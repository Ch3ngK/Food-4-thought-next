'use client';
import './popular.css';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/supabaseClient';

const LogoUrl = 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures/Food4Thought.png'; 

interface PopularItems {
  food_places_id: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviews:number;
}

interface PopularTrail {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  duration: string;
  stops: number;
  rating: number;
}

// Popular Food Trails Data
const PopularTrails = [
  {
    slug: 'hawker-delights',
    name: 'Singapore Hawker Delights',
    description: 'Explore the best of Singaporean street food across 5 iconic hawker centers.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//hawker-trail.jpeg',
    duration: '3 hours',
    stops: 5,
    rating: 4.9
  },
  {
    slug: 'chinatown-food-adventure',
    name: 'Chinatown Food Adventure',
    description: 'A culinary journey through Singapore\'s vibrant Chinatown district.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//chinatown-trail.jpeg',
    duration: '2.5 hours',
    stops: 4,
    rating: 4.7
  },
  {
    slug: 'little-india-spice-trail',
    name: 'Little India Spice Trail',
    description: 'Discover the rich flavors and spices of Indian cuisine in this immersive trail.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//india-trail.jpeg',
    duration: '2 hours',
    stops: 3,
    rating: 4.8
  }
];

const StarRating = ({ 
  value, 
  reviews,
  size = 16 
}: {
  value: number;
  reviews: number;
  size?: number;
}) => {
  return (
    <div className="star-rating-display" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.floor(value);
          const isHalf = star === Math.ceil(value) && value % 1 !== 0;
          
          return (
            <svg 
              key={star}
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width={size} 
              height={size}
              fill={isFilled ? "#FFD700" : (isHalf ? "url(#half-star)" : "none")}
              stroke="#FFD700"
              strokeWidth="2"
              style={{ marginRight: '2px', display: 'inline-block' }}
            >
              <defs>
                <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
                  <stop offset="50%" stopColor="#FFD700" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
      <span style={{ marginLeft: '5px', fontSize: '14px', color: '#666' }}>
        {value.toFixed(1)} ({reviews} reviews)
      </span>
    </div>
  );
};

export default function Popular() {
  const [popularItems, setPopularItems] = useState<PopularItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularItems();
  }, []);

  const fetchPopularItems = async () => {
    try {
      // get all food places with their review counts and average ratings
      const { data: foodPlaces, error: foodPlacesError } = await supabase
        .from('food_places')
        .select('food_places_id, food_places_name, image_1');

      if (foodPlacesError) {
        console.error('Error fetching food places:', foodPlacesError);
        return;
      }

      // then review statistics for each food place
      const placesWithStats = await Promise.all(
        foodPlaces.map(async (place) => {
          // get review count and average rating
          const { data: reviewStats, error: statsError } = await supabase
            .from('reviews')
            .select('rating')
            .eq('food_places_id', place.food_places_id);

          if (statsError) {
            console.error('Error fetching review stats:', statsError);
            return null;
          }

          const reviewCount = reviewStats?.length || 0;
          const averageRating = reviewCount > 0 
            ? reviewStats.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;

          // get athe best rated review for description, if available
          const { data: fiveStarReview, error: reviewError } = await supabase
            .from('reviews')
            .select('review_comments')
            .eq('food_places_id', place.food_places_id)
            .eq('rating', 5)
            .order('upvotes', { ascending: false })
            .limit(1);

          if (reviewError) {
            console.error('Error fetching 5-star review:', reviewError);
          }

          const description = fiveStarReview && fiveStarReview.length > 0 
            ? fiveStarReview[0].review_comments
            : `Experience the authentic flavors at ${place.food_places_name}. A popular dining destination loved by food enthusiasts.`;

          return {
            food_places_id: place.food_places_id,
            name: place.food_places_name,
            description: description,
            imageUrl: supabase.storage.from('pictures').getPublicUrl(place.image_1).data.publicUrl,
            rating: averageRating,
            reviews: reviewCount
          };
        })
      );

      // filter out null values and sort by review count (descending), then by average rating
      const validPlaces = placesWithStats
        .filter((place): place is PopularItems => place !== null && place.reviews > 0)
        .sort((a, b) => {
          // primary sort: by review count (descending)
          if (b.reviews !== a.reviews) {
            return b.reviews - a.reviews;
          }
          // secondary sort: by average rating (descending)
          return b.rating - a.rating;
        });

      // take the top 3
      const top3Places = validPlaces.slice(0, 3);
      setPopularItems(top3Places);
      
    } catch (error) {
      console.error('Error in fetchPopularItems:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="background-img-popular"></div>
        <Image 
          id="Logo-popular" 
          src={LogoUrl} 
          alt="Food4Thought Logo" 
          width={200} 
          height={80} 
        />
        <div className="text-box-popular">
          <div className="popular-food-items">Loading Popular Places...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="background-img-popular"></div>
      <Image 
        id="Logo-popular" 
        src={LogoUrl} 
        alt="Food4Thought Logo" 
        width={200} 
        height={80} 
      />
      
      <div className="text-box-popular">
        {/* popular food place section */}
        <div className="popular-food-items">Popular Food Places</div>
        <div className="pft-quote">Discover the best places to eat, ranked by our beloved community reviews.</div>
        
        <div className="food-items-container">
          {popularItems.length > 0 ? (
            popularItems.map((item, index) => (
              <div key={item.food_places_id} className="food-item">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={300}
                  height={200}
                  style={{ width: '90%', height: '200px', objectFit: 'cover', margin: '10px auto', borderRadius: '8px' }}
                />
                <div className="food-item-name">{item.name}</div>
                <div className="food-item-description">
                  {item.description.length > 120 
                    ? `${item.description.substring(0, 120)}...` 
                    : item.description}
                </div>
                <div className="rating">
                  <StarRating 
                    value={item.rating} 
                    reviews={item.reviews}
                    size={16}
                  />
                </div>
                <Link href={`/cuisinePage/indiv-cuisines/reviews/${item.food_places_id}`} passHref>
                  <button style={{
                    backgroundColor: '#f39c12',
                    color: 'white'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f39c12'}
                  >
                    View Review
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
              <p>No popular food places found yet. Be the first to leave a review!</p>
            </div>
          )}
        </div>
        
        {/* popular food trails section */}
        <div className="popular-food-items" style={{ marginTop: '40px' }}>Popular Food Trails</div>
        <div className="pft-quote">Explore curated culinary journeys loved by food enthusiasts.</div>
        
        <div className="food-items-container">
          {PopularTrails.map((trail, index) => (
            <div key={`trail-${index}`} className="food-item">
              <Image
                src={trail.imageUrl}
                alt={trail.name}
                width={350}
                height={220}
                style={{ width: '90%', height: '200px', objectFit: 'cover', margin: '10px auto', borderRadius: '8px' }}
              />
              <div className="food-item-name">{trail.name}</div>
              <div className="food-item-description">{trail.description}</div>
              <div style={{ margin: '10px 15px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Duration:</strong> {trail.duration}</span>
                <span><strong>Stops:</strong> {trail.stops}</span>
              </div>
              <div className="rating" style={{ margin: '10px 15px', fontSize: '14px' }}>
                {"★".repeat(Math.floor(trail.rating))}{"☆".repeat(5 - Math.floor(trail.rating))} {trail.rating}
              </div>
              <Link href={`/popular/food-trail-sharing/${encodeURIComponent(trail.slug)}`} passHref>
                <button style={{
                  margin: '10px 15px',
                  padding: '8px 0',
                  width: 'calc(100% - 30px)',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                  Explore Trail
                </button>
              </Link>
            </div>
          ))}
        </div>
        <div className="back-to-home-container">
          <Link href="/home" className="back-to-home-button">
            Back to Home
          </Link>
        </div> 
      </div>
    </div>
  );
}
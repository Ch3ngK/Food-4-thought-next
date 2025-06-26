'use client';
import './popular.css';
import Image from 'next/image';
import Link from 'next/link';

const LogoUrl = 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures/Food4Thought.png'; 

const PopularItems = [
  {
    name: 'Chilli Crab',
    description: 'A spicy and flavorful crab dish, perfect for seafood lovers.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//popular-pic-1.avif',
    rating: 5,
    reviews: 124
  },
  {
    name: 'Salted Egg Chicken',
    description: 'Crispy chicken coated in a rich salted egg sauce, a must-try for egg lovers.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//popular-pic-2.jpg',
    rating: 4.7,
    reviews: 100
  },
  {
    name: 'Thai Egg Rice',
    description: 'A simple yet delicious dish of rice topped with a perfectly cooked egg and Thai seasonings.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//popular-pic-3.webp',
    rating: 4.6,
    reviews: 88
  }
];

// Popular Food Trails Data
const PopularTrails = [
  {
    name: 'Singapore Hawker Delights',
    description: 'Explore the best of Singaporean street food across 5 iconic hawker centers.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//hawker-trail.jpeg',
    duration: '3 hours',
    stops: 5,
    rating: 4.9
  },
  {
    name: 'Chinatown Food Adventure',
    description: 'A culinary journey through Singapore\'s vibrant Chinatown district.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//chinatown-trail.jpeg',
    duration: '2.5 hours',
    stops: 4,
    rating: 4.7
  },
  {
    name: 'Little India Spice Trail',
    description: 'Discover the rich flavors and spices of Indian cuisine in this immersive trail.',
    imageUrl: 'https://uziezeevvajhdsxkumse.supabase.co/storage/v1/object/public/pictures//india-trail.jpeg',
    duration: '2 hours',
    stops: 3,
    rating: 4.8
  }
];

export default function Popular() {
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
        {/* Popular Food Items Section */}
        <div className="popular-food-items">Popular Food Items</div>
        <div className="pft-quote">Discover the most loved recipes by our community.</div>
        
        <div className="food-items-container">
          {PopularItems.map((item, index) => (
            <div key={index} className="food-item">
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={300}
                height={200}
                style={{ width: '90%', height: '200px', objectFit: 'cover', margin: '10px auto', borderRadius: '8px' }}
              />
              <div className="food-item-name">{item.name}</div>
              <div className="food-item-description">{item.description}</div>
              <div className="rating" style={{ margin: '10px 15px', fontSize: '14px' }}>
                {"★".repeat(Math.floor(item.rating))}{"☆".repeat(5-Math.floor(item.rating))} {item.rating} ({item.reviews} reviews)
              </div>
            </div>
          ))}
        </div>
        
        {/* Popular Food Trails Section */}
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
                {"★".repeat(Math.floor(trail.rating))}{"☆".repeat(5-Math.floor(trail.rating))} {trail.rating}
              </div>
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


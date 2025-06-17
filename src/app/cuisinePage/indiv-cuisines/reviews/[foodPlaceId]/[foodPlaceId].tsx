'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import './reviews.css';
import Link from 'next/link';
import { supabase } from '@/app/supabaseClient'; // Adjust path if needed

const imageKeys = {
  logo: 'Food4Thought.png',
  dpImg1: 'dragon-palace-pic-1.jpg',
  dpImg2: 'dragon-palace-pic-2.jpg',
  dpMap: 'dp-google-map.png',
  thumbsUp: 'thumbs-up.jpg',
  thumbsDown: 'thumbs-down.jpg',
  redFlag: 'red-flag.png',
};

interface Review {
  review_comments: string;
  review_username: string;
  created_at: string;
}

function Reviews() {
  const { foodPlaceId } = useParams();

  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [foodPlaceName, setFoodPlaceName] = useState<string>('');
  const [newReview, setNewReview] = useState('');
  const [username, setUsername] = useState('');


  useEffect(() => {
    const fetchImageUrls = async () => {
      const urls: Record<string, string> = {};
      for (const [key, file] of Object.entries(imageKeys)) {
        const { data } = supabase.storage.from('pictures').getPublicUrl(file);
        urls[key] = data.publicUrl;
      }
      setImageUrls(urls);
      setIsMounted(true);
    };
    fetchImageUrls();
  }, []);

  useEffect(() => {
    if (!foodPlaceId) return;

    const fetchReviews = async () => {
      try {
        // fetch food place name
        const { data: placeData, error: placeError } = await supabase
          .from('food_places')
          .select('food_places_name')
          .eq('food_places_id', foodPlaceId)
          .single();

        if (placeError || !placeData) {
          console.error('Error fetching food place name:', placeError);
          return;
        }
        setFoodPlaceName(placeData.food_places_name);

        // fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('review_comments, review_username, created_at')
          .eq('food_places_id', foodPlaceId);

        if (reviewsError) {
          console.error('Food Place has not been reviewed yet:', reviewsError);
          return;
        }

        setReviews(reviewsData || []);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchReviews();
  }, [foodPlaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!foodPlaceId || !newReview || !username) return;

  const { error } = await supabase
    .from('reviews')
    .insert([
      {
        review_comments: newReview,
        review_username: username,
        food_places_id: foodPlaceId,
      },
    ]);

  if (error) {
    console.error('Error submitting review:', error);
    return;
  }

  setNewReview('');
  setUsername('');

  // Refresh reviews
  const { data: updatedReviews } = await supabase
    .from('reviews')
    .select('review_comments, review_username')
    .eq('food_places_id', foodPlaceId);

  setReviews(updatedReviews || []);
};


  if (!isMounted || Object.keys(imageUrls).length === 0) return null;

  return (
    <div className="DragonPalace">
      <div className="background-layer" />
      <div className="content-layer">
        <Image id="Logo-6" src={imageUrls.logo} alt="Food 4 Thought Logo" height={80} width={240} />

        <div className="text-box-6">
          <div className="dragon-palace-header">{foodPlaceName}</div>
          <Image id="dp-img-1" src={imageUrls.dpImg1} alt="Dragon palace image 1" width={600} height={400} />
          <Image id="dp-img-2" src={imageUrls.dpImg2} alt="Dragon palace image 2" width={600} height={400} />
          <Image id="dp-google-map" src={imageUrls.dpMap} alt="Dragon palace google map" width={300} height={200} />
          <Link href="/cuisinePage/indiv-cuisines/mapsPage" className="dp-google-maps-text">
            View on google maps
          </Link>
          <br></br>
          <br></br>
        <div className='comment-section'>
        {reviews.length === 0 ? (
          <div className="no-reviews">No reviews yet. Be the first to leave one!</div>
        ) : (
          reviews.map((review, index) => (
          <div className="Dragon-Palace-Comment-1" key={index}>
            <div className="Dragon-Palace-Comment-1-text" key={index}>
              {review.review_comments}
            </div>
            <br></br><br></br>
            <div className="comment-1-user">By: {review.review_username}</div>
            <br></br>
            <span className="comment-timestamp">
              {new Date(review.created_at).toLocaleString()}
            </span>  
            <Image id="Thumbs-up-1" src={imageUrls.thumbsUp} alt="thumbs up" width={40} height={20} title="upvote" />
            <Image id="Thumbs-down-1" src={imageUrls.thumbsDown} alt="thumbs down" width={40} height={20} title="downvote" />
            <Image id="Red-flag-1" src={imageUrls.redFlag} alt="red flag" width={40} height={20} title="Flag for inappropriate content" />
            
          </div>
        )))}

        <div className="review-form-container">
        <h3>Leave a Review</h3>
        <form onSubmit={handleSubmit} className="review-form">
          <input
            type="text"
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <textarea
            placeholder="Your review"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            required
          />
          <button type="submit">Submit Review</button>
        </form>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

export default Reviews;
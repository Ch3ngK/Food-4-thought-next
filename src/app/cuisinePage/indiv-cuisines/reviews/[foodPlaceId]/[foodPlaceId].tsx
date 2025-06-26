'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/supabaseClient';
import './reviews.css';

interface Review {
  review_id: number;
  review_comments: string;
  review_username: string;
  created_at: string;
  upvotes: number;
  downvotes: number;
  rating: number;
  user_id: string | null;
}

function Reviews() {
  const { foodPlaceId } = useParams();
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [foodPlaceName, setFoodPlaceName] = useState('');
  const [newReview, setNewReview] = useState('');
  const [username, setUsername] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState<number>(0);

  // Fetch current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch place info + reviews
  useEffect(() => {
    if (!foodPlaceId) return;

    const fetchData = async () => {
      const { data: placeData } = await supabase
        .from('food_places')
        .select('food_places_name, image_1, image_2, map_image')
        .eq('food_places_id', foodPlaceId)
        .single();

      if (!placeData) return;

      setFoodPlaceName(placeData.food_places_name);
      setImageUrls({
        dpImg1: supabase.storage.from('pictures').getPublicUrl(placeData.image_1).data.publicUrl,
        dpImg2: supabase.storage.from('pictures').getPublicUrl(placeData.image_2).data.publicUrl,
        dpMap: supabase.storage.from('pictures').getPublicUrl(placeData.map_image).data.publicUrl,
        logo: supabase.storage.from('pictures').getPublicUrl('Food4Thought.png').data.publicUrl,
        thumbsUp: supabase.storage.from('pictures').getPublicUrl('thumbs-up.jpg').data.publicUrl,
        thumbsDown: supabase.storage.from('pictures').getPublicUrl('thumbs-down.jpg').data.publicUrl,
        redFlag: supabase.storage.from('pictures').getPublicUrl('red-flag.png').data.publicUrl,
      });

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('food_places_id', foodPlaceId)
        .order('created_at', { ascending: false });

      if (reviewsData) setReviews(reviewsData);
      setIsMounted(true);
    };

    fetchData();
  }, [foodPlaceId]);

  // Submit new review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview || !username || !foodPlaceId) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert('You must be logged in to submit a review.');
      return;
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        review_comments: newReview,
        review_username: username,
        food_places_id: foodPlaceId,
        upvotes: 0,
        downvotes: 0,
        rating,
        user_id: user.id,
      }])
      .select();

    if (error) {
      console.error('Insert error:', error);
      return;
    }

    if (data && data.length > 0) {
      setReviews(prev => [data[0], ...prev]);
    }

    setNewReview('');
    setUsername('');
    setRating(0);
  };

  const handleVote = async (reviewId: number, type: 'upvote' | 'downvote') => {
    const field = type === 'upvote' ? 'upvotes' : 'downvotes';
    const { error } = await supabase.rpc(`increment_review_${field}`, {
      review_id_input: reviewId,
    });

    if (error) {
      console.error('Vote error:', error);
      return;
    }

    setReviews(prev =>
      prev.map(r =>
        r.review_id === reviewId ? { ...r, [field]: r[field] + 1 } : r
      )
    );
  };

  const startEditing = (review: Review) => {
    setEditingReviewId(review.review_id);
    setEditedComment(review.review_comments);
    setEditedRating(review.rating);
  };

  const handleEditSubmit = async (e: React.FormEvent, reviewId: number) => {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    const { error } = await supabase
      .from('reviews')
      .update({
        review_comments: editedComment,
        rating: editedRating,
      })
      .eq('review_id', reviewId)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Edit error:', error.message);
      return;
    }

    setReviews(prev =>
      prev.map((r) =>
        r.review_id === reviewId
          ? { ...r, review_comments: editedComment, rating: editedRating }
          : r
      )
    );

    setEditingReviewId(null);
  };

  const handleDelete = async (reviewId: number) => {
    const confirm = window.confirm('Are you sure you want to delete this review?');
    if (!confirm) return;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', currentUserId); // secure delete

    if (error) {
      console.error('Delete error:', error);
      return;
    }

    setReviews(prev => prev.filter(r => r.review_id !== reviewId));
  };

  if (!isMounted) return null;

  return (
    <div className="DragonPalace">
      <div className="background-layer" />
      <div className="content-layer">
        <Image id="Logo-6" src={imageUrls.logo} alt="Logo" width={240} height={80} />
        <div className="text-box-6">
          <div className="dragon-palace-header">{foodPlaceName}</div>
          <Image id="dp-img-1" src={imageUrls.dpImg1} alt="Image 1" width={300} height={300} />
          <Image id="dp-img-2" src={imageUrls.dpImg2} alt="Image 2" width={300} height={300} />
          <Image id="dp-google-map" src={imageUrls.dpMap} alt="Map" width={300} height={200} />
          <Link href="#" className="dp-google-maps-text">View on Google Maps</Link>

          <div className="comment-section">
            {reviews.length === 0 ? (
              <div className="no-reviews">No reviews yet.</div>
            ) : (
              reviews.map((review) => (
                <div className="Dragon-Palace-Comment-1" key={review.review_id}>
                  {editingReviewId === review.review_id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, review.review_id)}>
                      <textarea
                        className="edit-comment-textarea"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        required
                      />
                      <select
                        value={editedRating}
                        onChange={(e) => setEditedRating(parseFloat(e.target.value))}
                      >
                        {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
                          <option key={star} value={star}>
                            {star} {star === 1 ? 'Star' : 'Stars'}
                          </option>
                        ))}
                      </select>
                      <button className='save-button' type="submit">Save</button>
                      <button className='cancel-button' type="button" onClick={() => setEditingReviewId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <div className="Dragon-Palace-Comment-1-text">{review.review_comments}</div>
                      <div className="comment-1-user">By: {review.review_username}</div>
                      <span className="comment-timestamp">{new Date(review.created_at).toLocaleString()}</span>
                      <div className="rating-stars">
                        {Array.from({ length: 5 }, (_, i) => {
                          const full = review.rating >= i + 1;
                          const half = review.rating >= i + 0.5 && review.rating < i + 1;
                          return <span key={i}>{full ? '⭐' : half ? '⯨' : '☆'}</span>;
                        })}
                      </div>
                      {review.user_id === currentUserId && (
                        <div style={{ marginTop: '10px' }}>
                          <button className='edit-button' onClick={() => startEditing(review)}>Edit</button>
                          <button className='delete-button' onClick={() => handleDelete(review.review_id)} style={{ marginLeft: '10px' }}>Delete</button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Voting */}
                  <span
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}
                    onClick={() => handleVote(review.review_id, 'upvote')}
                  >
                    <Image id="Thumbs-up-1" src={imageUrls.thumbsUp} alt="thumbs up" width={40} height={20} />
                    <span style={{ position: 'absolute', bottom: '20px', left: '1060px' }}>{review.upvotes || 0}</span>
                  </span>
                  <span
                    style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}
                    onClick={() => handleVote(review.review_id, 'downvote')}
                  >
                    <Image id="Thumbs-down-1" src={imageUrls.thumbsDown} alt="thumbs down" width={40} height={20} />
                    <span style={{ position: 'absolute', bottom: '20px', left: '1200px' }}>{review.downvotes || 0}</span>
                  </span>

                  <Image id="Red-flag-1" src={imageUrls.redFlag} alt="red flag" width={40} height={20} title="Flag for inappropriate content" />
                </div>
              ))
            )}

            <div className="review-form-container">
              <h3>Leave a Review</h3>
              <form onSubmit={handleSubmit} className="review-form">
                <input type="text" placeholder="Your name" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <textarea placeholder="Your review" value={newReview} onChange={(e) => setNewReview(e.target.value)} required />
                <select value={rating} onChange={(e) => setRating(parseFloat(e.target.value))} required>
                  <option value="">Select a rating</option>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((star) => (
                    <option key={star} value={star}>{star} {star === 1 ? 'Star' : 'Stars'}</option>
                  ))}
                </select>
                <button type="submit">Submit</button>
              </form>
              <br />
              <Link href="/cuisinePage" className="back-button">Back</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;

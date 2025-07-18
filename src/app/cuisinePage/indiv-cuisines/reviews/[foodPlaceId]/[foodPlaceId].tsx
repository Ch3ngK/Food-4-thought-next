'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
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
  user_vote?: 'upvote' | 'downvote' | null;
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
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState<number>(0);
  const [editedHoverRating, setEditedHoverRating] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const placeName = searchParams.get('name');

  const fetchReviews = async () => {
    if (!foodPlaceId) return;

    const { data: reviewsData, error } = await supabase
      .from('reviews')
      .select(`
        *,
        review_votes!left(vote_type)
      `)
      .eq('food_places_id', foodPlaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    if (reviewsData) {
      // Transform data to include user's vote status
      const transformedReviews = reviewsData.map(review => ({
        ...review,
        user_vote: review.review_votes?.length > 0 
          ? review.review_votes[0].vote_type 
          : null
      }));
      
      setReviews(transformedReviews);
    }
  };

  const StarRating = ({ 
    value, 
    onRate, 
    onHover, 
    onLeave,
    editable = true,
    size = 24 
  }: {
    value: number;
    onRate: (rating: number) => void;
    onHover: (rating: number | null) => void;
    onLeave: () => void;
    editable?: boolean;
    size?: number;
  }) => {
    return (
      <div className="star-rating-container">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= value;
          const isHalf = star - 0.5 === value;
          
          return (
            <div 
              key={star} 
              className={`star-wrapper ${editable ? 'editable' : ''}`}
              onMouseEnter={() => editable && onHover(star)}
              onMouseLeave={() => editable && onLeave()}
              onClick={() => editable && onRate(star)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width={size} 
                height={size}
                fill={isFilled ? "#FFD700" : "none"}
                stroke="#FFD700"
                strokeWidth="2"
              >
                { /* generated the stars with the help of chatgpt */ }
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                {isHalf && (
                  <defs>
                    <linearGradient id={`half-star-${star}`} x1="0" x2="100%" y1="0" y2="0">
                      <stop offset="50%" stopColor="#FFD700" />
                      <stop offset="50%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                )}
                {isHalf && (
                  <polygon 
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" 
                    fill={`url(#half-star-${star})`}
                  />
                )}
              </svg>
              {editable && star < 5 && (
                <button 
                  className="half-star-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRate(star + 0.5);
                  }}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
        <span className="rating-text">{value.toFixed(1)}</span>
      </div>
    );
  };

  // fetch current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, []);

  // fetch place info + reviews
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

      await fetchReviews();
      setIsMounted(true);
    };

    fetchData();
  }, [foodPlaceId, currentUserId]); 

  // submit new review
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

  const handleVote = async (reviewId: number, voteType: 'upvote' | 'downvote') => {
    if (!currentUserId) {
      alert('Please log in to vote');
      return;
    }

    try {
      const review = reviews.find(r => r.review_id === reviewId);
      if (!review) return;

      const currentVote = review.user_vote;
      let newUpvotes = review.upvotes;
      let newDownvotes = review.downvotes;
      let newVoteType: 'upvote' | 'downvote' | null = voteType;

      // determine the new vote state
      if (currentVote === voteType) {
        // user unvotes
        newVoteType = null;
        if (voteType === 'upvote') newUpvotes -= 1;
        else newDownvotes -= 1;
      } else if (currentVote) {
        // user change their vote
        if (voteType === 'upvote') {
          newUpvotes += 1;
          newDownvotes -= 1;
        } else {
          newUpvotes -= 1;
          newDownvotes += 1;
        }
      } else {
        // new vote
        if (voteType === 'upvote') newUpvotes += 1;
        else newDownvotes += 1;
      }

      // update the database
      if (newVoteType === null) {
        // delete the vote
        await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', currentUserId);
      } else if (currentVote) {
        // update the existing vote
        await supabase
          .from('review_votes')
          .update({ vote_type: newVoteType })
          .eq('review_id', reviewId)
          .eq('user_id', currentUserId);
      } else {
        // insert the new vote
        await supabase
          .from('review_votes')
          .insert([{
            review_id: reviewId,
            user_id: currentUserId,
            vote_type: newVoteType
          }]);
      }

      // update the review counts
      await supabase
        .from('reviews')
        .update({
          upvotes: newUpvotes,
          downvotes: newDownvotes
        })
        .eq('review_id', reviewId);

      // update local state of the code
      setReviews(prev =>
        prev.map(r =>
          r.review_id === reviewId
            ? {
                ...r,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                user_vote: newVoteType
              }
            : r
        )
      );
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };

  // renderVoteButtons function for visuals (got help from deepseek with the svg icons and colours)
  const renderVoteButtons = (review: Review) => {
    const hasUpvoted = review.user_vote === 'upvote';
    const hasDownvoted = review.user_vote === 'downvote';

    return (
      <div className="review-voting">
        <button 
        className={`vote-button upvote-button ${hasUpvoted ? 'active' : ''}`}
        onClick={() => handleVote(review.review_id, 'upvote')}
        aria-label="Upvote"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={hasUpvoted ? "#4CAF50" : "none"}
          stroke={hasUpvoted ? "#4CAF50" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/** svg generated by deepseek ai */}
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        <span className="vote-count">{review.upvotes}</span>
      </button>
        
      <button 
        className={`vote-button downvote-button ${hasDownvoted ? 'active' : ''}`}
        onClick={() => handleVote(review.review_id, 'downvote')}
        aria-label="Downvote"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={hasDownvoted ? "#F44336" : "none"}
          stroke={hasDownvoted ? "#F44336" : "currentColor"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/** svg generated by deepseek ai */}
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
        <span className="vote-count">{review.downvotes}</span>
      </button>
        
        <button className="flag-button" title="Flag for inappropriate content">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {/** svg generated by deepseek ai */}
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </button>
      </div>
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
      .eq('user_id', currentUserId);

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
            <div className="top-images-container">
              <Image id="dp-img-1" src={imageUrls.dpImg1} alt="Image 1" width={300} height={300} />
              <Image id="dp-img-2" src={imageUrls.dpImg2} alt="Image 2" width={300} height={300} />
              <Image id="dp-google-map" src={imageUrls.dpMap} alt="Map" width={300} height={200} />
              
            </div>
            <Link 
              href={`/food-trail/Foodtrailmap?locations=${encodeURIComponent(foodPlaceName)}`}
              className="dp-google-maps-text"
            >
              View on Map
            </Link>
         <div className="comments-outer-container">
          <div className="comment-section">
            {reviews.length === 0 ? (
              <div className="no-reviews">No reviews yet.</div>
            ) : (
              reviews.map((review) => (
                <div className="review-card" key={review.review_id}>
                  {editingReviewId === review.review_id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, review.review_id)} className="edit-review-form">
                      <textarea
                        className="edit-comment-textarea"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        required
                      />
                      <div className="edit-rating-container">
                        <StarRating 
                          value={editedHoverRating || editedRating} 
                          onRate={setEditedRating}
                          onHover={setEditedHoverRating}
                          onLeave={() => setEditedHoverRating(null)}
                        />
                      </div>
                      <div className="edit-form-actions">
                        <button className='save-button' type="submit">Save</button>
                        <button className='cancel-button' type="button" onClick={() => setEditingReviewId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="review-content">
                        <div className="review-header">
                          <div className="review-username">By: {review.review_username}</div>
                          <div className="review-timestamp">{new Date(review.created_at).toLocaleString()}</div>
                        </div>
                        
                        <div className="review-rating">
                          <StarRating 
                            value={review.rating} 
                            onRate={() => {}} 
                            onHover={() => {}} 
                            onLeave={() => {}} 
                            editable={false}
                            size={20}
                          />
                        </div>
                        
                        <div className="review-text">{review.review_comments}</div>
                        
                        {review.user_id === currentUserId && (
                          <div className="review-actions">
                            <button className='edit-button' onClick={() => startEditing(review)}>Edit</button>
                            <button className='delete-button-c' onClick={() => handleDelete(review.review_id)}>Delete</button>
                          </div>
                        )}
                      </div>
                      
                      <div className="review-voting">
                        {renderVoteButtons(review)}
                        { /** <div className="vote-button" onClick={() => handleVote(review.review_id, 'upvote')}>
                          <Image src={imageUrls.thumbsUp} alt="thumbs up" width={24} height={24} />
                          <span className="vote-count">{review.upvotes || 0}</span>
                        </div>
                        
                        <div className="vote-button" onClick={() => handleVote(review.review_id, 'downvote')}>
                          <Image src={imageUrls.thumbsDown} alt="thumbs down" width={24} height={24} />
                          <span className="vote-count">{review.downvotes || 0}</span>
                        </div>
                        
                        <div className="flag-button" title="Flag for inappropriate content">
                          <Image src={imageUrls.redFlag} alt="red flag" width={24} height={24} />
                        </div>
                        **/}
                      </div>
                    </>
                  )}
                </div>
              ))
            )}

            <div className="review-form-container">
              <h3>Leave a Review</h3>
              <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                  <label htmlFor="username">Your Name</label>
                  <input 
                    type="text" 
                    id="username"
                    placeholder="Enter your name" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="review">Your Review</label>
                  <textarea 
                    id="review"
                    placeholder="Share your experience..." 
                    value={newReview} 
                    onChange={(e) => setNewReview(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Rating</label>
                  <StarRating 
                    value={hoverRating || rating} 
                    onRate={setRating}
                    onHover={setHoverRating}
                    onLeave={() => setHoverRating(null)}
                  />
                </div>
                
                <button type="submit" className="submit-review-button">Submit Review</button>
              </form>
              
              <Link href="/cuisinePage" className="back-button">Back</Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;
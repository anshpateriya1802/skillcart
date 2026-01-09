import { useState } from 'react';
import { Star, ThumbsUp, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { reviewService } from '../../services/reviewService';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export const ReviewSection = ({ 
  courseId, 
  reviews = [], 
  userReview = null, 
  isEnrolled = false,
  onReviewSubmitted 
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview._id, { rating, comment });
        toast.success('Review updated successfully!');
      } else {
        await reviewService.createReview({ courseId, rating, comment });
        toast.success('Review submitted successfully!');
      }
      
      // Reset form
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      setEditingReview(null);
      
      // Callback to refresh reviews
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || '');
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleCancelEdit = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setRating(0);
    setComment('');
  };

  const renderStars = (count, interactive = false, onHover = null, onClick = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= (interactive ? (hoverRating || count) : count)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            onClick={() => interactive && onClick && onClick(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Write Review Section */}
      {isAuthenticated && isEnrolled && !userReview && (
        <Card>
          <CardContent className="p-6">
            {!showReviewForm ? (
              <Button onClick={() => setShowReviewForm(true)} className="w-full">
                <Edit2 className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingReview ? 'Edit Your Review' : 'Write Your Review'}
                </h3>
                
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                  </label>
                  {renderStars(
                    rating,
                    true,
                    setHoverRating,
                    setRating
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review (Optional)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Share your experience with this course..."
                    minLength={10}
                    maxLength={1000}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {comment.length}/1000 characters (minimum 10)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      editingReview ? 'Update Review' : 'Submit Review'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* User's Existing Review */}
      {userReview && !showReviewForm && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(userReview.rating)}
                  <span className="text-sm text-gray-600">Your Review</span>
                </div>
                <p className="text-gray-700">{userReview.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Posted on {formatDate(userReview.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditReview(userReview)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteReview(userReview._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Enrolled Alert */}
      {isAuthenticated && !isEnrolled && (
        <Alert variant="info">
          <AlertCircle className="w-4 h-4" />
          <span>You must be enrolled in this course to leave a review</span>
        </Alert>
      )}

      {/* All Reviews */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">
          Student Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.user?.name || 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mt-2">{review.comment}</p>
                    )}

                    {/* Helpful Button (placeholder for future feature) */}
                    {/* <div className="mt-3">
                      <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        Helpful (0)
                      </button>
                    </div> */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

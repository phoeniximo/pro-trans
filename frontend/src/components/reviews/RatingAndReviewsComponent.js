import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  StarIcon,
  UserCircleIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/client';
import Button from '../ui/Button';

// Component to display a rating with stars
export const StarRating = ({ rating, size = 'md' }) => {
  // Define sizes for stars
  const starSizes = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const starSize = starSizes[size] || starSizes.md;
  
  // If rating is null or undefined
  if (rating === null || rating === undefined) {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`${starSize} text-gray-300`} />
        ))}
        <span className="ml-1 text-sm text-gray-500">Non évalué</span>
      </div>
    );
  }
  
  // Create arrays of filled and empty stars
  const filledStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      {/* Filled stars */}
      {[...Array(filledStars)].map((_, i) => (
        <StarIcon key={`filled-${i}`} className={`${starSize} text-yellow-400`} />
      ))}
      
      {/* Half star */}
      {halfStar && (
        <div className="relative">
          <StarIcon className={`${starSize} text-gray-300`} />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <StarIcon className={`${starSize} text-yellow-400`} />
          </div>
        </div>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} className={`${starSize} text-gray-300`} />
      ))}
      
      {/* Numeric rating */}
      <span className="ml-1 text-sm text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
};

// Component to submit a review
export const SubmitReviewForm = ({ destinataireId, annonceId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Handle rating selection
  const handleSetRating = (value) => {
    setRating(value);
  };

  // Handle mouse enter on star
  const handleMouseEnter = (value) => {
    setHoverRating(value);
  };

  // Handle mouse leave on star
  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  // Handle comment change
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error('Veuillez laisser un commentaire d\'au moins 10 caractères');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await apiClient.post('/avis', {
        note: rating,
        commentaire: comment,
        destinataireId,
        annonceId
      });
      
      toast.success('Avis envoyé avec succès');
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Call callback function if provided
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.data);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Laisser un avis</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="focus:outline-none p-1"
                onClick={() => handleSetRating(value)}
                onMouseEnter={() => handleMouseEnter(value)}
                onMouseLeave={handleMouseLeave}
              >
                <StarIcon 
                  className={`h-8 w-8 ${
                    (hoverRating || rating) >= value 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire
          </label>
          <textarea
            id="comment"
            name="comment"
            rows="4"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            placeholder="Partagez votre expérience..."
            value={comment}
            onChange={handleCommentChange}
            required
            minLength={10}
          ></textarea>
          <div className="mt-1 text-xs text-gray-500">
            Minimum 10 caractères
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
          className="w-full sm:w-auto"
        >
          Envoyer mon avis
        </Button>
      </form>
    </div>
  );
};

// Main component to display ratings and reviews
const RatingAndReviewsComponent = ({ userId, showSubmitForm = false, annonceId = null }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'highest', 'lowest'
  const [visibleReviews, setVisibleReviews] = useState(5);
  const [userStats, setUserStats] = useState(null);
  const { user } = useAuth();
  
  // Fetch user reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await apiClient.get(`/avis/utilisateur/${userId}`);
        setReviews(response.data.data);
        
        // Calculate user stats
        const totalReviews = response.data.data.length;
        const totalRating = response.data.data.reduce((sum, review) => sum + review.note, 0);
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        
        // Count reviews by rating
        const ratingCounts = [0, 0, 0, 0, 0]; // For ratings 1 to 5
        response.data.data.forEach(review => {
          ratingCounts[review.note - 1]++;
        });
        
        setUserStats({
          totalReviews,
          averageRating,
          ratingCounts
        });
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Erreur lors du chargement des avis');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [userId]);
  
  // Handle sort change
  const handleSortChange = (order) => {
    setSortOrder(order);
    
    // Sort the reviews based on the selected order
    const sortedReviews = [...reviews];
    
    if (order === 'recent') {
      sortedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (order === 'highest') {
      sortedReviews.sort((a, b) => b.note - a.note);
    } else if (order === 'lowest') {
      sortedReviews.sort((a, b) => a.note - b.note);
    }
    
    setReviews(sortedReviews);
  };
  
  // Handle show more reviews
  const handleShowMore = () => {
    setVisibleReviews(prev => prev + 5);
  };
  
  // Handle review submission
  const handleReviewSubmitted = (newReview) => {
    // Add the new review to the list and sort according to current order
    setReviews(prev => {
      const updatedReviews = [newReview, ...prev];
      
      if (sortOrder === 'recent') {
        return updatedReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortOrder === 'highest') {
        return updatedReviews.sort((a, b) => b.note - a.note);
      } else if (sortOrder === 'lowest') {
        return updatedReviews.sort((a, b) => a.note - b.note);
      }
      
      return updatedReviews;
    });
    
    // Update user stats
    setUserStats(prev => {
      if (!prev) return null;
      
      const newTotalReviews = prev.totalReviews + 1;
      const newTotalRating = prev.totalReviews * prev.averageRating + newReview.note;
      const newAverageRating = newTotalRating / newTotalReviews;
      
      const newRatingCounts = [...prev.ratingCounts];
      newRatingCounts[newReview.note - 1]++;
      
      return {
        totalReviews: newTotalReviews,
        averageRating: newAverageRating,
        ratingCounts: newRatingCounts
      };
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  // Prepare reviews to display
  const displayedReviews = reviews.slice(0, visibleReviews);
  
  return (
    <div className="space-y-6">
      {/* Submit review form */}
      {showSubmitForm && user && user.id !== userId && (
        <SubmitReviewForm 
          destinataireId={userId} 
          annonceId={annonceId}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
      
      {/* User rating summary */}
      {userStats && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-gray-900">Note globale</h3>
              <div className="flex items-center mt-1">
                <StarRating rating={userStats.averageRating} size="lg" />
                <span className="ml-2 text-sm text-gray-500">
                  ({userStats.totalReviews} avis)
                </span>
              </div>
            </div>
            
            <div className="space-y-2 flex-1 max-w-xs">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = userStats.ratingCounts[rating - 1];
                const percentage = userStats.totalReviews > 0 
                  ? (count / userStats.totalReviews) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center text-sm">
                    <div className="w-6 text-right mr-2">{rating}</div>
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-2" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-right ml-2 text-xs text-gray-500">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Reviews list */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Avis ({reviews.length})</h3>
            
            {/* Sort options */}
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Trier par:</span>
              <select
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                value={sortOrder}
                onChange={e => handleSortChange(e.target.value)}
              >
                <option value="recent">Plus récents</option>
                <option value="highest">Meilleures notes</option>
                <option value="lowest">Moins bonnes notes</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Reviews */}
        {reviews.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Aucun avis pour le moment
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200">
              {displayedReviews.map(review => (
                <li key={review._id} className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {review.auteur.photo ? (
                        <img 
                          src={review.auteur.photo} 
                          alt={`${review.auteur.prenom} ${review.auteur.nom}`}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.auteur.prenom} {review.auteur.nom}
                          </h4>
                          <div className="mt-1">
                            <StarRating rating={review.note} size="sm" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), 'd MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {review.commentaire}
                      </div>
                      {review.annonce && (
                        <div className="mt-2 text-xs text-gray-500">
                          Transport: {review.annonce.titre}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Show more button */}
            {visibleReviews < reviews.length && (
              <div className="px-6 py-4 border-t border-gray-200 text-center">
                <button
                  type="button"
                  className="text-teal-600 hover:text-teal-700 font-medium"
                  onClick={handleShowMore}
                >
                  Afficher plus d'avis
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RatingAndReviewsComponent;
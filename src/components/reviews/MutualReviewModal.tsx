'use client';

import { useState, useEffect } from 'react';
import { X, Star, DollarSign, MessageCircle, CheckCircle, AlertCircle, Clock, Heart, ThumbsUp, User } from 'lucide-react';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '@/lib/appwrite/database';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface Job {
  $id: string;
  title: string;
  description: string;
  clientId: string;
  freelancerId: string;
  freelancerName: string;
  selectedBudget: number;
  selectedDuration: string;
}

interface MutualReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onReviewComplete: () => void;
}

interface ReviewData {
  rating: number;
  title: string;
  comment: string;
  tags: string[];
  isPublic: boolean;
  skills: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
  };
}

const REVIEW_TAGS = {
  client: [
    'Clear Communication', 'Timely Payments', 'Well-Defined Requirements', 
    'Professional', 'Good Feedback', 'Respectful', 'Flexible', 'Supportive'
  ],
  freelancer: [
    'High Quality Work', 'On Time Delivery', 'Excellent Communication', 
    'Creative', 'Problem Solver', 'Professional', 'Goes Extra Mile', 'Reliable'
  ]
};

export default function MutualReviewModal({ isOpen, onClose, job, onReviewComplete }: MutualReviewModalProps) {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'complete'>('review');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const isClient = user?.$id === job.clientId;
  const revieweeId = isClient ? job.freelancerId : job.clientId;
  const revieweeName = isClient ? job.freelancerName : 'Client';
  
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    title: '',
    comment: '',
    tags: [],
    isPublic: true,
    skills: {
      communication: 0,
      quality: 0,
      timeliness: 0,
      professionalism: 0,
    }
  });

  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    if (isOpen && user) {
      checkExistingReview();
    }
  }, [isOpen, user, job.$id]);

  const checkExistingReview = async () => {
    try {
      const reviews = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        [
          `jobId="${job.$id}"`,
          `reviewerId="${user?.$id}"`
        ]
      );
      
      if (reviews.documents.length > 0) {
        setExistingReview(reviews.documents[0]);
        setStep('complete');
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewData(prev => ({ ...prev, rating }));
  };

  const handleSkillRating = (skill: keyof ReviewData['skills'], rating: number) => {
    setReviewData(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: rating }
    }));
  };

  const toggleTag = (tag: string) => {
    setReviewData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async () => {
    if (!user || reviewData.rating === 0 || !reviewData.comment.trim()) {
      return;
    }

    setLoading(true);
    setSubmitStatus('idle');

    try {
      // Create review
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.REVIEWS,
        ID.unique(),
        {
          jobId: job.$id,
          projectId: job.$id, // Same as job for now
          reviewerId: user.$id,
          revieweeId: revieweeId,
          reviewerType: isClient ? 'client' : 'freelancer',
          rating: reviewData.rating,
          title: reviewData.title || `Review for ${revieweeName}`,
          comment: reviewData.comment,
          tags: JSON.stringify(reviewData.tags),
          skillRatings: JSON.stringify(reviewData.skills),
          isPublic: reviewData.isPublic,
          helpful: 0,
          notHelpful: 0,
          createdAt: new Date().toISOString(),
        }
      );

      // Update user stats
      if (!isClient) {
        // Update freelancer's rating
        try {
          const freelancer = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            job.freelancerId
          );

          const currentRating = freelancer.rating || 0;
          const currentCount = freelancer.reviewsCount || 0;
          const newCount = currentCount + 1;
          const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;

          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            job.freelancerId,
            {
              rating: newRating,
              reviewsCount: newCount,
              completedJobs: (freelancer.completedJobs || 0) + 1,
              totalEarnings: (freelancer.totalEarnings || 0) + job.selectedBudget
            }
          );
        } catch (statsError) {
          console.error('Error updating freelancer stats:', statsError);
        }
      } else {
        // Update client stats
        try {
          const client = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            job.clientId
          );

          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.USERS,
            job.clientId,
            {
              totalSpent: (client.totalSpent || 0) + job.selectedBudget,
              projectsCompleted: (client.projectsCompleted || 0) + 1,
            }
          );
        } catch (statsError) {
          console.error('Error updating client stats:', statsError);
        }
      }

      setSubmitStatus('success');
      setStep('complete');
      
      setTimeout(() => {
        onReviewComplete();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting review:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onChange, size = 'default' }: { 
    value: number; 
    onChange: (rating: number) => void;
    size?: 'small' | 'default' | 'large';
  }) => {
    const sizeClass = size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={cn(
              "transition-colors",
              rating <= value ? "text-yellow-400" : "text-gray-600"
            )}
          >
            <Star className={cn(sizeClass, rating <= value && "fill-current")} />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Success Status */}
        {submitStatus === 'success' && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-green-500/20 border-b border-green-500/30 text-center">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-300">Review submitted successfully!</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={cn("flex items-center justify-between p-6 border-b border-gray-700/50", submitStatus === 'success' && 'mt-16')}>
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Star className="w-7 h-7 text-yellow-400" />
              <span>
                {step === 'complete' && existingReview ? 'Review Submitted' : `Review ${revieweeName}`}
              </span>
            </h2>
            <p className="text-gray-400 mt-1">{job.title}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>${job.selectedBudget}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{job.selectedDuration}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'review' ? (
          /* Review Form */
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto custom-scrollbar space-y-6">
            {/* Overall Rating */}
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Overall Rating</span>
              </h3>
              <div className="flex items-center space-x-4">
                <StarRating 
                  value={reviewData.rating} 
                  onChange={handleRatingChange}
                  size="large"
                />
                <span className="text-2xl font-bold text-white">
                  {reviewData.rating > 0 ? `${reviewData.rating}.0` : '0.0'}
                </span>
              </div>
              <p className="text-yellow-200 text-sm mt-2">
                How was your overall experience working with {revieweeName}?
              </p>
            </div>

            {/* Skill Ratings */}
            <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-600/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Detailed Ratings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(reviewData.skills).map(([skill, rating]) => (
                  <div key={skill} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 capitalize font-medium">{skill}</span>
                      <span className="text-white font-bold">{rating}/5</span>
                    </div>
                    <StarRating 
                      value={rating} 
                      onChange={(r) => handleSkillRating(skill as keyof ReviewData['skills'], r)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span>Highlight Strengths</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {REVIEW_TAGS[isClient ? 'freelancer' : 'client'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      reviewData.tags.includes(tag)
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <span>Written Review</span>
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder={`Share details about your experience working with ${revieweeName}. What went well? What could be improved?`}
                className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {reviewData.comment.length}/1000 characters
                </p>
                <label className="flex items-center space-x-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={reviewData.isPublic}
                    onChange={(e) => setReviewData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500/20"
                  />
                  <span>Make public</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          /* Complete State */
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {existingReview ? 'Review Already Submitted' : 'Thank You for Your Review!'}
            </h3>
            <p className="text-gray-400 mb-6">
              {existingReview 
                ? 'You have already submitted a review for this project.'
                : 'Your feedback helps maintain quality in our community.'
              }
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {/* Footer */}
        {step === 'review' && (
          <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Your honest feedback helps improve our community
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Skip for Now
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || reviewData.rating === 0 || !reviewData.comment.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

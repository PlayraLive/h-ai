'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { 
  Star,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Calendar,
  User,
  Award,
  TrendingUp,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  client: {
    name: string;
    avatar: string;
    company: string;
    verified: boolean;
  };
  project: {
    id: string;
    title: string;
    category: string;
    completedAt: string;
    budget: number;
  };
  createdAt: string;
  isPublic: boolean;
  helpful: number;
  notHelpful: number;
  response?: {
    text: string;
    createdAt: string;
  };
  tags: string[];
}

export default function ReviewsPage() {
  const { success, error } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showReplyModal, setShowReplyModal] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    // Mock data
    const mockReviews: Review[] = [
      {
        id: '1',
        rating: 5,
        title: 'Outstanding AI Design Work!',
        comment: 'Alex delivered exceptional work on our AI-powered logo design. The creativity and attention to detail were outstanding. The final design perfectly captured our vision and exceeded our expectations. Communication was excellent throughout the project.',
        client: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          company: 'TechFlow Solutions',
          verified: true
        },
        project: {
          id: 'proj_1',
          title: 'AI-Powered Logo Design',
          category: 'Design',
          completedAt: '2024-01-15',
          budget: 2500
        },
        createdAt: '2024-01-16T10:30:00Z',
        isPublic: true,
        helpful: 12,
        notHelpful: 0,
        response: {
          text: 'Thank you so much for the wonderful review! It was a pleasure working with you and your team. I\'m thrilled that the design exceeded your expectations.',
          createdAt: '2024-01-16T14:20:00Z'
        },
        tags: ['Professional', 'Creative', 'On Time', 'Great Communication']
      },
      {
        id: '2',
        rating: 4,
        title: 'Great Work, Minor Delays',
        comment: 'The quality of work was excellent and the final product met all our requirements. However, there were some minor delays in delivery. Overall, very satisfied with the outcome and would work with Alex again.',
        client: {
          name: 'Mike Davis',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          company: 'InnovateLab',
          verified: true
        },
        project: {
          id: 'proj_2',
          title: 'Brand Identity Package',
          category: 'Branding',
          completedAt: '2024-01-10',
          budget: 3200
        },
        createdAt: '2024-01-11T09:15:00Z',
        isPublic: true,
        helpful: 8,
        notHelpful: 1,
        tags: ['Quality Work', 'Professional', 'Minor Delays']
      },
      {
        id: '3',
        rating: 5,
        title: 'Exceptional Mobile App Design',
        comment: 'Absolutely fantastic work! The mobile app design was modern, intuitive, and perfectly aligned with our brand. Alex was responsive, professional, and delivered ahead of schedule. Highly recommended!',
        client: {
          name: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          company: 'StartupXYZ',
          verified: false
        },
        project: {
          id: 'proj_3',
          title: 'Mobile App UI/UX Design',
          category: 'Mobile Design',
          completedAt: '2024-01-05',
          budget: 4500
        },
        createdAt: '2024-01-06T16:45:00Z',
        isPublic: true,
        helpful: 15,
        notHelpful: 0,
        tags: ['Excellent', 'Fast Delivery', 'Modern Design', 'Responsive']
      }
    ];

    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default:
        return 0;
    }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      error('Reply Required', 'Please enter a reply message');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? {
              ...review,
              response: {
                text: replyText,
                createdAt: new Date().toISOString()
              }
            }
          : review
      ));
      
      success('Reply Posted', 'Your reply has been posted successfully');
      setShowReplyModal(null);
      setReplyText('');
    } catch (err) {
      error('Failed to Post Reply', 'Please try again later');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Reviews & Ratings</h1>
                <p className="text-gray-400">Manage your client feedback and build your reputation</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Link
                  href="/en/reviews/request"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Request Review</span>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Average Rating</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-4 h-4',
                              i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Reviews</p>
                    <p className="text-2xl font-bold text-white">{reviews.length}</p>
                    <p className="text-green-400 text-sm">+3 this month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">5-Star Reviews</p>
                    <p className="text-2xl font-bold text-white">
                      {reviews.filter(r => r.rating === 5).length}
                    </p>
                    <p className="text-purple-400 text-sm">
                      {reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100) : 0}% of total
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Response Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {reviews.length > 0 ? Math.round((reviews.filter(r => r.response).length / reviews.length) * 100) : 0}%
                    </p>
                    <p className="text-green-400 text-sm">Excellent</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Rating Distribution */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-6">Rating Distribution</h3>
                <div className="space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-12">
                        <span className="text-sm text-gray-300">{rating}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-400 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-3">
                {/* Filters */}
                <div className="glass-card p-6 rounded-2xl mb-6">
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search reviews..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input-field pl-10 w-full"
                        />
                      </div>
                    </div>

                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="input-field"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Rating</option>
                      <option value="lowest">Lowest Rating</option>
                      <option value="helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>

                {/* Reviews */}
                {sortedReviews.length === 0 ? (
                  <div className="glass-card p-12 rounded-2xl text-center">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Reviews Found</h3>
                    <p className="text-gray-400 mb-6">
                      {searchQuery || ratingFilter !== 'all'
                        ? 'Try adjusting your filters to see more reviews.'
                        : 'Complete your first project to start receiving reviews.'}
                    </p>
                    <Link href="/en/jobs" className="btn-primary">
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedReviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        onReply={() => setShowReplyModal(review.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Reply to Review</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Thank you for your feedback..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowReplyModal(null)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReply(showReplyModal)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  onReply: () => void;
}

function ReviewCard({ review, onReply }: ReviewCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={review.client.avatar}
            alt={review.client.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-white">{review.client.name}</h4>
              {review.client.verified && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </div>
            <p className="text-gray-400 text-sm">{review.client.company}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                    )}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
              <button
                onClick={onReply}
                className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors w-full text-left"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reply</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors w-full text-left">
                <Flag className="w-4 h-4" />
                <span>Report</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">{review.title}</h3>
        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
      </div>

      {/* Project Info */}
      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">{review.project.title}</p>
            <p className="text-gray-400 text-sm">{review.project.category}</p>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-semibold">${review.project.budget.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">
              Completed {new Date(review.project.completedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {review.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Response */}
      {review.response && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Your Response</span>
            <span className="text-gray-400 text-xs">
              {new Date(review.response.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-300 text-sm">{review.response.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">{review.helpful}</span>
          </button>
          <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm">{review.notHelpful}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {review.isPublic ? (
            <span className="flex items-center space-x-1 text-green-400 text-sm">
              <Eye className="w-4 h-4" />
              <span>Public</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-gray-400 text-sm">
              <Eye className="w-4 h-4" />
              <span>Private</span>
            </span>
          )}
          
          {!review.response && (
            <button
              onClick={onReply}
              className="btn-secondary text-sm"
            >
              Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

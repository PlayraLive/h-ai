'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  MapPin,
  DollarSign,
  Clock,
  MessageCircle,
  Heart,
  HeartHandshake,
  Eye,
  Users,
  Award,
  CheckCircle,
  SlidersHorizontal,
  ArrowRight,
  Verified,
  Briefcase
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { FreelancerCardSkeleton } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  skills: string[];
  description: string;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  verified: boolean;
  topRated: boolean;
  category: string;
  portfolio: string[];
}

export default function FreelancersPage({ params }: { params: Promise<{ locale: string }> }) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [rateRange, setRateRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteFreelancers, setFavoriteFreelancers] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('rating');

  const searchParams = useSearchParams();
  const { success, info } = useToast();

  const mockFreelancers: Freelancer[] = [
    {
      id: '1',
      name: 'Alex Chen',
      title: 'AI Design Specialist',
      avatar: '/api/placeholder/60/60',
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 85,
      completedJobs: 156,
      responseTime: '1 hour',
      location: 'San Francisco, CA',
      skills: ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Brand Design', 'UI/UX'],
      description: 'Expert in AI-powered design with 5+ years of experience. Specialized in creating stunning visuals using cutting-edge AI tools.',
      languages: ['English', 'Mandarin'],
      availability: 'available',
      verified: true,
      topRated: true,
      category: 'ai_design',
      portfolio: ['/api/placeholder/300/200', '/api/placeholder/300/200']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      title: 'AI Developer & Automation Expert',
      avatar: '/api/placeholder/60/60',
      rating: 4.8,
      reviewCount: 89,
      hourlyRate: 95,
      completedJobs: 134,
      responseTime: '2 hours',
      location: 'London, UK',
      skills: ['OpenAI API', 'Python', 'TensorFlow', 'Machine Learning', 'Automation'],
      description: 'Full-stack AI developer specializing in chatbots, automation, and machine learning solutions for businesses.',
      languages: ['English', 'French'],
      availability: 'busy',
      verified: true,
      topRated: false,
      category: 'ai_development',
      portfolio: ['/api/placeholder/300/200', '/api/placeholder/300/200']
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      title: 'AI Video Content Creator',
      avatar: '/api/placeholder/60/60',
      rating: 4.7,
      reviewCount: 203,
      hourlyRate: 75,
      completedJobs: 298,
      responseTime: '30 minutes',
      location: 'Barcelona, Spain',
      skills: ['Runway ML', 'After Effects', 'Video Editing', 'AI Animation', 'Motion Graphics'],
      description: 'Creative video specialist using AI tools to produce engaging content for social media and marketing campaigns.',
      languages: ['Spanish', 'English'],
      availability: 'available',
      verified: true,
      topRated: true,
      category: 'ai_video',
      portfolio: ['/api/placeholder/300/200', '/api/placeholder/300/200']
    }
  ];

  useEffect(() => {
    // Симуляция загрузки данных
    setLoading(true);
    setTimeout(() => {
      setFreelancers(mockFreelancers);
      setLoading(false);
    }, 1500);

    // Получение параметров из URL
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handleFavoriteFreelancer = (freelancerId: string) => {
    const newFavorites = new Set(favoriteFreelancers);
    if (favoriteFreelancers.has(freelancerId)) {
      newFavorites.delete(freelancerId);
      info('Removed from favorites', 'Freelancer has been removed from your favorites.');
    } else {
      newFavorites.add(freelancerId);
      success('Added to favorites!', 'Freelancer has been added to your favorites.');
    }
    setFavoriteFreelancers(newFavorites);
  };

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || freelancer.category === selectedCategory;
    const matchesAvailability = selectedAvailability === 'all' || freelancer.availability === selectedAvailability;
    const matchesRate = freelancer.hourlyRate >= rateRange[0] && freelancer.hourlyRate <= rateRange[1];

    return matchesSearch && matchesCategory && matchesAvailability && matchesRate;
  });

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'rate_low':
        return a.hourlyRate - b.hourlyRate;
      case 'rate_high':
        return b.hourlyRate - a.hourlyRate;
      case 'experience':
        return b.completedJobs - a.completedJobs;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Find AI Freelancers</h1>
            <p className="text-xl text-gray-400">Connect with top AI specialists worldwide</p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search freelancers, skills..."
                  className="input-field pl-12 w-full"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  <option value="ai_design">AI Design</option>
                  <option value="ai_development">AI Development</option>
                  <option value="ai_video">AI Video</option>
                  <option value="ai_games">AI Games</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="rate_low">Lowest Rate</option>
                  <option value="rate_high">Highest Rate</option>
                  <option value="experience">Most Experience</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "btn-secondary flex items-center space-x-2",
                    showFilters && "bg-purple-500/20 text-purple-400"
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Rate: ${rateRange[0]} - ${rateRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={rateRange[1]}
                    onChange={(e) => setRateRange([rateRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedAvailability('all');
                      setRateRange([0, 200]);
                    }}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400">
              {loading ? 'Loading...' : `${sortedFreelancers.length} freelancers found`}
            </p>
          </div>

          {/* Freelancers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 9 }).map((_, index) => (
                <FreelancerCardSkeleton key={index} />
              ))
            ) : sortedFreelancers.length > 0 ? (
              sortedFreelancers.map((freelancer) => (
                <FreelancerCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  isFavorite={favoriteFreelancers.has(freelancer.id)}
                  onFavorite={() => handleFavoriteFreelancer(freelancer.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-lg mb-4">No freelancers found matching your criteria</div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedAvailability('all');
                    setRateRange([0, 200]);
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FreelancerCard({ freelancer, isFavorite, onFavorite }: {
  freelancer: Freelancer;
  isFavorite: boolean;
  onFavorite: () => void
}) {
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className={cn(
      "glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group",
      freelancer.topRated && "ring-2 ring-purple-500/30"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={freelancer.avatar}
              alt={freelancer.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-950",
              getAvailabilityColor(freelancer.availability)
            )}></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                {freelancer.name}
              </h3>
              {freelancer.verified && (
                <CheckCircle className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <p className="text-sm text-gray-400">{freelancer.title}</p>
          </div>
        </div>
        <button
          onClick={onFavorite}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          {isFavorite ? <HeartHandshake className="w-5 h-5 text-red-400" /> : <Heart className="w-5 h-5" />}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {freelancer.topRated && (
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
            Top Rated
          </span>
        )}
        {freelancer.verified && (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
            Verified
          </span>
        )}
        <span className={cn(
          "px-2 py-1 text-xs rounded-full",
          freelancer.availability === 'available' ? 'bg-green-500/20 text-green-400' :
          freelancer.availability === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-500/20 text-gray-400'
        )}>
          {getAvailabilityText(freelancer.availability)}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white font-semibold">{freelancer.rating}</span>
          </div>
          <div className="text-xs text-gray-400">({freelancer.reviewCount} reviews)</div>
        </div>
        <div className="text-center">
          <div className="text-white font-semibold mb-1">
            ${freelancer.hourlyRate}/hr
          </div>
          <div className="text-xs text-gray-400">{freelancer.completedJobs} jobs</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{freelancer.description}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {freelancer.skills.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="bg-gray-800/50 text-gray-300 text-xs px-2 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
        {freelancer.skills.length > 3 && (
          <span className="text-gray-400 text-xs px-2 py-1">
            +{freelancer.skills.length - 3} more
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{freelancer.location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Responds in {freelancer.responseTime}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href={`/en/freelancers/${freelancer.id}`}
          className="w-full btn-secondary text-center flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Profile</span>
        </Link>
        <div className="flex space-x-2">
          <Link
            href={`/en/messages?freelancer=${freelancer.id}`}
            className="flex-1 btn-primary text-center flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </Link>
          <Link
            href={`/en/jobs/create?freelancer=${freelancer.id}`}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-center flex items-center justify-center space-x-2"
          >
            <Briefcase className="w-4 h-4" />
            <span>Hire</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


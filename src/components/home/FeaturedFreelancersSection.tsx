'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserProfileService, UserProfile } from '@/lib/user-profile-service';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';

interface FeaturedFreelancersSectionProps {
  locale: string;
}

// Create service instance outside component to avoid hook issues
const userProfileService = new UserProfileService();

export function FeaturedFreelancersSection({ locale }: FeaturedFreelancersSectionProps) {
  const [freelancers, setFreelancers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedFreelancers = async () => {
      try {
        console.log('🔄 Loading featured freelancers...');
        
        // Get freelancers from database
        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
          [
            Query.equal('userType', 'freelancer'),
            Query.equal('verified', true),
            Query.orderDesc('rating'),
            Query.limit(6)
          ]
        );

        // Load full profiles for each freelancer
        const profilePromises = response.documents.map(doc => 
          userProfileService.getUserProfile(doc.$id)
        );
        
        const profiles = await Promise.all(profilePromises);
        const validProfiles = profiles.filter(p => p !== null) as UserProfile[];
        
        setFreelancers(validProfiles);
        console.log('✅ Featured freelancers loaded:', validProfiles.length);
      } catch (error) {
        console.error('❌ Error loading featured freelancers:', error);
        // Fallback to mock data
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedFreelancers();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured AI Specialists
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Meet our top-rated freelancers ready to bring your AI projects to life
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="glass-card p-6 rounded-2xl animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Featured AI Specialists
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Meet our top-rated freelancers ready to bring your AI projects to life
          </p>
        </div>

        {/* Freelancers Grid */}
        {freelancers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {freelancers.map((freelancer) => (
              <Link
                key={freelancer.$id}
                href={`/${locale}/profile/${freelancer.$id}`}
                className="glass-card p-6 rounded-2xl hover:scale-105 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                  {/* Avatar */}
                  <div className="relative">
                    {freelancer.avatar ? (
                      <img
                        src={freelancer.avatar}
                        alt={freelancer.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {getInitials(freelancer.name)}
                      </div>
                    )}
                    
                    {/* Online indicator */}
                    {freelancer.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                        {freelancer.name}
                      </h3>
                      {freelancer.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Star className="w-3 h-3 text-yellow-400" />
                      <span>{freelancer.rating.toFixed(1)}</span>
                      <span>({freelancer.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {freelancer.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {freelancer.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded">
                          +{freelancer.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {freelancer.bio && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {freelancer.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>{freelancer.completedJobs} jobs</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{freelancer.responseTime}</span>
                  </div>
                  
                  {freelancer.location && (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{freelancer.location}</span>
                    </div>
                  )}
                  
                  {freelancer.hourlyRate && (
                    <div className="text-green-400 font-medium">
                      ${freelancer.hourlyRate}/hr
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    freelancer.availability === 'available' ? 'bg-green-500/20 text-green-400' :
                    freelancer.availability === 'busy' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      freelancer.availability === 'available' ? 'bg-green-400' :
                      freelancer.availability === 'busy' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}></div>
                    {freelancer.availability === 'available' ? 'Available' :
                     freelancer.availability === 'busy' ? 'Busy' : 'Unavailable'}
                  </span>

                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Featured Freelancers Yet</h3>
            <p className="text-gray-400">Check back soon for our top AI specialists!</p>
          </div>
        )}

        {/* View All Button */}
        {freelancers.length > 0 && (
          <div className="text-center">
            <Link
              href={`/${locale}/freelancers`}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>View All Freelancers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

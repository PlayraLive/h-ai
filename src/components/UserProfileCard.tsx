'use client';

import { useState } from 'react';
import { UserProfile } from '@/lib/user-profile-service';
import { 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Edit,
  Camera,
  Globe,
  Award,
  TrendingUp,
  Users,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileCardProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onMessage?: () => void;
}

export default function UserProfileCard({ profile, isOwnProfile = false, onEdit, onMessage }: UserProfileCardProps) {
  const [showFullBio, setShowFullBio] = useState(false);

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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'busy':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Available for work';
      case 'busy':
        return 'Busy';
      default:
        return 'Unavailable';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                {getInitials(profile.name)}
              </div>
            )}
            
            {/* Online indicator */}
            {profile.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            )}
            
            {/* Edit avatar button for own profile */}
            {isOwnProfile && (
              <button className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              {profile.verified && (
                <CheckCircle className="w-5 h-5 text-blue-400" title="Verified" />
              )}
            </div>
            
            <p className="text-gray-400 mb-2">{profile.email}</p>
            
            {/* User Type & Availability */}
            <div className="flex items-center space-x-2">
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                profile.userType === 'freelancer' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              )}>
                {profile.userType === 'freelancer' ? '👨‍💻 Freelancer' : '🏢 Client'}
              </span>
              
              <span className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                getAvailabilityColor(profile.availability)
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full mr-1",
                  profile.availability === 'available' ? 'bg-green-400' :
                  profile.availability === 'busy' ? 'bg-yellow-400' : 'bg-red-400'
                )}></div>
                {getAvailabilityText(profile.availability)}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {isOwnProfile && onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Edit Profile"
          >
            <Edit className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{profile.rating.toFixed(1)}</div>
          <div className="text-xs text-gray-400 flex items-center justify-center">
            <Star className="w-3 h-3 text-yellow-400 mr-1" />
            Rating
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-white">{profile.completedJobs}</div>
          <div className="text-xs text-gray-400">
            {profile.userType === 'freelancer' ? 'Jobs Done' : 'Jobs Posted'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {profile.userType === 'freelancer' 
              ? formatCurrency(profile.totalEarnings)
              : formatCurrency(profile.totalEarnings)
            }
          </div>
          <div className="text-xs text-gray-400">
            {profile.userType === 'freelancer' ? 'Earned' : 'Spent'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-white">{profile.successRate}%</div>
          <div className="text-xs text-gray-400">Success Rate</div>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2">About</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {showFullBio || profile.bio.length <= 150 
              ? profile.bio 
              : `${profile.bio.slice(0, 150)}...`
            }
            {profile.bio.length > 150 && (
              <button
                onClick={() => setShowFullBio(!showFullBio)}
                className="text-purple-400 hover:text-purple-300 ml-1"
              >
                {showFullBio ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.slice(0, 8).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
              >
                {skill}
              </span>
            ))}
            {profile.skills.length > 8 && (
              <span className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-lg">
                +{profile.skills.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Location */}
        {profile.location && (
          <div className="flex items-center text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            {profile.location}
          </div>
        )}

        {/* Response Time */}
        <div className="flex items-center text-gray-400">
          <Clock className="w-4 h-4 mr-2" />
          Responds in {profile.responseTime}
        </div>

        {/* Languages */}
        {profile.languages.length > 0 && (
          <div className="flex items-center text-gray-400">
            <Globe className="w-4 h-4 mr-2" />
            {profile.languages.join(', ')}
          </div>
        )}

        {/* Member Since */}
        <div className="flex items-center text-gray-400">
          <Users className="w-4 h-4 mr-2" />
          Member since {new Date(profile.memberSince).getFullYear()}
        </div>
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {profile.badges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30"
              >
                <Award className="w-3 h-3 mr-1" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isOwnProfile && (
        <div className="mt-6 pt-6 border-t border-gray-800 flex space-x-3">
          <button
            onClick={onMessage}
            className="flex-1 btn-primary flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </button>
          {profile.userType === 'freelancer' && (
            <button className="flex-1 btn-secondary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Hire
            </button>
          )}
        </div>
      )}
    </div>
  );
}

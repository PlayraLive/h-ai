'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserProfileService, UserProfile } from '@/lib/user-profile-service';
import UserProfileCard from '@/components/UserProfileCard';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, 
  Star, 
  MessageCircle, 
  Share2,
  Flag,
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';

// Create service instance outside component to avoid hook issues
const userProfileService = new UserProfileService();

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuthContext();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        console.log('🔄 Loading profile for user:', userId);
        const userProfile = await userProfileService.getUserProfile(userId);
        
        if (userProfile) {
          setProfile(userProfile);
          console.log('✅ Profile loaded:', userProfile.name);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('❌ Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-0">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 lg:ml-0">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flag className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
                <p className="text-gray-400 mb-6">{error || 'This user profile does not exist.'}</p>
                <button
                  onClick={() => router.back()}
                  className="btn-primary flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Go Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.$id === userId;

  const tabs = [
    { id: 'about', label: 'About', icon: Star },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    { id: 'reviews', label: 'Reviews', icon: MessageCircle },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - H-AI Platform`,
          text: `Check out ${profile.name}'s profile on H-AI Platform`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 lg:ml-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => router.back()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Share Profile"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  
                  {!isOwnProfile && (
                    <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Report User">
                      <Flag className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Card */}
              <div className="mb-8">
                <UserProfileCard 
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                  onEdit={() => router.push('/en/dashboard?tab=profile')}
                />
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-800 mb-8">
                <div className="flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'about' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    {profile.bio && (
                      <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">About {profile.name}</h3>
                        <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {profile.skills.length > 0 && (
                      <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Skills & Expertise</h3>
                        <div className="flex flex-wrap gap-3">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work History Preview */}
                    <div className="glass-card p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Work</h3>
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400">Work history coming soon...</p>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="glass-card p-6 rounded-2xl">
                      <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Response Time</span>
                          <span className="text-white">{profile.responseTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Success Rate</span>
                          <span className="text-white">{profile.successRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Member Since</span>
                          <span className="text-white">{new Date(profile.memberSince).getFullYear()}</span>
                        </div>
                        {profile.userType === 'freelancer' && profile.hourlyRate && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Hourly Rate</span>
                            <span className="text-white">${profile.hourlyRate}/hr</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Languages */}
                    {profile.languages.length > 0 && (
                      <div className="glass-card p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-white mb-4">Languages</h3>
                        <div className="space-y-2">
                          {profile.languages.map((language, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-gray-300">{language}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'portfolio' && profile.userType === 'freelancer' && (
                <div>
                  <PortfolioGrid
                    userId={userId}
                    showFilters={true}
                    showSearch={true}
                    title=""
                    subtitle=""
                    limit={12}
                  />
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Reviews & Ratings</h3>
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Reviews system coming soon...</p>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Achievements & Badges</h3>
                  {profile.badges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profile.badges.map((badge, index) => (
                        <div
                          key={index}
                          className="flex items-center p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
                        >
                          <Award className="w-8 h-8 text-purple-400 mr-3" />
                          <div>
                            <h4 className="text-white font-medium">{badge}</h4>
                            <p className="text-purple-300 text-sm">Achievement unlocked</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No achievements yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

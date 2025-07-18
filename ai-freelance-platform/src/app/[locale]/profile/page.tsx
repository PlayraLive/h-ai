'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
  Edit, 
  Star, 
  MapPin, 
  Clock, 
  Verified,
  Camera,
  Plus,
  Briefcase,
  Award,
  TrendingUp,
  MessageCircle,
  Settings,
  Eye,
  Download
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn, formatCurrency } from '@/lib/utils';

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('profile');
  const [activeTab, setActiveTab] = useState('overview');

  const userProfile = {
    id: '1',
    name: 'Alex Chen',
    title: 'AI Design Specialist & Creative Director',
    avatar: '/avatars/user.jpg',
    coverImage: '/covers/profile-cover.jpg',
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 85,
    completedJobs: 156,
    responseTime: '1 hour',
    location: 'San Francisco, CA',
    verified: true,
    online: true,
    memberSince: '2022-03-15',
    totalEarnings: 125000,
    successRate: 98,
    languages: ['English', 'Mandarin', 'Spanish'],
    description: 'Passionate AI design specialist with 5+ years of experience creating stunning visuals using cutting-edge AI tools. I help businesses transform their ideas into compelling visual narratives through the power of artificial intelligence.',
    skills: [
      { name: 'Midjourney', level: 95, category: 'AI Tools' },
      { name: 'DALL-E', level: 90, category: 'AI Tools' },
      { name: 'Stable Diffusion', level: 88, category: 'AI Tools' },
      { name: 'Brand Design', level: 92, category: 'Design' },
      { name: 'UI/UX Design', level: 85, category: 'Design' },
      { name: 'Adobe Creative Suite', level: 90, category: 'Software' },
      { name: 'Figma', level: 88, category: 'Software' },
      { name: 'Prompt Engineering', level: 95, category: 'AI Skills' }
    ],
    portfolio: [
      {
        id: '1',
        title: 'AI-Generated Brand Identity',
        description: 'Complete brand identity created using AI tools for a tech startup',
        image: '/portfolio/project1.jpg',
        category: 'Branding',
        tools: ['Midjourney', 'Figma'],
        client: 'TechCorp Inc.',
        year: '2024',
        featured: true
      },
      {
        id: '2',
        title: 'E-commerce Product Visualization',
        description: 'AI-powered product images for online store',
        image: '/portfolio/project2.jpg',
        category: 'Product Design',
        tools: ['DALL-E', 'Photoshop'],
        client: 'ShopEasy',
        year: '2024',
        featured: true
      },
      {
        id: '3',
        title: 'Social Media Campaign',
        description: 'AI-generated social media assets for marketing campaign',
        image: '/portfolio/project3.jpg',
        category: 'Marketing',
        tools: ['Stable Diffusion', 'Canva'],
        client: 'Marketing Pro',
        year: '2023',
        featured: false
      }
    ],
    reviews: [
      {
        id: '1',
        client: 'Sarah Johnson',
        rating: 5,
        comment: 'Exceptional work! Alex delivered beyond expectations with creative AI-generated designs.',
        project: 'Brand Identity Design',
        date: '2024-01-10'
      },
      {
        id: '2',
        client: 'Mike Davis',
        rating: 5,
        comment: 'Professional, fast, and incredibly talented. Will definitely work with Alex again.',
        project: 'Product Visualization',
        date: '2024-01-05'
      }
    ],
    badges: ['Top Rated', 'Expert Verified', 'Fast Delivery', 'Rising Talent']
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="pt-16">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative -mt-16 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white border-4 border-gray-950">
                    {userProfile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  {userProfile.online && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-950"></div>
                  )}
                  <button className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-lg transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">{userProfile.name}</h1>
                        {userProfile.verified && (
                          <Verified className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <p className="text-xl text-gray-300 mb-2">{userProfile.title}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{userProfile.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Responds in {userProfile.responseTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      <button className="btn-secondary">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </button>
                      <Link href={`/${locale}/profile/edit`} className="btn-primary">
                        <Edit className="w-4 h-4 mr-2" />
                        {t('edit')}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold text-white">{userProfile.rating}</span>
                  </div>
                  <div className="text-sm text-gray-400">({userProfile.reviewCount} reviews)</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {formatCurrency(userProfile.hourlyRate)}/hr
                  </div>
                  <div className="text-sm text-gray-400">Hourly Rate</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-xl font-bold text-white mb-1">{userProfile.completedJobs}</div>
                  <div className="text-sm text-gray-400">Jobs Completed</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-xl font-bold text-white mb-1">{userProfile.successRate}%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-6">
                {userProfile.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={cn(
                      "text-sm px-3 py-1 rounded-full",
                      badge === 'Top Rated' && "bg-purple-500/20 text-purple-400",
                      badge === 'Expert Verified' && "bg-blue-500/20 text-blue-400",
                      badge === 'Rising Talent' && "bg-green-500/20 text-green-400",
                      badge === 'Fast Delivery' && "bg-orange-500/20 text-orange-400"
                    )}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center space-x-2 py-4 border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* About */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                  <p className="text-gray-300 leading-relaxed">{userProfile.description}</p>
                </div>

                {/* Skills */}
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">AI Skills</h3>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {userProfile.skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{skill.name}</span>
                          <span className="text-sm text-gray-400">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Languages */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Languages</h3>
                  <div className="space-y-2">
                    {userProfile.languages.map((language, index) => (
                      <div key={index} className="text-gray-300">{language}</div>
                    ))}
                  </div>
                </div>

                {/* Member Since */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Member Since</h3>
                  <p className="text-gray-300">
                    {new Date(userProfile.memberSince).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>

                {/* Total Earnings */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Total Earnings</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(userProfile.totalEarnings)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Portfolio</h2>
                <button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProfile.portfolio.map((project) => (
                  <div key={project.id} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 relative">
                      {project.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tools.map((tool, index) => (
                          <span key={index} className="bg-gray-800/50 text-gray-300 text-xs px-2 py-1 rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{project.client}</span>
                        <span>{project.year}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Client Reviews</h2>
              <div className="space-y-6">
                {userProfile.reviews.map((review) => (
                  <div key={review.id} className="glass-card p-6 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{review.client}</h4>
                        <p className="text-sm text-gray-400">{review.project}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{review.comment}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">Profile Settings</h2>
              <div className="glass-card p-6 rounded-2xl">
                <p className="text-gray-400">Settings panel coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

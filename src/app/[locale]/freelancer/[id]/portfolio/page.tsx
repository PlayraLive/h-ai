'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PortfolioService, PortfolioItem } from '@/lib/appwrite/portfolio';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import ShareButton from '@/components/shared/ShareButton';

// Try to import from Heroicons, fallback to simple icons
let ArrowLeftIcon, StarIcon, EyeIcon, HeartIcon, MapPinIcon, CalendarIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  ArrowLeftIcon = heroicons.ArrowLeftIcon;
  StarIcon = heroicons.StarIcon;
  EyeIcon = heroicons.EyeIcon;
  HeartIcon = heroicons.HeartIcon;
  MapPinIcon = heroicons.MapPinIcon;
  CalendarIcon = heroicons.CalendarIcon;
} catch {
  ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
  StarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
  EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  HeartIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
  MapPinIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  CalendarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  joinedDate: string;
  rating: number;
  reviewsCount: number;
  completedProjects: number;
  skills: string[];
  bio: string;
}

// Mock freelancer data - in real app, this would come from API
const mockFreelancers: { [key: string]: FreelancerProfile } = {
  'freelancer-alex-001': {
    id: 'freelancer-alex-001',
    name: 'Alex Rodriguez',
    title: 'Full-Stack AI Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    location: 'San Francisco, CA',
    joinedDate: '2023-01-15',
    rating: 4.9,
    reviewsCount: 47,
    completedProjects: 23,
    skills: ['React', 'Node.js', 'AI/ML', 'Python', 'TypeScript'],
    bio: 'Passionate full-stack developer specializing in AI-powered web applications. 5+ years of experience building scalable solutions for startups and enterprises.'
  },
  'freelancer-sarah-002': {
    id: 'freelancer-sarah-002',
    name: 'Sarah Chen',
    title: 'AI Artist & Creative Technologist',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    location: 'New York, NY',
    joinedDate: '2022-08-20',
    rating: 4.8,
    reviewsCount: 32,
    completedProjects: 18,
    skills: ['AI Art', 'Python', 'TensorFlow', 'Creative Coding', 'NFTs'],
    bio: 'Creative technologist combining art and AI to create stunning digital experiences. Expert in generative art and neural network applications.'
  },
  'freelancer-mike-003': {
    id: 'freelancer-mike-003',
    name: 'Mike Johnson',
    title: 'IoT & Hardware Engineer',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    location: 'Austin, TX',
    joinedDate: '2023-03-10',
    rating: 4.7,
    reviewsCount: 28,
    completedProjects: 15,
    skills: ['IoT', 'Arduino', 'React Native', 'Node.js', 'Hardware'],
    bio: 'IoT specialist with expertise in smart home systems and industrial automation. Bridging the gap between hardware and software.'
  },
  'freelancer-emma-004': {
    id: 'freelancer-emma-004',
    name: 'Emma Wilson',
    title: 'AI Content Strategist',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    location: 'London, UK',
    joinedDate: '2022-11-05',
    rating: 4.6,
    reviewsCount: 41,
    completedProjects: 29,
    skills: ['Content Strategy', 'AI Writing', 'SEO', 'Marketing', 'Vue.js'],
    bio: 'Content strategist leveraging AI to create compelling marketing campaigns and optimize content performance for global brands.'
  },
  'freelancer-david-005': {
    id: 'freelancer-david-005',
    name: 'David Kim',
    title: 'Blockchain Developer',
            avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150',
    location: 'Seoul, South Korea',
    joinedDate: '2023-02-28',
    rating: 4.8,
    reviewsCount: 19,
    completedProjects: 12,
    skills: ['Blockchain', 'Solidity', 'Web3', 'React', 'Smart Contracts'],
    bio: 'Blockchain developer focused on DeFi and governance solutions. Building the future of decentralized applications with cutting-edge technology.'
  }
};

export default function FreelancerPortfolioPage() {
  const params = useParams();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);

  useEffect(() => {
    const loadFreelancerPortfolio = async () => {
      try {
        const freelancerId = params.id as string;
        
        // Get freelancer profile
        const freelancerProfile = mockFreelancers[freelancerId];
        if (!freelancerProfile) {
          throw new Error('Freelancer not found');
        }
        setFreelancer(freelancerProfile);

        // Get portfolio items for this freelancer
        const items = await PortfolioService.getPortfolioByUser(freelancerId);
        setPortfolioItems(items);
        
      } catch (error) {
        console.error('Error loading freelancer portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFreelancerPortfolio();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading freelancer portfolio...</div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Freelancer Not Found</h1>
          <Link href="/en/freelancers" className="text-blue-400 hover:text-blue-300">
            ← Back to Freelancers
          </Link>
        </div>
      </div>
    );
  }

  const shareData = {
    url: `${window.location.origin}/en/freelancer/${freelancer.id}/portfolio`,
    title: `${freelancer.name}'s Portfolio`,
    description: `Check out ${freelancer.name}'s amazing AI-powered projects and creative work.`,
    image: freelancer.avatar,
    hashtags: ['Freelancer', 'Portfolio', 'AI', ...freelancer.skills.slice(0, 3)]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <Link
          href="/en/freelancers"
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Freelancers</span>
        </Link>

        {/* Freelancer Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            
            {/* Avatar */}
            <div className="relative">
              <Image
                src={freelancer.avatar}
                alt={freelancer.name}
                width={120}
                height={120}
                className="rounded-full border-4 border-white/20"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{freelancer.name}</h1>
              <p className="text-xl text-blue-300 mb-4">{freelancer.title}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>{freelancer.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Joined {new Date(freelancer.joinedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>{freelancer.rating} ({freelancer.reviewsCount} reviews)</span>
                </div>
              </div>

              <p className="text-gray-300 mb-6 max-w-2xl">{freelancer.bio}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {freelancer.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{freelancer.completedProjects}</div>
                  <div className="text-sm text-gray-400">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{portfolioItems.length}</div>
                  <div className="text-sm text-gray-400">Portfolio Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {portfolioItems.reduce((sum, item) => sum + (item.likesCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Likes</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Hire {freelancer.name.split(' ')[0]}
              </button>
              <button className="px-6 py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors">
                Send Message
              </button>
              <ShareButton
                data={shareData}
                platforms={['twitter', 'linkedin']}
                size="small"
                showLabels={false}
                className="justify-center"
              />
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Portfolio</h2>
            <div className="text-gray-300">
              {portfolioItems.length} {portfolioItems.length === 1 ? 'project' : 'projects'}
            </div>
          </div>

          {portfolioItems.length > 0 ? (
            <PortfolioGrid
              items={portfolioItems}
              showFilters={false}
              showSearch={false}
              title=""
              subtitle=""
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Portfolio Items Yet
              </h3>
              <p className="text-gray-400">
                {freelancer.name} hasn't added any portfolio items yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

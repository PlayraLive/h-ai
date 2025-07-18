'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortfolioService, PortfolioItem } from '@/lib/appwrite/portfolio';
import ShareButton from '@/components/shared/ShareButton';

// Try to import from Heroicons, fallback to simple icons
let ArrowLeftIcon, EyeIcon, HeartIcon, StarIcon, CodeBracketIcon, GlobeAltIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  ArrowLeftIcon = heroicons.ArrowLeftIcon;
  EyeIcon = heroicons.EyeIcon;
  HeartIcon = heroicons.HeartIcon;
  StarIcon = heroicons.StarIcon;
  CodeBracketIcon = heroicons.CodeBracketIcon;
  GlobeAltIcon = heroicons.GlobeAltIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
  EyeIcon = simpleIcons.EyeIcon;
  HeartIcon = simpleIcons.HeartIcon;
  StarIcon = simpleIcons.StarIcon;
  CodeBracketIcon = simpleIcons.CodeBracketIcon;
  GlobeAltIcon = simpleIcons.GlobeAltIcon;
}

export default function PortfolioItemPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadPortfolioItem = async () => {
      try {
        if (params.id) {
          const portfolioItem = await PortfolioService.getPortfolioItem(params.id as string);
          setItem(portfolioItem);
          
          // Increment view count
          await PortfolioService.incrementViews(params.id as string);
        }
      } catch (error: any) {
        console.error('Error loading portfolio item:', error);
        setError('Portfolio item not found');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioItem();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Portfolio Item Not Found</h1>
          <Link href="/en/portfolio" className="text-blue-400 hover:text-blue-300">
            ← Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  const shareData = {
    url: `${window.location.origin}/en/portfolio/${item.$id}`,
    title: item.title,
    description: item.description,
    image: item.thumbnailUrl,
    hashtags: ['AI', 'Portfolio', 'Creative', ...item.skills.slice(0, 3)]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden">
              <Image
                src={item.images[selectedImageIndex] || item.thumbnailUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            {item.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                      selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{item.title}</h1>
              <p className="text-xl text-gray-300 leading-relaxed">{item.description}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-400">
                <EyeIcon className="w-5 h-5" />
                <span>{item.viewsCount || 0}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <HeartIcon className="w-5 h-5" />
                <span>{item.likesCount || 0}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <StarIcon className="w-5 h-5" />
                <span>{item.averageRating || 0}</span>
              </div>
            </div>

            {/* Links */}
            {(item.liveUrl || item.githubUrl) && (
              <div className="flex space-x-4">
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <GlobeAltIcon className="w-5 h-5" />
                    <span>Live Demo</span>
                  </a>
                )}
                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <CodeBracketIcon className="w-5 h-5" />
                    <span>Source Code</span>
                  </a>
                )}
              </div>
            )}

            {/* AI Services */}
            {item.aiServices.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">AI Services Used</h3>
                <div className="flex flex-wrap gap-2">
                  {item.aiServices.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                    >
                      🤖 {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {item.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Skills & Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tools */}
            {item.tools.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tools Used</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Share This Project</h3>
              <ShareButton
                data={shareData}
                platforms={['twitter', 'linkedin', 'facebook', 'telegram']}
                size="medium"
                layout="grid"
                showLabels={true}
                showCopyLink={true}
                onShare={(platform) => {
                  console.log(`Shared ${item.title} on ${platform}`);
                }}
              />
            </div>

            {/* Creator Info */}
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Created by</h3>
              <div className="flex items-center space-x-4">
                {item.userAvatar && (
                  <Image
                    src={item.userAvatar}
                    alt={item.userName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                )}
                <div>
                  <div className="text-white font-medium">{item.userName}</div>
                  <div className="text-gray-400 text-sm">
                    Created {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

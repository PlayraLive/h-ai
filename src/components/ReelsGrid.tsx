"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Heart, Eye, Crown, Sparkles, ArrowRight, TrendingUp, Star } from "lucide-react";
import { ReelsService, Reel } from "@/lib/appwrite/reels";
import Link from "next/link";

interface ReelsGridProps {
  limit?: number;
  showTitle?: boolean;
  showViewAllButton?: boolean;
}

export default function ReelsGrid({
  limit = 4,
  showTitle = true,
  showViewAllButton = true,
}: ReelsGridProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredReel, setHoveredReel] = useState<string | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    loadReels();
  }, [limit]);

  const loadReels = async () => {
    try {
      setLoading(true);
      // Try to load real data from database
      const realReels = await ReelsService.getTopReels(limit);

      if (realReels && realReels.length > 0) {
        setReels(realReels);
      } else {
        // Fallback to mock data if no real data available
        setReels(getMockReels().slice(0, limit));
      }
    } catch (error) {
      console.error("Error loading reels:", error);
      // Fallback to mock data on error
      setReels(getMockReels().slice(0, limit));
    } finally {
      setLoading(false);
    }
  };

  const getMockReels = (): Reel[] => [
    {
      $id: "1",
      title: "AI Website Builder",
      description: "Create stunning websites with AI in minutes",
      videoUrl: "/videos/website-demo.mp4",
      thumbnailUrl: "/images/website-thumb.svg",
      category: "website",
      creatorId: "creator1",
      creatorName: "Alex Designer",
      isPremium: true,
      views: 15420,
      likes: 892,
      rating: 4.9,
      duration: 45,
      tags: ["React", "AI", "Next.js"],
    },
    {
      $id: "2",
      title: "TikTok Video Creator",
      description: "Generate viral TikTok content automatically",
      videoUrl: "/videos/tiktok-demo.mp4",
      thumbnailUrl: "/images/tiktok-thumb.svg",
      category: "video",
      creatorId: "creator2",
      creatorName: "Video Pro",
      isPremium: false,
      views: 23100,
      likes: 1340,
      rating: 4.8,
      duration: 30,
      tags: ["Python", "OpenAI", "FFmpeg"],
    },
    {
      $id: "3",
      title: "Telegram Bot Assistant",
      description: "Smart bot for customer support",
      videoUrl: "/videos/bot-demo.mp4",
      thumbnailUrl: "/images/bot-thumb.svg",
      category: "bot",
      creatorId: "creator3",
      creatorName: "Bot Master",
      isPremium: false,
      views: 18750,
      likes: 967,
      rating: 4.7,
      duration: 60,
      tags: ["Node.js", "Telegram", "AI"],
    },
    {
      $id: "4",
      title: "Logo Design AI",
      description: "Professional logos in seconds",
      videoUrl: "/videos/logo-demo.mp4",
      thumbnailUrl: "/images/logo-thumb.svg",
      category: "design",
      creatorId: "creator4",
      creatorName: "Design Guru",
      isPremium: true,
      views: 12300,
      likes: 654,
      rating: 4.6,
      duration: 25,
      tags: ["AI", "Design", "Branding"],
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleReelClick = (reel: Reel) => {
    // Analytics tracking
    console.log("Reel clicked:", reel.title);
  };

  const handleMouseEnter = (reelId: string, index: number) => {
    setHoveredReel(reelId);
    const video = videoRefs.current[index];
    if (video) {
      video.play().catch((e) => console.log("Video play failed:", e));
    }
  };

  const handleMouseLeave = (index: number) => {
    setHoveredReel(null);
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        {showTitle && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              <div className="h-8 w-64 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-4 w-96 bg-gray-800 rounded-lg animate-pulse mx-auto"></div>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div
              key={index}
              className="aspect-[9/16] bg-gray-800/50 rounded-2xl animate-pulse border border-gray-700/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Enhanced Title Section */}
      {showTitle && (
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Trending AI Solutions
            </h2>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-yellow-400 font-semibold">4.8</span>
            </div>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover cutting-edge AI solutions created by our community. 
            <span className="text-purple-400 font-medium"> Ready-to-use templates </span>
            for your next project.
          </p>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">150+</div>
              <div className="text-sm text-gray-400">Solutions</div>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-gray-400">Downloads</div>
            </div>
            <div className="w-px h-8 bg-gray-700"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.8★</div>
              <div className="text-sm text-gray-400">Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Reels Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {reels.map((reel, index) => (
          <Link
            key={reel.$id}
            href={`/en/solutions/${reel.$id}`}
            onClick={() => handleReelClick(reel)}
            onMouseEnter={() => handleMouseEnter(reel.$id!, index)}
            onMouseLeave={() => handleMouseLeave(index)}
            className="group relative aspect-[9/16] bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-900/20"
          >
            {/* Background Video/Image */}
            <div className="absolute inset-0">
              {/* Video Element */}
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                loop
                muted
                playsInline
                preload="metadata"
              />
              {/* Fallback for missing thumbnail */}
              {!reel.thumbnailUrl && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-purple-300" />
                </div>
              )}
              {/* Enhanced overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent group-hover:from-black/80" />
            </div>

            {/* Premium Badge */}
            {reel.isPremium && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg animate-pulse">
                <Crown className="w-3 h-3" />
                <span>PRO</span>
              </div>
            )}

            {/* Enhanced Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-20 h-20 bg-gradient-to-r from-purple-600/95 to-pink-600/95 backdrop-blur-lg rounded-full flex items-center justify-center border-3 border-white/30 transition-all duration-500 transform shadow-2xl ${
                  hoveredReel === reel.$id
                    ? "opacity-100 scale-100 shadow-purple-500/50"
                    : "opacity-0 scale-75"
                }`}
              >
                <Play className="w-8 h-8 text-white ml-1 drop-shadow-lg" />
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="absolute top-4 left-4 right-16">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {reel.creatorName[0]}
                    </span>
                  </div>
                  <p className="text-gray-200 text-sm font-medium">
                    {reel.creatorName}
                  </p>
                </div>
                <h3 className="text-white font-bold text-base md:text-lg leading-tight drop-shadow-lg">
                  {reel.title}
                </h3>
              </div>
            </div>

            {/* Enhanced Tech Tags */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {reel.tags?.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-3 py-1.5 bg-white/15 backdrop-blur-lg text-white text-xs font-medium rounded-full border border-white/20 shadow-lg"
                  >
                    {tag}
                  </span>
                ))}
                {reel.tags && reel.tags.length > 2 && (
                  <span className="px-3 py-1.5 bg-purple-500/30 backdrop-blur-lg text-purple-200 text-xs font-medium rounded-full border border-purple-400/20">
                    +{reel.tags.length - 2}
                  </span>
                )}
              </div>

              {/* Enhanced Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white text-xs font-medium">{formatNumber(reel.views)}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    <span className="text-white text-xs font-medium">{reel.rating}</span>
                  </div>
                </div>
                <div className="bg-green-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-green-400/30 shadow-lg">
                  ${Math.floor(reel.views * 0.01) || 99}
                </div>
              </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-purple-600/5 transition-all duration-500" />
          </Link>
        ))}
      </div>

      {/* Enhanced View All Button */}
      {showViewAllButton && (
        <div className="text-center mt-12">
          <Link
            href="/en/solutions"
            className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-purple-500/25 hover:scale-105 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <div className="relative flex items-center space-x-3">
              <span>Explore All Solutions</span>
              <div className="flex items-center space-x-1">
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </Link>
          
          <p className="text-gray-400 text-sm mt-4 max-w-md mx-auto">
            Browse our complete collection of 150+ AI-powered solutions and templates
          </p>
        </div>
      )}
    </div>
  );
}

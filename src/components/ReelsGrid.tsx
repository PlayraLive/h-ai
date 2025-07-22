"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Heart, Eye, Crown, Sparkles } from "lucide-react";
import { ReelsService, Reel } from "@/lib/appwrite/reels";
import Link from "next/link";

interface ReelsGridProps {
  limit?: number;
  showTitle?: boolean;
}

export default function ReelsGrid({
  limit = 4,
  showTitle = true,
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
      isPremium: false,
      views: 12890,
      likes: 743,
      rating: 4.6,
      duration: 25,
      tags: ["Figma", "AI", "SVG"],
    },
  ];

  const handleReelClick = async (reel: Reel) => {
    try {
      await ReelsService.incrementViews(reel.$id!);
      // Update local state
      setReels((prev) =>
        prev.map((r) =>
          r.$id === reel.$id ? { ...r, views: r.views + 1 } : r,
        ),
      );
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleMouseEnter = (reelId: string, index: number) => {
    setHoveredReel(reelId);
    const video = videoRefs.current[index];
    if (video) {
      video.currentTime = 0;
      video.play().catch(console.error);
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
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            🔥 Trending AI Solutions
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div
              key={index}
              className="aspect-[9/16] bg-gray-800/50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {reels.map((reel, index) => (
          <Link
            key={reel.$id}
            href={`/en/solutions/${reel.$id}`}
            onClick={() => handleReelClick(reel)}
            onMouseEnter={() => handleMouseEnter(reel.$id!, index)}
            onMouseLeave={() => handleMouseLeave(index)}
            className="group relative aspect-[9/16] bg-black/60 backdrop-blur-md rounded-xl overflow-hidden border border-gray-800/30 hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-purple-900/10"
          >
            {/* Background Video/Image */}
            <div className="absolute inset-0">
              {/* Video Element */}
              <video
                ref={(el) => (videoRefs.current[index] = el)}
                className="w-full h-full object-cover"
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                loop
                muted
                playsInline
                preload="metadata"
              />
              {/* Fallback for missing thumbnail */}
              {!reel.thumbnailUrl && (
                <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-gray-600" />
                </div>
              )}
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>

            {/* Premium Badge */}
            {reel.isPremium && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>PRO</span>
              </div>
            )}

            {/* Stylish Play Button - Only on Hover */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-16 h-16 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20 transition-all duration-300 transform shadow-2xl shadow-purple-500/50 ${
                  hoveredReel === reel.$id
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75"
                }`}
              >
                <Play className="w-7 h-7 text-white ml-1 drop-shadow-lg" />
              </div>
            </div>

            {/* Creator and Title */}
            <div className="absolute top-6 left-3 right-3">
              <div className="space-y-1">
                <p className="text-gray-300 text-sm font-medium">
                  {reel.creatorName}
                </p>
                <h3 className="text-white font-bold text-base md:text-lg leading-tight">
                  {reel.title}
                </h3>
              </div>
            </div>

            {/* Price Tag */}
            <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
              <span className="px-2 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-full border border-gray-700/30">
                ${Math.floor(reel.views * 0.01) || 99}
              </span>
              {reel.isPremium && index !== 0 && (
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-md text-white text-xs font-bold rounded-full border border-yellow-400/30">
                  PRO
                </span>
              )}
            </div>

            {/* Tech Tags */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {reel.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-white text-xs rounded-full border border-white/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatNumber(reel.views)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span>{reel.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Crown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  User,
  Plus,
} from "lucide-react";
import { ReelsService, Reel } from "@/lib/appwrite/reels";
import { useAuth } from "@/hooks/useAuth";

interface MobileReelsViewerProps {
  initialReelId?: string;
  category?: string;
}

export default function MobileReelsViewer({
  initialReelId,
  category,
}: MobileReelsViewerProps) {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    loadReels();
  }, [category]);

  useEffect(() => {
    // Auto-scroll to initial reel if provided
    if (initialReelId && reels.length > 0) {
      const index = reels.findIndex((reel) => reel.$id === initialReelId);
      if (index !== -1) {
        setCurrentIndex(index);
        scrollToReel(index);
      }
    }
  }, [initialReelId, reels]);

  const loadReels = async () => {
    try {
      setLoading(true);
      const reelsData = category
        ? await ReelsService.getReelsByCategory(category, 50)
        : await ReelsService.getTopReels(50);
      setReels(reelsData);
    } catch (error) {
      console.error("Error loading reels:", error);
      // Fallback to mock data
      setReels(getMockReels());
    } finally {
      setLoading(false);
    }
  };

  const getMockReels = (): Reel[] => [
    {
      $id: "1",
      title: "AI Website Builder",
      description:
        "Create stunning websites with AI in minutes! 🚀 #AI #Website #Design",
      videoUrl: "/videos/website-demo.mp4",
      thumbnailUrl: "/images/website-thumb.svg",
      category: "website",
      creatorId: "creator1",
      creatorName: "Alex Designer",
      creatorAvatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      isPremium: true,
      views: 15420,
      likes: 892,
      rating: 4.9,
      duration: 45,
      isActive: true,
      tags: ["AI", "Website", "Design"],
    },
    {
      $id: "2",
      title: "TikTok Video Creator",
      description:
        "Generate viral TikTok content automatically! 🎥 #TikTok #Video #AI",
      videoUrl: "/videos/tiktok-demo.mp4",
      thumbnailUrl: "/images/tiktok-thumb.svg",
      category: "video",
      creatorId: "creator2",
      creatorName: "Video Master",
      creatorAvatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      isPremium: false,
      views: 23100,
      likes: 1340,
      rating: 4.8,
      duration: 30,
      tags: ["Python", "Video", "AI"],
    },
    {
      $id: "3",
      title: "Telegram Bot Assistant",
      description: "Smart bot for customer support 🤖 #Bot #Telegram #AI",
      videoUrl: "/videos/bot-demo.mp4",
      thumbnailUrl: "/images/bot-thumb.svg",
      category: "bot",
      creatorId: "creator3",
      creatorName: "Bot Developer",
      creatorAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isPremium: true,
      views: 18750,
      likes: 967,
      rating: 4.7,
      duration: 60,
      tags: ["Node.js", "Telegram", "AI"],
    },
    {
      $id: "4",
      title: "Logo Design AI",
      description: "Professional logos in seconds! ✨ #Design #Logo #AI",
      videoUrl: "/videos/logo-demo.mp4",
      thumbnailUrl: "/images/logo-thumb.svg",
      category: "design",
      creatorId: "creator4",
      creatorName: "Design Guru",
      creatorAvatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      isPremium: false,
      views: 12890,
      likes: 743,
      rating: 4.6,
      duration: 25,
      tags: ["Figma", "AI", "SVG"],
    },
  ];

  const scrollToReel = (index: number) => {
    if (containerRef.current) {
      const container = containerRef.current;
      const targetScrollTop = index * container.clientHeight;
      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / containerHeight);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < reels.length
      ) {
        setCurrentIndex(newIndex);

        // Pause previous video and play current
        videoRefs.current.forEach((video, index) => {
          if (video) {
            if (index === newIndex) {
              video.play();
            } else {
              video.pause();
            }
          }
        });
      }
    }
  };

  const handleLike = async (reel: Reel) => {
    if (!user) return;

    try {
      await ReelsService.likeReel(reel.$id!, user.$id!);
      const newLikedReels = new Set(likedReels);
      if (likedReels.has(reel.$id!)) {
        newLikedReels.delete(reel.$id!);
      } else {
        newLikedReels.add(reel.$id!);
      }
      setLikedReels(newLikedReels);

      // Update reel likes count
      setReels((prev) =>
        prev.map((r) =>
          r.$id === reel.$id
            ? { ...r, likes: r.likes + (likedReels.has(reel.$id!) ? -1 : 1) }
            : r,
        ),
      );
    } catch (error) {
      console.error("Error liking reel:", error);
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

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Reels Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.$id}
            className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
          >
            {/* Video Background */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              className="absolute inset-0 w-full h-full object-cover"
              src={reel.videoUrl}
              poster={reel.thumbnailUrl}
              loop
              muted={isMuted}
              playsInline
              autoPlay={index === currentIndex}
              onLoadedData={() => {
                if (index === currentIndex && isPlaying) {
                  videoRefs.current[index]?.play();
                }
              }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Premium Badge */}
            {reel.isPremium && (
              <div className="absolute top-16 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 z-10">
                <Crown className="w-4 h-4" />
                <span>PRO</span>
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
              <div className="flex items-end justify-between">
                {/* Left Content */}
                <div className="flex-1 mr-4">
                  {/* Creator Info */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                      {(reel as any).creatorAvatar ? (
                        <img
                          src={(reel as any).creatorAvatar}
                          alt={reel.creatorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        @{reel.creatorName}
                      </h3>
                      <p className="text-gray-300 text-sm capitalize">
                        {reel.category} creator
                      </p>
                    </div>
                    <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Title and Description */}
                  <div className="mb-4">
                    <h2 className="text-white font-bold text-xl mb-2">
                      {reel.title}
                    </h2>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {reel.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reel.tags?.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-blue-400 text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Reel Statistics */}
                  <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 space-y-3">
                    <div className="text-white font-semibold text-sm mb-2">
                      📊 Статистика решения
                    </div>

                    {/* Main Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                        <div className="text-white font-bold text-lg">
                          {Math.floor(reel.views * 0.15)}
                        </div>
                        <div className="text-gray-300 text-xs">
                          Заказов выполнено
                        </div>
                      </div>
                      <div className="bg-green-600/20 rounded-xl p-3 text-center">
                        <div className="text-green-400 font-bold text-lg">
                          ${Math.floor(reel.views * 0.02)}
                        </div>
                        <div className="text-gray-300 text-xs">Общий доход</div>
                      </div>
                    </div>

                    {/* Service Types */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-600/20 rounded-lg p-2 text-center">
                        <div className="text-blue-400 font-semibold text-sm">
                          {Math.floor(reel.views * 0.08)}
                        </div>
                        <div className="text-gray-400 text-xs">AI-заказы</div>
                      </div>
                      <div className="bg-purple-600/20 rounded-lg p-2 text-center">
                        <div className="text-purple-400 font-semibold text-sm">
                          {Math.floor(reel.views * 0.05)}
                        </div>
                        <div className="text-gray-400 text-xs">Фрилансеры</div>
                      </div>
                      <div className="bg-pink-600/20 rounded-lg p-2 text-center">
                        <div className="text-pink-400 font-semibold text-sm">
                          {Math.floor(reel.views * 0.02)}
                        </div>
                        <div className="text-gray-400 text-xs">В проектах</div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300 text-xs">
                          Успешность: 98%
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-300 text-xs">
                          Время: &lt; 5 мин
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col items-center space-y-6">
                  {/* Like */}
                  <button
                    onClick={() => handleLike(reel)}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        likedReels.has(reel.$id!)
                          ? "bg-red-500 scale-110"
                          : "bg-gray-800/50 backdrop-blur-sm"
                      }`}
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          likedReels.has(reel.$id!)
                            ? "text-white fill-current"
                            : "text-white"
                        }`}
                      />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {formatNumber(reel.likes)}
                    </span>
                  </button>

                  {/* Comment */}
                  <button className="flex flex-col items-center space-y-1">
                    <div className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      {Math.floor(reel.likes * 0.3)}
                    </span>
                  </button>

                  {/* Share */}
                  <button className="flex flex-col items-center space-y-1">
                    <div className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Share2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white text-xs font-medium">
                      Share
                    </span>
                  </button>

                  {/* Save */}
                  <button className="flex flex-col items-center space-y-1">
                    <div className="w-12 h-12 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Bookmark className="w-6 h-6 text-white" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Play/Pause Control */}
            <button
              onClick={() => {
                const video = videoRefs.current[index];
                if (video) {
                  if (video.paused) {
                    video.play();
                    setIsPlaying(true);
                  } else {
                    video.pause();
                    setIsPlaying(false);
                  }
                }
              }}
              className="absolute inset-0 w-full h-full z-5"
            />

            {/* Volume Control */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-20 right-4 w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1 z-20">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white" : "bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

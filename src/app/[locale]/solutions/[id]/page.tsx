"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TopNav from "@/components/TopNav";
import ShareButton from "@/components/shared/ShareButton";
import {
  ArrowLeft,
  Play,
  Heart,
  Eye,
  Share2,
  Crown,
  Star,
  Clock,
  DollarSign,
  User,
  Bot,
  Zap,
  CheckCircle,
  Plus,
} from "lucide-react";
import { ReelsService, Reel } from "@/lib/appwrite/reels";
import { OrdersService } from "@/lib/appwrite/orders";
import { useAuth } from "@/hooks/useAuth";
import ReelAnalytics from "@/components/ReelAnalytics";

export default function SolutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [reel, setReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderType, setOrderType] = useState<"freelancer" | "ai">("freelancer");

  useEffect(() => {
    loadReel();
  }, [params.id]);

  const loadReel = async () => {
    try {
      setLoading(true);
      // В реальном приложении здесь будет запрос к API
      // const reelData = await ReelsService.getReel(params.id as string);

      // Mock data для демо
      const mockReel: Reel = {
        $id: params.id as string,
        title: "AI Website Builder Pro",
        description:
          "Create professional websites with artificial intelligence in minutes. Our AI analyzes your requirements and creates a unique design optimized for conversion.",
        videoUrl: "/videos/website-demo.mp4",
        thumbnailUrl: "/images/website-thumb.jpg",
        category: "website",
        creatorId: "creator1",
        creatorName: "Alex Designer",
        isPremium: true,
        views: 15420,
        likes: 892,
        rating: 4.9,
        duration: 45,

        tags: ["AI", "Website", "Design", "Landing Page", "E-commerce"],
      };

      setReel(mockReel);
    } catch (error) {
      console.error("Error loading reel:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !reel) return;

    try {
      await ReelsService.likeReel(reel.$id!, user.$id!);
      setIsLiked(!isLiked);
      setReel((prev) =>
        prev ? { ...prev, likes: prev.likes + (isLiked ? -1 : 1) } : null,
      );
    } catch (error) {
      console.error("Error liking reel:", error);
    }
  };

  const handleAddToProject = () => {
    if (!user) {
      router.push("/en/auth/login");
      return;
    }
    // Logic for adding to project
    alert("Solution added to your project!");
  };

  const handleOrder = async (type: "freelancer" | "ai") => {
    if (!user || !reel) {
      router.push("/en/auth/login");
      return;
    }

    try {
      const amount = type === "ai" ? 99 : 299;

      const order = await OrdersService.createOrder({
        buyerId: user.$id,
        buyerName: user.name || "Anonymous",
        sellerId: reel.creatorId,
        sellerName: reel.creatorName,
        solutionId: reel.$id!,
        solutionTitle: reel.title,
        orderType: type,
        amount,
        requirements: `Order for ${reel.title} via ${type === "ai" ? "AI Service" : "Freelancer"}`,
      });

      alert(`Order created successfully! Order ID: ${order.$id}`);
      setShowOrderModal(false);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
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
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading solution...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reel) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Solution not found
            </h1>
            <p className="text-gray-400 mb-6">
              The requested solution does not exist.
            </p>
            <Link
              href="/en/solutions"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Back to solutions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <TopNav />

      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/en/solutions"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to solutions</span>
            </Link>

            <div className="flex items-center space-x-3">
              <ShareButton
                data={{
                  url:
                    typeof window !== "undefined" ? window.location.href : "",
                  title: `${reel?.title || "AI Solution"} - AI Solution`,
                  description: `Check out this amazing AI solution: ${reel?.description || "Discover innovative AI-powered solutions"}`,
                }}
                platforms={["twitter", "linkedin"]}
                size="small"
                showLabels={false}
                className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-700/50">
                {/* Video Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-300">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </button>
                </div>

                {/* Premium Badge */}
                {reel.isPremium && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Crown className="w-4 h-4" />
                    <span>PRO</span>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="mt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {reel.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(reel.views)} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{reel.duration}с</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{reel.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isLiked
                          ? "bg-red-600 text-white"
                          : "bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                      />
                    </button>
                    <span className="text-gray-400 text-sm">
                      {formatNumber(reel.likes)}
                    </span>
                  </div>
                </div>

                {/* Creator Info */}
                <div className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {reel.creatorName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      AI Solutions Creator
                    </p>
                  </div>
                  <Link
                    href={`/en/freelancers/${reel.creatorId}`}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Profile
                  </Link>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {reel.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {reel.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm border border-purple-600/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Options */}
              <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Order Solution
                </h3>

                <div className="space-y-4">
                  {/* Freelancer Option */}
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white">
                          From Freelancer
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          от $299
                        </div>
                        <div className="text-xs text-gray-400">3-7 days</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      Personal customization for your requirements
                    </p>
                    <button
                      onClick={() => handleOrder("freelancer")}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Order from Freelancer
                    </button>
                  </div>

                  {/* AI Service Option */}
                  <div className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-purple-400" />
                        <span className="font-semibold text-white">
                          AI Service
                        </span>
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">$99</div>
                        <div className="text-xs text-purple-400">Instantly</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-4">
                      Ready solution with customization options
                    </p>
                    <button
                      onClick={() => handleOrder("ai")}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 font-medium"
                    >
                      Order from AI
                    </button>
                  </div>
                </div>

                {/* Add to Project */}
                <div className="mt-6 pt-6 border-t border-gray-700/30">
                  <button
                    onClick={handleAddToProject}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors border border-gray-600/50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Project</span>
                  </button>
                </div>
              </div>

              {/* Solution Statistics */}
              <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  📊 Solution Statistics
                </h3>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {Math.floor(reel.views * 0.15)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Orders completed
                    </div>
                  </div>
                  <div className="bg-green-600/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      ${Math.floor(reel.views * 0.02)}
                    </div>
                    <div className="text-gray-400 text-sm">Total revenue</div>
                  </div>
                </div>

                {/* Service Breakdown */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-white font-semibold">
                    Order distribution:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300 text-sm">
                          AI Service
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-medium">
                          65%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 text-sm">
                          Freelancers
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: "35%" }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-medium">
                          35%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-green-400 font-bold text-lg">98%</div>
                    <div className="text-gray-400 text-xs">Success rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold text-lg">
                      &lt; 5 мин
                    </div>
                    <div className="text-gray-400 text-xs">Average time</div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  What's included
                </h3>
                <div className="space-y-3">
                  {[
                    "Responsive design",
                    "SEO optimization",
                    "CMS integration",
                    "Mobile version",
                    "30 days support",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="mt-12">
            <ReelAnalytics
              reelId={reel.$id!}
              views={reel.views}
              likes={reel.likes}
              rating={reel.rating}
              category={reel.category}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

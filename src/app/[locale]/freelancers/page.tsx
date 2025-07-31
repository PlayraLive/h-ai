"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Star,
  MapPin,
  DollarSign,
  Clock,
  MessageCircle,
  Heart,
  HeartHandshake,
  Eye,
  Users,
  Award,
  CheckCircle,
  SlidersHorizontal,
  ArrowRight,
  Verified,
  Briefcase,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { FreelancerCardSkeleton } from "@/components/Loading";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import UserJobsModal from "@/components/UserJobsModal";
import FullScreenVideoAvatar from "@/components/FullScreenVideoAvatar";

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  completedJobs: number;
  responseTime: string;
  location: string;
  skills: string[];
  description: string;
  languages: string[];
  availability: "available" | "busy" | "offline";
  verified: boolean;
  topRated: boolean;
  category: string;
  portfolio: string[];
}

export default function FreelancersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [rateRange, setRateRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteFreelancers, setFavoriteFreelancers] = useState<Set<string>>(
    new Set(),
  );
  const [sortBy, setSortBy] = useState("rating");
  const [showUserJobsModal, setShowUserJobsModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] =
    useState<Freelancer | null>(null);

  const searchParams = useSearchParams();
  const { success, info } = useToast();

  const mockFreelancers: Freelancer[] = [
    {
      id: "freelancer-alex-001",
      name: "Alex Rodriguez",
      title: "Full-Stack AI Developer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      rating: 4.9,
      reviewCount: 47,
      hourlyRate: 95,
      completedJobs: 23,
      responseTime: "1 hour",
      location: "San Francisco, CA",
      skills: ["React", "Node.js", "AI/ML", "Python", "TypeScript", "Next.js"],
      description:
        "Passionate full-stack developer specializing in AI-powered web applications. 5+ years of experience building scalable solutions for startups and enterprises.",
      languages: ["English", "Spanish"],
      availability: "available",
      verified: true,
      topRated: true,
      category: "ai_design",
      portfolio: ["/api/placeholder/300/200", "/api/placeholder/300/200"],
    },
    {
      id: "freelancer-sarah-002",
      name: "Sarah Chen",
      title: "AI Artist & Creative Technologist",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      rating: 4.8,
      reviewCount: 32,
      hourlyRate: 85,
      completedJobs: 18,
      responseTime: "2 hours",
      location: "New York, NY",
      skills: [
        "AI Art",
        "Python",
        "TensorFlow",
        "Creative Coding",
        "NFTs",
        "Stable Diffusion",
      ],
      description:
        "Creative technologist combining art and AI to create stunning digital experiences. Expert in generative art and neural network applications.",
      languages: ["English", "Mandarin"],
      availability: "available",
      verified: true,
      topRated: true,
      category: "ai_design",
      portfolio: [
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300",
      ],
    },
    {
      id: "freelancer-mike-003",
      name: "Mike Johnson",
      title: "IoT & Hardware Engineer",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      rating: 4.7,
      reviewCount: 28,
      hourlyRate: 80,
      completedJobs: 15,
      responseTime: "3 hours",
      location: "Austin, TX",
      skills: [
        "IoT",
        "Arduino",
        "React Native",
        "Node.js",
        "Hardware",
        "Smart Home",
      ],
      description:
        "IoT specialist with expertise in smart home systems and industrial automation. Bridging the gap between hardware and software.",
      languages: ["English"],
      availability: "available",
      verified: true,
      topRated: false,
      category: "ai_development",
      portfolio: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300",
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300",
      ],
    },
  ];

  useEffect(() => {
    // Симуляция загрузки данных
    setLoading(true);
    setTimeout(() => {
      setFreelancers(mockFreelancers);
      setLoading(false);
    }, 1500);

    // Получение параметров из URL
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handleFavoriteFreelancer = (freelancerId: string) => {
    const newFavorites = new Set(favoriteFreelancers);
    if (favoriteFreelancers.has(freelancerId)) {
      newFavorites.delete(freelancerId);
      info(
        "Removed from favorites",
        "Freelancer has been removed from your favorites.",
      );
    } else {
      newFavorites.add(freelancerId);
      success(
        "Added to favorites!",
        "Freelancer has been added to your favorites.",
      );
    }
    setFavoriteFreelancers(newFavorites);
  };

  const handleHire = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowUserJobsModal(true);
  };

  const handleCloseJobsModal = () => {
    setShowUserJobsModal(false);
    setSelectedFreelancer(null);
  };

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || freelancer.category === selectedCategory;
    const matchesAvailability =
      selectedAvailability === "all" ||
      freelancer.availability === selectedAvailability;
    const matchesRate =
      freelancer.hourlyRate >= rateRange[0] &&
      freelancer.hourlyRate <= rateRange[1];

    return (
      matchesSearch && matchesCategory && matchesAvailability && matchesRate
    );
  });

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "rate_low":
        return a.hourlyRate - b.hourlyRate;
      case "rate_high":
        return b.hourlyRate - a.hourlyRate;
      case "experience":
        return b.completedJobs - a.completedJobs;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find AI Freelancers
            </h1>
            <p className="text-xl text-gray-400">
              Connect with top AI specialists worldwide
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search freelancers, skills..."
                  className="input-field pl-12 w-full"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  <option value="ai_design">AI Design</option>
                  <option value="ai_development">AI Development</option>
                  <option value="ai_video">AI Video</option>
                  <option value="ai_games">AI Games</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="rate_low">Lowest Rate</option>
                  <option value="rate_high">Highest Rate</option>
                  <option value="experience">Most Experience</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "btn-secondary flex items-center space-x-2",
                    showFilters && "bg-purple-500/20 text-purple-400",
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Rate: ${rateRange[0]} - ${rateRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={rateRange[1]}
                    onChange={(e) =>
                      setRateRange([rateRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedAvailability("all");
                      setRateRange([0, 200]);
                    }}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400">
              {loading
                ? "Loading..."
                : `${sortedFreelancers.length} freelancers found`}
            </p>
          </div>

          {/* Freelancers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 9 }).map((_, index) => (
                <FreelancerCardSkeleton key={index} />
              ))
            ) : sortedFreelancers.length > 0 ? (
              sortedFreelancers.map((freelancer) => (
                <FreelancerCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  isFavorite={favoriteFreelancers.has(freelancer.id)}
                  onFavorite={() => handleFavoriteFreelancer(freelancer.id)}
                  onHire={handleHire}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  No freelancers found matching your criteria
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedAvailability("all");
                    setRateRange([0, 200]);
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Jobs Modal */}
      <UserJobsModal
        isOpen={showUserJobsModal}
        onClose={handleCloseJobsModal}
        freelancerId={selectedFreelancer?.id}
        freelancerName={selectedFreelancer?.name}
      />
    </div>
  );
}

function FreelancerCard({
  freelancer,
  isFavorite,
  onFavorite,
  onHire,
}: {
  freelancer: Freelancer;
  isFavorite: boolean;
  onFavorite: () => void;
  onHire: (freelancer: Freelancer) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available";
      case "busy":
        return "Busy";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl hover:shadow-2xl transition-all duration-300 group cursor-pointer",
        "min-h-[400px] bg-gradient-to-br from-gray-900 to-gray-800",
        freelancer.topRated && "ring-2 ring-purple-500/50",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Avatar Background */}
      <div className="absolute inset-0">
        <FullScreenVideoAvatar
          specialistId={freelancer.id}
          specialistName={freelancer.name}
          specialistType="freelancer"
          className="w-full h-full"
          autoPlay={true}
          isHovered={isHovered}
          showControls={false}
          onVideoReady={() => console.log(`Video ready for ${freelancer.name}`)}
          onError={(error) => {
            console.error(`Video error for ${freelancer.name}:`, error);
          }}
        />
      </div>
      
      {/* Dark overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Content overlay */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-between">
        {/* Top section - Status indicators */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            {/* Availability indicator */}
            <div
              className={cn(
                "w-3 h-3 rounded-full border-2 border-white/50",
                getAvailabilityColor(freelancer.availability),
              )}
            />
            {freelancer.verified && (
              <CheckCircle className="w-5 h-5 text-blue-400" />
            )}
            {freelancer.topRated && (
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white/70 hover:text-red-400 transition-all hover:bg-black/50"
          >
            {isFavorite ? (
              <HeartHandshake className="w-5 h-5 text-red-400" />
            ) : (
              <Heart className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Middle section - grows to fill space */}
        <div className="flex-1" />
        
        {/* Bottom section - Freelancer info */}
        <div className="space-y-4">
          {/* Name and title */}
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                {freelancer.name}
              </h3>
            </div>
            <p className="text-sm text-white/80">{freelancer.title}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {freelancer.topRated && (
              <span className="px-2 py-1 bg-purple-500/30 backdrop-blur-sm text-purple-300 text-xs rounded-full border border-purple-400/30">
                Top Rated
              </span>
            )}
            {freelancer.verified && (
              <span className="px-2 py-1 bg-blue-500/30 backdrop-blur-sm text-blue-300 text-xs rounded-full border border-blue-400/30">
                Verified
              </span>
            )}
            <span
              className={cn(
                "px-2 py-1 text-xs rounded-full backdrop-blur-sm border",
                getAvailabilityStyles(freelancer.availability),
              )}
            >
              {getAvailabilityText(freelancer.availability)}
            </span>
          </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white font-semibold">
              {freelancer.rating}
            </span>
          </div>
          <div className="text-xs text-white/60">
            ({freelancer.reviewCount} reviews)
          </div>
        </div>
        <div className="text-center">
          <div className="text-white font-semibold mb-1">
            ${freelancer.hourlyRate}/hr
          </div>
          <div className="text-xs text-white/60">
            {freelancer.completedJobs} jobs
          </div>
        </div>
      </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Link
              href={`/en/messages?freelancer=${freelancer.id}`}
              className="flex-1 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all border border-white/20 text-center flex items-center justify-center space-x-2"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHire(freelancer);
              }}
              className="flex-1 bg-green-500/80 backdrop-blur-sm hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-all border border-green-400/30 text-center flex items-center justify-center space-x-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>Hire</span>
            </button>
          </div>
        </div>
    </div>
  );
}

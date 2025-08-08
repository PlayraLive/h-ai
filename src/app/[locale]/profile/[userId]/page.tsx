"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import {
  Share2, 
  Linkedin, 
  Twitter, 
  MapPin, 
  Calendar, 
  Star,
  DollarSign,
  Briefcase,
  Award,
  Users,
  MessageCircle,
  ExternalLink
} from "lucide-react";

interface UserProfile {
  $id: string;
  name: string;
  email: string;
  userType: "freelancer" | "client";
  avatar?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  hourlyRate?: number;
  rating?: number;
  totalEarnings?: number;
  completedProjects?: number;
  joinedAt?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface PortfolioItem {
  $id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  budget: number;
  completedAt: string;
  clientName: string;
  rating?: number;
  review?: string;
}

interface Solution {
  $id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  createdAt: string;
  downloads: number;
  rating: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const { user } = useAuthContext();
  const { success, error } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "solutions">("overview");

  useEffect(() => {
    loadProfile();
  }, [userId]);

    const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        setProfile(userData);
      }

      // Load portfolio items
      const portfolioResponse = await fetch(`/api/portfolio/${userId}`);
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setPortfolio(portfolioData.portfolio || []);
        
        // Update profile with stats from portfolio
        if (portfolioData.stats) {
          setProfile(prev => prev ? {
            ...prev,
            totalEarnings: portfolioData.stats.totalEarnings,
            completedProjects: portfolioData.stats.completedProjects,
            rating: parseFloat(portfolioData.stats.averageRating),
          } : prev);
        }
      }

      // Load solutions
      const solutionsResponse = await fetch(`/api/solutions/user/${userId}`);
      if (solutionsResponse.ok) {
        const solutionsData = await solutionsResponse.json();
        setSolutions(solutionsData);
        }
      } catch (err) {
      console.error("Error loading profile:", err);
      error("Failed to load profile", "Please try again later");
      } finally {
        setLoading(false);
      }
    };

  const handleShare = async (platform: "linkedin" | "twitter") => {
    const url = window.location.href;
    const text = `${profile?.name} - ${profile?.userType === "freelancer" ? "Freelancer" : "Client"} on H-Ai`;
    
    let shareUrl = "";
    if (platform === "linkedin") {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }

    window.open(shareUrl, "_blank");
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success("Link copied!", "Profile link has been copied to clipboard");
    } catch (err) {
      error("Failed to copy link", "Please try again");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-800 rounded-2xl mb-8"></div>
              <div className="h-64 bg-gray-800 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
            <p className="text-gray-400">This user profile could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.$id === userId;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="glass-card p-8 rounded-2xl mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                {profile.userType === "freelancer" && profile.rating && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {profile.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {profile.userType === "freelancer" ? "Freelancer" : "Client"}
                      </span>
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </span>
                      )}
                      {profile.joinedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(profile.joinedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Share Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyProfileLink}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                <button
                      onClick={() => handleShare("linkedin")}
                      className="btn-secondary"
                      title="Share on LinkedIn"
                >
                      <Linkedin className="w-4 h-4" />
                </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="btn-secondary"
                      title="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-gray-300 mb-4">{profile.bio}</p>
                )}

                {/* Stats */}
                {profile.userType === "freelancer" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.completedProjects || 0}</div>
                      <div className="text-sm text-gray-400">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">${profile.totalEarnings?.toLocaleString() || 0}</div>
                      <div className="text-sm text-gray-400">Earnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.hourlyRate || 0}</div>
                      <div className="text-sm text-gray-400">$/hr</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.rating?.toFixed(1) || "N/A"}</div>
                      <div className="text-sm text-gray-400">Rating</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
              </div>

              {/* Tabs */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium transition-all",
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium transition-all",
                  activeTab === "portfolio"
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                Portfolio ({portfolio.length})
              </button>
              {profile.userType === "freelancer" && (
                      <button
                  onClick={() => setActiveTab("solutions")}
                  className={cn(
                    "px-4 py-2 rounded-xl font-medium transition-all",
                    activeTab === "solutions"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  Solutions ({solutions.length})
                      </button>
              )}
              </div>

              {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                    {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span
                              key={index}
                          className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                {/* Social Links */}
                {profile.socialLinks && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Connect</h3>
                    <div className="flex gap-4">
                      {profile.socialLinks.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Linkedin className="w-5 h-5" />
                          LinkedIn
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {profile.socialLinks.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Twitter className="w-5 h-5" />
                          Twitter
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {profile.socialLinks.website && (
                        <a
                          href={profile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          Website
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                            </div>
                          )}

            {activeTab === "portfolio" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolio.map((item) => (
                  <div key={item.$id} className="glass-card p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{item.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-4">{item.description}</p>
                    
                    {/* Client and Review */}
                    <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Client: {item.clientName}</span>
                        <span className="text-sm text-gray-500">{new Date(item.completedAt).toLocaleDateString()}</span>
                            </div>
                      {item.review && (
                        <div className="text-sm text-gray-300 italic">
                          "{item.review}"
                        </div>
                      )}
                      </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="text-green-400 font-semibold">${item.budget.toLocaleString()}</span>
                      <span className="text-blue-400">{item.category}</span>
                    </div>
                  </div>
                ))}
                {portfolio.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400">No portfolio items yet.</p>
                  </div>
                )}
                </div>
              )}

            {activeTab === "solutions" && profile.userType === "freelancer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((solution) => (
                  <div key={solution.$id} className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-2">{solution.title}</h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">{solution.description}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Downloads</div>
                        <div className="text-white font-semibold">{solution.downloads}</div>
                          </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Rating</div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-white font-semibold">{solution.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-semibold">${solution.price}</span>
                      <span className="text-blue-400 text-sm">{solution.category}</span>
                    </div>
                  </div>
                ))}
                {solutions.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400">No solutions yet.</p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

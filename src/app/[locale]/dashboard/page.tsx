"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { UsersService } from "@/lib/appwrite/users";
import { JobsService } from "@/lib/appwrite/jobs";
import {
  databases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite/database";
import { InteractionsService } from "@/lib/appwrite/interactions";
import { AIOrderService, OrderCard } from '@/lib/services/ai-order-service';
import OrderCardComponent from '@/components/messaging/OrderCard';

import PortfolioGrid from "@/components/portfolio/PortfolioGrid";
import AddPortfolioForm from "@/components/portfolio/AddPortfolioForm";
import UserLevelCard from "@/components/gamification/UserLevelCard";
import AchievementsGrid from "@/components/gamification/AchievementsGrid";
import Navbar from "@/components/Navbar";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Star,
  Clock,
  Users,
  MessageCircle,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle,
  Home,
  Search,
  FileText,
  Video as VideoIcon,
  Play,
  Heart,
  Trash2,
  Bot,
} from "lucide-react";
// Navbar removed - using Sidebar instead
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";
import { ReelsService, Reel } from "@/lib/appwrite/reels";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Check URL params for tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);
  const [filterStatus, setFilterStatus] = useState("all");
  const [userType, setUserType] = useState<"freelancer" | "client">(
    "freelancer",
  );
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [solutions, setSolutions] = useState<Reel[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  // Add AI orders state
  const [aiOrders, setAiOrders] = useState<OrderCard[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Real user stats from database
  const [userStats, setUserStats] = useState({
    portfolioItems: 0,
    totalViews: 0,
    totalLikes: 0,
    averageRating: 0,
    featuredItems: 0,
    nftItems: 0,
    streakDays: 0,
    followers: 0,
    following: 0,
    commentsReceived: 0,
    sharesReceived: 0,
    joinedDate: new Date().toISOString(),
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const totalPoints = 485; // Calculate based on achievements
  const unlockedAchievements = [
    "first_portfolio",
    "first_thousand",
    "liked_creator",
    "featured_debut",
    "consistent_creator",
  ];
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  // Load user's solutions and stats
  const loadSolutions = useCallback(async () => {
    if (!user) return;

    setLoadingSolutions(true);
    try {
      const userSolutions = await ReelsService.getReelsByCreator(user.$id);
      setSolutions(userSolutions);
    } catch (error) {
      console.error("Error loading solutions:", error);
    } finally {
      setLoadingSolutions(false);
    }
  }, [user]);

  // Load real user statistics
  const loadUserStats = useCallback(async () => {
    if (!user) return;

    setStatsLoading(true);
    try {
      // Get user profile data
      const userProfile = await UsersService.getUserProfile(user.$id);

      if (userProfile) {
        // Get portfolio count
        const portfolioResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PORTFOLIO,
          [Query.equal("userId", user.$id)],
        );

        // Get user's reels
        const reelsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.REELS,
          [Query.equal("creatorId", user.$id)],
        );

        // Get interaction stats for user's content
        let totalViews = 0;
        let totalLikes = 0;
        let featuredItems = 0;

        // Calculate stats from portfolio
        for (const item of portfolioResponse.documents) {
          const stats = await InteractionsService.getInteractionStats(
            item.$id,
            "portfolio",
          );
          totalViews += stats.views;
          totalLikes += stats.likes;
          if (item.featured) featuredItems++;
        }

        // Calculate stats from reels
        for (const reel of reelsResponse.documents) {
          const stats = await InteractionsService.getInteractionStats(
            reel.$id,
            "reel",
          );
          totalViews += stats.views;
          totalLikes += stats.likes;
        }

        // Get followers and following
        const followers = await InteractionsService.getUserFollowers(user.$id);
        const following = await InteractionsService.getUserFollowing(user.$id);

        // Get user's projects
        const projectsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PROJECTS,
          [Query.equal("freelancerId", user.$id)],
        );

        // Calculate days since joining
        const joinDate = new Date(
          userProfile.memberSince || userProfile.$createdAt,
        );
        const today = new Date();
        const daysSinceJoining = Math.floor(
          (today.getTime() - joinDate.getTime()) / (1000 * 3600 * 24),
        );

        setUserStats({
          portfolioItems: portfolioResponse.documents.length,
          totalViews,
          totalLikes,
          averageRating: userProfile.rating || 0,
          featuredItems,
          nftItems: reelsResponse.documents.filter((r: any) => r.isPremium)
            .length,
          streakDays: Math.min(daysSinceJoining, 30),
          followers: followers.length,
          following: following.length,
          commentsReceived: userProfile.reviewsCount || 0,
          sharesReceived: 0,
          joinedDate: userProfile.memberSince || userProfile.$createdAt,
        });
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  // Load AI orders
  useEffect(() => {
    if (!user) return;
    
    setLoadingOrders(true);
    try {
      const userOrders = AIOrderService.getUserOrders(user.$id);
      const orderCards = userOrders.map(order => 
        AIOrderService.generateOrderCard(order, userType === 'freelancer' ? 'specialist' : 'client')
      );
      setAiOrders(orderCards);
    } catch (error) {
      console.error('Error loading AI orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  }, [user, userType]);

  // Set user type based on user data
  useEffect(() => {
    if (user && user.userType) {
      setUserType(user.userType);
    }
  }, [user]);

  // Load solutions when user changes or tab becomes active
  useEffect(() => {
    if (user && activeTab === "solutions") {
      loadSolutions();
    }
  }, [user, activeTab, loadSolutions]);

  // Load user stats when component mounts
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user, loadUserStats]);

  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Handle edit solution
  const handleEditSolution = (solution: Reel) => {
    // Redirect to edit page
    router.push(`/en/dashboard/solutions/edit/${solution.$id}`);
  };

  // Handle delete solution
  const handleDeleteSolution = async (solutionId: string) => {
    if (!confirm("Are you sure you want to delete this solution?")) {
      return;
    }

    try {
      await ReelsService.deleteReel(solutionId);
      // Reload solutions
      loadSolutions();
      alert("Solution deleted successfully!");
    } catch (error) {
      console.error("Error deleting solution:", error);
      alert("Failed to delete solution. Please try again.");
    }
  };

  // Debug: log auth state
  useEffect(() => {
    console.log("Dashboard auth state:", {
      user: user ? { name: user.name, email: user.email, id: user.$id } : null,
      isAuthenticated,
      isLoading,
    });
  }, [user, isAuthenticated, isLoading]);

  // Проверка аутентификации
  useEffect(() => {
    // Простая проверка без перезагрузки
    if (!isLoading && !isAuthenticated && !user) {
      console.log("Dashboard: User not authenticated, redirecting to login");
      router.push("/en/auth/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Проверяем аутентификацию после загрузки
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Please log in to access the dashboard
          </p>
          <button
            onClick={() => router.push("/en/login")}
            className="btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Safe formatting functions
  const safeCurrency = (amount: number) => {
    try {
      return formatCurrency(amount);
    } catch (e) {
      return `$${amount}`;
    }
  };

  const safeRelativeTime = (date: string) => {
    try {
      return formatRelativeTime(date);
    } catch (e) {
      return new Date(date).toLocaleDateString();
    }
  };

  // Temporarily disable auth check
  // if (!isAuthenticated) {
  //   return null;
  // }

  // Dynamic data based on user type and real user data
  const freelancerStats = [
    {
      label: "Total Earnings",
      value: safeCurrency(user?.totalEarnings || 0),
      change: "+12%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-400",
      bgGradient: "from-green-500 to-emerald-500",
      shadowColor: "shadow-green-500/25",
    },
    {
      label: "Active Projects",
      value: (user?.totalEarnings
        ? Math.floor(user.totalEarnings / 1000)
        : userStats.portfolioItems
      ).toString(),
      change: `+${Math.max(0, userStats.portfolioItems - 3)}`,
      changeType: "positive",
      icon: Briefcase,
      color: "text-blue-400",
      bgGradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Completed Jobs",
      value: (user?.completedJobs || 0).toString(),
      change: "+5",
      changeType: "positive",
      icon: CheckCircle,
      color: "text-purple-400",
      bgGradient: "from-purple-500 to-violet-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Client Rating",
      value: (user?.rating || 0).toFixed(1),
      change: "+0.1",
      changeType: "positive",
      icon: Star,
      color: "text-yellow-400",
      bgGradient: "from-yellow-500 to-orange-500",
      shadowColor: "shadow-yellow-500/25",
    },
  ];

  const clientStats = [
    {
      label: "Total Spent",
      value: safeCurrency(user?.totalEarnings || 0),
      change: "+18%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-400",
      bgGradient: "from-green-500 to-emerald-500",
      shadowColor: "shadow-green-500/25",
    },
    {
      label: "Active Jobs",
      value: (user?.totalEarnings
        ? Math.floor(user.totalEarnings / 2000)
        : userStats.portfolioItems
      ).toString(),
      change: "+1",
      changeType: "positive",
      icon: Briefcase,
      color: "text-blue-400",
      bgGradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Hired Freelancers",
      value: (user?.completedJobs || 0).toString(),
      change: "+3",
      changeType: "positive",
      icon: Users,
      color: "text-purple-400",
      bgGradient: "from-purple-500 to-violet-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Success Rate",
      value: `${user?.successRate || 96}%`,
      change: "+2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-yellow-400",
      bgGradient: "from-yellow-500 to-orange-500",
      shadowColor: "shadow-yellow-500/25",
    },
  ];

  const stats = userType === "freelancer" ? freelancerStats : clientStats;

  // Dynamic projects data
  const freelancerProjects = [
    {
      id: "1",
      title: "AI Logo Design for TechCorp",
      client: "Sarah Johnson",
      status: "in_progress",
      budget: 1500,
      deadline: "2024-01-20",
      progress: 75,
      lastUpdate: "2024-01-15T10:00:00Z",
      messages: 3,
    },
    {
      id: "2",
      title: "Chatbot Development",
      client: "Mike Davis",
      status: "review",
      budget: 3000,
      deadline: "2024-01-18",
      progress: 90,
      lastUpdate: "2024-01-14T15:30:00Z",
      messages: 1,
    },
    {
      id: "3",
      title: "AI Video Content Creation",
      client: "Emma Wilson",
      status: "completed",
      budget: 2000,
      deadline: "2024-01-15",
      progress: 100,
      lastUpdate: "2024-01-15T09:00:00Z",
      messages: 0,
    },
    {
      id: "4",
      title: "Game Character Design",
      client: "Alex Rodriguez",
      status: "pending",
      budget: 2500,
      deadline: "2024-01-25",
      progress: 0,
      lastUpdate: "2024-01-13T14:00:00Z",
      messages: 2,
    },
  ];

  const clientProjects = [
    {
      id: "1",
      title: "E-commerce Website Development",
      freelancer: "Alex Chen",
      status: "in_progress",
      budget: 5000,
      deadline: "2024-02-01",
      progress: 60,
      lastUpdate: "2024-01-15T10:00:00Z",
      messages: 5,
    },
    {
      id: "2",
      title: "Mobile App UI/UX Design",
      freelancer: "Maria Rodriguez",
      status: "review",
      budget: 2500,
      deadline: "2024-01-22",
      progress: 85,
      lastUpdate: "2024-01-14T15:30:00Z",
      messages: 2,
    },
    {
      id: "3",
      title: "AI Chatbot Integration",
      freelancer: "David Kim",
      status: "completed",
      budget: 3500,
      deadline: "2024-01-10",
      progress: 100,
      lastUpdate: "2024-01-10T09:00:00Z",
      messages: 0,
    },
    {
      id: "4",
      title: "Content Writing for Blog",
      freelancer: "Sarah Wilson",
      status: "pending",
      budget: 800,
      deadline: "2024-01-30",
      progress: 0,
      lastUpdate: "2024-01-12T14:00:00Z",
      messages: 1,
    },
  ];

  const recentProjects =
    userType === "freelancer" ? freelancerProjects : clientProjects;

  const upcomingDeadlines = [
    {
      project: "AI Logo Design for TechCorp",
      deadline: "2024-01-20",
      daysLeft: 5,
      priority: "high",
    },
    {
      project: "Chatbot Development",
      deadline: "2024-01-18",
      daysLeft: 3,
      priority: "urgent",
    },
    {
      project: "Game Character Design",
      deadline: "2024-01-25",
      daysLeft: 10,
      priority: "medium",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "review":
        return <Eye className="w-4 h-4 text-yellow-400" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400";
      case "review":
        return "bg-yellow-500/20 text-yellow-400";
      case "pending":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-red-500/20 text-red-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      default:
        return "text-green-400";
    }
  };

  const filteredProjects =
    filterStatus === "all"
      ? recentProjects
      : recentProjects.filter((project) => project.status === filterStatus);

  const tabs =
    userType === "freelancer"
      ? [
          { id: "overview", label: "Overview" },
          { id: "portfolio", label: "Portfolio" },
          { id: "solutions", label: "Solutions" },
          { id: "ai_orders", label: "AI Orders" },
          { id: "achievements", label: "Achievements" },
          { id: "earnings", label: "Earnings" },
        ]
      : [
          { id: "overview", label: "Overview" },
          { id: "projects", label: "Projects" },
          { id: "solutions", label: "Solutions" },
          { id: "ai_orders", label: "AI Orders" },
          { id: "jobs", label: "Jobs" },
          { id: "earnings", label: "Earnings" },
        ];

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="w-full pb-20 lg:pb-0 main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-[#2A1A3E] border-b border-gray-700/50 p-4 md:p-6 lg:p-8 overflow-hidden rounded-t-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.name || "User"}! 👋
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  {userType === "freelancer"
                    ? "Manage your projects and find new opportunities"
                    : "Post jobs and manage your hired freelancers"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* User Type Switcher */}
                <div className="flex bg-gray-800/80 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    onClick={() => setUserType("freelancer")}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      userType === "freelancer"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50",
                    )}
                  >
                    👨‍💻 Freelancer
                  </button>
                  <button
                    onClick={() => setUserType("client")}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      userType === "client"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50",
                    )}
                  >
                    🏢 Client
                  </button>
                </div>

                {/* Action Button */}
                {userType === "client" ? (
                  <Link
                    href="/en/jobs/create"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 hover:shadow-green-600/40"
                  >
                    <Plus className="w-4 h-4" />
                    Post New Job
                  </Link>
                ) : (
                  <Link
                    href="/en/jobs"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40"
                  >
                    <Briefcase className="w-4 h-4" />
                    Find Jobs
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 sm:p-6 rounded-2xl hover:bg-[#1A1A2E]/70 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center shadow-lg ${stat.shadowColor} group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium px-2 py-1 rounded-lg",
                        stat.changeType === "positive"
                          ? "text-green-400 bg-green-400/10"
                          : "text-red-400 bg-red-400/10",
                      )}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Level Card */}
          {userType === "freelancer" && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
              <UserLevelCard userStats={userStats} totalPoints={totalPoints} />
            </div>
          )}

          {/* Tabs */}
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-1 border border-gray-800/50">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex-1 sm:flex-none",
                    activeTab === tab.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">
                        {userType === "freelancer"
                          ? "Recent Portfolio"
                          : "Recent Projects"}
                      </h3>
                      <button
                        onClick={() =>
                          setActiveTab(
                            userType === "freelancer"
                              ? "portfolio"
                              : "projects",
                          )
                        }
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {recentProjects.slice(0, 4).map((project) => (
                        <div
                          key={project.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-700/50"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                            {getStatusIcon(project.status)}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-white font-medium text-sm sm:text-base truncate">
                                {project.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-400 truncate">
                                {userType === "freelancer"
                                  ? `Client: ${(project as any).client}`
                                  : `Freelancer: ${(project as any).freelancer}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                            <div className="text-left sm:text-right">
                              <div className="text-white font-medium text-sm sm:text-base">
                                {safeCurrency(project.budget)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400">
                                Due {safeRelativeTime(project.deadline)}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {project.messages > 0 && (
                                <Link
                                  href={`/en/messages?project=${project.id}`}
                                  className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors p-2 rounded-lg hover:bg-purple-500/10"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span className="text-sm hidden sm:inline">
                                    {project.messages}
                                  </span>
                                </Link>
                              )}

                              <Link
                                href={`/en/projects/${project.id}`}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                                title="View Project"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Upcoming Deadlines */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Upcoming Deadlines
                    </h3>
                    <div className="space-y-3">
                      {upcomingDeadlines.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">
                              {item.project}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(item.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              getPriorityColor(item.priority),
                            )}
                          >
                            {item.daysLeft}d
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Card */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Navigation
                    </h3>

                    {/* Main Navigation Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Link
                        href="/en/dashboard"
                        className="flex flex-col items-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-blue-400 text-center font-medium">
                          Dashboard
                        </span>
                      </Link>

                      <Link
                        href={
                          userType === "freelancer"
                            ? "/en/projects"
                            : "/en/jobs"
                        }
                        className="flex flex-col items-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-purple-400 text-center font-medium">
                          {userType === "freelancer" ? "Projects" : "Jobs"}
                        </span>
                      </Link>

                      <Link
                        href="/en/messages"
                        className="flex flex-col items-center p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/25">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-green-400 text-center font-medium">
                          Messages
                        </span>
                      </Link>

                      {/* AI Orders Quick Access */}
                      <button
                        onClick={() => setActiveTab("ai_orders")}
                        className="flex flex-col items-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-purple-400 text-center font-medium">
                          AI Orders
                        </span>
                      </button>

                      <Link
                        href="/en/payments"
                        className="flex flex-col items-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/25">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-yellow-400 text-center font-medium">
                          Payments
                        </span>
                      </Link>

                      <Link
                        href="/en/reviews"
                        className="flex flex-col items-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/25">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-orange-400 text-center font-medium">
                          Reviews
                        </span>
                      </Link>

                      <Link
                        href="/en/reports"
                        className="flex flex-col items-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/25">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-indigo-400 text-center font-medium">
                          Reports
                        </span>
                      </Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-gray-800/50 pt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">
                        Quick Actions
                      </h4>
                      <div className="space-y-2">
                        {userType === "client" ? (
                          <Link
                            href="/en/jobs/create"
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Post New Job
                          </Link>
                        ) : (
                          <Link
                            href="/en/jobs"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 text-sm"
                          >
                            <Search className="w-4 h-4" />
                            Find Jobs
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-300">Project completed</span>
                        <span className="text-gray-500">2h ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-300">
                          New message received
                        </span>
                        <span className="text-gray-500">4h ago</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-300">Payment received</span>
                        <span className="text-gray-500">1d ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    All Projects
                  </h2>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input-field"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Project
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            {userType === "freelancer"
                              ? "Client"
                              : "Freelancer"}
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Budget
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Deadline
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Progress
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {filteredProjects.map((project) => (
                          <tr
                            key={project.id}
                            className="hover:bg-gray-800/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="text-white font-medium">
                                {project.title}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-300">
                                {userType === "freelancer"
                                  ? (project as any).client
                                  : (project as any).freelancer}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={cn(
                                  "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                                  getStatusColor(project.status),
                                )}
                              >
                                {getStatusIcon(project.status)}
                                <span className="capitalize">
                                  {project.status.replace("_", " ")}
                                </span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white font-medium">
                                {safeCurrency(project.budget)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-300">
                                {new Date(
                                  project.deadline,
                                ).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                    style={{ width: `${project.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-400">
                                  {project.progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/en/projects/${project.id}`}
                                  className="p-1 text-gray-400 hover:text-white transition-colors"
                                  title="View Project"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/en/projects/${project.id}/edit`}
                                  className="p-1 text-gray-400 hover:text-white transition-colors"
                                  title="Edit Project"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/en/messages?project=${project.id}`}
                                  className="p-1 text-gray-400 hover:text-white transition-colors"
                                  title="Message"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "portfolio" && userType === "freelancer" && (
              <div>
                {showAddPortfolio ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        Add to Portfolio
                      </h2>
                      <button
                        onClick={() => setShowAddPortfolio(false)}
                        className="btn-secondary"
                      >
                        ← Back to Portfolio
                      </button>
                    </div>
                    <AddPortfolioForm
                      onSubmit={async (data) => {
                        console.log("Portfolio data:", data);
                        // TODO: Save to database
                        setShowAddPortfolio(false);
                      }}
                      onCancel={() => setShowAddPortfolio(false)}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        My Portfolio
                      </h2>
                      <button
                        onClick={() => setShowAddPortfolio(true)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Project</span>
                      </button>
                    </div>

                    <div className="bg-gray-900/50 rounded-2xl p-6">
                      {/* Debug info */}
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-300">
                        <strong>Debug:</strong> Current user ID:{" "}
                        {user?.$id || "Not logged in"}
                      </div>

                      <PortfolioGrid
                        userId={user?.$id}
                        showFilters={false}
                        showSearch={false}
                        title=""
                        subtitle=""
                        limit={12}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "achievements" && userType === "freelancer" && (
              <div className="space-y-8">
                <div className="glass-card p-6 rounded-2xl">
                  <AchievementsGrid
                    userStats={userStats}
                    unlockedAchievements={unlockedAchievements}
                  />
                </div>
              </div>
            )}

            {activeTab === "earnings" && (
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Earnings Overview
                </h2>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Earnings analytics coming soon...
                  </p>
                </div>
              </div>
            )}

            {activeTab === "solutions" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    My Solutions
                  </h2>
                  <Link
                    href="/en/dashboard/solutions/create"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Solution</span>
                  </Link>
                </div>

                {loadingSolutions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : solutions.length === 0 ? (
                  <div className="text-center py-12">
                    <VideoIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No solutions yet
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Create your first AI solution to start earning
                    </p>
                    <Link
                      href="/en/dashboard/solutions/create"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Your First Solution</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {solutions.map((solution) => (
                      <div
                        key={solution.$id}
                        className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden hover:border-gray-700/50 transition-all duration-300"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-[9/16] bg-gray-800">
                          {solution.thumbnailUrl ? (
                            <img
                              src={solution.thumbnailUrl}
                              alt={solution.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <VideoIcon className="w-12 h-12 text-gray-600" />
                            </div>
                          )}

                          {/* Play overlay */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="w-8 h-8 text-white" />
                          </div>

                          {/* Actions */}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <button
                              onClick={() => handleEditSolution(solution)}
                              className="p-1.5 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSolution(solution.$id!)
                              }
                              className="p-1.5 bg-black/50 backdrop-blur-sm text-red-400 rounded-lg hover:bg-black/70 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-white mb-2 line-clamp-2">
                            {solution.title}
                          </h3>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{solution.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="w-3 h-3" />
                                <span>{solution.likes}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span>{solution.rating}</span>
                            </div>
                          </div>

                          {/* Revenue */}
                          <div className="flex items-center justify-between">
                            <div className="text-green-400 font-semibold">
                              ${Math.floor(solution.views * 0.02)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.floor(solution.views * 0.15)} orders
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "jobs" && userType === "client" && (
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">My Jobs</h2>
                  <Link
                    href="/en/jobs/create"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Post New Job</span>
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-700/50"
                    >
                      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                        {getStatusIcon(project.status)}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium text-base">
                            {project.title}
                          </h4>
                          <p className="text-sm text-gray-400">
                            Freelancer: {(project as any).freelancer}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-right">
                          <div className="text-white font-medium">
                            {safeCurrency(project.budget)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Due {safeRelativeTime(project.deadline)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {project.messages > 0 && (
                            <Link
                              href={`/en/messages?project=${project.id}`}
                              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors p-2 rounded-lg hover:bg-purple-500/10"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm">
                                {project.messages}
                              </span>
                            </Link>
                          )}

                          <Link
                            href={`/en/jobs/${project.id}`}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                            title="View Job"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ai_orders" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    AI Specialist Orders
                  </h2>
                  <Link
                    href="/en/ai-specialists"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Browse AI Specialists</span>
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading AI orders...</p>
                    </div>
                  </div>
                ) : aiOrders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aiOrders.map((order) => (
                      <OrderCardComponent
                        key={order.orderId}
                        order={order}
                        onActionClick={(action, orderId) => {
                          if (action === 'open_chat') {
                            router.push(`/en/messages?ai_order=${orderId}`);
                          } else if (action === 'view_progress') {
                            router.push(`/en/projects/${orderId}`);
                          }
                        }}
                        className="hover:scale-105 transition-transform duration-200"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No AI Orders Yet</h3>
                    <p className="text-gray-400 mb-6">
                      {userType === 'client' 
                        ? 'Start by ordering from one of our AI specialists to get expert help on your projects.'
                        : 'No orders received yet. Your AI specialist profile is ready to receive orders from clients.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/en/ai-specialists"
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <Bot className="w-5 h-5" />
                        <span>Browse AI Specialists</span>
                      </Link>
                      {userType === 'freelancer' && (
                        <Link
                          href="/en/profile/edit"
                          className="border border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Edit className="w-5 h-5" />
                          <span>Setup AI Profile</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Analytics
                </h2>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Advanced analytics coming soon...
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserType } from "@/contexts/UserTypeContext";
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
  Sparkles,
  ArrowRight,
  User,
  Building2,
  Bookmark,
} from "lucide-react";
// Navbar removed - using Sidebar instead
import { cn } from "@/lib/utils";

// Временные функции для дашборда до исправления utils.ts
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return 'только что';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин. назад`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  } else if (diffInDays < 7) {
    return `${diffInDays} дн. назад`;
  } else {
    return targetDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};
import { ReelsService, Reel } from "@/lib/appwrite/reels";
import EnhancedOnboardingModal from "@/components/onboarding/EnhancedOnboardingModal";
import UserProgressCard from "@/components/gamification/UserProgressCard";
import { useGamification } from "@/hooks/useGamification";
import { ChatNavigationService } from "@/lib/chat-navigation";

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
  const { userType, setUserType } = useUserType();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [solutions, setSolutions] = useState<Reel[]>([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  // Add AI orders state
  const [aiOrders, setAiOrders] = useState<OrderCard[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Add Active Jobs state
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [loadingActiveJobs, setLoadingActiveJobs] = useState(false);

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
    // Добавляем недостающие поля для фрилансера/клиента
    activeJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 0,
    totalSpent: 0,
    projectsPosted: 0,
    averageProjectCost: 0,
    successRate: 0,
    hiredFreelancers: 0,
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

  // Состояния для онбординга и геймификации
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingTrigger, setOnboardingTrigger] = useState<'first_job' | 'first_application'>('first_job');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const { recordView, awardXP } = useGamification();

  // Load real user statistics
  const loadUserStats = async () => {
    if (!user) return;

    try {
      setStatsLoading(true);
      const response = await fetch(`/api/users/${user.$id}/stats`);
      const data = await response.json();

  // Load real user statistics
  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      setStatsLoading(true);
      const response = await fetch(`/api/users/${user.$id}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setUserStats(prev => ({
          ...prev,
          ...data.stats,
          joinedDate: user.$createdAt
        }));
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

      if (data.success) {
        setUserStats(prev => ({
          ...prev,
          ...data.stats,
          joinedDate: user.$createdAt
        }));
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Загрузка профиля пользователя и проверка онбординга
  useEffect(() => {
    if (user) {
      loadUserProfile();
      checkOnboardingStatus();
      recordView('dashboard', 'page'); // Записываем просмотр дашборда
    }
  }, [user, recordView]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      // Загружаем профиль пользователя
      const response = await fetch(`/api/user-profile?userId=${user.$id}`);
      const data = await response.json();

      if (data.profile) {
        setUserProfile(data.profile);
        // Устанавливаем тип пользователя из профиля
        if (data.profile.user_type) {
          setUserType(data.profile.user_type);
        }
      }

      // Загружаем реальную статистику
      await loadUserStats();
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const checkOnboardingStatus = async () => {
    if (!user) return;

    // Проверяем localStorage - если онбординг уже завершен, не показываем сообщения
    const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.$id}`);
    if (onboardingCompleted === 'true') {
      setNeedsOnboarding(false);
      setShowOnboarding(false);
      return;
    }

    try {
      // Проверяем, завершен ли онбординг через основную коллекцию users
      const userProfile = await UsersService.getUserProfile(user.$id);

      if (!userProfile) {
        // Если профиль не найден, нужен онбординг
        setNeedsOnboarding(true);
        return;
      }

      // Проверяем профиль в зависимости от типа пользователя
      const hasCompanyInfo = (userProfile as any).company_name && (userProfile as any).company_name.trim().length >= 2;
      const hasBio = userProfile.bio && userProfile.bio.trim().length >= 10;
      const hasSkills = userProfile.skills && userProfile.skills.length > 0;
      const hasSpecializations = (userProfile as any).specializations && (userProfile as any).specializations.length > 0;
      
      // Проверяем в зависимости от текущего типа пользователя в дашборде
      let profileCompleted = false;
      
      if (userType === 'client') {
        // Для клиентов нужна информация о компании ИЛИ bio (более гибкая проверка)
        profileCompleted = !!hasCompanyInfo || !!hasBio;
      } else {
        // Для фрилансеров нужны bio И (skills ИЛИ specializations)
        profileCompleted = !!hasBio && (!!hasSkills || !!hasSpecializations);
      }

      // Если профиль заполнен, не показываем онбординг
      if (profileCompleted) {
        setNeedsOnboarding(false);
        setShowOnboarding(false);
        // Сохраняем в localStorage, что онбординг завершен
        localStorage.setItem(`onboarding_completed_${user.$id}`, 'true');
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // При ошибке лучше не показывать онбординг, чтобы не мешать пользователю
      setNeedsOnboarding(false);
    }
  };

  const triggerOnboarding = (trigger: 'first_job' | 'first_application') => {
    setOnboardingTrigger(trigger);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setNeedsOnboarding(false);
    // Refresh user data
    loadUserStats();
    loadUserProfile(); // Перезагружаем профиль после онбординга
    awardXP(25, 'onboarding_completed'); // Bonus XP for completing onboarding
    
    // Сохраняем в localStorage, что онбординг завершен
    if (user) {
      localStorage.setItem(`onboarding_completed_${user.$id}`, 'true');
    }
  };

  const handleUserTypeChange = async (newUserType: "freelancer" | "client") => {
    setUserType(newUserType);
    
    // Сохраняем новый тип пользователя в профиле
    if (user && userProfile) {
      try {
        const response = await fetch('/api/user-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.$id,
            userType: newUserType,
            // Сохраняем остальные данные профиля
            avatarUrl: userProfile.avatar_url || '',
            bio: userProfile.bio || '',
            companyName: userProfile.company_name || '',
            companySize: userProfile.company_size || '',
            industry: userProfile.industry || '',
            interests: userProfile.interests || [],
            specializations: userProfile.specializations || [],
            experienceYears: userProfile.experience_years || 0,
            hourlyRateMin: userProfile.hourly_rate_min || 0,
            hourlyRateMax: userProfile.hourly_rate_max || 0,
            profileCompletion: userProfile.profile_completion || 0,
          }),
        });

        if (response.ok) {
          console.log('✅ User type saved successfully');
          // Обновляем локальный профиль
          setUserProfile((prev: any) => prev ? { ...prev, user_type: newUserType } : null);
        } else {
          console.error('❌ Failed to save user type');
        }
      } catch (error) {
        console.error('Error saving user type:', error);
      }
    }
  };

  // Navigate to appropriate chat
  const navigateToChat = async (targetUserId?: string, jobId?: string, orderId?: string, projectId?: string) => {
    if (!user) return;
    
    try {
      const chatInfo = await ChatNavigationService.getChatUrl({
        userId: user.$id,
        targetUserId,
        jobId,
        orderId,
        projectId,
        conversationType: orderId ? 'ai_order' : jobId ? 'job' : projectId ? 'project' : 'direct'
      });
      
      // Navigate to the chat
      window.location.href = chatInfo.chatUrl;
    } catch (error) {
      console.error('Error navigating to chat:', error);
      // Fallback to messages page
      window.location.href = '/en/messages';
    }
  };

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



  // Load AI orders from API
  const loadAIOrders = useCallback(async () => {
    if (!user) return;
    
    setLoadingOrders(true);
    try {
      // Загружаем заказы через API
      const response = await fetch(`/api/orders?userId=${user.$id}&action=list`);
      const data = await response.json();
      
      if (data.success && data.orders) {
        // Преобразуем заказы в карточки для отображения
        const orderCards = data.orders.map((order: any) => ({
          orderId: order.$id,
          userId: order.userId,
          specialistId: order.specialistId,
          specialist: {
            id: order.specialistId,
            name: order.specialistName,
            title: order.specialistTitle,
            avatar: `/avatars/${order.specialistId}.jpg`
          },
          tariff: {
            name: order.tariffName,
            price: order.amount,
            features: []
          },
          status: order.status || 'active',
          amount: order.amount,
          requirements: order.requirements,
          conversationId: order.conversationId,
          timeline: order.timeline,
          createdAt: order.createdAt,
          lastUpdate: order.updatedAt,
          actions: [
            {
              label: 'Открыть чат',
              action: 'open_chat',
              variant: 'primary'
            },
            {
              label: 'AI чат',
              action: 'chat_with_specialist',
              variant: 'success'
            }
          ]
        }));
        
        setAiOrders(orderCards);
        console.log('✅ Loaded AI orders:', orderCards.length);
      }
    } catch (error) {
      console.error('Error loading AI orders:', error);
      setAiOrders([]); // Fallback to empty array
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  // Load Active Jobs (jobs where user is actively working)
  const loadActiveJobs = useCallback(async () => {
    if (!user) return;
    
    setLoadingActiveJobs(true);
    try {
      // Load jobs based on user type
      // @ts-ignore
      let jobs: any[] = [];
      
      if (userType === 'freelancer') {
        // Get jobs where freelancer is assigned - with safe error handling
        try {
          const jobsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.JOBS,
            [
              Query.equal('assignedFreelancer', user.$id),
              Query.notEqual('status', 'completed'),
              Query.orderDesc('$createdAt'),
              Query.limit(20)
            ]
          );
          jobs = jobsResponse.documents as any[];
          console.log(`✅ Found ${jobs.length} assigned jobs for freelancer`);
        } catch (error) {
          console.warn('Failed to load assigned jobs:', error);
          jobs = [];
        }
      } else {
        // Get client's active jobs
        const jobsResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.JOBS,
          [
            Query.equal('clientId', user.$id),
            Query.equal('status', ['active', 'in_progress', 'review']),
            Query.orderDesc('$createdAt'),
            Query.limit(20)
          ]
        );
        jobs = jobsResponse.documents as any[];
      }

      // Enrich jobs with additional data
      // @ts-ignore
      const enrichedJobs = await Promise.all(jobs.map(async (job: any) => {
        try {
          // Get applications count
          const applicationsResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.APPLICATIONS,
            [Query.equal('jobId', job.$id)]
          );

          return {
            ...job,
            applicationsCount: applicationsResponse.documents.length,
            applications: applicationsResponse.documents.slice(0, 3), // First 3 applications
          };
        } catch (error) {
          console.warn('Error enriching job:', error);
          return {
            ...job,
            applicationsCount: 0,
            applications: []
          };
        }
      }));

      setActiveJobs(enrichedJobs);
      console.log('✅ Loaded active jobs:', enrichedJobs.length);
      
    } catch (error) {
      console.error('Error loading active jobs:', error);
      setActiveJobs([]);
    } finally {
      setLoadingActiveJobs(false);
    }
  }, [user, userType]);

  // Load AI orders when user changes
  useEffect(() => {
    if (user) {
      loadAIOrders();
    }
  }, [user, loadAIOrders]);

  // Load Active Jobs when user or user type changes
  useEffect(() => {
    if (user) {
      loadActiveJobs();
    }
  }, [user, loadActiveJobs]);

  // User type is now managed by UserTypeContext

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

  // Safe currency formatter
  const safeCurrency = (amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatCurrency(numAmount || 0);
  };

  // Safe relative time formatter
  const safeRelativeTime = (dateString: string): string => {
    try {
      return formatRelativeTime(dateString);
    } catch {
      return 'недавно';
    }
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



  // Temporarily disable auth check
  // if (!isAuthenticated) {
  //   return null;
  // }

  // Dynamic data based on user type and real user data
  const freelancerStats = [
    {
      label: "Total Earnings",
      value: safeCurrency(userStats.totalEarnings || 0),
      change: "+12%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-400",
      bgGradient: "from-green-500 to-emerald-500",
      shadowColor: "shadow-green-500/25",
    },
    {
      label: "Active Projects",
      value: userStats.activeJobs.toString(),
      change: `+${Math.max(0, userStats.activeJobs - 1)}`,
      changeType: "positive",
      icon: Briefcase,
      color: "text-blue-400",
      bgGradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Completed Jobs",
      value: userStats.completedJobs.toString(),
      change: `+${Math.max(0, userStats.completedJobs - 3)}`,
      changeType: "positive",
      icon: CheckCircle,
      color: "text-purple-400",
      bgGradient: "from-purple-500 to-violet-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Client Rating",
      value: userStats.rating > 0 ? userStats.rating.toFixed(1) : "0.0",
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
      value: safeCurrency(userStats.totalSpent || 0),
      change: "+18%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-400",
      bgGradient: "from-green-500 to-emerald-500",
      shadowColor: "shadow-green-500/25",
    },
    {
      label: "Active Jobs",
      value: userStats.activeJobs.toString(),
      change: "+1",
      changeType: "positive",
      icon: Briefcase,
      color: "text-blue-400",
      bgGradient: "from-blue-500 to-cyan-500",
      shadowColor: "shadow-blue-500/25",
    },
    {
      label: "Hired Freelancers",
      value: userStats.hiredFreelancers.toString(),
      change: "+3",
      changeType: "positive",
      icon: Users,
      color: "text-purple-400",
      bgGradient: "from-purple-500 to-violet-500",
      shadowColor: "shadow-purple-500/25",
    },
    {
      label: "Success Rate",
      value: `${Math.round(userStats.successRate || 0)}%`,
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
          { id: "active_jobs", label: "Active Jobs" },
          { id: "portfolio", label: "Portfolio" },
          { id: "solutions", label: "Solutions" },
          { id: "ai_orders", label: "AI Orders" },
          { id: "bookmarks", label: "Bookmarks" },
          { id: "achievements", label: "Achievements" },
          { id: "earnings", label: "Earnings" },
        ]
      : [
          { id: "overview", label: "Overview" },
          { id: "active_jobs", label: "Active Jobs" },
          { id: "projects", label: "Projects" },
          { id: "solutions", label: "Solutions" },
          { id: "ai_orders", label: "AI Orders" },
          { id: "jobs", label: "Jobs" },
          { id: "bookmarks", label: "Bookmarks" },
          { id: "earnings", label: "Earnings" },
        ];

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Top Navigation */}
      <Navbar />

      {/* Onboarding Modal */}
      {showOnboarding && (
        <EnhancedOnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingComplete}
          userType={userType}
          trigger={onboardingTrigger}
        />
      )}

      {/* Main Content */}
      <div className="w-full pb-20 lg:pb-0 main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-6">
          
          {/* Enhanced Onboarding Alert */}
          {needsOnboarding && !showOnboarding && (
            <div className="relative bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 border border-purple-500/20 rounded-2xl p-6 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>
              
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {userType === 'client' ? '🚀 Завершите настройку профиля' : '⭐ Создайте профессиональный профиль'}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {userType === 'client' 
                        ? 'Заполните информацию о компании для привлечения лучших фрилансеров. Это займет всего 2 минуты!'
                        : 'Добавьте информацию о навыках для получения большего количества заказов. Создайте впечатляющий профиль!'}
                    </p>
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400 font-medium">Быстрая настройка</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => triggerOnboarding(userType === 'client' ? 'first_job' : 'first_application')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-3 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-105"
                  >
                    <span>🎯 Настроить профиль</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setNeedsOnboarding(false)}
                    className="px-6 py-4 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200"
                  >
                    Позже
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header with Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Section */}
            <div className="lg:col-span-2 relative bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-[#2A1A3E] border-b border-gray-700/50 p-4 md:p-6 lg:p-8 overflow-hidden rounded-2xl">
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
                  <div className="bg-gray-800/80 rounded-xl p-1 backdrop-blur-sm border border-gray-700/50">
                    <div className="flex">
                      <button
                        onClick={() => handleUserTypeChange("freelancer")}
                        className={cn(
                          "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2",
                          userType === "freelancer"
                            ? "text-white"
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        {userType === "freelancer" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg shadow-blue-600/25" />
                        )}
                        <span className="relative z-10">👨‍💻</span>
                        <span className="relative z-10 font-medium">Фрилансер</span>
                      </button>
                      <button
                        onClick={() => handleUserTypeChange("client")}
                        className={cn(
                          "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center space-x-2",
                          userType === "client"
                            ? "text-white"
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        {userType === "client" && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg shadow-purple-600/25" />
                        )}
                        <span className="relative z-10">🏢</span>
                        <span className="relative z-10 font-medium">Клиент</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
                  {userType === "client" ? (
                    needsOnboarding ? (
                      <button
                        onClick={() => triggerOnboarding('first_job')}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40"
                      >
                        <Plus className="w-4 h-4" />
                        Complete Profile First
                      </button>
                    ) : (
                      <Link
                        href="/en/jobs/create"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 hover:shadow-green-600/40"
                      >
                        <Plus className="w-4 h-4" />
                        Post New Job
                      </Link>
                    )
                  ) : (
                    needsOnboarding ? (
                      <button
                        onClick={() => triggerOnboarding('first_application')}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40"
                      >
                        <Briefcase className="w-4 h-4" />
                        Complete Profile First
                      </button>
                    ) : (
                      <Link
                        href="/en/jobs"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40"
                      >
                        <Briefcase className="w-4 h-4" />
                        Find Jobs
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* User Progress Card */}
            <UserProgressCard />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 sm:p-6 rounded-2xl hover:bg-[#1A1A2E]/70 transition-all duration-200 group cursor-pointer"
                  onClick={() => recordView(`stat_${stat.label}`, 'stat')}
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
                {/* Recent Activities */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">
                        Последние активности
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Обновлено {new Date().toLocaleTimeString('ru')}</span>
                        <button
                          onClick={() => {
                            loadActiveJobs();
                            loadAIOrders();
                            loadSolutions();
                          }}
                          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                          title="Обновить"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Notifications/Alerts Section */}
                      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                            <h4 className="text-lg font-medium text-white">Важные уведомления</h4>
                          </div>
                          <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                            Все уведомления
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {/* Notification items */}
                          <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                            <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                Новая заявка на ваш проект "E-commerce Website"
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                5 минут назад • Фрилансер: Alex Chen
                              </p>
                            </div>
                            <button className="p-1 text-purple-400 hover:text-purple-300 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                Проект готов к проверке
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                2 часа назад • Mobile App UI/UX Design
                              </p>
                            </div>
                            <button className="p-1 text-blue-400 hover:text-blue-300 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">
                                Платеж получен
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                1 день назад • $3,500 за AI Chatbot Integration
                              </p>
                            </div>
                            <button className="p-1 text-green-400 hover:text-green-300 transition-colors">
                              <DollarSign className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Recent Messages Section */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-5 h-5 text-blue-400" />
                            <h4 className="text-lg font-medium text-white">Последние сообщения</h4>
                          </div>
                          <Link 
                            href="/en/messages"
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Все сообщения
                          </Link>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:bg-gray-800/70 transition-all cursor-pointer">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">A</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-white font-medium text-sm">Alex Chen</h5>
                                <span className="text-xs text-gray-400">10 мин</span>
                              </div>
                              <p className="text-gray-400 text-xs truncate">
                                Привет! Я готов начать работу над вашим проектом...
                              </p>
                            </div>
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          </div>

                          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:bg-gray-800/70 transition-all cursor-pointer">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">M</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="text-white font-medium text-sm">Maria Rodriguez</h5>
                                <span className="text-xs text-gray-400">1 час</span>
                              </div>
                              <p className="text-gray-400 text-xs truncate">
                                Дизайн готов! Посмотрите, пожалуйста, и дайте...
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Jobs Section */}
                      {activeJobs.length > 0 && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-5 h-5 text-purple-400" />
                              <h4 className="text-lg font-medium text-white">Активные заказы</h4>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                                {activeJobs.length}
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveTab("active_jobs")}
                              className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>Все заказы</span>
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {activeJobs.slice(0, 3).map((job: any) => (
                              <div
                                key={job.$id}
                                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:bg-gray-800/70 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(job.status)}
                                    <span className={cn(
                                      "px-2 py-1 rounded-full text-xs font-medium",
                                      getStatusColor(job.status)
                                    )}>
                                      {job.status === 'active' ? 'Активный' : 
                                       job.status === 'in_progress' ? 'В работе' : 
                                       job.status === 'review' ? 'На проверке' : job.status}
                                    </span>
                                  </div>
                                  <div>
                                    <h5 className="text-white font-medium text-sm">{job.title}</h5>
                                    <p className="text-gray-400 text-xs">
                                      {formatCurrency(job.budgetMin)} - {formatCurrency(job.budgetMax)} • 
                                      {job.applicationsCount} заявок
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Link
                                    href={`/en/jobs/${job.$id}`}
                                    className="p-2 text-purple-400 hover:text-purple-300 transition-colors rounded-lg hover:bg-purple-500/10"
                                    title="Открыть заказ"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    href={`/en/messages?job=${job.$id}`}
                                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-500/10"
                                    title="Сообщения"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Orders Section */}
                      {aiOrders.length > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Bot className="w-5 h-5 text-blue-400" />
                              <h4 className="text-lg font-medium text-white">AI заказы</h4>
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                                {aiOrders.length}
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveTab("ai_orders")}
                              className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>Все AI заказы</span>
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {aiOrders.slice(0, 3).map((order: any) => (
                              <div
                                key={order.orderId}
                                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:bg-gray-800/70 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={order.specialist?.avatar || `/images/specialists/ai-specialist-${order.specialistId}.jpg`}
                                    alt={order.specialist?.name}
                                    className="w-8 h-8 rounded-full border border-gray-600"
                                  />
                                  <div>
                                    <h5 className="text-white font-medium text-sm">{order.specialist?.name}</h5>
                                    <p className="text-gray-400 text-xs">
                                      {formatCurrency(order.amount)} • {order.status}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Link
                                    href={`/en/ai-specialists/${order.specialistId}/order`}
                                    className="p-2 text-blue-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-500/10"
                                    title="Открыть заказ"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    href={`/en/ai-specialists/${order.specialistId}/chat`}
                                    className="p-2 text-green-400 hover:text-green-300 transition-colors rounded-lg hover:bg-green-500/10"
                                    title="Чат с AI"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Solutions Section */}
                      {solutions.length > 0 && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <VideoIcon className="w-5 h-5 text-green-400" />
                              <h4 className="text-lg font-medium text-white">Мои решения</h4>
                              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                                {solutions.length}
                              </span>
                            </div>
                            <button
                              onClick={() => setActiveTab("solutions")}
                              className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center space-x-1"
                            >
                              <span>Все решения</span>
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {solutions.slice(0, 3).map((solution: any) => (
                              <div
                                key={solution.$id}
                                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:bg-gray-800/70 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                    <VideoIcon className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <h5 className="text-white font-medium text-sm">{solution.title}</h5>
                                    <p className="text-gray-400 text-xs">
                                      {solution.viewsCount || 0} просмотров • {solution.likesCount || 0} лайков
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Link
                                    href={`/en/solutions/${solution.$id}`}
                                    className="p-2 text-green-400 hover:text-green-300 transition-colors rounded-lg hover:bg-green-500/10"
                                    title="Открыть решение"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Link>
                                  <button
                                    onClick={() => handleEditSolution(solution)}
                                    className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-lg hover:bg-yellow-500/10"
                                    title="Редактировать"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty State */}
                      {activeJobs.length === 0 && aiOrders.length === 0 && solutions.length === 0 && (
                        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                          <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-white mb-2">Пока нет активностей</h4>
                          <p className="text-gray-400 mb-6">
                            {userType === "freelancer" 
                              ? "Начните искать проекты или создайте портфолио" 
                              : "Создайте первый заказ или закажите AI решение"}
                          </p>
                          <div className="flex justify-center space-x-3">
                            {userType === "freelancer" ? (
                              <>
                                <Link
                                  href="/en/jobs"
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                                >
                                  <Search className="w-4 h-4" />
                                  <span>Найти работу</span>
                                </Link>
                                <button
                                  onClick={() => setActiveTab("portfolio")}
                                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Портфолио</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <Link
                                  href="/en/jobs/create"
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>Создать заказ</span>
                                </Link>
                                <Link
                                  href="/en/ai-specialists"
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                                >
                                  <Bot className="w-4 h-4" />
                                  <span>AI Специалисты</span>
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar - Quick Stats & Navigation */}
                <div className="space-y-6">
                  {/* Quick Stats Cards */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Быстрая статистика
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* Active Jobs */}
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-purple-400">{activeJobs.length}</p>
                            <p className="text-xs text-gray-400">Активных заказов</p>
                          </div>
                          <Briefcase className="w-6 h-6 text-purple-400/60" />
                        </div>
                        <button
                          onClick={() => setActiveTab("active_jobs")}
                          className="absolute inset-0 w-full h-full rounded-xl hover:bg-purple-500/5 transition-colors"
                          aria-label="Перейти к активным заказам"
                        />
                      </div>

                      {/* AI Orders */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-blue-400">{aiOrders.length}</p>
                            <p className="text-xs text-gray-400">AI заказов</p>
                          </div>
                          <Bot className="w-6 h-6 text-blue-400/60" />
                        </div>
                        <button
                          onClick={() => setActiveTab("ai_orders")}
                          className="absolute inset-0 w-full h-full rounded-xl hover:bg-blue-500/5 transition-colors"
                          aria-label="Перейти к AI заказам"
                        />
                      </div>

                      {/* Solutions */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-green-400">{solutions.length}</p>
                            <p className="text-xs text-gray-400">Решений</p>
                          </div>
                          <VideoIcon className="w-6 h-6 text-green-400/60" />
                        </div>
                        <button
                          onClick={() => setActiveTab("solutions")}
                          className="absolute inset-0 w-full h-full rounded-xl hover:bg-green-500/5 transition-colors"
                          aria-label="Перейти к решениям"
                        />
                      </div>

                      {/* Portfolio Items */}
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 relative">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-yellow-400">{userStats.portfolioItems}</p>
                            <p className="text-xs text-gray-400">Портфолио</p>
                          </div>
                          <Star className="w-6 h-6 text-yellow-400/60" />
                        </div>
                        <button
                          onClick={() => setActiveTab("portfolio")}
                          className="absolute inset-0 w-full h-full rounded-xl hover:bg-yellow-500/5 transition-colors"
                          aria-label="Перейти к портфолио"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation Card */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Быстрая навигация
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
                        href={userType === "freelancer" ? "/en/projects" : "/en/jobs"}
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

                      <Link
                        href="/en/ai-specialists"
                        className="flex flex-col items-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/25">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-orange-400 text-center font-medium">
                          AI Специалисты
                        </span>
                      </Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="border-t border-gray-800/50 pt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">
                        Быстрые действия
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
                        
                        {/* Profile Actions */}
                        {userType === "freelancer" ? (
                          <>
                            <Link
                              href={`/${window.location.pathname.split('/')[1] || 'en'}/profile/${user?.$id || ''}`}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 text-sm"
                            >
                              <User className="w-4 h-4" />
                              Мой профиль фрилансера
                            </Link>
                            <Link
                              href={`/${window.location.pathname.split('/')[1] || 'en'}/profile/${user?.$id || ''}`}
                              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View Global Profile
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/${window.location.pathname.split('/')[1] || 'en'}/client-profile`}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 text-sm"
                          >
                            <Building2 className="w-4 h-4" />
                            Профиль компании
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Последние уведомления
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-300">Проект завершён</span>
                        </div>
                        <span className="text-gray-500 text-xs">2ч назад</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-blue-300">Новое сообщение</span>
                        </div>
                        <span className="text-gray-500 text-xs">4ч назад</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-purple-300">Платёж получен</span>
                        </div>
                        <span className="text-gray-500 text-xs">1д назад</span>
                      </div>
                      
                      <Link
                        href="/en/notifications"
                        className="block w-full text-center py-2 text-gray-400 hover:text-white transition-colors border border-gray-700/50 rounded-lg hover:bg-gray-800/50"
                      >
                        Все уведомления
                      </Link>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Производительность
                      </h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">Live</span>
                      </div>
                    </div>

                    {/* Performance Cards */}
                    <div className="space-y-4">
                      {/* Success Rate */}
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Успешность</span>
                          <span className="text-sm font-semibold text-green-400">96%</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>24/25 проектов</span>
                          <span>+2% за месяц</span>
                        </div>
                      </div>

                      {/* Response Time */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Время ответа</span>
                          <span className="text-sm font-semibold text-blue-400">~2ч</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>Среднее время</span>
                          <span>-30мин за неделю</span>
                        </div>
                      </div>

                      {/* Client Satisfaction */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Рейтинг</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm font-semibold text-yellow-400">4.9</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>127 отзывов</span>
                          <span>+0.1 за месяц</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini Activity Chart */}
                    <div className="mt-4 pt-4 border-t border-gray-800/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-300">Активность (7 дней)</span>
                        <span className="text-xs text-gray-400">Заказы/день</span>
                      </div>
                      <div className="flex items-end space-x-1 h-16">
                        {/* Activity bars */}
                        {[3, 5, 2, 8, 6, 4, 7].map((height, index) => (
                          <div key={index} className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t opacity-80 hover:opacity-100 transition-opacity" 
                               style={{ height: `${(height / 8) * 100}%` }}>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Пн</span>
                        <span>Сб</span>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Summary */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Заработки
                      </h3>
                      <button 
                        onClick={() => setActiveTab("earnings")}
                        className="text-green-400 hover:text-green-300 text-sm font-medium"
                      >
                        Подробнее
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Этот месяц</span>
                        <span className="text-green-400 font-semibold">$12,450</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Прошлый месяц</span>
                        <span className="text-gray-400">$9,320</span>
                      </div>
                      <div className="border-t border-gray-800/50 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Общий рост</span>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">+33.5%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mini earnings chart */}
                    <div className="mt-4 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-300 font-medium">Тренд заработка</span>
                      </div>
                      <div className="flex items-end space-x-1 h-8">
                        {[2100, 2800, 3200, 2900, 4100, 3800, 4500].map((amount, index) => (
                          <div key={index} className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t opacity-70 hover:opacity-100 transition-opacity" 
                               style={{ height: `${(amount / 4500) * 100}%` }}
                               title={`$${amount}`}>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "active_jobs" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {userType === "freelancer" ? "My Active Jobs" : "Active Jobs"}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={loadActiveJobs}
                      className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                    {userType === "client" && (
                      <Link
                        href="/en/jobs/create"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Post New Job</span>
                      </Link>
                    )}
                  </div>
                </div>

                {loadingActiveJobs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-400">Loading active jobs...</p>
                    </div>
                  </div>
                ) : activeJobs.length > 0 ? (
                  <div className="space-y-6">
                    {activeJobs.map((job, index) => (
                      <div
                        key={job.$id}
                        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-6 rounded-2xl hover:border-gray-700/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Job Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(job.status)}
                              <h3 className="text-xl font-semibold text-white">
                                {job.title}
                              </h3>
                              <span
                                className={cn(
                                  "px-3 py-1 rounded-full text-xs font-medium",
                                  getStatusColor(job.status)
                                )}
                              >
                                {job.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                              {job.description}
                            </p>
                            
                            {/* Job Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="font-medium">${job.budgetMin} - ${job.budgetMax}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span>{job.duration || 'Not specified'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span>{job.applicationsCount || 0} applications</span>
                              </div>
                              {job.deadline && (
                                <div className={cn(
                                  "flex items-center space-x-1 px-2 py-1 rounded-full text-xs",
                                  new Date(job.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Within 7 days
                                    ? "bg-red-500/20 text-red-400"
                                    : new Date(job.deadline) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Within 14 days
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                                )}>
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-500">
                                  Created {safeRelativeTime(job.$createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mt-4 lg:mt-0">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/en/jobs/${job.$id}`}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </Link>
                              <Link
                                href={`/en/messages?job=${job.$id}`}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Messages</span>
                              </Link>
                            </div>

                            {/* Status Update Buttons */}
                            {(userType === "freelancer" && job.assignedFreelancer === user.$id) || userType === "client" ? (
                              <div className="flex items-center space-x-1">
                                {job.status === 'in_progress' && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await databases.updateDocument(
                                          DATABASE_ID,
                                          COLLECTIONS.JOBS,
                                          job.$id,
                                          { status: 'review' }
                                        );
                                        await loadActiveJobs(); // Refresh data
                                      } catch (error) {
                                        console.error('Failed to submit for review:', error);
                                      }
                                    }}
                                    className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm flex items-center space-x-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Submit for Review</span>
                                  </button>
                                )}
                                {job.status === 'review' && userType === "client" && (
                                  <div className="flex items-center space-x-1">
                                    <button
                                      onClick={async () => {
                                        try {
                                          await databases.updateDocument(
                                            DATABASE_ID,
                                            COLLECTIONS.JOBS,
                                            job.$id,
                                            { status: 'completed' }
                                          );
                                          await loadActiveJobs(); // Refresh data
                                        } catch (error) {
                                          console.error('Failed to approve job:', error);
                                        }
                                      }}
                                      className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm flex items-center space-x-1"
                                    >
                                      <CheckCircle className="w-3 h-3" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await databases.updateDocument(
                                            DATABASE_ID,
                                            COLLECTIONS.JOBS,
                                            job.$id,
                                            { status: 'in_progress' }
                                          );
                                          await loadActiveJobs(); // Refresh data
                                        } catch (error) {
                                          console.error('Failed to request revision:', error);
                                        }
                                      }}
                                      className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm flex items-center space-x-1"
                                    >
                                      <AlertCircle className="w-3 h-3" />
                                      <span>Request Revision</span>
                                    </button>
                                  </div>
                                )}
                                {job.status === 'review' && userType === "freelancer" && (
                                  <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm">
                                    Awaiting Review
                                  </span>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {job.skills.slice(0, 5).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                                  +{job.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Progress for freelancers */}
                        {userType === "freelancer" && job.assignedFreelancer === user.$id && (
                          <div className="border-t border-gray-700/50 pt-4 mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Progress</span>
                              <span className="text-sm text-gray-300">{job.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress || 0}%` }}
                              ></div>
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              <button
                                onClick={async () => {
                                  const newProgress = Math.min((job.progress || 0) + 10, 100);
                                  try {
                                    await databases.updateDocument(
                                      DATABASE_ID,
                                      COLLECTIONS.JOBS,
                                      job.$id,
                                      { progress: newProgress }
                                    );
                                    await loadActiveJobs(); // Refresh data
                                  } catch (error) {
                                    console.error('Failed to update progress:', error);
                                  }
                                }}
                                className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm flex items-center space-x-1"
                              >
                                <TrendingUp className="w-3 h-3" />
                                <span>+10%</span>
                              </button>
                              {job.progress >= 100 && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await databases.updateDocument(
                                        DATABASE_ID,
                                        COLLECTIONS.JOBS,
                                        job.$id,
                                        { status: 'completed' }
                                      );
                                      await loadActiveJobs(); // Refresh data
                                    } catch (error) {
                                      console.error('Failed to mark as completed:', error);
                                    }
                                  }}
                                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Mark Complete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recent Applications for clients */}
                        {userType === "client" && job.applications && job.applications.length > 0 && (
                          <div className="border-t border-gray-700/50 pt-4 mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-300">Recent Applications</h4>
                              <Link
                                href={`/en/jobs/${job.$id}#applications`}
                                className="text-purple-400 hover:text-purple-300 text-sm"
                              >
                                View All ({job.applicationsCount})
                              </Link>
                            </div>
                            <div className="space-y-2">
                              {job.applications.slice(0, 2).map((application: any) => (
                                <div
                                  key={application.$id}
                                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Link 
                                      href={`/en/profile/${application.freelancerId}`}
                                      className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                                    >
                                      <span className="text-white text-sm font-semibold">
                                        {application.freelancerName?.charAt(0) || 'F'}
                                      </span>
                                    </Link>
                                    <div>
                                      <Link 
                                        href={`/en/profile/${application.freelancerId}`}
                                        className="text-white text-sm font-medium hover:text-purple-300 transition-colors"
                                      >
                                        {application.freelancerName}
                                      </Link>
                                      <p className="text-gray-400 text-xs">
                                        Proposed: ${application.proposedBudget}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={cn(
                                        "px-2 py-1 rounded-full text-xs",
                                        application.status === 'pending'
                                          ? "bg-yellow-500/20 text-yellow-400"
                                          : application.status === 'accepted'
                                          ? "bg-green-500/20 text-green-400"
                                          : "bg-red-500/20 text-red-400"
                                      )}
                                    >
                                      {application.status}
                                    </span>
                                    {application.status === 'pending' && (
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={async () => {
                                            try {
                                              await databases.updateDocument(
                                                DATABASE_ID,
                                                'applications', // Applications collection ID
                                                application.$id,
                                                { status: 'accepted' }
                                              );
                                              await databases.updateDocument(
                                                DATABASE_ID,
                                                COLLECTIONS.JOBS,
                                                job.$id,
                                                { 
                                                  assignedFreelancer: application.freelancerId,
                                                  status: 'in_progress' 
                                                }
                                              );
                                              await loadActiveJobs(); // Refresh data
                                            } catch (error) {
                                              console.error('Failed to accept application:', error);
                                            }
                                          }}
                                          className="p-1 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors"
                                          title="Accept Application"
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={async () => {
                                            try {
                                              await databases.updateDocument(
                                                DATABASE_ID,
                                                'applications', // Applications collection ID
                                                application.$id,
                                                { status: 'rejected' }
                                              );
                                              await loadActiveJobs(); // Refresh data
                                            } catch (error) {
                                              console.error('Failed to reject application:', error);
                                            }
                                          }}
                                          className="p-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                                          title="Reject Application"
                                        >
                                          <XCircle className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Client Job Management Actions */}
                        {userType === "client" && (
                          <div className="border-t border-gray-700/50 pt-4 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>Posted {safeRelativeTime(job.$createdAt)}</span>
                                {job.deadline && (
                                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/en/jobs/${job.$id}/edit`}
                                  className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm flex items-center space-x-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Edit</span>
                                </Link>
                                {job.status === 'active' && (
                                  <button
                                    onClick={async () => {
                                      const confirmed = confirm('Are you sure you want to close this job? This action cannot be undone.');
                                      if (confirmed) {
                                        try {
                                          await databases.updateDocument(
                                            DATABASE_ID,
                                            COLLECTIONS.JOBS,
                                            job.$id,
                                            { status: 'closed' }
                                          );
                                          await loadActiveJobs(); // Refresh data
                                        } catch (error) {
                                          console.error('Failed to close job:', error);
                                        }
                                      }
                                    }}
                                    className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm flex items-center space-x-1"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    <span>Close Job</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Active Jobs</h3>
                    <p className="text-gray-400 mb-6">
                      {userType === 'freelancer' 
                        ? 'No active jobs at the moment. Browse available jobs to find new opportunities.'
                        : 'No active jobs posted. Create your first job to start finding talented freelancers.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {userType === "freelancer" ? (
                        <Link
                          href="/en/jobs"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Search className="w-5 h-5" />
                          <span>Browse Jobs</span>
                        </Link>
                      ) : (
                        <Link
                          href="/en/jobs/create"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Post Your First Job</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                {/* Header with Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white">All Projects</h2>
                    <p className="text-gray-400 mt-1">Manage your projects, collaborate, and track progress</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* View Toggle */}
                    <div className="flex bg-gray-800/50 rounded-lg p-1">
                      <button className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm font-medium transition-colors">
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                            <div className="bg-current rounded-sm"></div>
                            <div className="bg-current rounded-sm"></div>
                            <div className="bg-current rounded-sm"></div>
                            <div className="bg-current rounded-sm"></div>
                          </div>
                          <span>Cards</span>
                        </div>
                      </button>
                      <button className="px-3 py-1 text-gray-300 hover:text-white rounded-md text-sm font-medium transition-colors">
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-4 flex flex-col space-y-0.5">
                            <div className="h-0.5 bg-current rounded"></div>
                            <div className="h-0.5 bg-current rounded"></div>
                            <div className="h-0.5 bg-current rounded"></div>
                          </div>
                          <span>List</span>
                        </div>
                      </button>
                    </div>

                    {/* Filter */}
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-gray-800/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Create Project Button */}
                    {userType === "client" && (
                      <Link
                        href="/en/jobs/create"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Project</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Projects Grid/Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-white line-clamp-1">
                              {project.title}
                            </h3>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getStatusColor(project.status)
                              )}
                            >
                              {project.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium">{safeCurrency(project.budget)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-blue-400" />
                              <span>{new Date(project.deadline).toLocaleDateString('ru')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Client/Freelancer Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {userType === "freelancer" 
                              ? (project as any).client?.charAt(0) || 'C'
                              : (project as any).freelancer?.charAt(0) || 'F'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {userType === "freelancer" 
                              ? (project as any).client 
                              : (project as any).freelancer}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {userType === "freelancer" ? "Client" : "Freelancer"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 text-sm">4.9</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-300">Progress</span>
                          <span className="text-sm font-semibold text-purple-400">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Project Timeline */}
                      <div className="mb-4 p-3 bg-gray-800/30 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Timeline</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-gray-400">Started:</span>
                            <span className="text-white">{formatRelativeTime(project.lastUpdate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-gray-400">Last update:</span>
                            <span className="text-white">{formatRelativeTime(project.lastUpdate)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-gray-400">Deadline:</span>
                            <span className={cn(
                              "font-medium",
                              new Date(project.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                                ? "text-red-400" 
                                : "text-white"
                            )}>
                              {new Date(project.deadline).toLocaleDateString('ru')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Messages Preview */}
                      {project.messages > 0 && (
                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-300 text-sm font-medium">
                                {project.messages} unread messages
                              </span>
                            </div>
                            <Link
                              href={`/en/messages?project=${project.id}`}
                              className="text-blue-400 hover:text-blue-300 transition-colors text-xs"
                            >
                              View Chat
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/en/projects/${project.id}`}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                        <Link
                          href={`/en/messages?project=${project.id}`}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center space-x-1"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat</span>
                        </Link>
                        {userType === "client" && (
                          <button className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                    <p className="text-gray-400 mb-6">
                      {filterStatus === 'all' 
                        ? 'You don\'t have any projects yet. Start by creating or finding your first project.'
                        : `No projects with status "${filterStatus}".`}
                    </p>
                    {userType === "client" ? (
                      <Link
                        href="/en/jobs/create"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Post Your First Project</span>
                      </Link>
                    ) : (
                      <Link
                        href="/en/jobs"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 inline-flex items-center space-x-2"
                      >
                        <Search className="w-5 h-5" />
                        <span>Find Projects</span>
                      </Link>
                    )}
                  </div>
                )}
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
              <div>
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-white">Earnings Dashboard</h2>
                    <p className="text-gray-400 mt-1">Track your income, manage payments, and analyze performance</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select className="bg-gray-800/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                      <option>Last 30 days</option>
                      <option>Last 3 months</option>
                      <option>Last 6 months</option>
                      <option>This year</option>
                      <option>All time</option>
                    </select>
                    
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Request Payout</span>
                    </button>
                  </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Earnings */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-green-300">Total Earnings</h3>
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">$24,587</div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">+18.2%</span>
                      <span className="text-gray-400 text-sm">vs last month</span>
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-blue-300">This Month</h3>
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">$4,250</div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">+12.5%</span>
                      <span className="text-gray-400 text-sm">vs last month</span>
                    </div>
                  </div>

                  {/* Pending Balance */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-purple-300">Pending Balance</h3>
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">$1,850</div>
                    <div className="text-gray-400 text-sm">Available for withdrawal</div>
                  </div>

                  {/* Average Per Project */}
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-orange-300">Avg Per Project</h3>
                      <Star className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">$2,150</div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-sm font-medium">+5.8%</span>
                      <span className="text-gray-400 text-sm">vs last month</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Earnings Chart */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Earnings Over Time</h3>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium">
                            Revenue
                          </button>
                          <button className="px-3 py-1 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors">
                            Projects
                          </button>
                        </div>
                      </div>

                      {/* Chart Area */}
                      <div className="mb-6">
                        <div className="flex items-end space-x-2 h-48">
                          {[1200, 1800, 2400, 1900, 3200, 2800, 4250, 3800, 4100, 3600, 4400, 4250].map((amount, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                                style={{ height: `${(amount / 4500) * 100}%` }}
                                title={`$${amount}`}
                              ></div>
                              <span className="text-xs text-gray-400 mt-2">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Chart Stats */}
                      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-800/50">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">$36,650</div>
                          <div className="text-sm text-gray-400">Total Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">17</div>
                          <div className="text-sm text-gray-400">Projects Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400">4.9</div>
                          <div className="text-sm text-gray-400">Avg Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Payment Methods */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-bold">PP</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">PayPal</div>
                            <div className="text-gray-400 text-sm">user@example.com</div>
                          </div>
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">Bank Transfer</div>
                            <div className="text-gray-400 text-sm">****1234</div>
                          </div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>

                        <button className="w-full p-3 border-2 border-dashed border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-gray-600/50 transition-colors">
                          + Add Payment Method
                        </button>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div>
                              <div className="text-white font-medium">Project Payment</div>
                              <div className="text-gray-400 text-sm">E-commerce Website</div>
                            </div>
                          </div>
                          <div className="text-green-400 font-semibold">+$2,500</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div>
                              <div className="text-white font-medium">Solution Revenue</div>
                              <div className="text-gray-400 text-sm">AI Logo Generator</div>
                            </div>
                          </div>
                          <div className="text-blue-400 font-semibold">+$150</div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <div>
                              <div className="text-white font-medium">Platform Fee</div>
                              <div className="text-gray-400 text-sm">Service charge</div>
                            </div>
                          </div>
                          <div className="text-red-400 font-semibold">-$125</div>
                        </div>
                      </div>
                      
                      <Link
                        href="/en/earnings/transactions"
                        className="block w-full mt-4 p-2 text-center text-purple-400 hover:text-purple-300 transition-colors border border-gray-700/50 rounded-lg hover:bg-gray-800/50"
                      >
                        View All Transactions
                      </Link>
                    </div>

                    {/* Tax Information */}
                    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Tax Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">This Year Earnings</span>
                          <span className="text-white font-semibold">$24,587</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Estimated Tax</span>
                          <span className="text-orange-400 font-semibold">$4,916</span>
                        </div>
                        <div className="pt-4 border-t border-gray-800/50">
                          <button className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Download Tax Documents
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - Recent Projects */}
                <div className="mt-8">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">Recent Earnings by Project</h3>
                      <Link
                        href="/en/projects"
                        className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                      >
                        View All Projects
                      </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-gray-800/50">
                          <tr>
                            <th className="text-left py-3 text-gray-300 font-medium">Project</th>
                            <th className="text-left py-3 text-gray-300 font-medium">Client</th>
                            <th className="text-left py-3 text-gray-300 font-medium">Amount</th>
                            <th className="text-left py-3 text-gray-300 font-medium">Status</th>
                            <th className="text-left py-3 text-gray-300 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/30">
                          <tr className="hover:bg-gray-800/30 transition-colors">
                            <td className="py-4 text-white font-medium">E-commerce Website Development</td>
                            <td className="py-4 text-gray-300">Sarah Johnson</td>
                            <td className="py-4 text-green-400 font-semibold">$2,500</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Paid</span>
                            </td>
                            <td className="py-4 text-gray-400">Dec 15, 2024</td>
                          </tr>
                          <tr className="hover:bg-gray-800/30 transition-colors">
                            <td className="py-4 text-white font-medium">Mobile App UI/UX Design</td>
                            <td className="py-4 text-gray-300">Mike Davis</td>
                            <td className="py-4 text-green-400 font-semibold">$1,800</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Paid</span>
                            </td>
                            <td className="py-4 text-gray-400">Dec 12, 2024</td>
                          </tr>
                          <tr className="hover:bg-gray-800/30 transition-colors">
                            <td className="py-4 text-white font-medium">AI Chatbot Integration</td>
                            <td className="py-4 text-gray-300">Emma Wilson</td>
                            <td className="py-4 text-yellow-400 font-semibold">$2,200</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pending</span>
                            </td>
                            <td className="py-4 text-gray-400">Dec 10, 2024</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "solutions" && (
              <div>
                {/* Header with Stats and Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white">My Solutions</h2>
                    <p className="text-gray-400 mt-1">Create, manage and monetize your AI solutions</p>
                    
                    {/* Quick Stats */}
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">{solutions.length} Solutions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">
                          {solutions.reduce((acc, sol) => acc + (sol.views || 0), 0).toLocaleString()} Total Views
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-sm text-gray-300">
                          ${solutions.reduce((acc, sol) => acc + Math.floor((sol.views || 0) * 0.02), 0).toLocaleString()} Earned
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* Filters */}
                    <div className="flex items-center space-x-3">
                      <select className="bg-gray-800/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                        <option>All Categories</option>
                        <option>AI Art</option>
                        <option>Content Creation</option>
                        <option>Business Automation</option>
                        <option>Data Analysis</option>
                      </select>
                      
                      <select className="bg-gray-800/50 border border-gray-700/50 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                        <option>Sort by Latest</option>
                        <option>Sort by Views</option>
                        <option>Sort by Revenue</option>
                        <option>Sort by Rating</option>
                      </select>
                    </div>
                    
                    <Link
                      href="/en/dashboard/solutions/create"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Solution</span>
                    </Link>
                  </div>
                </div>

                {/* Analytics Dashboard */}
                {solutions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Performance Card */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Performance</h3>
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Avg. Rating</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-medium">
                              {(solutions.reduce((acc, sol) => acc + (sol.rating || 0), 0) / solutions.length).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-sm">Best Performer</span>
                          <span className="text-green-400 font-medium">
                            {solutions.sort((a, b) => (b.views || 0) - (a.views || 0))[0]?.title.substring(0, 20)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Revenue</h3>
                        <DollarSign className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold text-green-400">
                          ${solutions.reduce((acc, sol) => acc + Math.floor((sol.views || 0) * 0.02), 0).toLocaleString()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm font-medium">+23.5% this month</span>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Card */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Engagement</h3>
                        <Heart className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold text-blue-400">
                          {solutions.reduce((acc, sol) => acc + (sol.likes || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Total Likes</div>
                      </div>
                    </div>
                  </div>
                )}

                {loadingSolutions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : solutions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Create Your First AI Solution
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Turn your AI expertise into income. Create solutions that help others and earn money while you sleep.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link
                        href="/en/dashboard/solutions/create"
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Create Solution</span>
                      </Link>
                      <Link
                        href="/en/marketplace"
                        className="inline-flex items-center space-x-2 px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-2xl transition-all duration-300 font-medium border border-gray-700/50"
                      >
                        <Search className="w-5 h-5" />
                        <span>Browse Examples</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map((solution, index) => (
                      <div
                        key={solution.$id}
                        className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Thumbnail with enhanced overlay */}
                        <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-800 to-gray-900">
                          {solution.thumbnailUrl ? (
                            <img
                              src={solution.thumbnailUrl}
                              alt={solution.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                              <VideoIcon className="w-16 h-16 text-purple-400" />
                            </div>
                          )}

                          {/* Enhanced Play overlay */}
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <Play className="w-8 h-8 text-white" />
                            </div>
                          </div>

                          {/* Revenue Badge */}
                          <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-semibold">
                            ${Math.floor((solution.views || 0) * 0.02)}
                          </div>

                          {/* Actions */}
                          <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => handleEditSolution(solution)}
                              className="p-2 bg-black/70 backdrop-blur-sm text-white rounded-lg hover:bg-black/90 transition-colors"
                              title="Edit Solution"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-black/70 backdrop-blur-sm text-blue-400 rounded-lg hover:bg-black/90 transition-colors"
                              title="Analytics"
                            >
                              <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSolution(solution.$id!)}
                              className="p-2 bg-black/70 backdrop-blur-sm text-red-400 rounded-lg hover:bg-black/90 transition-colors"
                              title="Delete Solution"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Status indicator */}
                          <div className="absolute bottom-3 left-3">
                            <div className="flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-white text-xs font-medium">Live</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Content */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-white text-lg line-clamp-2 leading-tight">
                              {solution.title}
                            </h3>
                            <div className="flex items-center space-x-1 ml-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-yellow-400 text-sm font-semibold">{solution.rating || 5.0}</span>
                            </div>
                          </div>

                          {/* Enhanced Stats */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 text-blue-400">
                                <Eye className="w-4 h-4" />
                                <span className="font-semibold">{(solution.views || 0).toLocaleString()}</span>
                              </div>
                              <span className="text-xs text-gray-400">Views</span>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 text-red-400">
                                <Heart className="w-4 h-4" />
                                <span className="font-semibold">{(solution.likes || 0).toLocaleString()}</span>
                              </div>
                              <span className="text-xs text-gray-400">Likes</span>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 text-green-400">
                                <Users className="w-4 h-4" />
                                <span className="font-semibold">{Math.floor((solution.views || 0) * 0.15)}</span>
                              </div>
                              <span className="text-xs text-gray-400">Orders</span>
                            </div>
                          </div>

                          {/* Performance indicator */}
                          <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-purple-300 font-medium">Performance</span>
                              <span className="text-xs text-gray-400">Last 30 days</span>
                            </div>
                            <div className="flex items-end space-x-1 h-6">
                              {[60, 80, 45, 90, 75, 85, 70].map((height, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
                                  style={{ height: `${height}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/en/solutions/${solution.$id}`}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm flex items-center justify-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </Link>
                            <Link
                              href={`/en/solutions/${solution.$id}/analytics`}
                              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm flex items-center justify-center space-x-1"
                            >
                              <TrendingUp className="w-4 h-4" />
                              <span>Analytics</span>
                            </Link>
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

            {activeTab === "bookmarks" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    My Bookmarks
                  </h2>
                  <Link
                    href="/en/jobs"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Browse Jobs</span>
                  </Link>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Bookmarks Feature</h3>
                  <p className="text-gray-400 mb-6">
                    Save interesting jobs to your bookmarks for easy access later.
                  </p>
                  <Link
                    href="/en/dashboard/bookmarks"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Bookmark className="w-5 h-5" />
                    <span>View All Bookmarks</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

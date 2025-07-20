'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

import MessagesSetupGuide from '@/components/MessagesSetupGuide';
// import { UserProfileService, UserProfile, FreelancerStats, ClientStats } from '@/lib/user-profile-service';
// import Navbar from '@/components/Navbar';

import PortfolioGrid from '@/components/portfolio/PortfolioGrid';
import AddPortfolioForm from '@/components/portfolio/AddPortfolioForm';
import UserLevelCard from '@/components/gamification/UserLevelCard';
import AchievementsGrid from '@/components/gamification/AchievementsGrid';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import UserProfileDropdown from '@/components/UserProfileDropdown';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
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
  Bell,
  Home,
  Search,
  FileText
} from 'lucide-react';
// Navbar removed - using Sidebar instead
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userType, setUserType] = useState<'freelancer' | 'client'>('freelancer');
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [creatingDemoMessages, setCreatingDemoMessages] = useState(false);
  const [creatingDemoNotifications, setCreatingDemoNotifications] = useState(false);




  // Mock gamification data - replace with real data from API
  const userStats = {
    portfolioItems: 5,
    totalViews: 1250,
    totalLikes: 89,
    averageRating: 4.7,
    featuredItems: 2,
    nftItems: 0,
    streakDays: 12,
    followers: 34,
    following: 18,
    commentsReceived: 23,
    sharesReceived: 15,
    joinedDate: '2024-01-15T00:00:00Z'
  };

  const totalPoints = 485; // Calculate based on achievements
  const unlockedAchievements = [
    'first_portfolio',
    'first_thousand',
    'liked_creator',
    'featured_debut',
    'consistent_creator'
  ];
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  // Set user type based on user data
  useEffect(() => {
    if (user && user.userType) {
      setUserType(user.userType);
    }
  }, [user]);

  // Run Appwrite diagnostics
  const runDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      console.log('🔍 Running Appwrite diagnostics...');
      const results = await AppwriteSetup.runDiagnostics();

      let message = '🔍 Appwrite Diagnostics Results:\n\n';

      if (results.connection.success) {
        message += '✅ Connection: OK\n';
      } else {
        message += `❌ Connection: ${results.connection.error}\n`;
        message += `💡 ${results.connection.message}\n\n`;
      }

      if (results.database.success) {
        message += '✅ Database: OK\n';
      } else {
        message += `❌ Database: ${results.database.error}\n`;
        message += `💡 ${results.database.message}\n\n`;
      }

      if (results.collections.success) {
        message += `✅ Collections: ${results.collections.collections?.length || 0} found\n`;
      } else {
        message += `❌ Collections: ${results.collections.error}\n`;
      }

      alert(message);
    } catch (error: any) {
      console.error('❌ Error running diagnostics:', error);
      alert(`❌ Diagnostics failed:\n\n${error.message}\n\nCheck console for details.`);
    } finally {
      setRunningDiagnostics(false);
    }
  };

  // Setup messages collections
  const setupMessagesCollections = async () => {
    setSettingUpCollections(true);
    try {
      console.log('🚀 Setting up messages collections...');
      const result = await messagesSetup.setupMessagesCollections();

      if (result.success) {
        if (result.created) {
          console.log('🎉 Collections created successfully!');
          alert('✅ Messages collections created successfully! You can now use the messaging system.');
        } else {
          console.log('✅ Collections already exist!');
          alert('✅ Collections already exist and are ready to use!');
        }
      } else {
        console.error('❌ Failed to setup collections:', result.error);
        alert('❌ Failed to setup collections. Check console for details.');
      }
    } catch (error) {
      console.error('❌ Error setting up collections:', error);
      alert('❌ Error setting up collections. Check console for details.');
    } finally {
      setSettingUpCollections(false);
    }
  };

  // Create demo messages
  const createDemoMessages = async () => {
    setCreatingDemoMessages(true);
    try {
      console.log('🚀 Creating demo messages...');
      const result = await demoMessagesCreator.createDemoMessages();
      console.log('✅ Demo messages created:', result);

      if (result) {
        alert(`🎉 Demo messages created successfully!\n\nCreated:\n• ${result.conversations} conversations\n• ${result.messages} messages\n\nGo to Messages page to see them!`);
      }
    } catch (error: any) {
      console.error('❌ Error creating demo messages:', error);
      alert(`❌ Error creating demo messages:\n\n${error.message}\n\nCheck console for details.`);
    } finally {
      setCreatingDemoMessages(false);
    }
  };

  // Create demo notifications
  const createDemoNotifications = async () => {
    if (!user) return;

    setCreatingDemoNotifications(true);
    try {
      console.log('🔔 Creating demo notifications...');

      // Создаем разные типы уведомлений
      await Promise.all([
        NotificationService.createMessageNotification(
          user.$id,
          'John Doe',
          'Hi! I\'m interested in your AI development services.',
          'demo-conversation-1'
        ),
        NotificationService.createProjectNotification(
          user.$id,
          'AI Chatbot Development',
          'demo-project-1',
          'new_project'
        ),
        NotificationService.createPaymentNotification(
          user.$id,
          500,
          'USD',
          'demo-payment-1',
          'payment_received'
        )
      ]);

      console.log('✅ Demo notifications created');
      alert('🔔 Demo notifications created! Check the notification bell.');
    } catch (error: any) {
      console.error('❌ Error creating demo notifications:', error);
      alert(`❌ Error creating demo notifications:\n\n${error.message}`);
    } finally {
      setCreatingDemoNotifications(false);
    }
  };

  // Debug: log auth state
  useEffect(() => {
    console.log('Dashboard auth state:', {
      user: user ? { name: user.name, email: user.email, id: user.$id } : null,
      isAuthenticated,
      isLoading
    });
  }, [user, isAuthenticated, isLoading]);

  // Проверка аутентификации
  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем, есть ли mock сессия
      const mockSession = localStorage.getItem('mockSession');
      const savedUser = localStorage.getItem('user');

      if (mockSession === 'true' && savedUser) {
        console.log('Dashboard: Mock session detected, skipping Appwrite check');
        return; // Не проверяем Appwrite для mock пользователей
      }

      // Для реальных пользователей проверяем Appwrite
      try {
        const { account } = await import('@/lib/appwrite');
        const { authService } = await import('@/services/authService');

        const user = await account.get();
        authService.setAuthenticated(user);

        if (!isAuthenticated) {
          setTimeout(() => window.location.reload(), 500);
        }
      } catch (error: any) {
        console.log('Dashboard: No Appwrite session, checking auth context...');

        // Даем время для инициализации контекста
        setTimeout(() => {
          if (!isLoading && !isAuthenticated) {
            console.log('Dashboard: Redirecting to login');
            router.push('/en/login');
          }
        }, 1000);
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, router]);



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
          <p className="text-gray-400 mb-4">Please log in to access the dashboard</p>
          <button
            onClick={() => router.push('/en/login')}
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

  // Dynamic data based on user type
  const freelancerStats = [
    {
      label: 'Total Earnings',
      value: safeCurrency(12500),
      change: '+12%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-400',
      bgGradient: 'from-green-500 to-emerald-500',
      shadowColor: 'shadow-green-500/25'
    },
    {
      label: 'Active Projects',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: 'Completed Jobs',
      value: '156',
      change: '+5',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500 to-violet-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      label: 'Client Rating',
      value: '4.9',
      change: '+0.1',
      changeType: 'positive',
      icon: Star,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500 to-orange-500',
      shadowColor: 'shadow-yellow-500/25'
    }
  ];

  const clientStats = [
    {
      label: 'Total Spent',
      value: safeCurrency(28750),
      change: '+18%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-400',
      bgGradient: 'from-green-500 to-emerald-500',
      shadowColor: 'shadow-green-500/25'
    },
    {
      label: 'Active Jobs',
      value: '5',
      change: '+1',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'shadow-blue-500/25'
    },
    {
      label: 'Hired Freelancers',
      value: '23',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500 to-violet-500',
      shadowColor: 'shadow-purple-500/25'
    },
    {
      label: 'Success Rate',
      value: '96%',
      change: '+2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500 to-orange-500',
      shadowColor: 'shadow-yellow-500/25'
    }
  ];

  const stats = userType === 'freelancer' ? freelancerStats : clientStats;

  // Dynamic projects data
  const freelancerProjects = [
    {
      id: '1',
      title: 'AI Logo Design for TechCorp',
      client: 'Sarah Johnson',
      status: 'in_progress',
      budget: 1500,
      deadline: '2024-01-20',
      progress: 75,
      lastUpdate: '2024-01-15T10:00:00Z',
      messages: 3
    },
    {
      id: '2',
      title: 'Chatbot Development',
      client: 'Mike Davis',
      status: 'review',
      budget: 3000,
      deadline: '2024-01-18',
      progress: 90,
      lastUpdate: '2024-01-14T15:30:00Z',
      messages: 1
    },
    {
      id: '3',
      title: 'AI Video Content Creation',
      client: 'Emma Wilson',
      status: 'completed',
      budget: 2000,
      deadline: '2024-01-15',
      progress: 100,
      lastUpdate: '2024-01-15T09:00:00Z',
      messages: 0
    },
    {
      id: '4',
      title: 'Game Character Design',
      client: 'Alex Rodriguez',
      status: 'pending',
      budget: 2500,
      deadline: '2024-01-25',
      progress: 0,
      lastUpdate: '2024-01-13T14:00:00Z',
      messages: 2
    }
  ];

  const clientProjects = [
    {
      id: '1',
      title: 'E-commerce Website Development',
      freelancer: 'Alex Chen',
      status: 'in_progress',
      budget: 5000,
      deadline: '2024-02-01',
      progress: 60,
      lastUpdate: '2024-01-15T10:00:00Z',
      messages: 5
    },
    {
      id: '2',
      title: 'Mobile App UI/UX Design',
      freelancer: 'Maria Rodriguez',
      status: 'review',
      budget: 2500,
      deadline: '2024-01-22',
      progress: 85,
      lastUpdate: '2024-01-14T15:30:00Z',
      messages: 2
    },
    {
      id: '3',
      title: 'AI Chatbot Integration',
      freelancer: 'David Kim',
      status: 'completed',
      budget: 3500,
      deadline: '2024-01-10',
      progress: 100,
      lastUpdate: '2024-01-10T09:00:00Z',
      messages: 0
    },
    {
      id: '4',
      title: 'Content Writing for Blog',
      freelancer: 'Sarah Wilson',
      status: 'pending',
      budget: 800,
      deadline: '2024-01-30',
      progress: 0,
      lastUpdate: '2024-01-12T14:00:00Z',
      messages: 1
    }
  ];

  const recentProjects = userType === 'freelancer' ? freelancerProjects : clientProjects;

  const upcomingDeadlines = [
    {
      project: 'AI Logo Design for TechCorp',
      deadline: '2024-01-20',
      daysLeft: 5,
      priority: 'high'
    },
    {
      project: 'Chatbot Development',
      deadline: '2024-01-18',
      daysLeft: 3,
      priority: 'urgent'
    },
    {
      project: 'Game Character Design',
      deadline: '2024-01-25',
      daysLeft: 10,
      priority: 'medium'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'review':
        return <Eye className="w-4 h-4 text-yellow-400" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'review':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-red-500/20 text-red-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const filteredProjects = filterStatus === 'all' 
    ? recentProjects 
    : recentProjects.filter(project => project.status === filterStatus);

  const tabs = userType === 'freelancer' ? [
    { id: 'overview', label: 'Overview' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'earnings', label: 'Earnings' }
  ] : [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'earnings', label: 'Earnings' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Top Navigation */}
      <Navbar />
      <TopNav />

      {/* Main Content */}
      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-[#2A1A3E] border-b border-gray-700/50 p-4 md:p-6 lg:p-8 overflow-hidden rounded-t-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>

            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.name || 'User'}! 👋
                </h1>
                <p className="text-gray-400 text-sm sm:text-base">
                  {userType === 'freelancer'
                    ? "Manage your projects and find new opportunities"
                    : "Post jobs and manage your hired freelancers"
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* User Type Switcher */}
                <div className="flex bg-gray-800/80 rounded-xl p-1 backdrop-blur-sm">
                  <button
                    onClick={() => setUserType('freelancer')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      userType === 'freelancer'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    )}
                  >
                    👨‍💻 Freelancer
                  </button>
                  <button
                    onClick={() => setUserType('client')}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      userType === 'client'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    )}
                  >
                    🏢 Client
                  </button>
                </div>

                {/* Action Button */}
                {userType === 'client' ? (
                  <Link href="/en/jobs/create" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 hover:shadow-green-600/40">
                    <Plus className="w-4 h-4" />
                    Post New Job
                  </Link>
                ) : (
                  <Link href="/en/jobs" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40">
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
                <div key={index} className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 sm:p-6 rounded-2xl hover:bg-[#1A1A2E]/70 transition-all duration-200 group">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center shadow-lg ${stat.shadowColor} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <span className={cn(
                      "text-xs sm:text-sm font-medium px-2 py-1 rounded-lg",
                      stat.changeType === 'positive'
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-red-400 bg-red-400/10'
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* User Level Card */}
          {userType === 'freelancer' && (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
              <UserLevelCard
                userStats={userStats}
                totalPoints={totalPoints}
              />
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
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      {userType === 'freelancer' ? 'Recent Portfolio' : 'Recent Projects'}
                    </h3>
                    <button
                      onClick={() => setActiveTab(userType === 'freelancer' ? 'portfolio' : 'projects')}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {recentProjects.slice(0, 4).map((project) => (
                      <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all duration-200 border border-gray-700/50">
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                          {getStatusIcon(project.status)}
                          <div className="min-w-0 flex-1">
                            <h4 className="text-white font-medium text-sm sm:text-base truncate">{project.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-400 truncate">
                              {userType === 'freelancer'
                                ? `Client: ${(project as any).client}`
                                : `Freelancer: ${(project as any).freelancer}`
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                          <div className="text-left sm:text-right">
                            <div className="text-white font-medium text-sm sm:text-base">{safeCurrency(project.budget)}</div>
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
                                <span className="text-sm hidden sm:inline">{project.messages}</span>
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
                  <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{item.project}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(item.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          getPriorityColor(item.priority)
                        )}>
                          {item.daysLeft}d
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Card */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 p-4 sm:p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Navigation</h3>

                  {/* Main Navigation Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link
                      href="/en/dashboard"
                      className="flex flex-col items-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/25">
                        <Home className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-blue-400 text-center font-medium">Dashboard</span>
                    </Link>

                    <Link
                      href={userType === 'freelancer' ? '/en/projects' : '/en/jobs'}
                      className="flex flex-col items-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-purple-400 text-center font-medium">
                        {userType === 'freelancer' ? 'Projects' : 'Jobs'}
                      </span>
                    </Link>

                    <Link
                      href="/en/messages"
                      className="flex flex-col items-center p-3 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/25">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-green-400 text-center font-medium">Messages</span>
                    </Link>

                    <Link
                      href="/en/payments"
                      className="flex flex-col items-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/25">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-yellow-400 text-center font-medium">Payments</span>
                    </Link>

                    <Link
                      href="/en/reviews"
                      className="flex flex-col items-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/25">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-orange-400 text-center font-medium">Reviews</span>
                    </Link>

                    <Link
                      href="/en/reports"
                      className="flex flex-col items-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/25">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-indigo-400 text-center font-medium">Reports</span>
                    </Link>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-gray-800/50 pt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      {userType === 'client' ? (
                        <Link href="/en/jobs/create" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-green-600/25 text-sm">
                          <Plus className="w-4 h-4" />
                          Post New Job
                        </Link>
                      ) : (
                        <Link href="/en/jobs" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 text-sm">
                          <Search className="w-4 h-4" />
                          Find Jobs
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300">Project completed</span>
                      <span className="text-gray-500">2h ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">New message received</span>
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

          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">All Projects</h2>
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
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Project</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          {userType === 'freelancer' ? 'Client' : 'Freelancer'}
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Budget</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Deadline</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Progress</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {filteredProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">{project.title}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-300">
                              {userType === 'freelancer'
                                ? (project as any).client
                                : (project as any).freelancer
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
                              getStatusColor(project.status)
                            )}>
                              {getStatusIcon(project.status)}
                              <span className="capitalize">{project.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium">{safeCurrency(project.budget)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-300">
                              {new Date(project.deadline).toLocaleDateString()}
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
                              <span className="text-sm text-gray-400">{project.progress}%</span>
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

          {activeTab === 'portfolio' && userType === 'freelancer' && (
            <div>
              {showAddPortfolio ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Add to Portfolio</h2>
                    <button
                      onClick={() => setShowAddPortfolio(false)}
                      className="btn-secondary"
                    >
                      ← Back to Portfolio
                    </button>
                  </div>
                  <AddPortfolioForm
                    onSubmit={async (data) => {
                      console.log('Portfolio data:', data);
                      // TODO: Save to database
                      setShowAddPortfolio(false);
                    }}
                    onCancel={() => setShowAddPortfolio(false)}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">My Portfolio</h2>
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
                      <strong>Debug:</strong> Current user ID: {user?.$id || 'Not logged in'}
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

          {activeTab === 'achievements' && userType === 'freelancer' && (
            <div className="space-y-8">
              <div className="glass-card p-6 rounded-2xl">
                <AchievementsGrid
                  userStats={userStats}
                  unlockedAchievements={unlockedAchievements}
                />
              </div>
            </div>
          )}





          {activeTab === 'earnings' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Earnings Overview</h2>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Earnings analytics coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Advanced analytics coming soon...</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Star,
  Calendar,
  Clock,
  Users,
  MessageCircle,
  Plus,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
// Navbar removed - using Sidebar instead
import { cn, formatCurrency, formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userType, setUserType] = useState<'freelancer' | 'client'>('freelancer');
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();



  // Debug logging
  useEffect(() => {
    console.log('Dashboard auth state:', { user, isAuthenticated, isLoading });
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    console.log('Dashboard useEffect triggered:', { isLoading, isAuthenticated });
    // Temporarily disable strict auth check to test
    // if (!isLoading && !isAuthenticated) {
    //   console.log('Redirecting to login...');
    //   router.push('/en/login');
    // }
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
      color: 'text-green-400'
    },
    {
      label: 'Active Projects',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-blue-400'
    },
    {
      label: 'Completed Jobs',
      value: '156',
      change: '+5',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'text-purple-400'
    },
    {
      label: 'Client Rating',
      value: '4.9',
      change: '+0.1',
      changeType: 'positive',
      icon: Star,
      color: 'text-yellow-400'
    }
  ];

  const clientStats = [
    {
      label: 'Total Spent',
      value: safeCurrency(28750),
      change: '+18%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      label: 'Active Jobs',
      value: '5',
      change: '+1',
      changeType: 'positive',
      icon: Briefcase,
      color: 'text-blue-400'
    },
    {
      label: 'Hired Freelancers',
      value: '23',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-400'
    },
    {
      label: 'Success Rate',
      value: '96%',
      change: '+2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-yellow-400'
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {userType === 'freelancer' ? 'Freelancer Dashboard' : 'Client Dashboard'}
              </h1>
              <p className="text-gray-400">
                {userType === 'freelancer'
                  ? "Manage your projects and find new opportunities"
                  : "Post jobs and manage your hired freelancers"
                }
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* User Type Switcher */}
              <div className="flex items-center bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setUserType('freelancer')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    userType === 'freelancer'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  👨‍💻 Freelancer
                </button>
                <button
                  onClick={() => setUserType('client')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    userType === 'client'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  🏢 Client
                </button>
              </div>

              {/* Action Button */}
              {userType === 'client' ? (
                <Link href="/en/jobs/create" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Link>
              ) : (
                <Link href="/en/jobs" className="btn-primary">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Find Jobs
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium",
                      stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-800 mb-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "py-4 border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-gray-400 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Projects */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Projects</h3>
                    <Link href="/en/projects" className="text-purple-400 hover:text-purple-300 transition-colors">
                      View All
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {recentProjects.slice(0, 4).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(project.status)}
                          <div>
                            <h4 className="text-white font-medium">{project.title}</h4>
                            <p className="text-sm text-gray-400">
                              {userType === 'freelancer'
                                ? `Client: ${(project as any).client}`
                                : `Freelancer: ${(project as any).freelancer}`
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-white font-medium">{safeCurrency(project.budget)}</div>
                            <div className="text-sm text-gray-400">
                              Due {safeRelativeTime(project.deadline)}
                            </div>
                          </div>
                          
                          {project.messages > 0 && (
                            <Link
                              href={`/en/messages?project=${project.id}`}
                              className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm">{project.messages}</span>
                            </Link>
                          )}

                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/en/projects/${project.id}`}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                              title="View Project"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/en/messages?project=${project.id}`}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                              title="Message"
                            >
                              <MessageCircle className="w-4 h-4" />
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

                {/* Quick Actions */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {userType === 'client' ? (
                      <>
                        <Link href="/en/jobs/create" className="block w-full btn-secondary text-center">
                          📝 Post New Job
                        </Link>
                        <Link href="/en/freelancers" className="block w-full btn-secondary text-center">
                          👥 Find Freelancers
                        </Link>
                        <Link href="/en/payments" className="block w-full btn-secondary text-center">
                          💳 Payments
                        </Link>
                        <Link href="/en/messages" className="block w-full btn-secondary text-center">
                          💬 Messages
                        </Link>
                        <Link href="/en/settings" className="block w-full btn-secondary text-center">
                          ⚙️ Settings
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/en/jobs" className="block w-full btn-secondary text-center">
                          🔍 Find Jobs
                        </Link>
                        <Link href="/en/projects" className="block w-full btn-secondary text-center">
                          📋 My Projects
                        </Link>
                        <Link href="/en/reviews" className="block w-full btn-secondary text-center">
                          ⭐ Reviews
                        </Link>
                        <Link href="/en/payments" className="block w-full btn-secondary text-center">
                          💳 Payments
                        </Link>
                        <Link href="/en/messages" className="block w-full btn-secondary text-center">
                          💬 Messages
                        </Link>
                        <Link href="/en/settings" className="block w-full btn-secondary text-center">
                          ⚙️ Settings
                        </Link>
                      </>
                    )}
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

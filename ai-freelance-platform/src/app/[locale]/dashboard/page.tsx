"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import TopNav from "@/components/TopNav";
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
  MoreVertical,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
// Using TopNav instead of Sidebar
import { cn, formatCurrency, formatRelativeTime } from "@/lib/utils";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/en/login");
    }
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

  if (!isAuthenticated) {
    return null;
  }

  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(12500),
      change: "+12%",
      changeType: "positive",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      label: "Active Projects",
      value: "8",
      change: "+2",
      changeType: "positive",
      icon: Briefcase,
      color: "text-blue-400",
    },
    {
      label: "Completed Jobs",
      value: "156",
      change: "+5",
      changeType: "positive",
      icon: CheckCircle,
      color: "text-purple-400",
    },
    {
      label: "Client Rating",
      value: "4.9",
      change: "+0.1",
      changeType: "positive",
      icon: Star,
      color: "text-yellow-400",
    },
  ];

  const recentProjects = [
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

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "projects", label: "Projects" },
    { id: "earnings", label: "Earnings" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <TopNav />

      {/* Main Content */}
      <div className="pt-20">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                  Welcome back! Here's what's happening with your projects.
                </p>
              </div>
              <div className="flex items-center justify-end sm:justify-start">
                <Link
                  href="/en/jobs/create"
                  className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                >
                  <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Post New Job</span>
                  <span className="sm:hidden">Post Job</span>
                </Link>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="glass-card p-3 sm:p-6 rounded-xl sm:rounded-2xl"
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div
                        className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-800 flex items-center justify-center ${stat.color}`}
                      >
                        <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
                      </div>
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium",
                          stat.changeType === "positive"
                            ? "text-green-400"
                            : "text-red-400",
                        )}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800 mb-6 sm:mb-8">
              <div className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base",
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-white",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Recent Projects */}
                <div className="lg:col-span-2">
                  <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">
                        Recent Projects
                      </h3>
                      <Link
                        href="/en/dashboard?tab=projects"
                        className="text-purple-400 hover:text-purple-300 transition-colors text-sm sm:text-base"
                      >
                        View All
                      </Link>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {recentProjects.slice(0, 4).map((project) => (
                        <div
                          key={project.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-800/30 rounded-xl gap-3 sm:gap-0"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                            {getStatusIcon(project.status)}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-white font-medium text-sm sm:text-base truncate">
                                {project.title}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-400">
                                {project.client}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                            <div className="text-left sm:text-right">
                              <div className="text-white font-medium text-sm sm:text-base">
                                {formatCurrency(project.budget)}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400">
                                Due {formatRelativeTime(project.deadline)}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {project.messages > 0 && (
                                <div className="flex items-center space-x-1 text-purple-400">
                                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="text-xs sm:text-sm">
                                    {project.messages}
                                  </span>
                                </div>
                              )}

                              <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors">
                                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 sm:space-y-6">
                  {/* Upcoming Deadlines */}
                  <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                      Upcoming Deadlines
                    </h3>
                    <div className="space-y-3">
                      {upcomingDeadlines.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">
                              {item.project}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(item.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "text-sm font-medium ml-2 flex-shrink-0",
                              getPriorityColor(item.priority),
                            )}
                          >
                            {item.daysLeft}d
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                      <Link
                        href="/en/jobs/create"
                        className="block w-full btn-secondary text-center text-sm sm:text-base py-2 sm:py-3"
                      >
                        Post New Job
                      </Link>
                      <Link
                        href="/en/freelancers"
                        className="block w-full btn-secondary text-center text-sm sm:text-base py-2 sm:py-3"
                      >
                        Find Freelancers
                      </Link>
                      <Link
                        href="/en/profile/edit"
                        className="block w-full btn-secondary text-center text-sm sm:text-base py-2 sm:py-3"
                      >
                        Edit Profile
                      </Link>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-300 flex-1 truncate">
                          Project completed
                        </span>
                        <span className="text-gray-500 flex-shrink-0">
                          2h ago
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-300 flex-1 truncate">
                          New message received
                        </span>
                        <span className="text-gray-500 flex-shrink-0">
                          4h ago
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-300 flex-1 truncate">
                          Payment received
                        </span>
                        <span className="text-gray-500 flex-shrink-0">
                          1d ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    All Projects
                  </h2>
                  <div className="flex items-center justify-end">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input-field text-sm sm:text-base"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">In Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Project
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                            Client
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
                                {project.client}
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
                                {formatCurrency(project.budget)}
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
                                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                                  <MessageCircle className="w-4 h-4" />
                                </button>
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

            {activeTab === "earnings" && (
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Earnings Overview
                </h2>
                <div className="text-center py-8 sm:py-12">
                  <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">
                    Earnings analytics coming soon...
                  </p>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                  Analytics
                </h2>
                <div className="text-center py-8 sm:py-12">
                  <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">
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

"use client";

import { useState } from "react";
import {
  Bell,
  Filter,
  Check,
  Trash2,
  Eye,
  MoreVertical,
  Briefcase,
  CreditCard,
  MessageCircle,
  Star,
  Settings,
  Search,
  CheckCircle,
  X,
  ArrowLeft,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

// Enhanced mock notifications data with English content
const mockNotifications = [
  {
    id: "1",
    type: "project",
    title: "New Project Proposal Received",
    message:
      "John Doe submitted a detailed proposal for your AI Chatbot Development project with a competitive budget of $2,500 and 2-week timeline.",
    time: "2 minutes ago",
    read: false,
    priority: "high",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/en/projects/123/proposals",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Successfully Received",
    message:
      "Congratulations! You received $500 for the AI Image Generator project. The payment has been processed and added to your account balance.",
    time: "1 hour ago",
    read: false,
    priority: "medium",
    avatar: null,
    actionUrl: "/en/payments/456",
  },
  {
    id: "3",
    type: "message",
    title: "New Message from Client",
    message:
      "Sarah Wilson sent you an important message regarding the ML model requirements, project timeline, and additional specifications.",
    time: "3 hours ago",
    read: false,
    priority: "medium",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/en/messages/789",
  },
  {
    id: "4",
    type: "review",
    title: "Excellent Review Received",
    message:
      "Amazing news! You received a 5-star review from Alex Chen for the AI Voice Assistant project. Great work maintaining high quality!",
    time: "1 day ago",
    read: true,
    priority: "low",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/en/reviews/101",
  },
  {
    id: "5",
    type: "system",
    title: "Account Successfully Verified",
    message:
      "Your freelancer account has been successfully verified! You now have access to premium projects and higher-paying opportunities.",
    time: "2 days ago",
    read: true,
    priority: "medium",
    avatar: null,
    actionUrl: "/en/profile",
  },
  {
    id: "6",
    type: "project",
    title: "Project Milestone Completed",
    message:
      "Your AI Data Analysis project has been marked as completed by the client. Payment will be released within 24 hours.",
    time: "3 days ago",
    read: true,
    priority: "high",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
    actionUrl: "/en/projects/202",
  },
  {
    id: "7",
    type: "system",
    title: "Security Alert",
    message:
      "New login detected from a different device. If this wasn't you, please secure your account immediately.",
    time: "5 days ago",
    read: true,
    priority: "high",
    avatar: null,
    actionUrl: "/en/settings/security",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">(
    "newest",
  );

  const filteredNotifications = notifications
    .filter((notification) => {
      const matchesFilter = filter === "all" || notification.type === filter;
      const matchesSearch =
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      // For now, we'll just sort by read status (unread first)
      if (a.read !== b.read) return a.read ? 1 : -1;
      return 0;
    });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const selectedCount = selectedNotifications.length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedNotifications((prev) => prev.filter((nId) => nId !== id));
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selectedCount === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
    }
  };

  const deleteSelected = () => {
    setNotifications((prev) =>
      prev.filter((n) => !selectedNotifications.includes(n.id)),
    );
    setSelectedNotifications([]);
  };

  const markSelectedAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        selectedNotifications.includes(n.id) ? { ...n, read: true } : n,
      ),
    );
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project":
        return <Briefcase className="w-5 h-5" />;
      case "payment":
        return <CreditCard className="w-5 h-5" />;
      case "message":
        return <MessageCircle className="w-5 h-5" />;
      case "review":
        return <Star className="w-5 h-5" />;
      case "system":
        return <Settings className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "project":
        return "from-blue-500 to-blue-600";
      case "payment":
        return "from-green-500 to-green-600";
      case "message":
        return "from-purple-500 to-purple-600";
      case "review":
        return "from-yellow-500 to-yellow-600";
      case "system":
        return "from-gray-500 to-gray-600";
      default:
        return "from-blue-500 to-blue-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-500/10";
      case "medium":
        return "border-yellow-500 bg-yellow-500/10";
      case "low":
        return "border-green-500 bg-green-500/10";
      default:
        return "border-gray-500 bg-gray-500/10";
    }
  };

  const filterOptions = [
    {
      value: "all",
      label: "All Notifications",
      count: notifications.length,
      icon: Bell,
    },
    {
      value: "project",
      label: "Projects",
      count: notifications.filter((n) => n.type === "project").length,
      icon: Briefcase,
    },
    {
      value: "payment",
      label: "Payments",
      count: notifications.filter((n) => n.type === "payment").length,
      icon: CreditCard,
    },
    {
      value: "message",
      label: "Messages",
      count: notifications.filter((n) => n.type === "message").length,
      icon: MessageCircle,
    },
    {
      value: "review",
      label: "Reviews",
      count: notifications.filter((n) => n.type === "review").length,
      icon: Star,
    },
    {
      value: "system",
      label: "System",
      count: notifications.filter((n) => n.type === "system").length,
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <TopNav />

      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/en/dashboard"
                  className="p-2 rounded-xl bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
                    Notifications Center
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-gray-400">
                      {unreadCount > 0 ? (
                        <span className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span>
                            {unreadCount} unread notification
                            {unreadCount === 1 ? "" : "s"}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>
                            All caught up! Great job staying organized.
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark All Read</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-gradient-to-r from-gray-800/50 via-gray-800/30 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/30 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notifications by title or content..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 border",
                          filter === option.value
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500 shadow-lg"
                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-gray-600/50",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold",
                            filter === option.value
                              ? "bg-white/20 text-white"
                              : "bg-gray-600 text-gray-400",
                          )}
                        >
                          {option.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={selectAll}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {selectedCount === filteredNotifications.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  <span className="text-sm text-gray-400">
                    {selectedCount} notification{selectedCount === 1 ? "" : "s"}{" "}
                    selected
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={markSelectedAsRead}
                    className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 border border-green-600/30"
                  >
                    <Check className="w-4 h-4" />
                    <span>Mark Read</span>
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 border border-red-600/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/30">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No Notifications Found
                </h3>
                <p className="text-gray-400 text-lg">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "You're all caught up! Check back later for new updates."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "bg-gradient-to-r from-gray-800/40 via-gray-800/30 to-gray-800/40 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl group border",
                    !notification.read
                      ? "border-purple-500/30 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 shadow-lg shadow-purple-500/10"
                      : "border-gray-700/30 hover:border-gray-600/50",
                  )}
                >
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification.id,
                        )}
                        onChange={() =>
                          toggleSelectNotification(notification.id)
                        }
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>

                    {/* Notification Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <div className="relative">
                          <UserAvatar
                            src={notification.avatar}
                            alt=""
                            size="lg"
                            className="ring-2 ring-gray-600"
                          />
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs bg-gradient-to-r",
                              getNotificationColor(notification.type),
                            )}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-r shadow-lg",
                            getNotificationColor(notification.type),
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={cn(
                                "text-lg font-bold",
                                notification.read
                                  ? "text-gray-300"
                                  : "text-white",
                              )}
                            >
                              {notification.title}
                            </h3>
                            <div
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium border",
                                getPriorityColor(notification.priority),
                              )}
                            >
                              {notification.priority.toUpperCase()}
                            </div>
                          </div>
                          <p className="text-gray-400 leading-relaxed mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{notification.time}</span>
                            </div>
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="inline-flex items-center space-x-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex-shrink-0 mt-2 animate-pulse shadow-lg"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button (if needed) */}
          {filteredNotifications.length > 0 && (
            <div className="text-center mt-8">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg">
                Load More Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

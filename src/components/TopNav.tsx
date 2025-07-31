"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Home,
  Briefcase,
  Users,
  CreditCard,
  Star,
  BarChart3,
  Settings,
  Bell,
  X,
  Check,
  MessageCircle,
  Eye,
  Trash2,
  MarkAsUnread,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface TopNavProps {
  locale?: string;
}

// Mock notifications data - improved with English content
const mockNotifications = [
  {
    id: "1",
    type: "project",
    title: "New Project Proposal",
    message: "John Doe submitted a proposal for your AI Chatbot project",
    time: "2 minutes ago",
    read: false,
    avatar:
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    message: "You received $500 for AI Image Generator project",
    time: "1 hour ago",
    read: false,
    avatar: null,
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "Sarah Wilson sent you a message about the ML model",
    time: "3 hours ago",
    read: false,
    avatar:
              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop&crop=face",
  },
  {
    id: "4",
    type: "review",
    title: "New Review",
    message: "You received a 5-star review from Alex Chen",
    time: "1 day ago",
    read: true,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
  },
  {
    id: "5",
    type: "system",
    title: "Account Verified",
    message: "Your freelancer account has been successfully verified",
    time: "2 days ago",
    read: true,
    avatar: null,
  },
];

export default function TopNav({ locale = "en" }: TopNavProps) {
  const pathname = usePathname();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: "Dashboard",
      icon: Home,
      description: "Overview & Analytics",
    },
    {
      href: `/${locale}/projects`,
      label: "Projects",
      icon: Settings,
      description: "Manage Projects",
    },
    {
      href: `/${locale}/freelancers`,
      label: "Freelancers",
      icon: Users,
      description: "Find Talent",
    },
    {
      href: `/${locale}/payments`,
      label: "Payments",
      icon: CreditCard,
      description: "Billing & Transactions",
    },
    {
      href: `/${locale}/reviews`,
      label: "Reviews",
      icon: Star,
      description: "Feedback & Ratings",
    },
    {
      href: `/${locale}/reports`,
      label: "Reports",
      icon: BarChart3,
      description: "Analytics & Insights",
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/dashboard`) {
      return pathname === `/${locale}/dashboard`;
    }
    return pathname.startsWith(href);
  };

  // Notification functions
  const unreadCount = notifications.filter((n) => !n.read).length;

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
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "project":
        return <Briefcase className="w-4 h-4" />;
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      case "message":
        return <MessageCircle className="w-4 h-4" />;
      case "review":
        return <Star className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "project":
        return "bg-blue-500";
      case "payment":
        return "bg-green-500";
      case "message":
        return "bg-purple-500";
      case "review":
        return "bg-yellow-500";
      case "system":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    // Reset counter by marking all as read when opening
    if (!isNotificationOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Navigation Tabs */}
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap rounded-t-2xl",
                    "hover:bg-gradient-to-b hover:from-gray-700/50 hover:to-gray-800/50",
                    active
                      ? "text-purple-400 bg-gradient-to-b from-gray-700/30 to-gray-800/30 border-b-3 border-purple-500 shadow-lg"
                      : "text-gray-400 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-all duration-300",
                      active
                        ? "text-purple-400 scale-110"
                        : "text-gray-400 group-hover:text-white group-hover:scale-105",
                    )}
                  />
                  <span className="hidden sm:block">{item.label}</span>

                  {/* Enhanced Tooltip for mobile */}
                  <div className="sm:hidden absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 shadow-xl border border-gray-700">
                    {item.label}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right side - Notifications and Settings */}
          <div className="flex items-center space-x-4">
            {/* Enhanced Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <div
                className="relative p-3 text-purple-400 hover:text-white hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-blue-600/20 rounded-xl transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-purple-500/25"
                onClick={handleNotificationClick}
              >
                <Bell className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-gray-900 shadow-lg animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              {/* Enhanced Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
                  {/* Header */}
                  <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Notifications
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "All caught up!"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="p-2 text-gray-400 hover:text-green-400 rounded-lg hover:bg-green-500/10 transition-all duration-200"
                            title="Mark all as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setIsNotificationOpen(false)}
                          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b border-gray-800/50 hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/30 cursor-pointer transition-all duration-200 group",
                            !notification.read &&
                              "bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-l-4 border-purple-500",
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar or Icon */}
                            <div className="flex-shrink-0 mt-1">
                              {notification.avatar ? (
                                <img
                                  src={notification.avatar}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                                />
                              ) : (
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs",
                                    getNotificationColor(notification.type),
                                  )}
                                >
                                  {getNotificationIcon(notification.type)}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4
                                className={cn(
                                  "font-medium text-sm mb-1",
                                  notification.read
                                    ? "text-gray-300"
                                    : "text-white",
                                )}
                              >
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-400 mb-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500">
                                {notification.time}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-green-400 rounded-md hover:bg-green-500/10 transition-all duration-200"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-all duration-200"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-b-2xl">
                    <button
                      className="w-full py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]"
                      onClick={() => {
                        window.location.href = `/${locale}/notifications`;
                        setIsNotificationOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>View All Notifications</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Button */}
            <Link
              href={`/${locale}/settings`}
              className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-blue-600/20 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-purple-500/25"
              title="Settings"
            >
              <Settings className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90" />
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4f46e5 #374151;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Zap,
  User,
  LogOut,
  Briefcase,
  Users,
  Sparkles,
  Bell,
  MessageSquare,
  Check,
  Trash2,
  Eye,
  CreditCard,
  Star,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuthContext } from "@/contexts/AuthContext";
import AuthButtons from "@/components/AuthButtons";
import UserAvatarSkeleton from "@/components/UserAvatarSkeleton";
import NavbarUserAvatar from "@/components/NavbarUserAvatar";

// Mock notifications data
const mockNotifications = [
  {
    id: "1",
    type: "project",
    title: "New Project Assigned",
    message:
      "You've been assigned to work on 'E-commerce Website Redesign' project.",
    time: "2 minutes ago",
    read: false,
    avatar: null,
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    message: "$2,500 has been deposited to your account for completed work.",
    time: "1 hour ago",
    read: false,
    avatar: null,
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "Client has sent you a message regarding project requirements.",
    time: "3 hours ago",
    read: true,
    avatar: null,
  },
  {
    id: "4",
    type: "review",
    title: "Project Review",
    message: "Your work on 'Mobile App UI' has received a 5-star rating!",
    time: "1 day ago",
    read: true,
    avatar: null,
  },
  {
    id: "5",
    type: "system",
    title: "Profile Updated",
    message: "Your profile information has been successfully updated.",
    time: "2 days ago",
    read: true,
    avatar: null,
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const pathname = usePathname();
  const locale = "en";

  const { user, isAuthenticated, initializing, logout } = useAuthContext();

  // Debug: log auth state
  useEffect(() => {
    console.log("Navbar auth state:", {
      user: user ? { name: user.name, email: user.email, id: user.$id } : null,
      isAuthenticated,
      initializing,
    });
  }, [user, isAuthenticated, initializing]);

  // Simple translations
  const t = (key: string) => {
    const translations: Record<string, string> = {
      home: "Home",
      jobs: "Jobs",
      freelancers: "Freelancers",
      login: "Login",
      signup: "Sign Up",
    };
    return translations[key] || key;
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
        return <MessageSquare className="w-4 h-4" />;
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

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Reset counter by marking all as read when opening
    if (!showNotifications && unreadCount > 0) {
      markAllAsRead();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNotifications &&
        !(event.target as Element).closest(".notification-dropdown")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const handleLogin = async () => {
    window.location.href = `/${locale}/login`;
  };

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { href: `/${locale}/solutions`, label: "Solutions", icon: Sparkles },
    { href: `/${locale}/jobs`, label: t("jobs"), icon: Briefcase },
    { href: `/${locale}/freelancers`, label: t("freelancers"), icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Notifications Dropdown Component
  const NotificationsDropdown = ({
    isMobile = false,
  }: {
    isMobile?: boolean;
  }) => (
    <div
      className={cn(
        "absolute right-0 mt-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl z-50 backdrop-blur-xl",
        isMobile ? "w-80" : "w-96",
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white">Notifications</h3>
            <p className="text-sm text-gray-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
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
              onClick={() => setShowNotifications(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div
        className={cn("overflow-y-auto", isMobile ? "max-h-64" : "max-h-80")}
      >
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          notifications
            .slice(0, isMobile ? 5 : notifications.length)
            .map((notification) => (
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
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs bg-gradient-to-r",
                        getNotificationColor(notification.type),
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "font-medium text-sm mb-1",
                        notification.read ? "text-gray-300" : "text-white",
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
            setShowNotifications(false);
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>View All Notifications</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 m-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Freelance
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm no-underline",
                    isActive(link.href)
                      ? "bg-purple-500/10 text-purple-400"
                      : "text-gray-300 hover:text-white hover:bg-white/5",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Test User Button for non-authenticated users */}
            {!isAuthenticated && !initializing && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={async () => {
                    try {
                      const { MockAuthManager } = await import(
                        "@/utils/mockAuth"
                      );
                      await MockAuthManager.loginMockUser();
                      setTimeout(() => window.location.reload(), 500);
                    } catch (error) {
                      console.error("Test login failed:", error);
                      alert("Test login failed. Please try again.");
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Test User
                </button>
              </div>
            )}

            {/* Auth State */}
            {initializing ? (
              <UserAvatarSkeleton />
            ) : isAuthenticated && user ? (
              <NavbarUserAvatar locale={locale} />
            ) : (
              <AuthButtons locale={locale} />
            )}

            {/* Desktop Notifications Bell */}
            <div className="relative notification-dropdown">
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-purple-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-gray-900 animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && <NotificationsDropdown />}
            </div>
          </div>

          {/* Mobile Right Section */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile Notifications Bell */}
            <div className="relative notification-dropdown">
              <button
                onClick={handleNotificationClick}
                className="p-2 text-purple-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && <NotificationsDropdown isMobile={true} />}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-in slide-in-from-top duration-300">
            <div className="space-y-2 px-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300",
                      isActive(link.href)
                        ? "bg-purple-500/20 text-purple-400"
                        : "text-gray-300 hover:text-white hover:bg-white/5",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth State */}
            {initializing ? (
              <div className="mt-4 pt-4 border-t border-white/10 px-4">
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-700 rounded-lg mb-3"></div>
                  <div className="h-10 bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 px-4">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={`/${locale}/profile`}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-white/5 transition-colors w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 px-4">
                <button
                  onClick={handleLogin}
                  className="block w-full btn-secondary text-center"
                >
                  {t("login")}
                </button>
                <Link
                  href={`/${locale}/signup`}
                  className="block w-full btn-primary text-center"
                >
                  {t("signup")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

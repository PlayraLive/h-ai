"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Globe,
  Zap,
  User,
  LogOut,
  Briefcase,
  Users,
  Plus,
  Sparkles,
  Package,
  Bot,
  Video,
  Bell,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAuthContext } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import AuthButtons from "@/components/AuthButtons";
import UserAvatarSkeleton from "@/components/UserAvatarSkeleton";
import NavbarUserAvatar from "@/components/NavbarUserAvatar";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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

  // Простые переводы
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

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = () => {
      // Убрали обработчик для setShowLangMenu, так как он больше не используется
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogin = async () => {
    // Redirect to login page
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

  // Additional links for authenticated users
  // Эти ссылки определены, но пока не используются
  /*
  const userLinks = user
    ? [
        {
          href: `/${locale}/dashboard/solutions`,
          label: "My Solutions",
          icon: Video,
        },
      ]
    : [];
  */

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Функция перенесена в NavbarUserAvatar
  /*
  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };
  */

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

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Auth Buttons */}
            {!isAuthenticated && !initializing && (
              <div className="flex items-center space-x-3">
                {/* Test User Button */}
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

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-purple-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300"
                title="Notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-gray-900">
                  3
                </span>
              </button>

              {showNotifications && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  />

                  {/* Notifications Dropdown */}
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">
                        Уведомления
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {/* Notification Item */}
                      <div className="p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-white">
                              Новое сообщение
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              У вас новое сообщение от пользователя
                            </p>
                            <span className="text-xs text-gray-500 mt-2 block">
                              5 минут назад
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notification Item */}
                      <div className="p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Bell className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-white">
                              Системное уведомление
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Ваш аккаунт был успешно обновлен
                            </p>
                            <span className="text-xs text-gray-500 mt-2 block">
                              1 час назад
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notification Item */}
                      <div className="p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Bell className="w-4 h-4 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-white">
                              Новый заказ
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Поступил новый заказ от клиента
                            </p>
                            <span className="text-xs text-gray-500 mt-2 block">
                              вчера
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border-t border-gray-800">
                      <button
                        className="w-full py-2 text-center text-sm text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-md transition-all"
                        onClick={() => {
                          window.location.href = `/${locale}/notifications`;
                          setShowNotifications(false);
                        }}
                      >
                        Показать все
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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

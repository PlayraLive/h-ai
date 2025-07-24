"use client";

import { useState } from "react";
import { User, LogOut, Settings, Briefcase, Globe, MessageCircle, FileText } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarUserAvatarProps {
  locale: string;
}

export default function NavbarUserAvatar({ locale }: NavbarUserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Переменная showLangMenu удалена, так как переключатель языка интегрирован непосредственно в меню
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    // Для mock пользователей очищаем localStorage
    if (user.$id === "mock-user-id") {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("mockSession");
    }

    await logout();
    setIsOpen(false);

    // Перезагружаем страницу для обновления состояния
    setTimeout(() => window.location.reload(), 100);
  };

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {getInitials(user.name || user.email)}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white">
            {user.name || user.email}
          </div>
          <div className="text-xs text-gray-400">
            {user.$id === "mock-user-id" ? "Test User" : "User"}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
            <div className="py-2">
              {/* User Info */}
              <div className="px-4 py-2 border-b border-gray-700">
                <div className="text-sm font-medium text-white">
                  {user.name || user.email}
                </div>
                <div className="text-xs text-gray-400">{user.email}</div>
                {user.$id === "mock-user-id" && (
                  <div className="text-xs text-green-400 mt-1">
                    Mock User (Test Mode)
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href={`/${locale}/jobs`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase className="w-4 h-4" />
                <span>My Jobs</span>
              </Link>

              <Link
                href={`/${locale}/jobs/create`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Briefcase className="w-4 h-4" />
                <span>Post a Job</span>
              </Link>

              <Link
                href={`/${locale}/messages`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Messages</span>
              </Link>

              <Link
                href={`/${locale}/profile`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-700 my-1" />

              {/* Language Switcher */}
              <div className="px-4 py-2">
                <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
                  <Globe className="w-4 h-4" />
                  <span>Language</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <button
                    onClick={() => switchLocale("en")}
                    className={`text-sm py-1 px-2 rounded ${
                      locale === "en"
                        ? "bg-purple-500/30 text-purple-300"
                        : "hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => switchLocale("ru")}
                    className={`text-sm py-1 px-2 rounded ${
                      locale === "ru"
                        ? "bg-purple-500/30 text-purple-300"
                        : "hover:bg-gray-700 text-gray-300"
                    }`}
                  >
                    Русский
                  </button>
                </div>
              </div>

              {/* Terms of Use */}
              <Link
                href={`/${locale}/terms`}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="w-4 h-4" />
                <span>Terms of Use</span>
              </Link>

              {/* Divider */}
              <div className="border-t border-gray-700 my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

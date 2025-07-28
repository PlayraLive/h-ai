"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Settings, Briefcase, Globe, MessageCircle, FileText } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { databases, DATABASE_ID, Query } from "@/lib/appwrite/database";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarUserAvatarProps {
  locale: string;
}

interface UserProfile {
  avatar_url?: string;
  company_name?: string;
  bio?: string;
}

export default function NavbarUserAvatar({ locale }: NavbarUserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const { user, logout } = useAuthContext();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const profileResponse = await databases.listDocuments(
        DATABASE_ID,
        'user_profiles',
        [Query.equal('user_id', user.$id)]
      );

      if (profileResponse.documents.length > 0) {
        setUserProfile(profileResponse.documents[0] as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = () => {
    // Приоритет: профиль из базы > встроенный аватар > дефолт
    return userProfile?.avatar_url || user.avatar || null;
  };

  const getDisplayName = () => {
    if (userProfile?.company_name) {
      return userProfile.company_name;
    }
    return user.name || user.email;
  };

  const getSubtitle = () => {
    if (userProfile?.company_name && user.name) {
      return user.name; // Показываем имя пользователя под названием компании
    }
    if (user.$id === "mock-user-id") {
      return "Test User";
    }
    return user.userType === 'client' ? 'Клиент' : 'Фрилансер';
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
        {/* Avatar with Loading State */}
        <div className="relative">
          {avatarLoading ? (
            <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          ) : getAvatarUrl() ? (
            <img
              src={getAvatarUrl()}
              alt={getDisplayName()}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/20"
                             onError={(e) => {
                 // Fallback to initials if image fails to load
                 e.currentTarget.style.display = 'none';
                 const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                 if (nextElement) {
                   nextElement.style.display = 'flex';
                 }
               }}
            />
          ) : null}
          
          {/* Fallback initials */}
          <div 
            className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ display: getAvatarUrl() ? 'none' : 'flex' }}
          >
            {getInitials(getDisplayName())}
          </div>
          
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-white truncate max-w-32">
            {getDisplayName()}
          </div>
          <div className="text-xs text-gray-400 truncate max-w-32">
            {getSubtitle()}
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
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
            <div className="py-2">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl()}
                        alt={getDisplayName()}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {getInitials(getDisplayName())}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {getDisplayName()}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    {userProfile?.bio && (
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {userProfile.bio.slice(0, 40)}...
                      </div>
                    )}
                    {user.$id === "mock-user-id" && (
                      <div className="text-xs text-green-400 mt-1">
                        Mock User (Test Mode)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href={`/${locale}/profile`}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </Link>

                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Briefcase className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>

                <Link
                  href={`/${locale}/messages`}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Messages
                </Link>

                <Link
                  href={`/${locale}/settings`}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
              </div>

              {/* Language Switcher */}
              <div className="py-1 border-t border-gray-700">
                <div className="px-4 py-2">
                  <div className="text-xs font-medium text-gray-400 mb-2">Language</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => switchLocale("en")}
                      className={`px-2 py-1 text-xs rounded ${
                        locale === "en"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => switchLocale("ru")}
                      className={`px-2 py-1 text-xs rounded ${
                        locale === "ru"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      RU
                    </button>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="py-1 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

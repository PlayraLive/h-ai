'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  LogOut,
  ChevronDown,
  Plus
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import UserAvatar from '@/components/UserAvatar';
import { NotificationDropdown } from '@/components/NotificationDropdown';

interface UserMenuProps {
  locale: string;
}

export default function UserMenu({ locale }: UserMenuProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuthContext();
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Post Job Button */}
      <Link 
        href={`/${locale}/jobs/create`} 
        className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium text-sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Post Job
      </Link>

      {/* Notifications */}
      <NotificationDropdown userId={user?.$id} />

      {/* User Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-all duration-200 group"
        >
          <UserAvatar
            src={user?.avatar}
            alt={user?.name}
            size="md"
            fallbackText={user?.name}
            className="ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all duration-200"
          />
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors hidden sm:block" />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <UserAvatar
                  src={user?.avatar}
                  alt={user?.name}
                  size="sm"
                  fallbackText={user?.name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Dashboard
              </Link>

              <Link
                href={`/${locale}/profile/${user?.$id || ''}`}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Link>

              <Link
                href={`/${locale}/projects`}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Briefcase className="w-4 h-4 mr-3" />
                My Projects
              </Link>

              <Link
                href={`/${locale}/messages`}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                Messages
              </Link>

              <Link
                href={`/${locale}/settings`}
                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Link>

              {/* Mobile Post Job */}
              <Link
                href={`/${locale}/jobs/create`}
                className="sm:hidden flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Plus className="w-4 h-4 mr-3" />
                Post Job
              </Link>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-700 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

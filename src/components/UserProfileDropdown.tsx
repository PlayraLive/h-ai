'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown, Crown, Star, Briefcase, MessageCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { account } from '@/lib/appwrite';

interface UserProfileDropdownProps {
  className?: string;
}

export default function UserProfileDropdown({ className = '' }: UserProfileDropdownProps) {
  const { user, logout } = useAuthContext();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      logout();
      router.push('/en/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Принудительный logout даже если есть ошибка
      logout();
      router.push('/en/login');
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'View Profile',
      action: () => {
        router.push('/en/profile');
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Settings',
      action: () => {
        router.push('/en/settings');
        setIsOpen(false);
      }
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      action: () => {
        router.push('/en/messages');
        setIsOpen(false);
      }
    },
    {
      icon: Briefcase,
      label: user?.userType === 'freelancer' ? 'My Projects' : 'Posted Jobs',
      action: () => {
        router.push(user?.userType === 'freelancer' ? '/en/projects' : '/en/jobs');
        setIsOpen(false);
      }
    }
  ];

  if (!user) {
    return null;
  }

  // Получить аватар пользователя
  const getAvatarUrl = () => {
    if (user.avatar) {
      return user.avatar;
    }
    // Генерируем аватар на основе имени
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=40`;
  };

  // Получить уровень пользователя
  const getUserLevel = () => {
    // Можно добавить логику для определения уровня
    return user.userType === 'freelancer' ? 'Pro' : 'Premium';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <div className="relative">
          <img
            src={getAvatarUrl()}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          {/* Online indicator */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-gray-400">{getUserLevel()} {user.userType}</p>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <img
                src={getAvatarUrl()}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-white">{user.name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.userType === 'freelancer' 
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {user.userType === 'freelancer' ? (
                      <>
                        <Star className="w-3 h-3 mr-1" />
                        Pro Freelancer
                      </>
                    ) : (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium Client
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-800 py-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

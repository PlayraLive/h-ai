'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  User,
  Globe,
  Zap,
  Briefcase,
  Users,
  LogOut,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/UserAvatar';
import { NotificationDropdown } from '@/components/NotificationDropdown';



export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);


  const pathname = usePathname();
  const locale = 'en';

  const { user, isAuthenticated, logout } = useAuth();



  // Простые переводы
  const t = (key: string) => {
    const translations: any = {
      'home': 'Home',
      'jobs': 'Jobs',
      'freelancers': 'Freelancers',
      'login': 'Login',
      'signup': 'Sign Up'
    };
    return translations[key] || key;
  };

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = () => {
      setShowLangMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    // Redirect to login page
    window.location.href = '/en/login';
  };

  const handleLogout = async () => {
    await logout();
  };



  const navLinks = [
    { href: `/${locale}/jobs`, label: t('jobs'), icon: Briefcase },
    { href: `/${locale}/freelancers`, label: t('freelancers'), icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
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
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300",
                    isActive(link.href)
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Avatar - показываем если залогинен */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <NotificationDropdown userId={user.$id} />

                {/* User Avatar with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <UserAvatar
                      src={user.avatar}
                      alt={user.name || user.email}
                      size="sm"
                      fallbackText={user.name || user.email}
                    />
                    <span className="text-sm text-gray-300 hidden lg:block">
                      {user.name || user.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 glass-card border border-white/10 rounded-lg shadow-lg z-50">
                      <Link
                        href={`/${locale}/dashboard`}
                        className="flex items-center space-x-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href={`/${locale}/settings`}
                        className="flex items-center space-x-2 px-4 py-3 text-sm hover:bg-white/5 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href={`/${locale}/login`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  className="btn-primary"
                >
                  {t('signup')}
                </Link>
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center space-x-1 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm uppercase">{locale}</span>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-32 glass-card border border-white/10 rounded-lg shadow-lg">
                  <button
                    onClick={() => switchLocale('en')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => switchLocale('ru')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors"
                  >
                    Русский
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Post Job Button */}
                <Link href={`/${locale}/jobs/create`} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Link>

                {/* Profile Avatar - Direct link to Dashboard */}
                <Link
                  href={`/${locale}/dashboard`}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-all duration-200 group"
                  title="Go to Dashboard"
                >
                  <UserAvatar
                    src={user?.avatar}
                    alt={user?.name}
                    size="md"
                    fallbackText={user?.name}
                    className="ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all duration-200"
                  />
                  <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    Dashboard
                  </span>
                </Link>
              </>
            ) : (
              <>
                {/* Auth Buttons */}
                <button onClick={handleLogin} className="btn-secondary">
                  {t('login')}
                </button>
                <Link href={`/${locale}/signup`} className="btn-primary">
                  {t('signup')}
                </Link>
              </>
            )}
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
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {isAuthenticated ? (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 px-4">
                <Link
                  href={`/${locale}/jobs/create`}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Plus className="w-5 h-5" />
                  <span>Post Job</span>
                </Link>
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
                <button onClick={handleLogin} className="block w-full btn-secondary text-center">
                  {t('login')}
                </button>
                <Link href={`/${locale}/signup`} className="block w-full btn-primary text-center">
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

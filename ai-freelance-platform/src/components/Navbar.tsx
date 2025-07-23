'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Globe,
  Zap,
  MessageCircle,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Plus,
  BarChart3,
  CreditCard,
  Star,
  Filter,
  Check,
  Trash2,
  Eye,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from '@/components/UserAvatar';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'project',
    title: 'New Project Proposal',
    message: 'John Doe submitted a proposal for your AI Chatbot project with a budget of $2,500',
    time: '2 minutes ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    actionUrl: '/en/projects/123/proposals'
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $500 for AI Image Generator project. Payment has been processed successfully.',
    time: '1 hour ago',
    read: false,
    avatar: null,
    actionUrl: '/en/payments/456'
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Wilson sent you a message about the ML model requirements and timeline.',
    time: '3 hours ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    actionUrl: '/en/messages/789'
  },
  {
    id: '4',
    type: 'review',
    title: 'New Review',
    message: 'You received a 5-star review from Alex Chen for the AI Voice Assistant project.',
    time: '1 day ago',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
    actionUrl: '/en/reviews/101'
  },
  {
    id: '5',
    type: 'system',
    title: 'Account Verified',
    message: 'Your freelancer account has been successfully verified. You can now bid on premium projects.',
    time: '2 days ago',
    read: true,
    avatar: null,
    actionUrl: '/en/profile'
  }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationFilter, setNotificationFilter] = useState('all');
  const pathname = usePathname();
  const locale = 'en';
  const { success, info } = useToast();
  const { user, isAuthenticated, login, logout } = useAuth();

  // Notification functions
  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (notificationFilter === 'all') return true;
    return notification.type === notificationFilter;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project': return <Briefcase className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'message': return <MessageCircle className="w-4 h-4" />;
      case 'review': return <Star className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'project': return 'bg-blue-500';
      case 'payment': return 'bg-green-500';
      case 'message': return 'bg-purple-500';
      case 'review': return 'bg-yellow-500';
      case 'system': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

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
      setShowProfileMenu(false);
      setShowNotifications(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    await login('google');
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/jobs?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navLinks = [
    { href: `/${locale}`, label: t('home'), icon: Zap },
    { href: `/${locale}/jobs`, label: t('jobs'), icon: Briefcase },
    { href: `/${locale}/freelancers`, label: t('freelancers'), icon: Users },
    { href: `/${locale}/messages`, label: 'Messages', icon: MessageCircle },
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
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, freelancers..."
                className="bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 w-64"
              />
            </form>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="p-2 text-gray-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 glass-card border border-white/10 rounded-xl shadow-2xl z-50">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex items-center space-x-2 mt-3">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <div className="flex space-x-1">
                        {['all', 'project', 'payment', 'message', 'review', 'system'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setNotificationFilter(filter)}
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium transition-all duration-200',
                              notificationFilter === filter
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            )}
                          >
                            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No notifications</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-4 hover:bg-white/5 transition-colors border-b border-gray-700/50 group',
                            !notification.read && 'bg-purple-500/5'
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Avatar or Icon */}
                            <div className="flex-shrink-0">
                              {notification.avatar ? (
                                <img
                                  src={notification.avatar}
                                  alt=""
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-white',
                                  getNotificationColor(notification.type)
                                )}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className={cn(
                                    'text-sm font-medium',
                                    notification.read ? 'text-gray-300' : 'text-white'
                                  )}>
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {notification.time}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notification.read && (
                                    <button
                                      onClick={() => markAsRead(notification.id)}
                                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                      title="Mark as read"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Unread indicator */}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full absolute right-4 top-6"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-700">
                    <Link
                      href="/en/notifications"
                      className="block text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
                          <p className="text-gray-400 text-xs mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white text-sm">New proposal on your job posting</p>
                          <p className="text-gray-400 text-xs mt-1">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-700">
                    <Link href={`/${locale}/notifications`} className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

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

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileMenu(!showProfileMenu);
                    }}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-all duration-200 group"
                  >
                    <UserAvatar
                      src={user?.avatar}
                      alt={user?.name}
                      size="md"
                      fallbackText={user?.name}
                      className="ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all duration-200"
                    />
                    <ChevronDown className={cn(
                      'w-4 h-4 text-gray-400 transition-all duration-200',
                      showProfileMenu ? 'rotate-180 text-purple-400' : 'group-hover:text-white'
                    )} />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-64 glass-card border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                      {/* User Info Header */}
                      <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          <UserAvatar
                            src={user?.avatar}
                            alt={user?.name}
                            size="lg"
                            fallbackText={user?.name}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold truncate">{user?.name || 'User'}</div>
                            <div className="text-gray-300 text-sm truncate">{user?.email}</div>
                            <div className="flex items-center space-x-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-400">Online</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="p-3 border-b border-gray-700">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-white font-semibold text-sm">12</div>
                            <div className="text-gray-400 text-xs">Projects</div>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">4.9</div>
                            <div className="text-gray-400 text-xs">Rating</div>
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">$2.5k</div>
                            <div className="text-gray-400 text-xs">Earned</div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href={`/${locale}/dashboard`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="font-medium">Dashboard</span>
                        </Link>

                        <Link
                          href={`/${locale}/profile`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                            <User className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="font-medium">Profile</span>
                        </Link>

                        <Link
                          href={`/${locale}/messages`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                            <MessageCircle className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">Messages</span>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">3</span>
                            </div>
                          </div>
                        </Link>

                        <Link
                          href={`/${locale}/payments`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                            <CreditCard className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="font-medium">Payments</span>
                        </Link>

                        <Link
                          href={`/${locale}/settings`}
                          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200 group"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center group-hover:bg-gray-500/30 transition-colors">
                            <Settings className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="font-medium">Settings</span>
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-700 p-2">
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full rounded-lg group"
                        >
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                            <LogOut className="w-4 h-4 text-red-400" />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Mobile Right Section */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile Notifications */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                }}
                className="p-2 text-purple-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-card border border-white/10 rounded-xl shadow-2xl z-50">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-sm">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Filter Tags */}
                    <div className="flex items-center space-x-2 mt-3">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <div className="flex space-x-1 overflow-x-auto">
                        {['all', 'project', 'payment', 'message'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setNotificationFilter(filter)}
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
                              notificationFilter === filter
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            )}
                          >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-64 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No notifications</p>
                      </div>
                    ) : (
                      filteredNotifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-3 border-b border-gray-800 hover:bg-white/5 transition-colors cursor-pointer group',
                            !notification.read && 'bg-purple-500/5'
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Icon */}
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1',
                              getNotificationColor(notification.type)
                            )}>
                              {getNotificationIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={cn(
                                    'text-sm font-medium',
                                    notification.read ? 'text-gray-300' : 'text-white'
                                  )}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {!notification.read && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification.id);
                                      }}
                                      className="p-1 text-gray-400 hover:text-green-400 transition-colors"
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
                                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Unread indicator */}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full absolute right-3 top-4"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-3 border-t border-gray-700">
                    <Link
                      href="/en/notifications"
                      className="block text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors ml-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-in slide-in-from-top duration-300 bg-gray-900/95 backdrop-blur-lg">
            {/* Search Mobile */}
            <div className="px-4 mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, freelancers..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                />
              </form>
            </div>

            {/* Navigation Links */}
            <div className="px-4 space-y-2 mb-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 w-full p-4 rounded-xl transition-all duration-300 group",
                      isActive(link.href)
                        ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30"
                        : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isActive(link.href) ? "scale-110" : "group-hover:scale-105"
                    )} />
                    <span className="font-medium">{link.label}</span>
                    {isActive(link.href) && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full ml-auto animate-pulse"></div>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile User Section */}
            <div className="px-4 pt-4 border-t border-gray-700">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{user?.name || 'User'}</p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/en/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center space-x-2 p-3 bg-purple-500/20 text-purple-400 rounded-xl transition-colors hover:bg-purple-500/30"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                    <Link
                      href="/en/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center space-x-2 p-3 bg-gray-700/50 text-gray-300 rounded-xl transition-colors hover:bg-gray-600/50"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-red-500/20 text-red-400 rounded-xl transition-colors hover:bg-red-500/30"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl transition-all duration-300 hover:from-purple-600 hover:to-pink-600"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign In</span>
                  </button>
                  <Link
                    href="/en/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center space-x-2 p-3 bg-gray-700/50 text-gray-300 rounded-xl transition-colors hover:bg-gray-600/50 border border-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Up</span>
                  </Link>
                </div>
              )}
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

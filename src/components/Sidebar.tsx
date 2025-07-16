'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Briefcase, 
  MessageCircle, 
  DollarSign, 
  User, 
  Settings, 
  Bell,
  Search,
  Plus,
  Menu,
  X,
  Star,
  FileText,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/en/dashboard',
    icon: Home,
    description: 'Overview and stats'
  },
  {
    name: 'Projects',
    href: '/en/projects',
    icon: Briefcase,
    description: 'Manage your projects'
  },
  {
    name: 'Messages',
    href: '/en/messages',
    icon: MessageCircle,
    description: 'Chat with clients/freelancers',
    badge: true
  },
  {
    name: 'Payments',
    href: '/en/payments',
    icon: DollarSign,
    description: 'Payment history'
  },
  {
    name: 'Reviews',
    href: '/en/reviews',
    icon: Star,
    description: 'Reviews and ratings'
  },
  {
    name: 'Reports',
    href: '/en/reports',
    icon: BarChart3,
    description: 'Analytics and insights'
  },
];

const quickActions = [
  {
    name: 'Post Project',
    href: '/en/projects/create',
    icon: Plus,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'Find Freelancers',
    href: '/en/freelancers',
    icon: Search,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <Link href="/en" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Freelance
            </span>
          </Link>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:block hidden"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => setIsMobileOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-700">
          <Link href="/en/profile" className="flex items-center space-x-3 hover:bg-gray-700 rounded-lg p-2 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.role}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-white font-medium transition-colors',
                  action.color
                )}
              >
                <action.icon className="w-4 h-4" />
                <span className="text-sm">{action.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
                )} />
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="space-y-1">
          <Link
            href="/en/settings"
            className={cn(
              'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith('/en/settings')
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            )}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg lg:hidden"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 lg:hidden',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}

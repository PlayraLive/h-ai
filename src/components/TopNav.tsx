'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Home,
  Briefcase,
  Users,
  CreditCard,
  Star,
  BarChart3,
  Settings
} from 'lucide-react';

interface TopNavProps {
  locale?: string;
}

export default function TopNav({ locale = 'en' }: TopNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & Analytics'
    },
    {
      href: `/${locale}/jobs`,
      label: 'Jobs',
      icon: Briefcase,
      description: 'Browse & Manage Jobs'
    },
    {
      href: `/${locale}/projects`,
      label: 'Projects',
      icon: Settings,
      description: 'Manage Projects'
    },
    {
      href: `/${locale}/freelancers`,
      label: 'Freelancers',
      icon: Users,
      description: 'Find Talent'
    },
    {
      href: `/${locale}/payments`,
      label: 'Payments',
      icon: CreditCard,
      description: 'Billing & Transactions'
    },
    {
      href: `/${locale}/reviews`,
      label: 'Reviews',
      icon: Star,
      description: 'Feedback & Ratings'
    },
    {
      href: `/${locale}/reports`,
      label: 'Reports',
      icon: BarChart3,
      description: 'Analytics & Insights'
    }
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/dashboard`) {
      return pathname === `/${locale}/dashboard`;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="w-full bg-[#1A1A2E]/50 backdrop-blur-sm border-b border-gray-700/50">
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
                    'group relative flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap',
                    'hover:bg-gray-700/30 rounded-t-xl',
                    active
                      ? 'text-purple-400 bg-gray-700/20 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 transition-colors',
                    active ? 'text-purple-400' : 'text-gray-400 group-hover:text-white'
                  )} />
                  <span className="hidden sm:block">{item.label}</span>
                  
                  {/* Tooltip for mobile */}
                  <div className="sm:hidden absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right side - Settings or additional actions */}
          <div className="flex items-center space-x-2">
            <Link
              href={`/${locale}/settings`}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all duration-300"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

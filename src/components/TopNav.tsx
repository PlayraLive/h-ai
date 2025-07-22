"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Home,
  Briefcase,
  Users,
  CreditCard,
  Star,
  BarChart3,
  Settings,
  Bell,
  X,
  Check,
} from "lucide-react";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import React, { useState, useRef, useEffect } from "react";

interface TopNavProps {
  locale?: string;
}

export default function TopNav({ locale = "en" }: TopNavProps) {
  const pathname = usePathname();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Закрытие выпадающего списка при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: "Dashboard",
      icon: Home,
      description: "Overview & Analytics",
    },
    {
      href: `/${locale}/projects`,
      label: "Projects",
      icon: Settings,
      description: "Manage Projects",
    },
    {
      href: `/${locale}/freelancers`,
      label: "Freelancers",
      icon: Users,
      description: "Find Talent",
    },
    {
      href: `/${locale}/payments`,
      label: "Payments",
      icon: CreditCard,
      description: "Billing & Transactions",
    },
    {
      href: `/${locale}/reviews`,
      label: "Reviews",
      icon: Star,
      description: "Feedback & Ratings",
    },
    {
      href: `/${locale}/reports`,
      label: "Reports",
      icon: BarChart3,
      description: "Analytics & Insights",
    },
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
                    "group relative flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap",
                    "hover:bg-gray-700/30 rounded-t-xl",
                    active
                      ? "text-purple-400 bg-gray-700/20 border-b-2 border-purple-500"
                      : "text-gray-400 hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      active
                        ? "text-purple-400"
                        : "text-gray-400 group-hover:text-white",
                    )}
                  />
                  <span className="hidden sm:block">{item.label}</span>

                  {/* Tooltip for mobile */}
                  <div className="sm:hidden absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right side - Notifications and Settings */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell - Custom Implementation */}
            <div className="relative" ref={notificationRef}>
              <div
                className="p-2 text-purple-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300 relative z-10 cursor-pointer flex items-center justify-center"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <Bell className="w-6 h-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold border-2 border-gray-900">
                  3
                </span>
              </div>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      Уведомления
                    </h3>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
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
                          <Bell className="w-4 h-4 text-blue-500" />
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
                            Новый заказ
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Ваш заказ был подтвержден
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
                            Системное уведомление
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Обновление системы успешно установлено
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
                        setIsNotificationOpen(false);
                      }}
                    >
                      Показать все
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Original NotificationDropdown - Hidden */}
            <div className="hidden">
              <NotificationDropdown className="relative" />
            </div>
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

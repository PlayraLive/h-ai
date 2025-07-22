// Компонент выпадающего списка уведомлений
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  Check,
  Clock,
  User,
  MessageSquare,
  DollarSign,
  Star,
  Filter,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  NotificationService,
  Notification as AppNotification,
} from "@/lib/services/notifications";
import { useAuthContext } from "@/contexts/AuthContext";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({
  className = "",
}: NotificationDropdownProps) {
  const { user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<
    "all" | "unread" | "message" | "project" | "payment"
  >("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Загрузка уведомлений
  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userNotifications = await NotificationService.getUserNotifications(
        user.$id,
        20,
      );
      setNotifications(userNotifications);

      const unread = userNotifications.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Подписываемся на real-time уведомления
    const unsubscribe = NotificationService.subscribeToUserNotifications(
      user.$id,
      (newNotification) => {
        console.log("🔔 New notification:", newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Воспроизводим звук уведомления
        try {
          const notificationSound = new Audio("/sounds/notification.mp3");
          notificationSound.volume = 0.5;
          notificationSound
            .play()
            .catch((e) => console.log("Sound play failed:", e));
        } catch (e) {
          console.log("Sound creation failed:", e);
        }

        // Показать браузерное уведомление
        if (
          window.Notification &&
          window.Notification.permission === "granted"
        ) {
          new window.Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/favicon.ico",
          });
        }
      },
      (updatedNotification) => {
        console.log("📝 Updated notification:", updatedNotification);
        setNotifications((prev) =>
          prev.map((n) =>
            n.$id === updatedNotification.$id ? updatedNotification : n,
          ),
        );

        if (updatedNotification.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [user, loadNotifications]);

  useEffect(() => {
    // Закрываем dropdown при клике вне его
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Запрос разрешения на уведомления
  useEffect(() => {
    if (window.Notification && window.Notification.permission === "default") {
      window.Notification.requestPermission();
    }
  }, []);

  // Отметить как прочитанное
  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.$id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Удалить уведомление
  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.$id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await NotificationService.markAllAsRead(user.$id);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Фильтрация уведомлений
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.is_read;
    return notification.type === filter;
  });

  // Обработка клика по уведомлению
  const handleNotificationClick = (notification: AppNotification) => {
    // Отмечаем как прочитанное
    if (!notification.is_read) {
      markAsRead(notification.$id);
    }

    // Переходим по ссылке если есть
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "payment":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "review":
        return <Star className="w-4 h-4 text-yellow-500" />;
      case "project":
        return <User className="w-4 h-4 text-purple-500" />;
      case "system":
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
      });
    } catch {
      return "recently";
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Кнопка уведомлений */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-all rounded-lg hover:bg-purple-500/20 group"
        title="Notifications"
      >
        <Bell
          className={`w-6 h-6 ${unreadCount > 0 ? "text-purple-400" : ""} group-hover:animate-pulse`}
        />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-gray-900 shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-xl z-50">
          {/* Заголовок */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Фильтры */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="message">Messages</option>
                <option value="project">Projects</option>
                <option value="payment">Payments</option>
              </select>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-purple-400 hover:text-purple-300 ml-auto"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.$id}
                  className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                    !notification.is_read
                      ? "bg-purple-500/5 border-l-2 border-l-purple-500"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Иконка */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Контент */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4
                          className={`font-medium text-sm ${
                            !notification.is_read
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.$id);
                              }}
                              className="p-1 text-gray-400 hover:text-green-400"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.$id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 bg-gray-900/50">
              <button
                onClick={() => {
                  window.location.href = "/en/notifications";
                  setIsOpen(false);
                }}
                className="w-full text-center py-1.5 text-sm text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-md font-medium transition-all"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

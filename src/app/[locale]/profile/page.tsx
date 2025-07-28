"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { databases, DATABASE_ID, Query } from "@/lib/appwrite/database";
import Link from "next/link";
import {
  Edit,
  Star,
  MapPin,
  Clock,
  Verified,
  Award,
  Eye,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn, formatCurrency } from "@/lib/utils";

interface UserProfile {
  $id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  interests?: string[];
  specializations?: string[];
  experience_years?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  onboarding_completed?: boolean;
  profile_completion?: number;
  $createdAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Загружаем профиль пользователя
      const profileResponse = await databases.listDocuments(
        DATABASE_ID,
        'user_profiles',
        [Query.equal('user_id', user.$id)]
      );

      if (profileResponse.documents.length > 0) {
        setUserProfile(profileResponse.documents[0] as any);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Необходима авторизация
            </h2>
            <p className="text-gray-400 mb-6">
              Войдите в систему чтобы просмотреть профиль.
            </p>
            <Link href="/login" className="btn-primary">
              Войти
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Данные профиля с fallback на данные пользователя
  const displayProfile = {
    id: user.$id,
    name: user.name || "Пользователь",
    title: userProfile?.specializations?.[0] || "Специалист",
    avatar: userProfile?.avatar_url || "/avatars/default.jpg",
    coverImage: "/covers/profile-cover.jpg",
    rating: 4.5,
    reviewCount: 0,
    hourlyRate: userProfile?.hourly_rate_min || 50,
    completedJobs: 0,
    responseTime: "1 час",
    location: "Удаленная работа",
    verified: user.emailVerification || false,
    online: true,
    memberSince: user.$createdAt,
    totalEarnings: 0,
    successRate: 100,
    languages: ["Русский", "English"],
    description: userProfile?.bio || "Добро пожаловать в мой профиль!",
    skills: userProfile?.specializations?.map(skill => ({
      name: skill,
      level: 85,
      category: "Специализация"
    })) || [],
    portfolio: [],
    reviews: [],
    badges: [],
    stats: {
      totalViews: 0,
      profileViews: 0,
      jobsCompleted: 0,
      clientsSatisfied: 0
    }
  };

  const tabs = [
    { id: "overview", label: "Обзор", icon: Eye },
    { id: "achievements", label: "Достижения", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Info */}
          <div className="relative -mt-20 px-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-6 lg:space-y-0">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white border-4 border-gray-950">
                    {displayProfile.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  {displayProfile.online && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-950"></div>
                  )}
                </div>

                <div className="lg:mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {displayProfile.name}
                    </h1>
                    {displayProfile.verified && (
                      <Verified className="w-6 h-6 text-blue-400" />
                    )}
                  </div>
                  <p className="text-xl text-gray-300 mb-2">
                    {displayProfile.title}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{displayProfile.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Отвечает за {displayProfile.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Link
                  href="/profile/edit"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Редактировать</span>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-xl font-bold text-white">
                    {displayProfile.rating}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  ({displayProfile.reviewCount} отзывов)
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {formatCurrency(displayProfile.hourlyRate)}/час
                </div>
                <div className="text-sm text-gray-400">Почасовая ставка</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {displayProfile.completedJobs}
                </div>
                <div className="text-sm text-gray-400">Выполнено работ</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {displayProfile.successRate}%
                </div>
                <div className="text-sm text-gray-400">Успешность</div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              {displayProfile.badges.map((badge: string, index: number) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-800">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      О себе
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {displayProfile.description}
                    </p>
                  </div>

                  {/* Skills */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Навыки
                    </h3>
                    <div className="space-y-4">
                      {displayProfile.skills.map((skill, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 font-medium">
                              {skill.name}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {skill.level}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Languages */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Языки
                    </h3>
                    <div className="space-y-2">
                      {displayProfile.languages.map((language, index) => (
                        <div key={index} className="text-gray-300">
                          {language}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Участник с
                    </h3>
                    <p className="text-gray-300">
                      {new Date(displayProfile.memberSince).toLocaleDateString(
                        "ru-RU",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  {/* Total Earnings */}
                  <div className="glass-card p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Общий заработок
                    </h3>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(displayProfile.totalEarnings)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Award className="w-6 h-6" />
                  <span>Достижения</span>
                </h2>

                {displayProfile.badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProfile.badges.map((badge: string, index: number) => (
                      <div
                        key={index}
                        className="glass-card rounded-2xl p-6 text-center"
                      >
                        <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {badge}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Получено {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      Пока нет достижений
                    </h3>
                    <p className="text-gray-500">
                      Выполняйте задачи и зарабатывайте бейджи чтобы показать свой прогресс.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

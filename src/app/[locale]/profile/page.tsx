"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
  Camera,
  Plus,
  Briefcase,
  Award,
  TrendingUp,
  MessageCircle,
  Settings,
  Eye,
  Download,
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
  const t = useTranslations("profile");
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
    { id: "overview", label: "Overview", icon: Eye },
    { id: "achievements", label: "Achievements", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="profile-content">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors">
            <Camera className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative -mt-16 pb-8">
              <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6">
                {/* Avatar */}
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
                  <button className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-lg transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
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
                          <span>Responds in {displayProfile.responseTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      <button className="btn-secondary">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </button>
                      <Link
                        href={`/${locale}/profile/edit`}
                        className="btn-primary"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t("edit")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold text-white">
                      {displayProfile.rating}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    ({displayProfile.reviewCount} reviews)
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {formatCurrency(displayProfile.hourlyRate)}/hr
                  </div>
                  <div className="text-sm text-gray-400">Hourly Rate</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {displayProfile.completedJobs}
                  </div>
                  <div className="text-sm text-gray-400">Jobs Completed</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <div className="text-xl font-bold text-white mb-1">
                    {displayProfile.successRate}%
                  </div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-6">
                {displayProfile.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={cn(
                      "text-sm px-3 py-1 rounded-full",
                      badge === "Top Rated" &&
                        "bg-purple-500/20 text-purple-400",
                      badge === "Expert Verified" &&
                        "bg-blue-500/20 text-blue-400",
                      badge === "Rising Talent" &&
                        "bg-green-500/20 text-green-400",
                      badge === "Fast Delivery" &&
                        "bg-orange-500/20 text-orange-400",
                    )}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center space-x-2 py-4 border-b-2 transition-colors",
                      activeTab === tab.id
                        ? "border-purple-500 text-purple-400"
                        : "border-transparent text-gray-400 hover:text-white",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 main-content">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* About */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {displayProfile.description}
                  </p>
                </div>

                {/* Skills */}
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      AI Skills
                    </h3>
                    <button className="text-purple-400 hover:text-purple-300 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {displayProfile.skills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            {skill.name}
                          </span>
                          <span className="text-sm text-gray-400">
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
                    Languages
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
                    Member Since
                  </h3>
                  <p className="text-gray-300">
                    {new Date(displayProfile.memberSince).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                      },
                    )}
                  </p>
                </div>

                {/* Total Earnings */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Total Earnings
                  </h3>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(displayProfile.totalEarnings)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Award className="w-6 h-6" />
                <span>Achievements</span>
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
                        Earned on {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No achievements yet
                  </h3>
                  <p className="text-gray-500">
                    Complete tasks and earn badges to showcase your progress.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-8">
                Profile Settings
              </h2>
              <div className="glass-card p-6 rounded-2xl">
                <p className="text-gray-400">Settings panel coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

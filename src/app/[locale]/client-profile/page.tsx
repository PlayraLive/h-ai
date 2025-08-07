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
  Building2,
  Users,
  Briefcase,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileEditModal from "@/components/ProfileEditModal";
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

export default function ClientProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleProfileUpdated = () => {
    loadUserProfile(); // Перезагружаем профиль после обновления
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

  // Mock data for client profile
  const displayProfile = {
    name: userProfile?.company_name || user?.name || "Компания",
    title: userProfile?.industry || "Отрасль не указана",
    location: "Местоположение не указано",
    responseTime: "24 часа",
    rating: 4.8,
    reviewCount: 12,
    hourlyRate: 0, // Clients don't have hourly rate
    completedJobs: 8,
    successRate: 95,
    online: true,
    verified: true,
    companySize: userProfile?.company_size || "Не указан",
    bio: userProfile?.bio || "Описание компании не указано",
    interests: userProfile?.interests || [],
  };

  const tabs = [
    { id: "overview", label: "Обзор", icon: Eye },
    { id: "company", label: "О компании", icon: Building2 },
    { id: "projects", label: "Проекты", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Info */}
          <div className="relative -mt-20 px-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-6 lg:space-y-0">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col lg:flex-row lg:items-end space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white border-4 border-gray-950">
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
                      <Users className="w-4 h-4" />
                      <span>{displayProfile.companySize}</span>
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
                <button
                  onClick={() => setShowEditModal(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
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
                  {displayProfile.completedJobs}
                </div>
                <div className="text-sm text-gray-400">Завершенных проектов</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {displayProfile.successRate}%
                </div>
                <div className="text-sm text-gray-400">Успешность</div>
              </div>
              <div className="glass-card p-4 rounded-xl text-center">
                <div className="text-xl font-bold text-white mb-1">
                  {displayProfile.interests.length}
                </div>
                <div className="text-sm text-gray-400">Областей работы</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex space-x-1 bg-gray-900 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">О компании</h3>
                <p className="text-gray-300 leading-relaxed">
                  {displayProfile.bio}
                </p>
              </div>

              {displayProfile.interests.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Области работы</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayProfile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "company" && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Информация о компании</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Название</h4>
                  <p className="text-white">{displayProfile.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Размер компании</h4>
                  <p className="text-white">{displayProfile.companySize}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Отрасль</h4>
                  <p className="text-white">{displayProfile.title}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-300 mb-2">Рейтинг</h4>
                  <p className="text-white">{displayProfile.rating}/5</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Проекты</h3>
              <p className="text-gray-300">
                Здесь будут отображаться проекты компании.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      {userProfile && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userProfile={userProfile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
} 
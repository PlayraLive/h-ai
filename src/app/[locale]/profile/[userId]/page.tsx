"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";
import { databases, DATABASE_ID, Query, COLLECTIONS } from "@/lib/appwrite/database";
import Link from "next/link";
import {
  Edit,
  Star,
  MapPin,
  Clock,
  Verified,
  Award,
  Eye,
  DollarSign,
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

export default function UserProfilePage() {
  const params = useParams();
  const locale = params.locale as string;
  const userId = params.userId as string;
  const { user: currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId, currentUser]);

  const loadUserProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Проверяем, является ли это профилем текущего пользователя
      setIsOwnProfile(currentUser?.$id === userId);

      // Сначала пытаемся загрузить профиль из коллекции user_profiles
      let profileResponse = await databases.listDocuments(
        DATABASE_ID,
        'user_profiles',
        [Query.equal('user_id', userId)]
      );

      if (profileResponse.documents.length > 0) {
        setUserProfile(profileResponse.documents[0] as any);
        return;
      }

      // Если профиль не найден в user_profiles, загружаем из коллекции USERS
      try {
        const userResponse = await databases.getDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userId
        );
        
        if (userResponse) {
          // Преобразуем данные пользователя в формат UserProfile
          const userProfileData: UserProfile = {
            $id: userResponse.$id,
            user_id: userResponse.$id,
            avatar_url: userResponse.avatar,
            bio: userResponse.bio,
            company_name: userResponse.name,
            company_size: userResponse.companySize,
            industry: userResponse.industry,
            interests: userResponse.interests,
            specializations: userResponse.skills,
            experience_years: userResponse.experienceYears,
            hourly_rate_min: userResponse.hourlyRate,
            hourly_rate_max: userResponse.hourlyRate,
            onboarding_completed: userResponse.onboardingCompleted,
            profile_completion: userResponse.profileCompletion,
            $createdAt: userResponse.$createdAt,
          };
          
          setUserProfile(userProfileData);
        }
      } catch (userError) {
        console.error('Ошибка загрузки пользователя:', userError);
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-gray-400">Профиль не найден</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-3xl font-bold text-white">
                  {userProfile.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-3xl object-cover"
                    />
                  ) : (
                    "U"
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {userProfile.company_name || "Пользователь"}
                  </h1>
                  <p className="text-white/80 text-lg">
                    {userProfile.specializations?.join(", ") || "Специалист"}
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-2 text-white/80">
                      <MapPin className="w-4 h-4" />
                      <span>Удаленная работа</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white/80">
                      <Clock className="w-4 h-4" />
                      <span>Отвечает за 1 час</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center space-x-2 backdrop-blur-md"
                >
                  <Edit className="w-5 h-5" />
                  <span>Редактировать</span>
                </button>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Star className="w-8 h-8 text-yellow-400 fill-current" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">4.5</div>
              <div className="text-sm text-gray-400">(0 отзывов)</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {userProfile.hourly_rate_min ? `${userProfile.hourly_rate_min} $/час` : "Почасовая ставка"}
              </div>
              <div className="text-sm text-gray-400">Почасовая ставка</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Award className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">0</div>
              <div className="text-sm text-gray-400">Выполнено работ</div>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <Verified className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-gray-400">Успешность</div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8">
            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-800/50 rounded-2xl p-1">
              {[
                { id: "overview", label: "Обзор" },
                { id: "portfolio", label: "Портфолио (0)" },
                { id: "solutions", label: "Решения (3)" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300",
                    activeTab === tab.id
                      ? "bg-purple-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Bio */}
                {userProfile.bio && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">О себе</h3>
                    <p className="text-gray-300 leading-relaxed">{userProfile.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {userProfile.specializations && userProfile.specializations.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Навыки</h3>
                    <div className="flex flex-wrap gap-3">
                      {userProfile.specializations.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {userProfile.experience_years && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Опыт</h3>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="w-5 h-5" />
                      <span>{userProfile.experience_years} лет опыта</span>
                    </div>
                  </div>
                )}

                {/* Industry */}
                {userProfile.industry && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">Отрасль</h3>
                    <p className="text-gray-300">{userProfile.industry}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "portfolio" && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Портфолио пусто</h3>
                <p className="text-gray-400">Здесь будут отображаться ваши выполненные проекты</p>
              </div>
            )}

            {activeTab === "solutions" && (
              <div className="text-center py-12">
                <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Решения</h3>
                <p className="text-gray-400">Здесь будут отображаться ваши решения и продукты</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isOwnProfile && userProfile && (
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

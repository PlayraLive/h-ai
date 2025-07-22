"use client";

import { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Star,
  MessageSquare,
  Settings,
  Folder,
  Sparkles,
  Bot,
  Palette,
  Play,
  Heart,
  Eye,
  Crown,
  Plus,
  Edit3,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Share2,
} from "lucide-react";
import { JobService } from "@/services/jobs";
import ShareButton from "@/components/shared/ShareButton";

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
}

const tabs = [
  { id: "overview", name: "Обзор", icon: User },
  { id: "projects", name: "Мои проекты", icon: Folder },
  { id: "solutions", name: "Решения", icon: Sparkles },
  { id: "jobs", name: "Мои заказы", icon: Briefcase },
  { id: "ai-orders", name: "AI-заказы", icon: Bot },
  { id: "customizations", name: "Кастомизации", icon: Palette },
  { id: "portfolio", name: "Портфолио", icon: Play },
  { id: "reviews", name: "Отзывы", icon: Star },
  { id: "messages", name: "Сообщения", icon: MessageSquare },
  { id: "settings", name: "Настройки", icon: Settings },
];

export default function ProfileTabs({
  userId,
  isOwnProfile,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const visibleTabs = isOwnProfile
    ? tabs
    : tabs.filter(
        (tab) => !["messages", "settings", "ai-orders"].includes(tab.id),
      );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab userId={userId} isOwnProfile={isOwnProfile} />;
      case "projects":
        return <ProjectsTab userId={userId} isOwnProfile={isOwnProfile} />;
      case "solutions":
        return <SolutionsTab userId={userId} isOwnProfile={isOwnProfile} />;
      case "jobs":
        return <JobsTab userId={userId} isOwnProfile={isOwnProfile} />;
      case "ai-orders":
        return <AIOrdersTab userId={userId} />;
      case "customizations":
        return (
          <CustomizationsTab userId={userId} isOwnProfile={isOwnProfile} />
        );
      case "portfolio":
        return <PortfolioTab userId={userId} isOwnProfile={isOwnProfile} />;
      case "reviews":
        return <ReviewsTab userId={userId} isOwnProfile={isOwnProfile} />;
      case "messages":
        return <MessagesTab userId={userId} />;
      case "settings":
        return <SettingsTab userId={userId} />;
      default:
        return <OverviewTab userId={userId} isOwnProfile={isOwnProfile} />;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-700/50 mb-8">
        <div className="flex flex-wrap gap-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-t-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-purple-600/20 text-purple-400 border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTabContent()}</div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <Folder className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-sm text-gray-400">Активных проектов</div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">47</div>
              <div className="text-sm text-gray-400">Решений добавлено</div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-600/20 rounded-xl">
              <Bot className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">23</div>
              <div className="text-sm text-gray-400">AI-заказов</div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-600/20 rounded-xl">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-sm text-gray-400">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Последняя активность
        </h3>
        <div className="space-y-4">
          {[
            {
              action: "Добавил решение",
              item: "AI Website Builder",
              time: "2 часа назад",
              type: "solution",
            },
            {
              action: "Заказал у AI",
              item: "TikTok Content Creator",
              time: "1 день назад",
              type: "ai-order",
            },
            {
              action: "Создал проект",
              item: "E-commerce Platform",
              time: "3 дня назад",
              type: "project",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-xl"
            >
              <div
                className={`p-2 rounded-lg ${
                  activity.type === "solution"
                    ? "bg-purple-600/20"
                    : activity.type === "ai-order"
                      ? "bg-green-600/20"
                      : "bg-blue-600/20"
                }`}
              >
                {activity.type === "solution" ? (
                  <Sparkles className="w-4 h-4 text-purple-400" />
                ) : activity.type === "ai-order" ? (
                  <Bot className="w-4 h-4 text-green-400" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">{activity.action}</div>
                <div className="text-purple-400 text-sm">{activity.item}</div>
              </div>
              <div className="text-gray-400 text-sm">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Projects Tab Component
function ProjectsTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Мои проекты</h3>
        {isOwnProfile && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            <span>Новый проект</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: "E-commerce Platform",
            status: "active",
            solutions: 5,
            progress: 75,
          },
          {
            name: "Mobile App Design",
            status: "completed",
            solutions: 3,
            progress: 100,
          },
          { name: "AI Chatbot", status: "draft", solutions: 2, progress: 25 },
        ].map((project, index) => (
          <div
            key={index}
            className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">
                {project.name}
              </h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === "active"
                    ? "bg-green-600/20 text-green-400"
                    : project.status === "completed"
                      ? "bg-blue-600/20 text-blue-400"
                      : "bg-gray-600/20 text-gray-400"
                }`}
              >
                {project.status === "active"
                  ? "Активный"
                  : project.status === "completed"
                    ? "Завершен"
                    : "Черновик"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Решений добавлено:</span>
                <span className="text-white font-medium">
                  {project.solutions}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Прогресс:</span>
                  <span className="text-white font-medium">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <button className="w-full py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors text-sm font-medium">
                Открыть проект
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Solutions Tab Component
function SolutionsTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Добавленные решения</h3>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm">
            <option>Все категории</option>
            <option>Сайты</option>
            <option>Видео</option>
            <option>Боты</option>
            <option>Дизайн</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "AI Website Builder",
            category: "website",
            views: 1542,
            likes: 89,
            isPremium: true,
          },
          {
            title: "TikTok Creator Bot",
            category: "video",
            views: 2310,
            likes: 134,
            isPremium: false,
          },
          {
            title: "Telegram Assistant",
            category: "bot",
            views: 875,
            likes: 67,
            isPremium: false,
          },
        ].map((solution, index) => (
          <div
            key={index}
            className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative flex items-center justify-center">
              <Play className="w-12 h-12 text-white/70" />
              {solution.isPremium && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>PRO</span>
                </div>
              )}
            </div>

            <div className="p-4">
              <h4 className="text-lg font-semibold text-white mb-2">
                {solution.title}
              </h4>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span className="capitalize">{solution.category}</span>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{solution.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{solution.likes}</span>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium">
                    Редактировать
                  </button>
                  <button className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Orders Tab Component
function JobsTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJobsTab, setActiveJobsTab] = useState("active");
  const jobService = new JobService();

  useEffect(() => {
    loadJobs();
  }, [userId]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const result = await jobService.getJobsByClient(userId);
      if (result.success) {
        setJobs(result.jobs || []);
      }
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getJobsByStatus = (status: string) => {
    switch (status) {
      case "active":
        return jobs.filter(
          (job) => job.status === "active" || job.status === "open",
        );
      case "in_progress":
        return jobs.filter((job) => job.status === "in_progress");
      case "completed":
        return jobs.filter((job) => job.status === "completed");
      case "cancelled":
        return jobs.filter((job) => job.status === "cancelled");
      default:
        return jobs;
    }
  };

  const filteredJobs = getJobsByStatus(activeJobsTab);

  const shareData = {
    url: `${typeof window !== "undefined" ? window.location.origin : ""}/profile/${userId}`,
    title: `Проекты пользователя`,
    description: `Посмотрите на заказы и проекты`,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Мои заказы</h2>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Мои заказы</h2>
        <ShareButton
          data={shareData}
          platforms={["twitter", "linkedin"]}
          size="small"
          showLabels={false}
          className="ml-auto"
        />
      </div>

      {/* Jobs Status Tabs */}
      <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1">
        {[
          {
            id: "active",
            name: "Активные",
            count: getJobsByStatus("active").length,
          },
          {
            id: "in_progress",
            name: "В работе",
            count: getJobsByStatus("in_progress").length,
          },
          {
            id: "completed",
            name: "Завершенные",
            count: getJobsByStatus("completed").length,
          },
          {
            id: "cancelled",
            name: "Отмененные",
            count: getJobsByStatus("cancelled").length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveJobsTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeJobsTab === tab.id
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
          >
            <span>{tab.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeJobsTab === tab.id ? "bg-white/20" : "bg-gray-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {activeJobsTab === "active" && "Нет активных заказов"}
              {activeJobsTab === "in_progress" && "Нет заказов в работе"}
              {activeJobsTab === "completed" && "Нет завершенных заказов"}
              {activeJobsTab === "cancelled" && "Нет отмененных заказов"}
            </p>
            {activeJobsTab === "active" && isOwnProfile && (
              <button className="mt-4 btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Создать новый заказ
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.$id}
                className="glass-card p-6 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
                      {job.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === "active"
                          ? "bg-green-600/20 text-green-400"
                          : job.status === "in_progress"
                            ? "bg-blue-600/20 text-blue-400"
                            : job.status === "completed"
                              ? "bg-purple-600/20 text-purple-400"
                              : "bg-red-600/20 text-red-400"
                      }`}
                    >
                      {job.status === "active" && "Активен"}
                      {job.status === "in_progress" && "В работе"}
                      {job.status === "completed" && "Завершен"}
                      {job.status === "cancelled" && "Отменен"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        ${job.budgetMin} - ${job.budgetMax}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{job.proposals || 0} предложений</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(job.$createdAt).toLocaleDateString("ru")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShareButton
                      data={{
                        url: `${typeof window !== "undefined" ? window.location.origin : ""}/jobs/${job.$id}`,
                        title: `${job.title} - Job Order`,
                        description: `Check out this job opportunity: ${job.title}`,
                      }}
                      platforms={["twitter", "linkedin"]}
                      size="small"
                      showLabels={false}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                    />
                    {isOwnProfile && (
                      <button className="text-gray-400 hover:text-white transition-colors p-1">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AIOrdersTab({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">AI-заказы</h3>

      <div className="space-y-4">
        {[
          {
            id: "1",
            service: "Website Builder Pro",
            status: "completed",
            price: 99,
            date: "2024-01-15",
          },
          {
            id: "2",
            service: "TikTok Content Creator",
            status: "processing",
            price: 49,
            date: "2024-01-14",
          },
          {
            id: "3",
            service: "Logo Design AI",
            status: "pending",
            price: 29,
            date: "2024-01-13",
          },
        ].map((order) => (
          <div
            key={order.id}
            className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-2">
                  {order.service}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Заказ #{order.id}</span>
                  <span>{order.date}</span>
                  <span className="text-white font-medium">${order.price}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "completed"
                      ? "bg-green-600/20 text-green-400"
                      : order.status === "processing"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : "bg-gray-600/20 text-gray-400"
                  }`}
                >
                  {order.status === "completed"
                    ? "Завершен"
                    : order.status === "processing"
                      ? "В обработке"
                      : "Ожидает"}
                </span>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                  Детали
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Customizations Tab Component
function CustomizationsTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Кастомизации</h3>
        {isOwnProfile && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            <span>Новая кастомизация</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            name: "Custom Website Theme",
            original: "AI Website Builder",
            changes: 5,
            status: "active",
          },
          {
            name: "Branded TikTok Template",
            original: "TikTok Creator",
            changes: 3,
            status: "draft",
          },
        ].map((customization, index) => (
          <div
            key={index}
            className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  {customization.name}
                </h4>
                <p className="text-sm text-gray-400">
                  Основано на: {customization.original}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  customization.status === "active"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-gray-600/20 text-gray-400"
                }`}
              >
                {customization.status === "active" ? "Активно" : "Черновик"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Изменений:</span>
                <span className="text-white font-medium">
                  {customization.changes}
                </span>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium">
                  Редактировать
                </button>
                <button className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder components for other tabs
function PortfolioTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  return <div className="text-white">Portfolio content...</div>;
}

function ReviewsTab({
  userId,
  isOwnProfile,
}: {
  userId: string;
  isOwnProfile: boolean;
}) {
  return <div className="text-white">Reviews content...</div>;
}

function MessagesTab({ userId }: { userId: string }) {
  return <div className="text-white">Messages content...</div>;
}

function SettingsTab({ userId }: { userId: string }) {
  return <div className="text-white">Settings content...</div>;
}

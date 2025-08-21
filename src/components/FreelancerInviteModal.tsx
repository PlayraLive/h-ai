'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, Users, Send, Sparkles, Filter, Search, CheckCircle, Award, DollarSign, Calendar, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FreelancerMatchingService, FreelancerProfile, MatchScore } from '@/services/freelancerMatchingService';

// Используем FreelancerProfile из сервиса
type Freelancer = FreelancerProfile;

interface FreelancerInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobSkills: string[];
  jobTitle: string;
  onInvite: (freelancerIds: string[]) => void;
}

export default function FreelancerInviteModal({
  isOpen,
  onClose,
  jobId,
  jobSkills,
  jobTitle,
  onInvite
}: FreelancerInviteModalProps) {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFreelancers, setSelectedFreelancers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minRating: 0,
    maxHourlyRate: 1000,
    verified: false,
    available: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (isOpen) {
      loadRecommendedFreelancers();
    }
  }, [isOpen, jobSkills]);

  const loadRecommendedFreelancers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Загружаем фрилансеров для навыков:', jobSkills);
      
      // Используем AI-сервис для подбора фрилансеров
      const result = await FreelancerMatchingService.findMatchingFreelancers({
        skills: jobSkills,
        // Можно добавить дополнительные критерии из джоба
      }, 20); // Увеличиваем лимит

      console.log('✅ Найдено фрилансеров:', result.freelancers.length);
      console.log('✅ Матчи:', result.matches);

      setFreelancers(result.freelancers);
      setMatches(result.matches);
    } catch (error) {
      console.error('❌ Ошибка загрузки фрилансеров:', error);
      
      // Fallback на моковые данные в случае ошибки
      const mockFreelancers: Freelancer[] = [
        {
          $id: '1',
          name: 'Alex Chen',
          email: 'alex@example.com',
          userType: 'freelancer',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          bio: 'AI/ML Engineer specializing in computer vision and natural language processing.',
          skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP'],
          hourlyRate: 85,
          rating: 4.9,
          reviewsCount: 47,
          completedJobs: 23,
          location: 'San Francisco, CA',
          responseTime: '2 hours',
          verification_status: 'verified',
          availability: 'available'
        },
        {
          $id: '2',
          name: 'Maria Rodriguez',
          email: 'maria@example.com',
          userType: 'freelancer',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          bio: 'Creative AI artist and prompt engineer. I help businesses create stunning AI-generated content.',
          skills: ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Prompt Engineering'],
          hourlyRate: 65,
          rating: 4.8,
          reviewsCount: 32,
          completedJobs: 18,
          location: 'Barcelona, Spain',
          responseTime: '1 hour',
          verification_status: 'verified',
          availability: 'available'
        }
      ];
      
      console.log('🔄 Используем моковые данные:', mockFreelancers.length);
      setFreelancers(mockFreelancers);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFreelancerSelect = (freelancerId: string) => {
    setSelectedFreelancers(prev => 
      prev.includes(freelancerId)
        ? prev.filter(id => id !== freelancerId)
        : [...prev, freelancerId]
    );
  };

  const handleInvite = () => {
    onInvite(selectedFreelancers);
    setSelectedFreelancers([]);
    onClose();
  };

  // Сначала применяем поиск
  let filteredFreelancers = freelancers.filter(freelancer => {
    if (!searchQuery) return true;

    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Затем применяем фильтры
  if (filters.verified) {
    filteredFreelancers = filteredFreelancers.filter(f => f.verification_status === 'verified');
  }
  
  if (filters.available) {
    filteredFreelancers = filteredFreelancers.filter(f => f.availability === 'available');
  }

  if (filters.minRating > 0) {
    filteredFreelancers = filteredFreelancers.filter(f => (f.rating || 0) >= filters.minRating);
  }

  if (filters.maxHourlyRate < 1000) {
    filteredFreelancers = filteredFreelancers.filter(f => (f.hourlyRate || 0) <= filters.maxHourlyRate);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1A1A2E] via-[#1A1A3E] to-[#2A1A3E] rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-t-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center mb-2">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mr-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                Подобрать фрилансеров
              </h2>
              <p className="text-gray-300 text-lg">
                AI-рекомендации для проекта: <span className="text-purple-400 font-semibold">{jobTitle}</span>
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-gray-400">Найдено:</span>
                <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-sm rounded-full font-medium">
                  {filteredFreelancers.length} из {freelancers.length}
                </span>
                <span className="text-sm text-gray-400">Выбрано:</span>
                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-sm rounded-full font-medium">
                  {selectedFreelancers.length}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-700/50 bg-gray-800/20">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени, навыкам или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'grid' 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                )}
              >
                <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'list' 
                    ? "bg-purple-600 text-white" 
                    : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50"
                )}
              >
                <div className="w-5 h-5 flex flex-col gap-0.5">
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-2"
              />
              <span>Только верифицированные</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.available}
                onChange={(e) => setFilters(prev => ({ ...prev, available: e.target.checked }))}
                className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-2"
              />
              <span>Только доступные</span>
            </label>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Мин. рейтинг:</span>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value={0}>Любой</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Макс. ставка:</span>
              <select
                value={filters.maxHourlyRate}
                onChange={(e) => setFilters(prev => ({ ...prev, maxHourlyRate: Number(e.target.value) }))}
                className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value={1000}>Любая</option>
                <option value={50}>$50/час</option>
                <option value={100}>$100/час</option>
                <option value={200}>$200/час</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-2">Подбираем лучших фрилансеров</h3>
                <p className="text-gray-400">AI анализирует навыки и опыт для идеального совпадения</p>
              </div>
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Фрилансеры не найдены</h3>
              <p className="text-gray-400 text-lg mb-6">Попробуйте изменить критерии поиска или фильтры</p>
              <div className="bg-gray-800/30 rounded-2xl p-6 max-w-md mx-auto">
                <h4 className="text-lg font-medium text-white mb-3">Статистика поиска:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Всего в базе:</span>
                    <span className="text-white font-medium">{freelancers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">После фильтров:</span>
                    <span className="text-white font-medium">{filteredFreelancers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Требуемые навыки:</span>
                    <span className="text-white font-medium">{jobSkills.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={cn(
              "gap-4",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                : "space-y-4"
            )}>
              {filteredFreelancers.map((freelancer) => {
                const match = matches.find(m => m.freelancerId === freelancer.$id);
                return (
                  <FreelancerCard
                    key={freelancer.$id}
                    freelancer={freelancer}
                    isSelected={selectedFreelancers.includes(freelancer.$id)}
                    onSelect={() => handleFreelancerSelect(freelancer.$id)}
                    jobSkills={jobSkills}
                    matchScore={match}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700/50 bg-gray-800/20">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Выбрано: <span className="text-white font-semibold">{selectedFreelancers.length}</span> фрилансер{selectedFreelancers.length !== 1 ? 'ов' : ''}
            </div>
            {selectedFreelancers.length > 0 && (
              <button
                onClick={() => setSelectedFreelancers([])}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Очистить выбор
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Отмена
            </button>
            <button
              onClick={handleInvite}
              disabled={selectedFreelancers.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 flex items-center gap-2 hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              <Send className="w-5 h-5" />
              Пригласить ({selectedFreelancers.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FreelancerCardProps {
  freelancer: Freelancer;
  isSelected: boolean;
  onSelect: () => void;
  jobSkills: string[];
  matchScore?: MatchScore;
  viewMode: 'grid' | 'list';
}

function FreelancerCard({ freelancer, isSelected, onSelect, jobSkills, matchScore, viewMode }: FreelancerCardProps) {
  const matchingSkills = freelancer.skills.filter(skill =>
    jobSkills.some(jobSkill =>
      skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  const cardClasses = cn(
    "relative cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
    viewMode === 'grid' 
      ? "p-6 rounded-2xl border-2" 
      : "p-4 rounded-xl border-2",
    isSelected
      ? "border-purple-500 bg-gradient-to-br from-purple-500/10 to-blue-500/10 shadow-lg shadow-purple-500/25"
      : "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-700/50"
  );

  return (
    <div className={cardClasses} onClick={onSelect}>
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Match Score Badge */}
      {matchScore && (
        <div className="absolute -top-2 -left-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
          {Math.round(matchScore.score * 100)}%
        </div>
      )}

      <div className={cn(
        "flex gap-4",
        viewMode === 'grid' ? "flex-col" : "items-start"
      )}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {freelancer.avatar ? (
            <img
              src={freelancer.avatar}
              alt={freelancer.name}
              className={cn(
                "object-cover ring-2 ring-gray-600/50",
                viewMode === 'grid' ? "w-20 h-20 rounded-2xl" : "w-16 h-16 rounded-xl"
              )}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={cn(
              "bg-gradient-to-br from-purple-600 to-blue-600 ring-2 ring-gray-600/50 flex items-center justify-center text-white font-bold",
              viewMode === 'grid' ? "w-20 h-20 rounded-2xl text-2xl" : "w-16 h-16 rounded-xl text-xl",
              freelancer.avatar ? "hidden" : "flex"
            )}
          >
            {freelancer.name.charAt(0).toUpperCase()}
          </div>
          
          {/* Verification Badge */}
          {freelancer.verification_status === 'verified' && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-bold text-white text-lg mb-1 truncate">{freelancer.name}</h4>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                {freelancer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{freelancer.location}</span>
                  </div>
                )}
                {freelancer.responseTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{freelancer.responseTime}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Rating */}
            {freelancer.rating && (
              <div className="flex items-center gap-1 bg-yellow-600/20 px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                <span className="text-white font-medium text-sm">
                  {freelancer.rating.toFixed(1)}
                </span>
                {freelancer.reviewsCount && (
                  <span className="text-gray-400 text-xs">({freelancer.reviewsCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Bio */}
          {freelancer.bio && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{freelancer.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {freelancer.hourlyRate && (
              <div className="text-center p-2 bg-gray-700/30 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                <div className="text-white font-semibold text-sm">${freelancer.hourlyRate}</div>
                <div className="text-gray-400 text-xs">в час</div>
              </div>
            )}
            {freelancer.completedJobs !== undefined && (
              <div className="text-center p-2 bg-gray-700/30 rounded-lg">
                <Award className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <div className="text-white font-semibold text-sm">{freelancer.completedJobs}</div>
                <div className="text-gray-400 text-xs">проектов</div>
              </div>
            )}
            {freelancer.availability && (
              <div className="text-center p-2 bg-gray-700/30 rounded-lg">
                <div className={cn(
                  "w-2 h-2 rounded-full mx-auto mb-1",
                  freelancer.availability === 'available' ? "bg-green-400" : "bg-red-400"
                )}></div>
                <div className="text-white font-semibold text-sm">
                  {freelancer.availability === 'available' ? 'Доступен' : 'Занят'}
                </div>
                <div className="text-gray-400 text-xs">статус</div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 font-medium">Совпадающие навыки:</span>
              <span className="text-xs text-purple-400 font-medium">
                {matchingSkills.length} из {jobSkills.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {matchingSkills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30"
                >
                  {skill}
                </span>
              ))}
              {matchingSkills.length > 4 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-lg">
                  +{matchingSkills.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

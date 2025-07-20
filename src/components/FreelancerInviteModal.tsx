'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, Users, Send, Sparkles, Filter, Search, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      loadRecommendedFreelancers();
    }
  }, [isOpen, jobSkills]);

  const loadRecommendedFreelancers = async () => {
    setLoading(true);
    try {
      // Используем AI-сервис для подбора фрилансеров
      const result = await FreelancerMatchingService.findMatchingFreelancers({
        skills: jobSkills,
        // Можно добавить дополнительные критерии из джоба
      }, 10);

      setFreelancers(result.freelancers);
      setMatches(result.matches);
    } catch (error) {
      console.error('Error loading freelancers:', error);
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
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
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
      setFreelancers(mockFreelancers);
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

  // Затем применяем фильтры через сервис
  filteredFreelancers = FreelancerMatchingService.filterFreelancers(filteredFreelancers, {
    minRating: filters.minRating,
    maxHourlyRate: filters.maxHourlyRate,
    verified: filters.verified,
    available: filters.available
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-purple-400" />
              Подобрать фрилансеров
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              AI-рекомендации для проекта: {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по имени, навыкам или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span>Только верифицированные</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.available}
                  onChange={(e) => setFilters(prev => ({ ...prev, available: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                />
                <span>Только доступные</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <span className="ml-3 text-gray-300">Подбираем лучших фрилансеров...</span>
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Фрилансеры не найдены</h3>
              <p className="text-gray-400">Попробуйте изменить критерии поиска</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Выбрано: {selectedFreelancers.length} фрилансер{selectedFreelancers.length !== 1 ? 'ов' : ''}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleInvite}
              disabled={selectedFreelancers.length === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
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
}

function FreelancerCard({ freelancer, isSelected, onSelect, jobSkills, matchScore }: FreelancerCardProps) {
  const matchingSkills = freelancer.skills.filter(skill =>
    jobSkills.some(jobSkill =>
      skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-purple-500 bg-purple-500/10"
          : "border-gray-700 bg-gray-800 hover:border-gray-600"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        <img
          src={freelancer.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
          alt={freelancer.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-white truncate">{freelancer.name}</h4>
              {freelancer.verification_status === 'verified' && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </div>
            {matchScore && (
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">
                  {Math.round(matchScore.score * 100)}% совпадение
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
            {freelancer.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                <span>{freelancer.rating}</span>
                <span>({freelancer.reviewsCount})</span>
              </div>
            )}
            {freelancer.hourlyRate && (
              <span>${freelancer.hourlyRate}/час</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{freelancer.bio}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {matchingSkills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded"
              >
                {skill}
              </span>
            ))}
            {matchingSkills.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                +{matchingSkills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

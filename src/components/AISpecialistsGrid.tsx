'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Zap, ChevronRight } from 'lucide-react';
import PositiveAICard from '@/components/PositiveAICard';
import { AISpecialist } from '@/types';
import { getAISpecialists } from '@/lib/data/ai-specialists';

interface AISpecialistsGridProps {
  title?: string;
  description?: string;
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

export default function AISpecialistsGrid({
  title = "AI Специалисты",
  description = "Профессиональные AI специалисты готовы помочь с вашими проектами.",
  limit,
  showViewAll = true,
  className = ''
}: AISpecialistsGridProps) {
  const [specialists, setSpecialists] = useState<AISpecialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadSpecialists = async () => {
      try {
        setLoading(true);
        const data = await getAISpecialists();
        const filteredData = limit ? data.slice(0, limit) : data;
        setSpecialists(filteredData);
      } catch (err) {
        console.error('Error loading specialists:', err);
        setError('Failed to load AI specialists');
      } finally {
        setLoading(false);
      }
    };

    loadSpecialists();
  }, [limit]);

  const handleOrder = (specialist: AISpecialist) => {
    router.push(`/en/ai-specialists/${specialist.id}/order?type=task`);
  };

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-3xl h-96 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
        <p className="text-red-400 text-lg">Ошибка загрузки специалистов</p>
      </div>
    );
  }

  if (specialists.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 text-lg">Специалисты скоро появятся</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white">{title}</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {specialists.map((specialist) => (
          <PositiveAICard
            key={specialist.id}
            specialist={specialist}
            onOrder={handleOrder}
          />
        ))}
      </div>

      {/* View All Button */}
      {showViewAll && (
        <div className="text-center mt-8">
          <button 
            onClick={() => router.push('/ai-specialists')}
            className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold text-sm shadow-xl hover:shadow-purple-500/25 hover:scale-105 border border-white/10"
          >
            <Users className="w-4 h-4 mr-2" />
            Все специалисты
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
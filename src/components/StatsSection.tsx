'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Star, 
  DollarSign, 
  Zap, 
  Globe, 
  Video, 
  Bot,
  Palette,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

const stats = [
  {
    id: 'users',
    label: 'Активных пользователей',
    value: 25000,
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
    suffix: '+'
  },
  {
    id: 'solutions',
    label: 'AI-решений создано',
    value: 150000,
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-600/20',
    suffix: '+'
  },
  {
    id: 'projects',
    label: 'Проектов завершено',
    value: 45000,
    icon: CheckCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-600/20',
    suffix: '+'
  },
  {
    id: 'revenue',
    label: 'Общий оборот',
    value: 2500000,
    icon: DollarSign,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600/20',
    prefix: '$',
    suffix: '+'
  }
];

const categoryStats = [
  {
    category: 'Сайты',
    icon: Globe,
    count: 45000,
    growth: '+23%',
    color: 'text-blue-400'
  },
  {
    category: 'Видео',
    icon: Video,
    count: 32000,
    growth: '+45%',
    color: 'text-red-400'
  },
  {
    category: 'Боты',
    icon: Bot,
    count: 28000,
    growth: '+67%',
    color: 'text-green-400'
  },
  {
    category: 'Дизайн',
    icon: Palette,
    count: 35000,
    growth: '+34%',
    color: 'text-pink-400'
  }
];

export default function StatsSection() {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      stats.forEach((stat) => {
        animateValue(stat.id, 0, stat.value, 2000);
      });
    }
  }, [isVisible]);

  const animateValue = (id: string, start: number, end: number, duration: number) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      
      setAnimatedValues(prev => ({ ...prev, [id]: current }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <section id="stats-section" className="py-20 bg-gradient-to-b from-gray-950 to-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Платформа в цифрах
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Присоединяйтесь к тысячам пользователей, которые уже создают будущее с помощью AI
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const animatedValue = animatedValues[stat.id] || 0;
            
            return (
              <div
                key={stat.id}
                className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-2xl mb-6`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-white">
                    {stat.prefix}{formatNumber(animatedValue)}{stat.suffix}
                  </div>
                  <div className="text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Stats */}
        <div className="bg-[#1A1A2E]/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Популярные категории
            </h3>
            <p className="text-gray-400">
              Самые востребованные AI-решения на платформе
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryStats.map((category, index) => {
              const Icon = category.icon;
              
              return (
                <div
                  key={index}
                  className="bg-gray-800/30 border border-gray-700/30 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-4">
                    <Icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white">
                      {category.category}
                    </h4>
                    <div className="text-2xl font-bold text-white">
                      {formatNumber(category.count)}
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm font-medium">
                        {category.growth}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-600/20 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              &lt; 5 мин
            </div>
            <div className="text-gray-400">
              Среднее время создания AI-решения
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600/10 to-blue-600/10 border border-green-600/20 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              4.9/5
            </div>
            <div className="text-gray-400">
              Средняя оценка качества
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              98%
            </div>
            <div className="text-gray-400">
              Успешность выполнения заказов
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 border border-purple-600/30 rounded-3xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Готовы присоединиться?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Начните создавать AI-решения уже сегодня и станьте частью революции в цифровом творчестве
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl">
                Начать бесплатно
              </button>
              <button className="px-8 py-4 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-2xl transition-colors border border-gray-600/50">
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

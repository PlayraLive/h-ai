'use client';

import Link from 'next/link';
import { 
  Sparkles, 
  Briefcase, 
  Play, 
  Package,
  Bot,
  ArrowRight,
  Zap
} from 'lucide-react';

interface NavigationButtonsProps {
  locale?: string;
}

export default function NavigationButtons({ locale = 'en' }: NavigationButtonsProps) {
  const buttons = [
    {
      href: `/${locale}/solutions`,
      label: 'AI Solutions',
      description: 'Browse AI-powered solutions',
      icon: Sparkles,
      gradient: 'from-purple-600 to-blue-600',
      hoverGradient: 'from-purple-700 to-blue-700'
    },
    {
      href: `/${locale}/jobs`,
      label: 'Jobs',
      description: 'Find freelance opportunities',
      icon: Briefcase,
      gradient: 'from-blue-600 to-cyan-600',
      hoverGradient: 'from-blue-700 to-cyan-700'
    },
    {
      href: `/${locale}/packages`,
      label: 'Packages',
      description: 'Ready-made solution packages',
      icon: Package,
      gradient: 'from-green-600 to-teal-600',
      hoverGradient: 'from-green-700 to-teal-700'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buttons.map((button) => {
          const Icon = button.icon;
          return (
            <Link
              key={button.href}
              href={button.href}
              className="group relative overflow-hidden"
            >
              <div className={`
                relative p-8 rounded-2xl border border-gray-700/50 
                bg-gradient-to-br ${button.gradient} 
                hover:${button.hoverGradient}
                transition-all duration-300 
                hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25
                backdrop-blur-sm
              `}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 border border-white/20 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border border-white/20 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 group-hover:bg-white/30 transition-all duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                    {button.label}
                  </h3>
                  
                  <p className="text-white/80 text-sm mb-6 leading-relaxed">
                    {button.description}
                  </p>

                  <div className="inline-flex items-center space-x-2 text-white font-medium group-hover:translate-x-1 transition-transform duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI Service CTA */}
      <div className="mt-8 text-center">
        <Link
          href={`/${locale}/ai-service`}
          className="group inline-flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white rounded-2xl transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-orange-500/25 hover:scale-105 border border-white/10"
        >
          <Bot className="w-6 h-6" />
          <span>Try AI Service</span>
          <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-white/10 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-2xl" />
        </Link>
      </div>
    </div>
  );
}

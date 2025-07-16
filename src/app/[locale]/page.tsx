import Link from 'next/link';
import {
  Palette,
  Code,
  Video,
  Gamepad2,
  ArrowRight,
  Star,
  Users,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Простые переводы без next-intl для демо
  const t = (key: string) => {
    const translations: any = {
      'hero.title': 'Find the best AI freelancers',
      'hero.subtitle': 'Get your projects done by verified AI specialists',
      'hero.cta': 'Get Started',
      'hero.browse': 'Browse Jobs',
      'categories.title': 'AI Services',
      'categories.design': 'AI Design',
      'categories.code': 'AI Development',
      'categories.video': 'AI Video',
      'categories.games': 'AI Games'
    };
    return translations[key] || key;
  };

  const categories = [
    {
      icon: Palette,
      title: t('categories.design'),
      description: 'AI-powered design services',
      color: 'from-pink-500 to-rose-500',
      jobs: 234
    },
    {
      icon: Code,
      title: t('categories.code'),
      description: 'AI development & automation',
      color: 'from-blue-500 to-cyan-500',
      jobs: 189
    },
    {
      icon: Video,
      title: t('categories.video'),
      description: 'AI video editing & creation',
      color: 'from-purple-500 to-violet-500',
      jobs: 156
    },
    {
      icon: Gamepad2,
      title: t('categories.games'),
      description: 'AI game development',
      color: 'from-green-500 to-emerald-500',
      jobs: 98
    }
  ];

  const stats = [
    { label: 'Active Freelancers', value: '2,500+', icon: Users },
    { label: 'Projects Completed', value: '15,000+', icon: Briefcase },
    { label: 'Success Rate', value: '98%', icon: TrendingUp },
    { label: 'Average Rating', value: '4.9', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                {t('hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/signup`} className="btn-primary text-lg px-8 py-4 group">
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={`/${locale}/jobs`} className="btn-secondary text-lg px-8 py-4 group">
                {t('hero.browse')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="glass-card p-6 rounded-2xl">
                    <Icon className="w-8 h-8 mx-auto mb-4 text-purple-400" />
                    <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('categories.title')}</h2>
            <p className="text-xl text-gray-400">Explore AI-powered services across different domains</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  href={`/${locale}/jobs?category=${category.title.toLowerCase().replace(' ', '_')}`}
                  className="group glass-card p-8 rounded-2xl hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
                        {category.jobs} jobs available
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 rounded-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to start your AI project?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of satisfied clients and freelancers on our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/${locale}/jobs/create`} className="btn-primary text-lg px-8 py-4">
                Post a Job
              </Link>
              <Link href={`/${locale}/freelancers`} className="btn-secondary text-lg px-8 py-4">
                Find Freelancers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

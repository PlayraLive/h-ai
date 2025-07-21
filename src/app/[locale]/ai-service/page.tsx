'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import { 
  Bot, 
  Zap, 
  Clock, 
  CheckCircle, 
  Star,
  DollarSign,
  Sparkles,
  ArrowRight,
  Crown,
  Globe,
  Video,
  Palette,
  MessageSquare,
  Shield,
  Rocket
} from 'lucide-react';

const aiServices = [
  {
    id: 'website',
    name: 'AI Website Builder',
    description: 'Create professional websites with AI',
    icon: Globe,
    price: 99,
    originalPrice: 299,
    deliveryTime: 'Instant',
    features: [
      'Responsive design',
      'SEO optimization',
      'CMS integration',
      '1 year hosting',
      'SSL certificate',
      '30 days support'
    ],
    popular: true
  },
  {
    id: 'video',
    name: 'TikTok Content Creator',
    description: 'Automatic viral content creation',
    icon: Video,
    price: 49,
    originalPrice: 199,
    deliveryTime: '5 minutes',
    features: [
      '10 videos per month',
      'Auto subtitles',
      'Trends analysis',
      'Post scheduler',
      'Views analytics'
    ],
    popular: false
  },
  {
    id: 'design',
    name: 'Logo & Brand AI',
    description: 'Logo and branding creation',
    icon: Palette,
    price: 29,
    originalPrice: 149,
    deliveryTime: '2 minutes',
    features: [
      'Vector logo',
      'Color palette',
      'Typography',
      'Business cards',
      'Brand identity'
    ],
    popular: false
  },
  {
    id: 'bot',
    name: 'Telegram Bot Assistant',
    description: 'Smart bot for business automation',
    icon: MessageSquare,
    price: 79,
    originalPrice: 249,
    deliveryTime: '10 minutes',
    features: [
      'Order processing',
      'Customer support',
      'CRM integration',
      'Analytics',
      'Auto-responder'
    ],
    popular: true
  }
];

const subscriptionPlans = [
  {
    name: 'Starter',
    price: 29,
    period: 'месяц',
    features: [
      '5 AI-заказов в месяц',
      'Базовые шаблоны',
      'Email поддержка',
      'Стандартное качество'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: 79,
    period: 'месяц', 
    features: [
      '20 AI-заказов в месяц',
      'Премиум шаблоны',
      'Приоритетная поддержка',
      'HD качество',
      'Кастомизация',
      'API доступ'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'месяц',
    features: [
      'Безлимитные AI-заказы',
      'Все шаблоны',
      '24/7 поддержка',
      '4K качество',
      'Полная кастомизация',
      'Белый лейбл',
      'Персональный менеджер'
    ],
    popular: false
  }
];

export default function AIServicePage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'single' | 'subscription'>('single');

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <TopNav />
      
      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl">
                <Bot className="w-12 h-12 text-purple-400" />
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                <Sparkles className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
                AI-Сервис
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Получайте готовые решения мгновенно с помощью нашего AI-сервиса. 
              Никаких ожиданий, только результат!
            </p>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Мгновенная доставка</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Гарантия качества</span>
              </div>
              <div className="flex items-center space-x-2">
                <Rocket className="w-4 h-4 text-purple-400" />
                <span>AI последнего поколения</span>
              </div>
            </div>
          </div>

          {/* Order Type Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-2">
              <button
                onClick={() => setOrderType('single')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  orderType === 'single'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Разовые заказы
              </button>
              <button
                onClick={() => setOrderType('subscription')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                  orderType === 'subscription'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Подписка
              </button>
            </div>
          </div>

          {/* Single Orders */}
          {orderType === 'single' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Выберите AI-решение
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {aiServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.id}
                      className={`relative bg-[#1A1A2E]/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                        selectedService === service.id
                          ? 'border-purple-500 shadow-2xl shadow-purple-500/20 scale-105'
                          : 'border-gray-700/50 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      {/* Popular Badge */}
                      {service.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>ПОПУЛЯРНО</span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl">
                          <Icon className="w-8 h-8 text-purple-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-3xl font-bold text-white">${service.price}</span>
                            <span className="text-lg text-gray-400 line-through">${service.originalPrice}</span>
                          </div>
                          <div className="flex items-center justify-center space-x-1 text-sm text-green-400">
                            <Clock className="w-4 h-4" />
                            <span>{service.deliveryTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 mb-6">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                        {service.features.length > 3 && (
                          <div className="text-purple-400 text-sm text-center">
                            +{service.features.length - 3} функций
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        className={`w-full py-3 rounded-xl transition-all duration-300 font-medium ${
                          selectedService === service.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                        }`}
                      >
                        {selectedService === service.id ? 'Выбрано' : 'Выбрать'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Order Button */}
              {selectedService && (
                <div className="text-center">
                  <button className="inline-flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-purple-500/25 hover:scale-105">
                    <Bot className="w-6 h-6" />
                    <span>Заказать у AI</span>
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subscription Plans */}
          {orderType === 'subscription' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Выберите план подписки
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative bg-[#1A1A2E]/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 ${
                      plan.popular
                        ? 'border-purple-500 shadow-2xl shadow-purple-500/20 scale-105'
                        : 'border-gray-700/50 hover:border-purple-500/50'
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        РЕКОМЕНДУЕМ
                      </div>
                    )}

                    {/* Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-center space-x-1">
                          <span className="text-4xl font-bold text-white">${plan.price}</span>
                          <span className="text-gray-400">/{plan.period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      className={`w-full py-4 rounded-xl transition-all duration-300 font-bold ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                          : 'bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50'
                      }`}
                    >
                      {plan.popular ? 'Начать сейчас' : 'Выбрать план'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Все планы включают 7-дневный бесплатный пробный период
                </p>
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="mt-16 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-pink-900/20 rounded-3xl p-8 border border-gray-700/30">
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Почему выбирают наш AI-сервис?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="p-4 bg-purple-600/20 rounded-2xl w-fit mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Мгновенный результат</h4>
                <p className="text-gray-400 text-sm">Получайте готовые решения за секунды, а не дни</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-blue-600/20 rounded-2xl w-fit mx-auto mb-4">
                  <Star className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Высокое качество</h4>
                <p className="text-gray-400 text-sm">AI обучен на лучших примерах и трендах</p>
              </div>
              
              <div className="text-center">
                <div className="p-4 bg-pink-600/20 rounded-2xl w-fit mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-pink-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Доступные цены</h4>
                <p className="text-gray-400 text-sm">В 3-5 раз дешевле работы с фрилансерами</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

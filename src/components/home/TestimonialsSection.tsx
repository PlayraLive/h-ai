// Интерактивная секция отзывов с каруселью
'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Users, Briefcase, TrendingUp } from 'lucide-react';

interface TestimonialsSectionProps {
  locale: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  project: string;
  category: 'client' | 'freelancer';
}

export function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [filter, setFilter] = useState<'all' | 'client' | 'freelancer'>('all');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Marketing Director',
      company: 'TechCorp Inc.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: 'The AI freelancer I hired created an amazing chatbot for our customer service. The quality exceeded my expectations and the project was delivered on time.',
      project: 'AI Chatbot Development',
      category: 'client'
    },
    {
      id: '2',
      name: 'Alex Chen',
      role: 'AI Developer',
      company: 'Freelancer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: 'This platform helped me find consistent high-quality projects. The payment system is reliable and the clients are professional.',
      project: 'Machine Learning Models',
      category: 'freelancer'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Startup Founder',
      company: 'InnovateLab',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: 'Found the perfect AI designer who created our entire brand identity using AI tools. The creativity and speed were incredible!',
      project: 'AI Brand Design',
      category: 'client'
    },
    {
      id: '4',
      name: 'Michael Park',
      role: 'AI Consultant',
      company: 'Freelancer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: 'The platform\'s escrow system gives me confidence in every project. I\'ve built long-term relationships with amazing clients here.',
      project: 'AI Strategy Consulting',
      category: 'freelancer'
    },
    {
      id: '5',
      name: 'Lisa Wang',
      role: 'Product Manager',
      company: 'Digital Solutions',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: 'The AI video editor I hired transformed our marketing content. The turnaround time was amazing and the quality was professional-grade.',
      project: 'AI Video Production',
      category: 'client'
    }
  ];

  const filteredTestimonials = testimonials.filter(t => 
    filter === 'all' || t.category === filter
  );

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => 
        (prev + 1) % filteredTestimonials.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [filteredTestimonials.length, isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => 
      (prev + 1) % filteredTestimonials.length
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => 
      prev === 0 ? filteredTestimonials.length - 1 : prev - 1
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  const currentTestimonialData = filteredTestimonials[currentTestimonial];

  const stats = [
    { icon: Users, label: 'Happy Clients', value: '10,000+', color: 'text-blue-500' },
    { icon: Briefcase, label: 'Projects Completed', value: '50,000+', color: 'text-green-500' },
    { icon: Star, label: 'Average Rating', value: '4.9/5', color: 'text-yellow-500' },
    { icon: TrendingUp, label: 'Success Rate', value: '98%', color: 'text-purple-500' }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Community Says
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of satisfied clients and freelancers
          </p>

          {/* Filter buttons */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'client', label: 'Clients' },
              { key: 'freelancer', label: 'Freelancers' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key as any);
                  setCurrentTestimonial(0);
                }}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  filter === key
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div
            className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 relative overflow-hidden border border-gray-700"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Quote icon */}
            <Quote className="absolute top-6 left-6 w-12 h-12 text-purple-500/30" />
            
            {currentTestimonialData && (
              <div className="relative z-10">
                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < currentTestimonialData.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Testimonial text */}
                <blockquote className="text-xl md:text-2xl text-white text-center mb-8 leading-relaxed">
                  "{currentTestimonialData.text}"
                </blockquote>

                {/* Author info */}
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={currentTestimonialData.avatar}
                    alt={currentTestimonialData.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-center">
                    <div className="font-semibold text-white">
                      {currentTestimonialData.name}
                    </div>
                    <div className="text-gray-300">
                      {currentTestimonialData.role}
                    </div>
                    <div className="text-sm text-purple-400">
                      {currentTestimonialData.company}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Project: {currentTestimonialData.project}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {filteredTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial
                    ? 'bg-purple-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="group text-center transform hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon Container with enhanced gradients */}
                <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${
                  stat.color === 'text-blue-500' 
                    ? 'from-blue-500 via-blue-600 to-cyan-500' 
                    : stat.color === 'text-green-500'
                    ? 'from-green-500 via-emerald-500 to-teal-500'
                    : stat.color === 'text-yellow-500' 
                    ? 'from-yellow-400 via-orange-500 to-red-500'
                    : 'from-purple-500 via-pink-500 to-purple-600'
                } flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 relative overflow-hidden`}>
                  
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Rotating border effect */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
                  
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10 drop-shadow-lg" />
                </div>

                {/* Value with enhanced typography */}
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
                  <span className={`bg-gradient-to-r ${
                    stat.color === 'text-blue-500' 
                      ? 'from-blue-400 to-cyan-400' 
                      : stat.color === 'text-green-500'
                      ? 'from-green-400 to-emerald-400'
                      : stat.color === 'text-yellow-500' 
                      ? 'from-yellow-400 to-orange-400'
                      : 'from-purple-400 to-pink-400'
                  } bg-clip-text text-transparent drop-shadow-sm`}>
                    {stat.value}
                  </span>
                </div>

                {/* Label with better styling */}
                <div className="text-gray-300 font-medium text-sm md:text-base leading-tight px-2">
                  {stat.label}
                </div>

                {/* Subtle hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-700 ${
                  stat.color === 'text-blue-500' 
                    ? 'bg-blue-500' 
                    : stat.color === 'text-green-500'
                    ? 'bg-green-500'
                    : stat.color === 'text-yellow-500' 
                    ? 'bg-yellow-500'
                    : 'bg-purple-500'
                } -z-10`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

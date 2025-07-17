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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Community Says
          </h2>
          <p className="text-xl text-gray-600 mb-8">
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
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 md:p-12 relative overflow-hidden"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Quote icon */}
            <Quote className="absolute top-6 left-6 w-12 h-12 text-purple-200" />
            
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
                <blockquote className="text-xl md:text-2xl text-gray-800 text-center mb-8 leading-relaxed">
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
                    <div className="font-semibold text-gray-900">
                      {currentTestimonialData.name}
                    </div>
                    <div className="text-gray-600">
                      {currentTestimonialData.role}
                    </div>
                    <div className="text-sm text-purple-600">
                      {currentTestimonialData.company}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

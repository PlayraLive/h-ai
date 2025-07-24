'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { 
  ArrowLeft, 
  Clock, 
  Star, 
  CheckCircle, 
  DollarSign,
  CreditCard,
  Calendar,
  FileText,
  Upload,
  Zap,
  Crown,
  Users,
  MessageCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { getSpecialistById } from '@/lib/data/ai-specialists';
import { AISpecialist } from '@/types';
import { useAuthContext } from '@/contexts/AuthContext';
import AISpecialistChat from '@/components/messaging/AISpecialistChat';
import { AIBriefData } from '@/services/messaging';

interface OrderPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function AISpecialistOrderPage({ params }: OrderPageProps) {
  const { locale, id } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, initializing } = useAuthContext();
  
  const [specialist, setSpecialist] = useState<AISpecialist | null>(null);
  const [orderType, setOrderType] = useState<'monthly' | 'task'>('task');
  const [currentStep, setCurrentStep] = useState<'select' | 'brief' | 'ai_chat' | 'payment' | 'confirmation'>('select');
  const [showAIChat, setShowAIChat] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<AIBriefData | null>(null);
  
  // Form state
  const [briefData, setBriefData] = useState({
    title: '',
    description: '',
    requirements: '',
    deadline: '',
    attachments: [] as string[]
  });

  useEffect(() => {
    const loadSpecialist = async () => {
      const foundSpecialist = await getSpecialistById(id);
      if (!foundSpecialist) {
        router.push(`/${locale}/404`);
        return;
      }
      setSpecialist(foundSpecialist);

      // Get order type from URL params
      const type = searchParams.get('type') as 'monthly' | 'task';
      if (type) {
        setOrderType(type);
      }
    };

    loadSpecialist();
  }, [id, router, locale, searchParams]);

  useEffect(() => {
    // Redirect to login if not authenticated (but only after initialization is complete)
    if (!isLoading && !initializing && !isAuthenticated) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [isAuthenticated, isLoading, initializing, router, locale]);

  if (!specialist || isLoading || initializing || (initializing === false && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">
            {!specialist ? 'Loading specialist...' : 
             isLoading || initializing ? 'Checking authentication...' : 
             'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (currentStep === 'select') {
      router.back();
    } else {
      // Go back to previous step
      const steps = ['select', 'brief', 'ai_chat', 'payment', 'confirmation'] as const;
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex > 0) {
        setCurrentStep(steps[currentIndex - 1]);
      }
    }
  };

  const handleNext = () => {
    if (currentStep === 'select') {
      setShowAIChat(true);
      setCurrentStep('ai_chat');
    } else {
      const steps = ['select', 'brief', 'ai_chat', 'payment', 'confirmation'] as const;
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const handleBriefGenerated = (brief: AIBriefData) => {
    setGeneratedBrief(brief);
  };

  const handleContinueOrder = () => {
    setCurrentStep('brief');
  };

  const handleOrder = async () => {
    // TODO: Implement order creation
    console.log('Creating order:', {
      specialistId: specialist.id,
      orderType,
      briefData,
      clientId: user?.$id
    });
    
    // For now, just show confirmation
    setCurrentStep('confirmation');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className="space-y-8">
            {/* Specialist Info */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Image
                    src={specialist.avatar}
                    alt={specialist.name}
                    width={80}
                    height={80}
                    className="rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${specialist.name}`;
                    }}
                  />
                  {specialist.isFeatured && (
                    <div className="absolute -top-2 -right-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{specialist.name}</h2>
                  <p className="text-purple-400 font-medium">{specialist.title}</p>
                  <p className="text-gray-400 mt-2">{specialist.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">{specialist.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">{specialist.completedTasks} tasks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{specialist.responseTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Choose Your Plan</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Option */}
                <div 
                  className={`relative bg-gray-800/50 rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                    orderType === 'task' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-700/30 hover:border-gray-600/50'
                  }`}
                  onClick={() => setOrderType('task')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white">Single Task</h4>
                      <p className="text-gray-400 text-sm mt-1">Perfect for one-time projects</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${specialist.taskPrice}</div>
                      <div className="text-gray-400 text-sm">per task</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Delivery: {specialist.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>1 revision included</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Direct chat support</span>
                    </div>
                  </div>
                  
                  {orderType === 'task' && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly Option */}
                <div 
                  className={`relative bg-gray-800/50 rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                    orderType === 'monthly' 
                      ? 'border-purple-500 bg-purple-500/10' 
                      : 'border-gray-700/30 hover:border-gray-600/50'
                  }`}
                  onClick={() => setOrderType('monthly')}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white">Monthly Subscription</h4>
                      <p className="text-gray-400 text-sm mt-1">Unlimited tasks per month</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">${specialist.monthlyPrice}</div>
                      <div className="text-gray-400 text-sm">per month</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Unlimited tasks</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Priority support</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Unlimited revisions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>50% faster delivery</span>
                    </div>
                  </div>
                  
                  {orderType === 'monthly' && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Поговорить с AI специалистом</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        );

      case 'ai_chat':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Обсуждение проекта</h3>
              <p className="text-gray-400">Поговорите с {specialist.name} о ваших требованиях</p>
            </div>

            <AISpecialistChat
              specialist={specialist}
              onBriefGenerated={handleBriefGenerated}
              onContinueOrder={handleContinueOrder}
              className="mx-auto"
            />

            {generatedBrief && (
              <div className="text-center">
                <p className="text-green-400 mb-4">✅ Техническое задание готово!</p>
                <button
                  onClick={handleContinueOrder}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Продолжить к оформлению заказа
                </button>
              </div>
            )}
          </div>
        );

      case 'brief':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Project Brief</h3>
              <p className="text-gray-400">Tell {specialist.name} about your project</p>
            </div>

            <div className="space-y-4">
              {/* Project Title */}
              <div>
                <label className="block text-white font-medium mb-2">Project Title</label>
                <input
                  type="text"
                  value={briefData.title}
                  onChange={(e) => setBriefData({...briefData, title: e.target.value})}
                  placeholder="e.g., Create a logo for my startup"
                  className="w-full bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-white font-medium mb-2">Project Description</label>
                <textarea
                  value={briefData.description}
                  onChange={(e) => setBriefData({...briefData, description: e.target.value})}
                  placeholder="Describe your project in detail..."
                  rows={6}
                  className="w-full bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-white font-medium mb-2">Specific Requirements</label>
                <textarea
                  value={briefData.requirements}
                  onChange={(e) => setBriefData({...briefData, requirements: e.target.value})}
                  placeholder="Any specific requirements, style preferences, etc..."
                  rows={4}
                  className="w-full bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-white font-medium mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={briefData.deadline}
                  onChange={(e) => setBriefData({...briefData, deadline: e.target.value})}
                  className="w-full bg-gray-800/50 border border-gray-700/30 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-white font-medium mb-2">Attachments (Optional)</label>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Click to upload files or drag and drop</p>
                  <p className="text-gray-500 text-sm mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!briefData.title || !briefData.description}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Continue to Payment</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Payment</h3>
              <p className="text-gray-400">Secure payment powered by Stripe</p>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30">
              <h4 className="text-lg font-bold text-white mb-4">Order Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>{specialist.name} - {orderType === 'monthly' ? 'Monthly Subscription' : 'Single Task'}</span>
                  <span>${orderType === 'monthly' ? specialist.monthlyPrice : specialist.taskPrice}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Platform fee (10%)</span>
                  <span>${((orderType === 'monthly' ? specialist.monthlyPrice : specialist.taskPrice) * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>${((orderType === 'monthly' ? specialist.monthlyPrice : specialist.taskPrice) * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <h4 className="text-lg font-bold text-white">Payment Method</h4>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-gray-900 border border-gray-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-gray-900 border border-gray-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full bg-gray-900 border border-gray-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-gray-900 border border-gray-700/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleOrder}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Complete Payment</span>
            </button>
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
              <p className="text-gray-400">Your order has been submitted to {specialist.name}</p>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/30">
              <h4 className="text-lg font-bold text-white mb-4">What happens next?</h4>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <div>
                    <p className="text-white font-medium">{specialist.name} reviews your brief</p>
                    <p className="text-gray-400 text-sm">Usually within {specialist.responseTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <div>
                    <p className="text-white font-medium">Work begins on your project</p>
                    <p className="text-gray-400 text-sm">You'll receive updates throughout the process</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <div>
                    <p className="text-white font-medium">Delivery and approval</p>
                    <p className="text-gray-400 text-sm">Expected delivery: {specialist.deliveryTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push(`/${locale}/messages`)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
              >
                View Messages
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentStep === 'select' && 'Choose Your Plan'}
                {currentStep === 'ai_chat' && 'AI Consultation'}
                {currentStep === 'brief' && 'Project Brief'}
                {currentStep === 'payment' && 'Payment'}
                {currentStep === 'confirmation' && 'Confirmation'}
              </h1>
              <p className="text-gray-400">
                Step {['select', 'ai_chat', 'brief', 'payment', 'confirmation'].indexOf(currentStep) + 1} of 5
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {['select', 'ai_chat', 'brief', 'payment', 'confirmation'].map((step, index) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    ['select', 'ai_chat', 'brief', 'payment', 'confirmation'].indexOf(currentStep) >= index
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(((['select', 'ai_chat', 'brief', 'payment', 'confirmation'].indexOf(currentStep) + 1) / 5) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Step Content */}
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
} 
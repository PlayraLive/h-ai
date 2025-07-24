'use client';

import { useState } from 'react';
import { 
  Shield, 
  Users, 
  Briefcase, 
  MessageCircle, 
  CreditCard, 
  Brain, 
  Video, 
  Palette, 
  Code, 
  Star, 
  Lock, 
  CheckCircle,
  ArrowRight,
  Search,
  Heart,
  Globe,
  Zap,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TermsSectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

function TermsSection({ id, title, icon: Icon, children, isExpanded, onToggle }: TermsSectionProps) {
  return (
    <div className="border border-gray-700/50 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-300"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white text-left">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-gradient-to-b from-gray-900/30 to-gray-950/30 border-t border-gray-700/30">
          {children}
        </div>
      )}
    </div>
  );
}

export default function TermsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['platform-overview']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const features = [
    {
      icon: Brain,
      title: 'AI Specialists Marketplace',
      description: 'Connect with verified AI experts in machine learning, natural language processing, computer vision, and more'
    },
    {
      icon: Video,
      title: 'AI Video & Content Creation',
      description: 'Access AI-powered video editing, content generation, and multimedia production services'
    },
    {
      icon: Palette,
      title: 'AI Design & Creativity',
      description: 'Find specialists in AI art generation, brand design, UI/UX creation using cutting-edge AI tools'
    },
    {
      icon: Code,
      title: 'AI Development Services',
      description: 'Custom AI model development, chatbot creation, automation scripts, and ML pipeline development'
    },
    {
      icon: MessageCircle,
      title: 'Real-time Communication',
      description: 'Built-in messaging system with file sharing, project collaboration, and milestone tracking'
    },
    {
      icon: CreditCard,
      title: 'Secure Payment System',
      description: 'Escrow-protected payments, milestone-based releases, and multiple payment methods'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-20">
      {/* Hero Section */}
      <div className="relative py-20 bg-gradient-to-b from-purple-900/20 via-[#0A0A0F] to-[#0A0A0F]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Terms of Use
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Welcome to AI Freelance - the premier platform connecting businesses with AI specialists. 
            Our comprehensive terms ensure a safe, productive, and innovative environment for all users.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Last updated: January 2025</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Global compliance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>GDPR compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Features Overview */}
      <div className="py-20 bg-gradient-to-b from-[#0A0A0F] to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Our Platform Offers
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover the comprehensive features that make AI Freelance the leading platform for AI services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group">
                  <div className="h-full bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <div className="py-20 bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            
            <TermsSection
              id="platform-overview"
              title="Platform Overview & Services"
              icon={Zap}
              isExpanded={expandedSections.includes('platform-overview')}
              onToggle={() => toggleSection('platform-overview')}
            >
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>
                  AI Freelance is a cutting-edge marketplace that connects businesses with verified AI specialists across various domains:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <Brain className="w-5 h-5 text-purple-400 mr-2" />
                      AI Development Services
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Machine Learning Model Development</li>
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Natural Language Processing</li>
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Computer Vision Solutions</li>
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Chatbot & Virtual Assistant Creation</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <Palette className="w-5 h-5 text-blue-400 mr-2" />
                      Creative AI Services
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />AI-Generated Art & Design</li>
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Video Content Creation</li>
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Brand Identity Development</li>
                      <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Marketing Content Generation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TermsSection>

            <TermsSection
              id="user-responsibilities"
              title="User Responsibilities & Guidelines"
              icon={Users}
              isExpanded={expandedSections.includes('user-responsibilities')}
              onToggle={() => toggleSection('user-responsibilities')}
            >
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <h4 className="text-lg font-semibold text-white">For Clients:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />Provide clear project requirements and expectations</li>
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />Communicate professionally and respectfully</li>
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />Make timely payments through our secure escrow system</li>
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />Provide constructive feedback and reviews</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mt-8">For AI Specialists:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />Maintain high-quality work standards</li>
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />Deliver projects within agreed timelines</li>
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />Protect client confidentiality and data</li>
                  <li className="flex items-start"><ArrowRight className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />Continuously update skills and certifications</li>
                </ul>
              </div>
            </TermsSection>

            <TermsSection
              id="payment-terms"
              title="Payment & Escrow System"
              icon={CreditCard}
              isExpanded={expandedSections.includes('payment-terms')}
              onToggle={() => toggleSection('payment-terms')}
            >
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>Our secure payment system ensures protection for both clients and freelancers:</p>
                
                <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/20 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Lock className="w-5 h-5 text-green-400 mr-2" />
                    Escrow Protection
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Funds are held securely until project completion</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Milestone-based payment releases</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Dispute resolution support</li>
                    <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />Multiple payment methods accepted</li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Platform Fees</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Client fee: 3% of project value</li>
                      <li>• Freelancer fee: 5-10% based on earnings</li>
                      <li>• Premium features available</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Supported Methods</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Credit/Debit Cards</li>
                      <li>• PayPal</li>
                      <li>• Bank Transfers</li>
                      <li>• Cryptocurrency (select)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TermsSection>

            <TermsSection
              id="quality-assurance"
              title="Quality Assurance & Verification"
              icon={Award}
              isExpanded={expandedSections.includes('quality-assurance')}
              onToggle={() => toggleSection('quality-assurance')}
            >
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>We maintain the highest standards through our comprehensive verification system:</p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Identity Verification</h4>
                    <p className="text-sm text-gray-400">All specialists undergo thorough background checks</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Skill Assessment</h4>
                    <p className="text-sm text-gray-400">AI proficiency tests and portfolio reviews</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Performance Tracking</h4>
                    <p className="text-sm text-gray-400">Continuous monitoring and rating systems</p>
                  </div>
                </div>
              </div>
            </TermsSection>

            <TermsSection
              id="privacy-security"
              title="Privacy & Data Security"
              icon={Lock}
              isExpanded={expandedSections.includes('privacy-security')}
              onToggle={() => toggleSection('privacy-security')}
            >
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Your Privacy Matters</h4>
                  <p className="mb-4">We implement industry-leading security measures to protect your data:</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="space-y-2">
                      <li className="flex items-start"><Lock className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />End-to-end encryption</li>
                      <li className="flex items-start"><Lock className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />GDPR compliance</li>
                      <li className="flex items-start"><Lock className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />Regular security audits</li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start"><Lock className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />Data minimization</li>
                      <li className="flex items-start"><Lock className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />Secure cloud storage</li>
                      <li className="flex items-start"><Lock className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />24/7 monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TermsSection>

            <TermsSection
              id="community-guidelines"
              title="Community Guidelines & Support"
              icon={Heart}
              isExpanded={expandedSections.includes('community-guidelines')}
              onToggle={() => toggleSection('community-guidelines')}
            >
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <p>We foster a respectful, innovative community where everyone can thrive:</p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Community Standards</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start"><Heart className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />Respectful communication</li>
                      <li className="flex items-start"><Heart className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />Professional conduct</li>
                      <li className="flex items-start"><Heart className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />Constructive feedback</li>
                      <li className="flex items-start"><Heart className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />Knowledge sharing</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Support Channels</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start"><MessageCircle className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />24/7 Live chat support</li>
                      <li className="flex items-start"><MessageCircle className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />Community forums</li>
                      <li className="flex items-start"><MessageCircle className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />Video tutorials</li>
                      <li className="flex items-start"><MessageCircle className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />Expert guidance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TermsSection>

          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Join thousands of satisfied users who trust AI Freelance for their AI project needs. 
                Start your journey today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105">
                  Find AI Specialists
                </button>
                <button className="border border-gray-600 text-gray-300 hover:border-purple-500 hover:text-white font-medium px-8 py-3 rounded-lg transition-all duration-300">
                  Post Your Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
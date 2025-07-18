'use client';

import React from 'react';
import Link from 'next/link';

// Try to import from Heroicons, fallback to simple icons
let RocketLaunchIcon, UserGroupIcon, CurrencyDollarIcon, ChartBarIcon, 
    BriefcaseIcon, PaintBrushIcon, CogIcon, ShieldCheckIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  RocketLaunchIcon = heroicons.RocketLaunchIcon;
  UserGroupIcon = heroicons.UserGroupIcon;
  CurrencyDollarIcon = heroicons.CurrencyDollarIcon;
  ChartBarIcon = heroicons.ChartBarIcon;
  BriefcaseIcon = heroicons.BriefcaseIcon;
  PaintBrushIcon = heroicons.PaintBrushIcon;
  CogIcon = heroicons.CogIcon;
  ShieldCheckIcon = heroicons.ShieldCheckIcon;
} catch {
  RocketLaunchIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
  UserGroupIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  );
  CurrencyDollarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
  ChartBarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
  BriefcaseIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2H10a2 2 0 00-2 2v2" />
    </svg>
  );
  PaintBrushIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3V1m10 20a4 4 0 004-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4zM17 3V1" />
    </svg>
  );
  CogIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  ShieldCheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export default function DemoPage() {
  const features = [
    {
      icon: <BriefcaseIcon className="w-8 h-8" />,
      title: "Project Management",
      description: "Complete project lifecycle from posting to payment",
      link: "/en/jobs",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <UserGroupIcon className="w-8 h-8" />,
      title: "Freelancer Profiles",
      description: "Detailed profiles with portfolios and ratings",
      link: "/en/freelancers",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: <PaintBrushIcon className="w-8 h-8" />,
      title: "Portfolio Showcase",
      description: "Beautiful portfolio galleries with AI project highlights",
      link: "/en/portfolio",
      color: "from-pink-500 to-red-600"
    },
    {
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
      title: "Stripe Payments",
      description: "Secure escrow payments with 10% platform commission",
      link: "/en/dashboard",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <ChartBarIcon className="w-8 h-8" />,
      title: "Admin Analytics",
      description: "Comprehensive platform analytics and user management",
      link: "/en/admin",
      color: "from-orange-500 to-yellow-600"
    },
    {
      icon: <CogIcon className="w-8 h-8" />,
      title: "Dashboard",
      description: "Unified dashboard for freelancers and clients",
      link: "/en/dashboard",
      color: "from-indigo-500 to-blue-600"
    }
  ];

  const workflow = [
    {
      step: 1,
      title: "Post Project",
      description: "Clients post AI-powered projects with detailed requirements",
      status: "Client Action"
    },
    {
      step: 2,
      title: "Apply & Bid",
      description: "Freelancers submit applications with portfolio samples",
      status: "Freelancer Action"
    },
    {
      step: 3,
      title: "Review & Hire",
      description: "Clients review applications and select the best freelancer",
      status: "Client Action"
    },
    {
      step: 4,
      title: "Work & Deliver",
      description: "Freelancers complete the work and submit for review",
      status: "Freelancer Action"
    },
    {
      step: 5,
      title: "Review & Pay",
      description: "Clients approve work and release payment via Stripe",
      status: "Client Action"
    },
    {
      step: 6,
      title: "Platform Fee",
      description: "10% commission automatically deducted for platform",
      status: "Automated"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <RocketLaunchIcon className="w-16 h-16 text-blue-400 mr-4" />
            <h1 className="text-5xl font-bold text-white">H-AI Platform</h1>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Complete AI-powered freelancing platform with project management, secure payments, 
            portfolio showcases, and comprehensive analytics. Built with Next.js, Appwrite, and Stripe.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <ShieldCheckIcon className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-medium">Fully Functional Demo</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.link}
              className="group relative overflow-hidden bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
              
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Workflow Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Project Workflow</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Workflow Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />
              
              {workflow.map((item, index) => (
                <div key={index} className="relative flex items-start mb-8 last:mb-0">
                  {/* Step Number */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white font-bold text-lg mr-6">
                    {item.step}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Client Action' ? 'bg-blue-500/20 text-blue-400' :
                        item.status === 'Freelancer Action' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-blue-400 mb-2">10%</div>
            <div className="text-gray-300 text-sm">Platform Commission</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
            <div className="text-gray-300 text-sm">Secure Payments</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-purple-400 mb-2">AI</div>
            <div className="text-gray-300 text-sm">Powered Projects</div>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
            <div className="text-gray-300 text-sm">Platform Uptime</div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Built With Modern Tech</h2>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              'Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 
              'Appwrite', 'Stripe', 'Node.js', 'Vercel'
            ].map((tech, index) => (
              <div key={index} className="px-4 py-2 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 text-gray-300">
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the complete AI freelancing platform. Browse projects, view portfolios, 
            check analytics, and see how everything works together seamlessly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/en/jobs" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
              Browse Projects
            </Link>
            <Link href="/en/freelancers" className="btn-secondary border-white text-white hover:bg-white/10">
              Find Freelancers
            </Link>
            <Link href="/en/admin" className="btn-secondary border-white text-white hover:bg-white/10">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

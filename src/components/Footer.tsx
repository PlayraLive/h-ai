'use client';

import Link from 'next/link';
import { 
  Zap, 
  Brain, 
  Code, 
  Palette, 
  Video, 
  MessageCircle, 
  Shield, 
  Award,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  Heart,
  Star,
  Users,
  Briefcase,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface FooterProps {
  locale?: string;
}

export default function Footer({ locale = 'en' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const services = [
    { icon: Brain, name: 'AI Development', href: `/${locale}/services/ai-development` },
    { icon: Code, name: 'Machine Learning', href: `/${locale}/services/machine-learning` },
    { icon: Palette, name: 'AI Design', href: `/${locale}/services/ai-design` },
    { icon: Video, name: 'Content Creation', href: `/${locale}/services/content-creation` },
  ];

  const quickLinks = [
    { name: 'Find Specialists', href: `/${locale}/freelancers` },
    { name: 'Post a Job', href: `/${locale}/jobs/create` },
    { name: 'Browse Jobs', href: `/${locale}/jobs` },
    { name: 'AI Solutions', href: `/${locale}/solutions` },
    { name: 'Dashboard', href: `/${locale}/dashboard` },
    { name: 'Messages', href: `/${locale}/messages` },
  ];

  const company = [
    { name: 'About Us', href: `/${locale}/about` },
    { name: 'How it Works', href: `/${locale}/how-it-works` },
    { name: 'Success Stories', href: `/${locale}/success-stories` },
    { name: 'Careers', href: `/${locale}/careers` },
    { name: 'Press Kit', href: `/${locale}/press` },
    { name: 'Blog', href: `/${locale}/blog` },
  ];

  const support = [
    { name: 'Help Center', href: `/${locale}/help` },
    { name: 'Contact Support', href: `/${locale}/support` },
    { name: 'Community Forum', href: `/${locale}/community` },
    { name: 'API Documentation', href: `/${locale}/docs` },
    { name: 'System Status', href: `/${locale}/status` },
    { name: 'Bug Report', href: `/${locale}/bug-report` },
  ];

  const legal = [
    { name: 'Terms of Use', href: `/${locale}/terms` },
    { name: 'Privacy Policy', href: `/${locale}/privacy` },
    { name: 'Cookie Policy', href: `/${locale}/cookies` },
    { name: 'GDPR Compliance', href: `/${locale}/gdpr` },
    { name: 'Refund Policy', href: `/${locale}/refunds` },
    { name: 'Dispute Resolution', href: `/${locale}/disputes` },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/aifreelance', color: 'hover:text-blue-400' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/aifreelance', color: 'hover:text-blue-600' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/aifreelance', color: 'hover:text-gray-300' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/aifreelance', color: 'hover:text-pink-400' },
    { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/aifreelance', color: 'hover:text-red-500' },
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Users' },
    { icon: Briefcase, value: '50,000+', label: 'Projects Completed' },
    { icon: Star, value: '4.9/5', label: 'Average Rating' },
    { icon: Globe, value: '150+', label: 'Countries' },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-950 via-[#0A0A0F] to-black border-t border-gray-800/50">
      {/* Top Section with Newsletter */}
      <div className="relative py-16 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-purple-900/20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join the AI Revolution
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Connect with top AI specialists worldwide. Get updates on the latest AI trends, project opportunities, and platform features.
            </p>
            
            {/* Newsletter Signup */}
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 flex items-center justify-center space-x-2">
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Join 50,000+ professionals. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-700/30 pt-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                    <Icon className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href={`/${locale}`} className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Freelance
                </span>
              </Link>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                The world's premier platform connecting businesses with verified AI specialists. 
                Transform your ideas into reality with cutting-edge artificial intelligence solutions.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">hello@aifreelance.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-300">SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-300">ISO 27001</span>
                </div>
              </div>
            </div>

            {/* AI Services */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 text-purple-400 mr-2" />
                AI Services
              </h4>
              <ul className="space-y-3">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <li key={index}>
                      <Link 
                        href={service.href}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300 group"
                      >
                        <Icon className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors duration-300" />
                        <span className="text-sm">{service.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Company</h4>
              <ul className="space-y-3">
                {company.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Support</h4>
              <ul className="space-y-3 mb-8">
                {support.slice(0, 3).map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <h4 className="text-lg font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-3">
                {legal.slice(0, 3).map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2" />
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-800/50 bg-gradient-to-r from-gray-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © {currentYear} AI Freelance. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-sm text-gray-400">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                <span>for the AI community</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-400 hidden md:block">Follow us:</span>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                      title={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Additional Legal Links */}
          <div className="mt-6 pt-6 border-t border-gray-800/30">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500">
              {legal.map((link, index) => (
                <Link 
                  key={index}
                  href={link.href}
                  className="hover:text-gray-300 transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
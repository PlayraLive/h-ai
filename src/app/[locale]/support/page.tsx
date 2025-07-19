'use client';

import React, { useState } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Shield,
  CreditCard,
  Users,
  Briefcase,
  Star
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

export default function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const supportCategories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'account', label: 'Account & Profile', icon: Users },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'projects', label: 'Projects & Jobs', icon: Briefcase },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star }
  ];

  const faqs = [
    {
      id: '1',
      category: 'account',
      question: 'How do I verify my account?',
      answer: 'To verify your account, go to your profile settings and upload a government-issued ID. Verification typically takes 24-48 hours.'
    },
    {
      id: '2',
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept major credit cards (Visa, Mastercard, Amex) and cryptocurrencies (Bitcoin, Ethereum, USDT). All payments are processed securely.'
    },
    {
      id: '3',
      category: 'payments',
      question: 'How does the escrow system work?',
      answer: 'When you fund a project, the money is held in escrow until the work is completed and approved. This protects both clients and freelancers.'
    },
    {
      id: '4',
      category: 'projects',
      question: 'How do I post a job?',
      answer: 'Click "Post a Job" from your dashboard, fill in the project details, set your budget and timeline, then publish. Freelancers will start submitting proposals.'
    },
    {
      id: '5',
      category: 'projects',
      question: 'What if I\'m not satisfied with the work?',
      answer: 'You can request revisions or open a dispute. Our support team will mediate and ensure a fair resolution for both parties.'
    },
    {
      id: '6',
      category: 'security',
      question: 'Is my personal information secure?',
      answer: 'Yes, we use bank-level encryption and follow strict security protocols to protect your data. We never share your information with third parties.'
    },
    {
      id: '7',
      category: 'reviews',
      question: 'Can I change my review after submitting it?',
      answer: 'Reviews can be edited within 14 days of submission. After that, they become permanent to maintain review integrity.'
    },
    {
      id: '8',
      category: 'account',
      question: 'How do I become a verified freelancer?',
      answer: 'Complete your profile, verify your identity, showcase your portfolio, and maintain high-quality work with good client feedback.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support ticket:', ticketForm);
    // Handle ticket submission
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">How can we help you?</h1>
            <p className="text-xl text-gray-400 mb-8">Find answers to common questions or contact our support team</p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 w-full text-lg py-4"
              />
            </div>
          </div>

          {/* Quick Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 rounded-2xl text-center">
              <MessageCircle className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-gray-400 mb-4">Get instant help from our support team</p>
              <button className="btn-primary w-full">Start Chat</button>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
              <p className="text-gray-400 mb-4">Send us a detailed message</p>
              <button className="btn-secondary w-full">Send Email</button>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center">
              <Phone className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Phone Support</h3>
              <p className="text-gray-400 mb-4">Call us for urgent issues</p>
              <button className="btn-secondary w-full">+1 (555) 123-4567</button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ Section */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {supportCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                          "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300",
                          activeCategory === category.id
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{category.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/30 transition-colors"
                      >
                        <span className="text-white font-medium">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedFaq === faq.id && (
                        <div className="px-4 pb-4 border-t border-gray-700">
                          <p className="text-gray-300 pt-4">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                    <p className="text-gray-400">Try adjusting your search or browse different categories</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-white mb-6">Submit a Ticket</h3>
                
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      className="input-field w-full"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="">Select category</option>
                      <option value="account">Account & Profile</option>
                      <option value="payments">Payments & Billing</option>
                      <option value="projects">Projects & Jobs</option>
                      <option value="security">Security & Privacy</option>
                      <option value="reviews">Reviews & Ratings</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                      className="input-field w-full resize-none"
                      placeholder="Please provide as much detail as possible..."
                    />
                  </div>
                  
                  <button type="submit" className="w-full btn-primary">
                    Submit Ticket
                  </button>
                </form>
              </div>

              {/* Support Hours */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Support Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Live Chat</span>
                    <span className="text-white">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email Support</span>
                    <span className="text-white">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone Support</span>
                    <span className="text-white">9 AM - 6 PM PST</span>
                  </div>
                </div>
              </div>

              {/* Response Times */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Response Times</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Urgent</span>
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                      &lt; 1 hour
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">High</span>
                    <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs">
                      &lt; 4 hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Medium</span>
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                      &lt; 24 hours
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Low</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                      &lt; 48 hours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

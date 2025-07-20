'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import {
  ArrowLeft,
  Star,
  MapPin,
  DollarSign,
  MessageCircle,
  Share2,
  Flag,
  CheckCircle,
  Briefcase,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  completedAt: string;
  client: string;
  rating: number;
  budget: number;
}

interface Review {
  id: string;
  client: {
    name: string;
    avatar: string;
    company: string;
  };
  rating: number;
  comment: string;
  project: string;
  completedAt: string;
}

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  location: string;
  hourlyRate: number;
  totalEarned: number;
  jobsCompleted: number;
  rating: number;
  reviewsCount: number;
  responseTime: string;
  availability: 'available' | 'busy' | 'unavailable';
  memberSince: string;
  lastSeen: string;
  verified: boolean;
  topRated: boolean;
  description: string;
  skills: string[];
  languages: { name: string; level: string }[];
  education: { degree: string; school: string; year: string }[];
  certifications: { name: string; issuer: string; year: string }[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  workHistory: {
    totalJobs: number;
    repeatClients: number;
    onTime: number;
    onBudget: number;
  };
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockFreelancer: Freelancer = {
      id: params.id as string,
      name: 'Alex Chen',
      title: 'Senior AI Designer & Developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      location: 'San Francisco, CA',
      hourlyRate: 85,
      totalEarned: 125000,
      jobsCompleted: 89,
      rating: 4.9,
      reviewsCount: 67,
      responseTime: '< 1 hour',
      availability: 'available',
      memberSince: '2022-03-15',
      lastSeen: '2024-01-15T10:00:00Z',
      verified: true,
      topRated: true,
      description: `I'm a passionate AI designer and developer with 5+ years of experience creating innovative digital solutions. I specialize in AI-powered design tools, machine learning interfaces, and cutting-edge web applications.

My expertise includes:
• AI Design Tools (Midjourney, DALL-E, Stable Diffusion)
• Frontend Development (React, Next.js, TypeScript)
• UI/UX Design (Figma, Adobe Creative Suite)
• Machine Learning (Python, TensorFlow, PyTorch)

I've worked with startups and Fortune 500 companies, delivering high-quality projects on time and within budget. I'm committed to understanding your vision and bringing it to life with the latest AI technologies.`,
      skills: [
        'AI Design', 'React', 'Next.js', 'TypeScript', 'Python', 'Figma', 
        'Adobe Creative Suite', 'Midjourney', 'DALL-E', 'Machine Learning',
        'UI/UX Design', 'Brand Identity', 'Web Development', 'Mobile Design'
      ],
      languages: [
        { name: 'English', level: 'Native' },
        { name: 'Mandarin', level: 'Native' },
        { name: 'Spanish', level: 'Conversational' }
      ],
      education: [
        { degree: 'Master of Computer Science', school: 'Stanford University', year: '2019' },
        { degree: 'Bachelor of Design', school: 'Art Center College of Design', year: '2017' }
      ],
      certifications: [
        { name: 'Google AI Certification', issuer: 'Google', year: '2023' },
        { name: 'AWS Machine Learning', issuer: 'Amazon', year: '2023' },
        { name: 'Adobe Certified Expert', issuer: 'Adobe', year: '2022' }
      ],
      portfolio: [
        {
          id: '1',
          title: 'AI-Powered E-commerce Platform',
          description: 'Complete redesign of an e-commerce platform with AI-driven product recommendations',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          category: 'Web Development',
          completedAt: '2024-01-10',
          client: 'TechCorp Inc.',
          rating: 5,
          budget: 8500
        },
        {
          id: '2',
          title: 'Brand Identity for AI Startup',
          description: 'Complete brand identity including logo, website, and marketing materials',
          image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
          category: 'Brand Design',
          completedAt: '2023-12-15',
          client: 'InnovateLab',
          rating: 5,
          budget: 3200
        },
        {
          id: '3',
          title: 'Mobile App UI/UX Design',
          description: 'Modern mobile app design with AI-powered features',
          image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
          category: 'Mobile Design',
          completedAt: '2023-11-20',
          client: 'StartupXYZ',
          rating: 4.8,
          budget: 4500
        }
      ],
      reviews: [
        {
          id: '1',
          client: {
            name: 'Sarah Johnson',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
            company: 'TechFlow Solutions'
          },
          rating: 5,
          comment: 'Alex delivered exceptional work on our AI-powered logo design. The creativity and attention to detail were outstanding. Highly recommended!',
          project: 'AI Logo Design',
          completedAt: '2024-01-10'
        },
        {
          id: '2',
          client: {
            name: 'Mike Davis',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            company: 'InnovateLab'
          },
          rating: 5,
          comment: 'Professional, fast, and delivered exactly what we needed. The AI integration was seamless and the design is beautiful.',
          project: 'Brand Identity Package',
          completedAt: '2023-12-15'
        },
        {
          id: '3',
          client: {
            name: 'Emma Wilson',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
            company: 'StartupXYZ'
          },
          rating: 4.8,
          comment: 'Great communication throughout the project. Alex understood our vision and brought it to life perfectly.',
          project: 'Mobile App Design',
          completedAt: '2023-11-20'
        }
      ],
      workHistory: {
        totalJobs: 89,
        repeatClients: 23,
        onTime: 98,
        onBudget: 95
      }
    };

    setTimeout(() => {
      setFreelancer(mockFreelancer);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleSendMessage = () => {
    setShowContactModal(true);
  };

  const submitMessage = () => {
    // Handle message submission
    console.log('Sending message:', {
      freelancerId: freelancer?.id,
      message: message
    });
    setShowContactModal(false);
    setMessage('');
    // Redirect to messages
    router.push(`/en/messages?freelancer=${freelancer?.id}`);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'unavailable': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available Now';
      case 'busy': return 'Busy';
      case 'unavailable': return 'Unavailable';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading freelancer profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Freelancer Not Found</h1>
            <p className="text-gray-400 mb-6">The freelancer you're looking for doesn't exist.</p>
            <Link
              href="/en/freelancers"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Back to Freelancers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <TopNav />

      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/en/freelancers"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Freelancers</span>
              </Link>

              <div className="flex items-center space-x-3">
                <button className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50">
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cover & Profile */}
            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden mb-8">
              <div className="relative h-48 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 relative">
                  <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                    <div className="relative">
                      {freelancer.avatar ? (
                        <img
                          src={freelancer.avatar}
                          alt={freelancer.name}
                          className="w-32 h-32 rounded-2xl object-cover border-4 border-[#1A1A2E]"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 border-4 border-[#1A1A2E] flex items-center justify-center ${freelancer.avatar ? 'hidden' : 'flex'}`}
                      >
                        <span className="text-white font-bold text-3xl">
                          {freelancer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {freelancer.verified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#1A1A2E]">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">{freelancer.name}</h1>
                        {freelancer.topRated && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>Top Rated</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xl text-gray-300 mb-2">{freelancer.title}</p>
                      <div className="flex items-center space-x-4 text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{freelancer.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>{freelancer.rating}/5 ({freelancer.reviewsCount} reviews)</span>
                        </div>
                        <div className={`flex items-center space-x-1 ${getAvailabilityColor(freelancer.availability)}`}>
                          <div className="w-2 h-2 rounded-full bg-current"></div>
                          <span>{getAvailabilityText(freelancer.availability)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-6 md:mt-0">
                    <button
                      onClick={handleSendMessage}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Message</span>
                    </button>
                    <Link
                      href={`/en/jobs/create?freelancer=${freelancer.id}`}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      <span>Hire Now</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 rounded-2xl text-center">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">${freelancer.hourlyRate}/hr</div>
                <div className="text-sm text-gray-400">Hourly Rate</div>
              </div>
              <div className="glass-card p-6 rounded-2xl text-center">
                <Briefcase className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{freelancer.jobsCompleted}</div>
                <div className="text-sm text-gray-400">Jobs Completed</div>
              </div>
              <div className="glass-card p-6 rounded-2xl text-center">
                <DollarSign className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">${freelancer.totalEarned.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Earned</div>
              </div>
              <div className="glass-card p-6 rounded-2xl text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{freelancer.responseTime}</div>
                <div className="text-sm text-gray-400">Response Time</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="border-b border-gray-700">
                <nav className="flex space-x-8 px-8">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'portfolio', label: 'Portfolio' },
                    { id: 'reviews', label: 'Reviews' },
                    { id: 'experience', label: 'Experience' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-gray-400 hover:text-white'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-line text-gray-300">{freelancer.description}</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
                      <div className="flex flex-wrap gap-3">
                        {freelancer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Languages</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {freelancer.languages.map((lang, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                            <span className="text-white">{lang.name}</span>
                            <span className="text-gray-400 text-sm">{lang.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Work History Stats */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Work History</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-white">{freelancer.workHistory.totalJobs}</div>
                          <div className="text-sm text-gray-400">Total Jobs</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-white">{freelancer.workHistory.repeatClients}</div>
                          <div className="text-sm text-gray-400">Repeat Clients</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-white">{freelancer.workHistory.onTime}%</div>
                          <div className="text-sm text-gray-400">On Time</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                          <div className="text-2xl font-bold text-white">{freelancer.workHistory.onBudget}%</div>
                          <div className="text-sm text-gray-400">On Budget</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Portfolio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {freelancer.portfolio.map((item) => (
                        <div key={item.id} className="bg-gray-800/50 rounded-2xl overflow-hidden hover:bg-gray-800/70 transition-colors">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                {item.category}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-400">{item.rating}</span>
                              </div>
                            </div>
                            <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{item.client}</span>
                              <span className="text-green-400">${item.budget.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-6">Client Reviews</h3>
                    <div className="space-y-6">
                      {freelancer.reviews.map((review) => (
                        <div key={review.id} className="bg-gray-800/50 rounded-2xl p-6">
                          <div className="flex items-start space-x-4">
                            <img
                              src={review.client.avatar}
                              alt={review.client.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-white">{review.client.name}</h4>
                                  <p className="text-gray-400 text-sm">{review.client.company}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'w-4 h-4',
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                      )}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-300 mb-3">{review.comment}</p>
                              <div className="flex items-center justify-between text-sm text-gray-400">
                                <span>Project: {review.project}</span>
                                <span>{new Date(review.completedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-8">
                    {/* Education */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Education</h3>
                      <div className="space-y-4">
                        {freelancer.education.map((edu, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Award className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{edu.degree}</h4>
                              <p className="text-gray-400">{edu.school}</p>
                              <p className="text-gray-500 text-sm">{edu.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Certifications</h3>
                      <div className="space-y-4">
                        {freelancer.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{cert.name}</h4>
                              <p className="text-gray-400">{cert.issuer}</p>
                              <p className="text-gray-500 text-sm">{cert.year}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Modal */}
          {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Send Message to {freelancer.name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'm interested in working with you on a project..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitMessage}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

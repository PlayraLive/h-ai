'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  location: string;
  verified: boolean;
  description: string;
  skills: string[];
  languages: string[];
  completedJobs: number;
  totalEarnings: number;
  responseTime: string;
  availability: string;
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);

  useEffect(() => {
    loadFreelancer();
  }, [params.id]);

  const loadFreelancer = async () => {
    try {
      setLoading(true);
      
      const mockFreelancer: Freelancer = {
        id: params.id as string,
        name: 'Mike Johnson',
        title: 'Full-Stack Developer & AI Specialist',
        avatar: '',
        rating: 4.9,
        reviewsCount: 127,
        hourlyRate: 85,
        location: 'San Francisco, CA',
        verified: true,
        description: 'Experienced full-stack developer with 8+ years of experience in building scalable web applications.',
        skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AI/ML', 'PostgreSQL'],
        languages: ['English (Native)', 'Spanish (Fluent)'],
        completedJobs: 156,
        totalEarnings: 250000,
        responseTime: '< 1 hour',
        availability: 'Available now'
      };

      setFreelancer(mockFreelancer);
    } catch (error) {
      console.error('Error loading freelancer:', error);
    } finally {
      setLoading(false);
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
            <p className="text-gray-400 mb-6">The freelancer you are looking for does not exist.</p>
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

          <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden mb-8">
            <div className="relative h-48 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-pink-600/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
            </div>
            
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
                <div className="relative mb-4 sm:mb-0">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 border-4 border-[#1A1A2E] flex items-center justify-center">
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
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{freelancer.name}</h1>
                  <p className="text-lg text-gray-300 mb-4">{freelancer.title}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{freelancer.rating}</span>
                      <span className="text-gray-400">({freelancer.reviewsCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{freelancer.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">${freelancer.hourlyRate}/hour</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  <button className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact
                  </button>
                  <Link
                    href={`/en/jobs/create?freelancer=${freelancer.id}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Hire
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Completed Jobs</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{freelancer.completedJobs}</p>
                  <p className="text-green-400 text-xs md:text-sm">100% success rate</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Total Earned</p>
                  <p className="text-xl md:text-2xl font-bold text-white">${freelancer.totalEarnings.toLocaleString()}</p>
                  <p className="text-blue-400 text-xs md:text-sm">All time</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Response Time</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{freelancer.responseTime}</p>
                  <p className="text-purple-400 text-xs md:text-sm">Average</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Availability</p>
                  <p className="text-xl md:text-2xl font-bold text-white">{freelancer.availability}</p>
                  <p className="text-yellow-400 text-xs md:text-sm">Status</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">About</h3>
                <p className="text-gray-300 leading-relaxed">{freelancer.description}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm border border-purple-600/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Languages</h3>
                <div className="space-y-2">
                  {freelancer.languages.map((language, index) => (
                    <div key={index} className="text-gray-300">{language}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Bookmark,
  BookmarkCheck,
  Eye,
  Users,
  Calendar,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { JobCardSkeleton } from '@/components/Loading';
import { useToast } from '@/components/Toast';
import { JobsService } from '@/lib/appwrite/jobs';
import { cn } from '@/lib/utils';
interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogo: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  postedAt: string;
  deadline: string;
  proposals: number;
  rating: number;
  category: string;
  featured: boolean;
  urgent: boolean;
}

export default function JobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [budgetRange, setBudgetRange] = useState([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('newest');

  const searchParams = useSearchParams();
  const { success, info } = useToast();

  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'AI-Powered Logo Design for Tech Startup',
      description: 'We need a creative AI designer to create a modern, minimalist logo for our AI startup. The logo should convey innovation, trust, and cutting-edge technology.',
      company: 'TechFlow AI',
      companyLogo: '/api/placeholder/40/40',
      location: 'Remote',
      type: 'freelance',
      budget: { min: 500, max: 1500, currency: 'USD' },
      skills: ['AI Design', 'Logo Design', 'Branding', 'Figma'],
      postedAt: '2024-01-15',
      deadline: '2024-01-30',
      proposals: 12,
      rating: 4.8,
      category: 'ai_design',
      featured: true,
      urgent: false
    },
    {
      id: '2',
      title: 'Machine Learning Model Development',
      description: 'Looking for an experienced ML engineer to develop a recommendation system for our e-commerce platform. Must have experience with Python, TensorFlow, and large datasets.',
      company: 'ShopSmart Inc',
      companyLogo: '/api/placeholder/40/40',
      location: 'New York, NY',
      type: 'contract',
      budget: { min: 5000, max: 15000, currency: 'USD' },
      skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Science'],
      postedAt: '2024-01-14',
      deadline: '2024-02-15',
      proposals: 8,
      rating: 4.9,
      category: 'ai_development',
      featured: false,
      urgent: true
    },
    {
      id: '3',
      title: 'AI Video Editing for YouTube Channel',
      description: 'Need an AI video editor to create engaging content for our tech YouTube channel. Experience with AI-powered editing tools required.',
      company: 'TechTalks Media',
      companyLogo: '/api/placeholder/40/40',
      location: 'Remote',
      type: 'part-time',
      budget: { min: 1000, max: 3000, currency: 'USD' },
      skills: ['AI Video Editing', 'After Effects', 'Premiere Pro', 'Motion Graphics'],
      postedAt: '2024-01-13',
      deadline: '2024-01-25',
      proposals: 15,
      rating: 4.7,
      category: 'ai_video',
      featured: false,
      urgent: false
    }
  ];

  useEffect(() => {
    // Получение параметров из URL
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      // Проверяем наличие переменных окружения
      if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
          !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
          !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
        console.warn('Appwrite not configured, using mock data');
        setJobs(mockJobs);
        return;
      }

      const filters: any = {};

      if (selectedCategory && selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      if (selectedLocation && selectedLocation !== 'all') {
        filters.location = selectedLocation;
      }

      if (budgetRange[0] > 0) {
        filters.budgetMin = budgetRange[0];
      }

      if (budgetRange[1] < 10000) {
        filters.budgetMax = budgetRange[1];
      }

      if (experienceLevel && experienceLevel !== 'all') {
        filters.experienceLevel = experienceLevel;
      }

      if (searchQuery) {
        filters.search = searchQuery;
      }

      console.log('Calling JobsService.getJobs with filters:', filters);
      const { jobs: loadedJobs } = await JobsService.getJobs(filters);
      console.log('Loaded jobs:', loadedJobs);

      // Если нет джобов из БД, используем mock данные
      if (!loadedJobs || loadedJobs.length === 0) {
        console.log('No jobs found in database, using mock data');
        setJobs(mockJobs);
        return;
      }

      // Convert Appwrite documents to Job interface
      const convertedJobs = loadedJobs.map(job => ({
        id: job.$id!,
        title: job.title,
        description: job.description,
        company: job.clientCompany || job.clientName,
        location: job.location,
        type: job.budgetType,
        budget: {
          min: job.budgetMin,
          max: job.budgetMax,
          currency: job.currency
        },
        skills: job.skills,
        postedAt: job.$createdAt!,
        deadline: job.deadline,
        proposals: job.applicationsCount,
        rating: 4.5, // Default rating
        category: job.category,
        featured: job.featured,
        urgent: job.urgent,
        experienceLevel: job.experienceLevel,
        client: {
          name: job.clientName,
          avatar: job.clientAvatar || '',
          company: job.clientCompany || '',
          rating: 4.5,
          jobsPosted: 1,
          totalSpent: job.budgetMax,
          memberSince: job.$createdAt!,
          verified: true
        }
      }));

      setJobs(convertedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Fallback to mock data if real data fails
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedLocation, budgetRange, experienceLevel, sortBy, searchQuery]);

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      info('Job removed from saved', 'Job has been removed from your saved list.');
    } else {
      newSavedJobs.add(jobId);
      success('Job saved!', 'Job has been added to your saved list.');
    }
    setSavedJobs(newSavedJobs);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesBudget = job.budget.min >= budgetRange[0] && job.budget.max <= budgetRange[1];

    return matchesSearch && matchesCategory && matchesType && matchesBudget;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      case 'budget_high':
        return b.budget.max - a.budget.max;
      case 'budget_low':
        return a.budget.min - b.budget.min;
      case 'proposals':
        return a.proposals - b.proposals;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Find AI Jobs</h1>
            <p className="text-xl text-gray-400">Discover amazing opportunities in AI and machine learning</p>
          </div>

          {/* Search and Filters */}
          <div className="glass-card p-6 rounded-2xl mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, skills, companies..."
                  className="input-field pl-12 w-full"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  <option value="ai_design">AI Design</option>
                  <option value="ai_development">AI Development</option>
                  <option value="ai_video">AI Video</option>
                  <option value="ai_games">AI Games</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="newest">Newest First</option>
                  <option value="budget_high">Highest Budget</option>
                  <option value="budget_low">Lowest Budget</option>
                  <option value="proposals">Fewest Proposals</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "btn-secondary flex items-center space-x-2",
                    showFilters && "bg-purple-500/20 text-purple-400"
                  )}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All Types</option>
                    <option value="freelance">Freelance</option>
                    <option value="contract">Contract</option>
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Budget Range: ${budgetRange[0]} - ${budgetRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20000"
                    step="500"
                    value={budgetRange[1]}
                    onChange={(e) => setBudgetRange([budgetRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setBudgetRange([0, 20000]);
                    }}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400">
              {loading ? 'Loading...' : `${sortedJobs.length} jobs found`}
            </p>
          </div>

          {/* Job Cards */}
          <div className="space-y-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))
            ) : sortedJobs.length > 0 ? (
              sortedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobs.has(job.id)}
                  onSave={() => handleSaveJob(job.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">No jobs found matching your criteria</div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setBudgetRange([0, 20000]);
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, isSaved, onSave }: { job: Job; isSaved: boolean; onSave: () => void }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-500/20 text-green-400';
      case 'part-time': return 'bg-blue-500/20 text-blue-400';
      case 'contract': return 'bg-purple-500/20 text-purple-400';
      case 'freelance': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className={cn(
      "glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group",
      job.featured && "ring-2 ring-purple-500/30",
      job.urgent && "ring-2 ring-red-500/30"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={job.companyLogo}
            alt={job.company}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
              {job.title}
            </h3>
            <p className="text-gray-400">{job.company}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {job.featured && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              Featured
            </span>
          )}
          {job.urgent && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              Urgent
            </span>
          )}
          <button
            onClick={onSave}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
          >
            {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 line-clamp-2">{job.description}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 4).map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-gray-800/50 text-gray-300 text-sm rounded-full"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="px-3 py-1 bg-gray-800/50 text-gray-400 text-sm rounded-full">
            +{job.skills.length - 4} more
          </span>
        )}
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div className="flex items-center space-x-2 text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span className={cn("px-2 py-1 rounded-full text-xs", getTypeColor(job.type))}>
            {job.type}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <DollarSign className="w-4 h-4" />
          <span>${job.budget.min.toLocaleString()} - ${job.budget.max.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>{job.proposals} proposals</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Posted {formatDate(job.postedAt)}</span>
          <span>•</span>
          <span>Deadline {formatDate(job.deadline)}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{job.rating}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href={`/en/jobs/${job.id}`}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Link>
          <Link
            href={`/en/jobs/${job.id}/apply`}
            className="btn-primary flex items-center space-x-2"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

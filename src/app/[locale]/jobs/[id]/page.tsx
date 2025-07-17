'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Bookmark,
  BookmarkCheck,
  Users,
  Calendar,
  Share2,
  Flag,
  Send,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Building,
  Globe,
  Award
} from 'lucide-react';
import { JobsService, ApplicationsService } from '@/lib/appwrite/jobs';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
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
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  clientInfo: {
    name: string;
    avatar: string;
    rating: number;
    jobsPosted: number;
    totalSpent: number;
    memberSince: string;
    verified: boolean;
  };
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [proposalBudget, setProposalBudget] = useState('');
  const [proposalDeadline, setProposalDeadline] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [params.id, user]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const jobData = await JobsService.getJob(params.id as string);

      // Convert Appwrite document to Job interface
      const convertedJob: Job = {
        id: jobData.$id!,
        title: jobData.title,
        description: jobData.description,
        company: jobData.clientCompany || jobData.clientName,
        companyLogo: jobData.clientAvatar || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        companyDescription: `${jobData.clientCompany || jobData.clientName} is looking for talented freelancers.`,
        location: jobData.location,
        type: jobData.budgetType as 'full-time' | 'part-time' | 'contract' | 'freelance',
        budget: {
          min: jobData.budgetMin,
          max: jobData.budgetMax,
          currency: jobData.currency
        },
        skills: jobData.skills,
        postedAt: jobData.$createdAt!,
        deadline: jobData.deadline,
        proposals: jobData.applicationsCount,
        rating: 4.8, // Default rating
        category: jobData.category,
        featured: jobData.featured,
        urgent: jobData.urgent,
        requirements: [
          `Experience level: ${jobData.experienceLevel}`,
          `Duration: ${jobData.duration}`,
          'Strong portfolio required',
          'Excellent communication skills'
        ],
        responsibilities: [
          'Deliver high-quality work on time',
          'Communicate regularly with client',
          'Follow project requirements',
          'Provide revisions if needed'
        ],
        benefits: [
          'Flexible working hours',
          'Remote work opportunity',
          'Competitive compensation',
          'Potential for long-term collaboration'
        ],
        experienceLevel: jobData.experienceLevel,
        clientInfo: {
          name: jobData.clientName,
          avatar: jobData.clientAvatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
          rating: 4.9,
          jobsPosted: 15,
          totalSpent: 12500,
          memberSince: jobData.$createdAt!,
          verified: true
        }
      };

      setJob(convertedJob);

      // Check if user has already applied
      if (user) {
        const applied = await ApplicationsService.hasUserApplied(params.id as string, user.$id || user.id);
        setHasApplied(applied);
      }

    } catch (error) {
      console.error('Error loading job:', error);
      // Fallback to mock data
      const mockJob: Job = {
      id: params.id as string,
      title: 'AI-Powered Logo Design for Tech Startup',
      description: `We are looking for a talented AI designer to create a modern, innovative logo for our tech startup. The logo should represent cutting-edge technology, innovation, and trust.

Key Requirements:
- Experience with AI design tools (Midjourney, DALL-E, Stable Diffusion)
- Strong portfolio of logo designs
- Understanding of brand identity principles
- Ability to create multiple variations and formats

Deliverables:
- Primary logo design
- Logo variations (horizontal, vertical, icon-only)
- Color and monochrome versions
- Vector files (AI, SVG) and raster files (PNG, JPG)
- Brand guidelines document

Timeline: 1-2 weeks
Budget: $500-$1000

We value creativity, attention to detail, and professional communication. Please include relevant portfolio samples in your proposal.`,
      company: 'TechFlow Solutions',
      companyLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
      companyDescription: 'TechFlow Solutions is a fast-growing startup focused on AI-powered business automation tools.',
      location: 'Remote',
      type: 'freelance',
      budget: { min: 500, max: 1000, currency: 'USD' },
      skills: ['AI Design', 'Logo Design', 'Midjourney', 'Brand Identity', 'Adobe Illustrator'],
      postedAt: '2024-01-15T10:00:00Z',
      deadline: '2024-02-01T23:59:59Z',
      proposals: 12,
      rating: 4.8,
      category: 'AI Design',
      featured: true,
      urgent: false,
      requirements: [
        '3+ years of experience in logo design',
        'Proficiency with AI design tools',
        'Strong portfolio of brand identity work',
        'Excellent communication skills',
        'Ability to work with feedback and revisions'
      ],
      responsibilities: [
        'Create initial logo concepts using AI tools',
        'Refine designs based on client feedback',
        'Deliver final files in multiple formats',
        'Provide brand guidelines documentation',
        'Ensure designs are scalable and versatile'
      ],
      benefits: [
        'Flexible working hours',
        'Potential for long-term collaboration',
        'Creative freedom in design approach',
        'Fast payment upon completion',
        'Opportunity to work with cutting-edge AI tools'
      ],
      experienceLevel: 'intermediate',
      clientInfo: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        rating: 4.9,
        jobsPosted: 15,
        totalSpent: 12500,
        memberSince: '2023-03-15',
        verified: true
      }
    };

      setTimeout(() => {
        setJob(mockJob);
        setLoading(false);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
  };

  const handleApply = () => {
    setShowApplyModal(true);
  };

  const submitProposal = async () => {
    if (!user) {
      alert('Please log in to apply for jobs');
      router.push('/en/login');
      return;
    }

    if (!proposalText.trim() || !proposalBudget) {
      alert('Please fill in all required fields');
      return;
    }

    setIsApplying(true);

    try {
      const applicationData = {
        jobId: params.id as string,
        freelancerId: user.$id || user.id,
        freelancerName: user.name || user.email,
        freelancerAvatar: user.avatar,
        freelancerRating: 4.5, // Default rating
        coverLetter: proposalText,
        proposedBudget: parseInt(proposalBudget),
        proposedDuration: proposalDeadline || '1 week'
      };

      await ApplicationsService.submitApplication(applicationData, user.$id || user.id);

      setHasApplied(true);
      setShowApplyModal(false);
      setProposalText('');
      setProposalBudget('');
      setProposalDeadline('');

      alert('Application submitted successfully!');

    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Job Not Found</h1>
            <p className="text-gray-400 mb-6">The job you're looking for doesn't exist.</p>
            <Link href="/en/jobs" className="btn-primary">
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/en/jobs"
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-6 h-6 rounded object-cover"
                      />
                      <span className="text-gray-400">{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveJob}
                  className="p-3 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
                <button className="p-3 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="p-3 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors">
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Job Overview */}
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Job Overview</h2>
                    <div className="flex items-center space-x-4">
                      {job.featured && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                          Featured
                        </span>
                      )}
                      {job.urgent && (
                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                          Urgent
                        </span>
                      )}
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full capitalize">
                        {job.type}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-white">
                        ${job.budget.min}-${job.budget.max}
                      </div>
                      <div className="text-sm text-gray-400">Budget</div>
                    </div>
                    <div className="text-center">
                      <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-white">{job.proposals}</div>
                      <div className="text-sm text-gray-400">Proposals</div>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-white">
                        {new Date(job.deadline).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-400">Deadline</div>
                    </div>
                    <div className="text-center">
                      <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-white capitalize">{job.experienceLevel}</div>
                      <div className="text-sm text-gray-400">Level</div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-line text-gray-300">{job.description}</div>
                  </div>
                </div>

                {/* Skills Required */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Skills Required</h3>
                  <div className="flex flex-wrap gap-3">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
                  <ul className="space-y-3">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Responsibilities */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Responsibilities</h3>
                  <ul className="space-y-3">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Apply Section */}
                <div className="glass-card p-6 rounded-2xl">
                  <button
                    onClick={handleApply}
                    disabled={hasApplied || !user}
                    className={`w-full text-lg py-4 mb-4 transition-colors ${
                      hasApplied
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                        : !user
                        ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    {hasApplied ? 'Application Submitted' : !user ? 'Login to Apply' : 'Apply for this Job'}
                  </button>
                  <Link
                    href={`/en/messages?job=${job.id}`}
                    className="w-full btn-secondary text-center block py-3"
                  >
                    Message Client
                  </Link>
                </div>

                {/* Client Info */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">About the Client</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={job.clientInfo.avatar}
                      alt={job.clientInfo.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{job.clientInfo.name}</h4>
                        {job.clientInfo.verified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-400">{job.clientInfo.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Jobs Posted:</span>
                      <span className="text-white">{job.clientInfo.jobsPosted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Spent:</span>
                      <span className="text-white">${job.clientInfo.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Member Since:</span>
                      <span className="text-white">
                        {new Date(job.clientInfo.memberSince).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">About the Company</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-white">{job.company}</h4>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">Technology</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{job.companyDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Submit Proposal</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                  placeholder="Explain why you're the best fit for this project..."
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Budget (USD) *
                  </label>
                  <input
                    type="number"
                    value={proposalBudget}
                    onChange={(e) => setProposalBudget(e.target.value)}
                    placeholder="Enter your budget"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Delivery Time *
                  </label>
                  <select
                    value={proposalDeadline}
                    onChange={(e) => setProposalDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select timeline</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="1 month">1 month</option>
                    <option value="2+ months">2+ months</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitProposal}
                  disabled={isApplying || !proposalText.trim() || !proposalBudget}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplying ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

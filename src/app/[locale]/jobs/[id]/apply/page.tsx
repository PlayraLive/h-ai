'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { PortfolioService, PortfolioItem } from '@/lib/appwrite/portfolio';

// Job interface (using existing structure)
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
}

// Try to import from Heroicons, fallback to simple icons
let ArrowLeftIcon, PaperClipIcon, CheckCircleIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  ArrowLeftIcon = heroicons.ArrowLeftIcon;
  PaperClipIcon = heroicons.PaperClipIcon;
  CheckCircleIcon = heroicons.CheckCircleIcon;
} catch {
  ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
  PaperClipIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
  CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ApplyToJobPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  
  const [job, setJob] = useState<Job | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form data
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [proposedDuration, setProposedDuration] = useState('');
  const [selectedPortfolioItems, setSelectedPortfolioItems] = useState<string[]>([]);

  // Mock jobs data (same as in jobs page)
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'AI-Powered Logo Design for Tech Startup',
      description: 'We need a creative AI designer to create a modern, minimalist logo for our AI startup. The logo should convey innovation, trust, and cutting-edge technology. Experience with Midjourney, DALL-E, or similar AI design tools is required.',
      company: 'TechFlow AI',
      companyLogo: '/api/placeholder/60/60',
      companyDescription: 'Leading AI startup focused on automation solutions',
      location: 'Remote',
      type: 'freelance',
      budget: { min: 500, max: 1500, currency: 'USD' },
      skills: ['AI Design', 'Midjourney', 'DALL-E', 'Logo Design', 'Brand Identity'],
      postedAt: '2024-01-15',
      deadline: '2024-02-15',
      proposals: 12,
      rating: 4.8,
      category: 'AI Design'
    },
    {
      id: '2',
      title: 'ChatGPT Integration for E-commerce Platform',
      description: 'Looking for an experienced developer to integrate ChatGPT API into our e-commerce platform. The integration should handle customer inquiries, product recommendations, and order assistance.',
      company: 'ShopSmart Inc',
      companyLogo: '/api/placeholder/60/60',
      companyDescription: 'E-commerce platform serving 100k+ customers',
      location: 'Remote',
      type: 'contract',
      budget: { min: 2000, max: 5000, currency: 'USD' },
      skills: ['OpenAI API', 'ChatGPT', 'Node.js', 'React', 'E-commerce'],
      postedAt: '2024-01-14',
      deadline: '2024-03-01',
      proposals: 8,
      rating: 4.9,
      category: 'AI Development'
    },
    {
      id: '3',
      title: 'AI Content Generation for Social Media',
      description: 'We need an AI specialist to set up automated content generation for our social media channels. Should include text, images, and scheduling capabilities using various AI tools.',
      company: 'Digital Marketing Pro',
      companyLogo: '/api/placeholder/60/60',
      companyDescription: 'Full-service digital marketing agency',
      location: 'Remote',
      type: 'freelance',
      budget: { min: 1000, max: 3000, currency: 'USD' },
      skills: ['Content Generation', 'Social Media', 'AI Tools', 'Automation'],
      postedAt: '2024-01-13',
      deadline: '2024-02-28',
      proposals: 15,
      rating: 4.7,
      category: 'Content Creation'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const jobId = params.id as string;

        // Find job in mock data
        const foundJob = mockJobs.find(j => j.id === jobId);
        if (foundJob) {
          setJob(foundJob);
          // Set default budget to job max budget
          setProposedBudget(foundJob.budget.max.toString());
        }

        // Load user's portfolio items if user is logged in
        if (user) {
          try {
            const portfolio = await PortfolioService.getUserPortfolio(user.$id);
            setPortfolioItems(portfolio);
          } catch (error) {
            console.log('No portfolio items found');
            setPortfolioItems([]);
          }
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to apply for this job.');
      return;
    }

    if (!job) {
      alert('Job not found.');
      return;
    }

    if (!coverLetter.trim()) {
      alert('Please write a cover letter.');
      return;
    }

    if (!proposedBudget || parseFloat(proposedBudget) <= 0) {
      alert('Please enter a valid budget.');
      return;
    }

    setSubmitting(true);

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, just show success
      console.log('Application submitted:', {
        jobId: job.id,
        jobTitle: job.title,
        freelancerId: user.$id,
        freelancerName: user.name || 'Anonymous',
        coverLetter: coverLetter.trim(),
        proposedBudget: parseFloat(proposedBudget),
        proposedDuration: proposedDuration || '2-3 weeks',
        portfolioItems: selectedPortfolioItems
      });

      setSubmitted(true);

      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push(`/en/application-success?job=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`);
      }, 2000);

    } catch (error: any) {
      console.error('Error applying to job:', error);
      alert(`Failed to apply: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePortfolioItem = (itemId: string) => {
    setSelectedPortfolioItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <Link href="/en/jobs" className="text-blue-400 hover:text-blue-300">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-gray-300 mb-6">
            Your application for "{job.title}" has been sent to {job.company}.
            You'll be notified when they respond.
          </p>
          <div className="text-sm text-gray-400">
            Redirecting in 2 seconds...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-gray-300 mb-6">Please log in to apply for this job.</p>
          <Link href="/en/auth/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        
        {/* Back Button */}
        <Link
          href={`/en/jobs/${job.id}`}
          className="inline-flex items-center space-x-2 text-gray-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Job Details</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Application Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h1 className="text-3xl font-bold text-white mb-6">Apply for this Job</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cover Letter *
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain why you're the perfect fit for this project. Mention your relevant experience, skills, and how you plan to approach this work..."
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {coverLetter.length}/2000 characters
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Bid ({project.budgetType === 'fixed' ? 'Total' : 'Per Hour'}) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">$</span>
                        <input
                          type="number"
                          value={proposedBudget}
                          onChange={(e) => setProposedBudget(e.target.value)}
                          placeholder="0"
                          min="1"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Client's budget: ${project.budget}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Delivery Time
                      </label>
                      <input
                        type="text"
                        value={proposedDuration}
                        onChange={(e) => setProposedDuration(e.target.value)}
                        placeholder={project.duration}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="text-xs text-gray-400 mt-1">
                        Client expects: {project.duration}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Items */}
                  {portfolioItems.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Relevant Portfolio Items (Optional)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {portfolioItems.slice(0, 6).map((item) => (
                          <div
                            key={item.$id}
                            onClick={() => togglePortfolioItem(item.$id)}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                              selectedPortfolioItems.includes(item.$id)
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              {selectedPortfolioItems.includes(item.$id) && (
                                <CheckCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Select relevant work samples to strengthen your application
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex space-x-4 pt-6 border-t border-gray-700">
                    <Link
                      href={`/en/jobs/${job.id}`}
                      className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-colors text-center"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Job Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-4">Job Summary</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{job.title}</h4>
                    <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Budget:</span>
                      <div className="text-white font-medium">
                        ${job.budget.min} - ${job.budget.max}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>
                      <div className="text-white font-medium capitalize">{job.type}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Company:</span>
                      <div className="text-white font-medium">{job.company}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Proposals:</span>
                      <div className="text-white font-medium">{job.proposals}</div>
                    </div>
                  </div>

                  {job.skills.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-sm">Skills Required:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.skills.slice(0, 6).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400">
                      By submitting this application, you agree to our terms of service and privacy policy.
                    </div>
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

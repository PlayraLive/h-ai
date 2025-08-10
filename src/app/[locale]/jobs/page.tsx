"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Eye,
  Users,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  XIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { JobCardSkeleton } from "@/components/Loading";
import { useToast } from "@/components/Toast";
import { JobsService, ApplicationsService } from "@/lib/appwrite/jobs";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import ApplyJobModal from "@/components/ApplyJobModal";
import InteractionButtons from "@/components/shared/InteractionButtons";
import BookmarkButton from "@/components/BookmarkButton";
interface Job {
  $id: string;
  title: string;
  description: string;
  clientName: string;
  clientAvatar?: string;
  location: string;
  type: "fixed" | "hourly" | "full-time" | "part-time" | "contract" | "freelance";
  budgetMin: number;
  budgetMax: number;
  currency: string;
  skills: string[];
  $createdAt: string;
  deadline?: string;
  applicationsCount: number;
  rating?: number;
  category: string;
  featured: boolean;
  urgent: boolean;
  hasApplied?: boolean;
  applicationStatus?: "pending" | "accepted" | "rejected";
  isOwner?: boolean;
  clientId?: string;
  status?: 'active' | 'in_progress' | 'completed' | 'cancelled' | 'pending';
}

const mockJobs: Job[] = [
  {
    $id: "1",
    title: "AI-Powered Logo Design for Tech Startup",
    description:
      "We need a creative AI designer to create a modern, minimalist logo for our AI startup. The logo should convey innovation, trust, and cutting-edge technology.",
    clientName: "TechFlow AI",
    clientAvatar: "/api/placeholder/40/40",
    location: "Remote",
    type: "freelance",
    budgetMin: 500,
    budgetMax: 1500,
    currency: "USD",
    skills: ["AI Design", "Logo Design", "Branding", "Figma"],
    $createdAt: "2024-01-15T00:00:00.000Z",
    deadline: "2024-01-30",
    applicationsCount: 12,
    rating: 4.8,
    category: "ai_design",
    featured: true,
    urgent: false,
  },
  {
    $id: "2",
    title: "Machine Learning Model Development",
    description:
      "Looking for an experienced ML engineer to develop a recommendation system for our e-commerce platform. Must have experience with Python, TensorFlow, and large datasets.",
    clientName: "ShopSmart Inc",
    clientAvatar: "/api/placeholder/40/40",
    location: "New York, NY",
    type: "contract",
    budgetMin: 5000,
    budgetMax: 15000,
    currency: "USD",
    skills: ["Machine Learning", "Python", "TensorFlow", "Data Science"],
    $createdAt: "2024-01-14T00:00:00.000Z",
    deadline: "2024-02-15",
    applicationsCount: 8,
    rating: 4.9,
    category: "ai_development",
    featured: false,
    urgent: true,
  },
  {
    $id: "3",
    title: "AI Video Editing for YouTube Channel",
    description:
      "Need an AI video editor to create engaging content for our tech YouTube channel. Experience with AI-powered editing tools required.",
    clientName: "TechTalks Media",
    clientAvatar: "/api/placeholder/40/40",
    location: "Remote",
    type: "part-time",
    budgetMin: 1000,
    budgetMax: 3000,
    currency: "USD",
    skills: [
      "AI Video Editing",
      "After Effects",
      "Premiere Pro",
      "Motion Graphics",
    ],
    $createdAt: "2024-01-13T00:00:00.000Z",
    deadline: "2024-01-25",
    applicationsCount: 15,
    rating: 4.7,
    category: "ai_video",
    featured: false,
    urgent: false,
  },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation] = useState("all");
  const [experienceLevel] = useState("all");
  const [budgetRange, setBudgetRange] = useState([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("newest");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const searchParams = useSearchParams();
  const { success, info } = useToast();
  const router = useRouter();
  const { user } = useAuthContext();

  useEffect(() => {
    // Получение параметров из URL
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🚀 Loading jobs from Appwrite...");
      
      // Always try to load from Appwrite first
      const loadedJobs = await JobsService.getJobs();
      console.log("📊 Loaded jobs from Appwrite:", loadedJobs);

      // If no jobs from database, show empty state instead of mock data
      if (!loadedJobs || !loadedJobs.jobs || loadedJobs.jobs.length === 0) {
        console.log("⚠️ No jobs found in database, showing empty state");
        setJobs([]);
        return;
      }

      // Get user applications if user is a freelancer
      let userApplications: string[] = [];
      let userApplicationStatuses: Record<string, "pending" | "accepted" | "rejected"> = {};
      if (user && user.userType === 'freelancer') {
        try {
          const applications = await ApplicationsService.getFreelancerApplications(user.$id);
          userApplications = applications.map(app => app.jobId);
          // Create a map of jobId to application status
          applications.forEach(app => {
            userApplicationStatuses[app.jobId] = app.status as "pending" | "accepted" | "rejected";
          });
          console.log('👤 Freelancer applications loaded:', userApplications, userApplicationStatuses);
        } catch (error) {
          console.warn('Could not load user applications:', error);
        }
      }

      // Get job applications if user is a client (job owner)
      if (user && user.userType === 'client') {
        try {
          // For each job owned by the client, get applications to determine if any are pending
          for (const job of loadedJobs.jobs) {
            if (job.clientId === user.$id) {
              const jobApplications = await ApplicationsService.getJobApplications(job.$id);
              // Check if there are any pending applications
              const hasPendingApplications = jobApplications.some(app => app.status === 'pending');
              if (hasPendingApplications) {
                userApplications.push(job.$id);
                userApplicationStatuses[job.$id] = 'pending';
              }
            }
          }
          console.log('👔 Client job applications loaded:', userApplications, userApplicationStatuses);
        } catch (error) {
          console.warn('Could not load job applications for client:', error);
        }
      }

      // Convert Appwrite documents to Job interface
      const convertedJobs: Job[] = loadedJobs.jobs.map(
        (job: Record<string, any>) => {
          console.log("🔄 Converting job:", job.title, job);
          
          return {
            $id: job.$id!,
            title: job.title || "Untitled Job",
            description: job.description || "No description provided",
            clientName: job.clientName || job.clientCompany || "Anonymous Client",
            clientAvatar: job.clientAvatar || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40",
            location: job.location || "Remote",
            type: job.budgetType || "freelance",
            budgetMin: job.budgetMin || 0,
            budgetMax: job.budgetMax || 0,
            currency: job.currency || "USD",
            skills: job.skills || [],
            $createdAt: job.$createdAt!,
            deadline: job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            applicationsCount: job.applicationsCount || 0,
            rating: job.rating || 4.5,
            category: job.category || "ai_development",
            featured: job.featured || false,
            urgent: job.urgent || false,
            hasApplied: userApplications.includes(job.$id!),
            applicationStatus: userApplicationStatuses[job.$id!],
            isOwner: user && job.clientId === user.$id,
            clientId: job.clientId,
            status: job.status || 'active',
          };
        }
      );

      setJobs(convertedJobs);
    } catch (error) {
      console.error("❌ Error loading jobs:", error);
      // Show empty state instead of mock data
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    selectedLocation,
    budgetRange,
    experienceLevel,
    sortBy,
    searchQuery,
    user, // Добавляем user в зависимости
  ]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      info("Removed from saved", "Job has been removed from your saved list.");
    } else {
      newSavedJobs.add(jobId);
      success("Job saved!", "Job has been added to your saved list.");
    }
    setSavedJobs(newSavedJobs);
  };

  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
    setSelectedJob(null);
  };

  const handleApplicationSuccess = async () => {
    success(
      "🎉 Заявка отправлена!",
      "Ваша заявка успешно отправлена работодателю. Перенаправляем на страницу джоба...",
    );
    
    // Reload jobs to update proposal count
    loadJobs();
    
    // Redirect to the specific job page to show application status
    if (selectedJob) {
      setTimeout(() => {
        router.push(`/en/jobs/${selectedJob.$id}`);
      }, 2000);
    }
  };

  // Function to update application status locally
  const updateApplicationStatus = async (jobId: string, status: "pending" | "accepted" | "rejected") => {
    try {
      console.log(`🔄 Updating application status for job ${jobId} to ${status}`);
      
      // Update local state immediately for better UX
      setJobs(prevJobs => {
        const updatedJobs = prevJobs.map(job => 
          job.$id === jobId 
            ? { ...job, hasApplied: true, applicationStatus: status }
            : job
        );
        console.log('✅ Local state updated:', updatedJobs.find(job => job.$id === jobId));
        return updatedJobs;
      });

      // Call API to update status in database
      const response = await fetch(`/api/applications/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          clientResponse: status === 'accepted' ? 'Application accepted' : 'Application rejected'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }
      
      console.log('✅ API call successful');
      success(
        `Status updated to ${status}`,
        `Application status has been successfully updated.`
      );
    } catch (error: any) {
      console.error('❌ Error updating application status:', error);
      error(
        'Update failed',
        'Failed to update application status. Please try again.'
      );
      
      // Revert local state on error
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.$id === jobId 
            ? { ...job, hasApplied: true, applicationStatus: "pending" }
            : job
        )
      );
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;
    const matchesType = selectedType === "all" || job.type === selectedType;
    const matchesBudget =
      job.budgetMin >= budgetRange[0] && job.budgetMax <= budgetRange[1];

    return matchesSearch && matchesCategory && matchesType && matchesBudget;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      case "budget_high":
        return b.budgetMax - a.budgetMax;
      case "budget_low":
        return a.budgetMin - b.budgetMin;
      case "proposals":
        return b.applicationsCount - a.applicationsCount;
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
            <p className="text-xl text-gray-400">
              Discover amazing opportunities in AI and machine learning
            </p>
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
                    showFilters && "bg-purple-500/20 text-purple-400",
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Type
                  </label>
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
                    onChange={(e) =>
                      setBudgetRange([budgetRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedType("all");
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
              {loading ? "Loading..." : `${sortedJobs.length} jobs found`}
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
                  key={job.$id}
                  job={job}
                  isSaved={savedJobs.has(job.$id)}
                  onSave={() => handleSaveJob(job.$id)}
                  onApply={() => handleApplyToJob(job)}
                  onStatusUpdate={updateApplicationStatus}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  No jobs found matching your criteria
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedType("all");
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

        {/* Apply Job Modal */}
        {selectedJob && (
          <ApplyJobModal
            isOpen={showApplyModal}
            onClose={handleCloseApplyModal}
            job={{
              id: selectedJob.$id,
              title: selectedJob.title,
              budget: { min: selectedJob.budgetMin, max: selectedJob.budgetMax, currency: selectedJob.currency },
              company: selectedJob.clientName,
              skills: selectedJob.skills,
            }}
            onSuccess={handleApplicationSuccess}
          />
        )}
      </div>
    </div>
  );
}

function JobCard({
  job,
  isSaved,
  onSave,
  onApply,
  onStatusUpdate,
}: {
  job: Job;
  isSaved: boolean;
  onSave: () => void;
  onApply: () => void;
  onStatusUpdate: (jobId: string, status: "pending" | "accepted" | "rejected") => void;
}) {
  // Debug logging
  console.log(`🔍 JobCard render for job ${job.$id}:`, {
    hasApplied: job.hasApplied,
    applicationStatus: job.applicationStatus,
    isOwner: job.isOwner
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "fixed":
        return "bg-purple-500/20 text-purple-400";
      case "hourly":
        return "bg-blue-500/20 text-blue-400";
      case "full-time":
        return "bg-green-500/20 text-green-400";
      case "part-time":
        return "bg-blue-500/20 text-blue-400";
      case "contract":
        return "bg-purple-500/20 text-purple-400";
      case "freelance":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div
      className={cn(
        "glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group",
        job.featured && "ring-2 ring-purple-500/30",
        job.urgent && "ring-2 ring-red-500/30",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
              <img
                src={job.clientAvatar}
                alt={job.clientName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                {job.title}
              </h3>
              <p className="text-gray-400">{job.clientName}</p>
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
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs",
              getTypeColor(job.type),
            )}
          >
            {job.type === 'fixed' ? 'Fixed' : job.type === 'hourly' ? 'Hourly' : job.type}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <DollarSign className="w-4 h-4" />
          <span>
            ${job.budgetMin.toLocaleString()} - $
            {job.budgetMax.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>{job.applicationsCount} proposals</span>
        </div>
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Posted {formatDate(job.$createdAt)}</span>
          <span>•</span>
          <span>Deadline {formatDate(job.deadline || '')}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{job.rating || 4.5}</span>
          </div>
        </div>

        <BookmarkButton
          jobId={job.$id}
          jobTitle={job.title}
          jobBudget={`$${job.budgetMin.toLocaleString()} - $${job.budgetMax.toLocaleString()}`}
          jobCategory={job.category}
          clientName={job.clientName}
          clientAvatar={job.clientAvatar}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <Link
            href={`/en/jobs/${job.$id}`}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Link>
          {!job.isOwner && (
            <>
              <button
                onClick={onApply}
                disabled={job.hasApplied}
                className={cn(
                  "flex items-center space-x-2 transition-all",
                  job.hasApplied 
                    ? job.applicationStatus === "accepted"
                      ? "bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg px-4 py-2 cursor-not-allowed"
                      : job.applicationStatus === "rejected"
                      ? "bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 cursor-not-allowed"
                      : "bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-lg px-4 py-2 cursor-not-allowed"
                    : "btn-primary"
                )}
              >
                {job.hasApplied ? (
                  <>
                    {job.applicationStatus === "accepted" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Принята</span>
                      </>
                    ) : job.applicationStatus === "rejected" ? (
                      <>
                        <XIcon className="w-4 h-4" />
                        <span>Отклонена</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>На рассмотрении</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span>Apply Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              
              {/* Contract status badge for owners and applicants */}
              {job.status && (
                <span className={cn(
                  "ml-2 px-3 py-1 rounded-lg text-xs font-medium border",
                  job.status === 'in_progress' && "bg-blue-600/20 text-blue-400 border-blue-600/30",
                  job.status === 'completed' && "bg-green-600/20 text-green-400 border-green-600/30",
                  job.status === 'pending' && "bg-amber-600/20 text-amber-400 border-amber-600/30",
                  job.status === 'cancelled' && "bg-red-600/20 text-red-400 border-red-600/30",
                  job.status === 'active' && "bg-gray-600/20 text-gray-300 border-gray-600/30"
                )}>
                  {job.status === 'in_progress' && 'Активный контракт'}
                  {job.status === 'completed' && 'Контракт завершен'}
                  {job.status === 'pending' && 'Ожидает'}
                  {job.status === 'cancelled' && 'Отменен'}
                  {job.status === 'active' && 'Джобс активен'}
                </span>
              )}

              {/* Status Update Buttons for Job Owner */}
              {job.isOwner && job.hasApplied && job.applicationStatus === "pending" && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      console.log(`🎯 Accept button clicked for job ${job.$id}`);
                      onStatusUpdate(job.$id, "accepted");
                    }}
                    className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-sm hover:bg-green-600/30 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      console.log(`🎯 Reject button clicked for job ${job.$id}`);
                      onStatusUpdate(job.$id, "rejected");
                    }}
                    className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

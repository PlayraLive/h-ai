"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ShareButton from "@/components/shared/ShareButton";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Eye,
  Bookmark,
  BookmarkCheck,
  Users,
  Calendar,
  Share2,
  Flag,
  Send,
  CheckCircle,
  Building,
  Globe,
  Award,
  Briefcase,
  Target,
  MessageCircle,
} from "lucide-react";
import { JobsService, ApplicationsService } from "@/lib/appwrite/jobs";
import { JobService } from "@/services/jobs";
import { useAuth } from "@/hooks/useAuth";
import ApplyJobModal from "@/components/ApplyJobModal";
import JobApplicationsModal from "@/components/JobApplicationsModal";
import FreelancerInviteModal from "@/components/FreelancerInviteModal";
import JobWorkflowTimeline from "@/components/JobWorkflowTimeline";
import { InvitationsService } from "@/lib/appwrite/invitations";
import { FreelancerMatchingService } from "@/services/freelancerMatchingService";
import { projectService } from "@/services/project";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "freelance";
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
  experienceLevel: "entry" | "intermediate" | "expert";
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
  const [hasApplied, setHasApplied] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [jobInvitations, setJobInvitations] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);

  useEffect(() => {
    loadJob();
    if (user && user.userType === "client") {
      loadJobInvitations();
    }
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
        companyLogo:
          jobData.clientAvatar ||
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150",
        companyDescription: `${jobData.clientCompany || jobData.clientName} is looking for talented freelancers.`,
        location: jobData.location || "Remote",
        type: jobData.budgetType as
          | "full-time"
          | "part-time"
          | "contract"
          | "freelance",
        budget: {
          min: jobData.budgetMin,
          max: jobData.budgetMax,
          currency: jobData.currency || "USD",
        },
        skills: jobData.skills || [],
        postedAt: jobData.$createdAt!,
        deadline:
          jobData.deadline ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        proposals: jobData.applicationsCount || 0,
        rating: 4.5,
        category: jobData.category,
        featured: jobData.featured || false,
        urgent: jobData.urgent || false,
        requirements: [
          `Experience level: ${jobData.experienceLevel}`,
          `Duration: ${jobData.duration}`,
          "Strong portfolio required",
          "Excellent communication skills",
        ],
        responsibilities: [
          "Deliver high-quality work on time",
          "Communicate regularly with the client",
          "Follow project requirements closely",
        ],
        benefits: [
          "Competitive compensation",
          "Flexible working hours",
          "Opportunity for long-term collaboration",
        ],
        experienceLevel: jobData.experienceLevel as
          | "entry"
          | "intermediate"
          | "expert",
        clientInfo: {
          name: jobData.clientName,
          avatar:
            jobData.clientAvatar ||
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
          rating: 4.8,
          jobsPosted: 12,
          totalSpent: 8500,
          memberSince: jobData.$createdAt!,
          verified: true,
        },
      };

      setJob(convertedJob);

      // Check if user has already applied
      if (user) {
        try {
          const applications = await ApplicationsService.getJobApplications(
            jobData.$id!,
          );
          const userApplication = applications.find(
            (app: any) => app.freelancerId === user.$id,
          );
          setHasApplied(!!userApplication);
        } catch (error) {
          console.log("No applications found");
        }
      }
    } catch (error) {
      console.error("Error loading job:", error);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
  };

  const handleApply = () => {
    if (!user) {
      alert("Please log in to apply for jobs");
      router.push("/en/login");
      return;
    }
    setShowApplyModal(true);
  };

  const handleApplicationSuccess = () => {
    setHasApplied(true);
    setShowApplyModal(false);
    if (job) {
      setJob({
        ...job,
        proposals: job.proposals + 1,
      });
    }
  };

  const loadJobInvitations = async () => {
    if (!user || user.userType !== "client") return;

    try {
      const jobService = new JobService();
      const result = await jobService.getJobInvitations(params.id as string);
      
      if (result.success) {
        setJobInvitations(result.invitations || []);
        console.log('✅ Loaded job invitations:', result.invitations?.length);
      } else {
        console.error('Failed to load job invitations:', result.error);
        setJobInvitations([]);
      }
    } catch (error) {
      console.error('Error loading job invitations:', error);
      setJobInvitations([]);
    }
  };

  const loadJobApplications = async () => {
    if (!job?.id) return;

    try {
      const applications = await ApplicationsService.getJobApplications(job.id);
      setJobApplications(applications);
    } catch (error) {
      console.error("Error loading job applications:", error);
    }
  };

  const handleAcceptApplication = async (application: any) => {
    if (!job || !user) return;

    try {
      // Создаем активный проект
      const activeProject = await projectService.createActiveProject({
        jobId: job.id,
        freelancerId: application.freelancerId,
        clientId: user.$id!,
        title: job.title,
        description: job.description,
        budget: application.proposedBudget || job.budget.max,
        deadline: job.deadline,
        status: "active",
        progress: 0,
        startedAt: new Date().toISOString(),
        requirements: job.requirements?.join("\n") || "",
        deliverables: "",
      });

      // Отправляем системное сообщение в проект
      await projectService.sendProjectMessage({
        projectId: activeProject.$id!,
        senderId: "system",
        receiverId: application.freelancerId,
        message: `Project "${job.title}" has been started! Welcome to the workspace.`,
        messageType: "system",
        read: false,
        timestamp: new Date().toISOString(),
      });

      alert("Application accepted! Active project created.");
      setShowApplicationsModal(false);
    } catch (error) {
      console.error("Error accepting application:", error);
      alert("Error accepting application. Please try again.");
    }
  };

  const handleInviteFreelancers = async (freelancerIds: string[]) => {
    if (!user || user.userType !== "client") {
      alert("Only clients can invite freelancers");
      return;
    }

    try {
      console.log('Sending invitations to freelancers:', freelancerIds);
      
      // Use JobService to send invitations
      const jobService = new JobService();
      const result = await jobService.sendInvitations(
        params.id as string,
        freelancerIds,
        `Hello! I would like to invite you to work on my project "${job?.title}". Please take a look at the project details and let me know if you're interested.`,
        user.$id
      );

      if (result.success) {
        alert(`Successfully sent ${result.summary?.successful} invitation(s) to freelancers!`);
        
        // Reload invitations to show updated list
        loadJobInvitations();
        
        // Send notifications
        if (result.notifications) {
          const successfulNotifications = result.notifications.filter(n => n.status === 'sent').length;
          console.log(`✅ Sent ${successfulNotifications} notifications successfully`);
        }
      } else {
        alert(`Failed to send invitations: ${result.error}`);
      }
    } catch (error) {
      console.error('Error inviting freelancers:', error);
      alert('Failed to send invitations. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Job Not Found
            </h1>
            <p className="text-gray-400 mb-6">
              The job you're looking for doesn't exist.
            </p>
            <Link href="/en/jobs" className="btn-primary">
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />

      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-[#2A1A3E] border-b border-gray-700/50 p-4 md:p-6 lg:p-8 overflow-hidden rounded-t-2xl mt-6">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>

            <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start space-x-4 md:space-x-6 flex-1">
                <Link
                  href="/en/jobs"
                  className="p-2 md:p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 group backdrop-blur-sm border border-gray-700/30"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                    {job.featured && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-full font-medium shadow-lg">
                        ⭐ Featured
                      </span>
                    )}
                    {job.urgent && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-full font-medium shadow-lg">
                        🔥 Urgent
                      </span>
                    )}
                    <span className="px-3 py-1.5 bg-gray-700/50 text-gray-200 text-sm rounded-full capitalize backdrop-blur-sm border border-gray-600/30">
                      {job.type}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-400">
                    <div className="flex items-center space-x-2 bg-gray-800/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-lg object-cover ring-1 ring-gray-600/30"
                      />
                      <span className="font-medium text-sm md:text-base">
                        {job.company}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm md:text-base">
                        {job.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800/30 px-3 py-2 rounded-lg backdrop-blur-sm">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm md:text-base">
                        Posted {new Date(job.postedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveJob}
                  className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group"
                  title={isSaved ? "Remove from saved" : "Save job"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
                  ) : (
                    <Bookmark className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  )}
                </button>
                <ShareButton
                  data={{
                    url:
                      typeof window !== "undefined" ? window.location.href : "",
                    title: `${job.title} - Job Opening`,
                    description: `Check out this job opportunity: ${job.title} at ${job.company}`,
                  }}
                  platforms={["twitter", "linkedin"]}
                  size="small"
                  showLabels={false}
                  className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/30"
                />
                <button
                  className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/30 group"
                  title="Report job"
                >
                  <Flag className="w-5 h-5 text-gray-300 group-hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 mt-6">
            {/* Main Content */}
            <div className="lg:col-span-2 bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 lg:rounded-2xl overflow-hidden">
              {/* Job Overview */}
              <div className="p-4 md:p-6 lg:p-8 border-b border-gray-700/50">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center">
                  <div className="p-2 bg-purple-600/20 rounded-lg mr-3">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  Job Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  <div className="relative group">
                    <div className="text-center p-4 md:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300 min-h-[140px] flex flex-col justify-center">
                      <div className="p-3 bg-green-600/20 rounded-xl w-fit mx-auto mb-3">
                        <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white mb-1 break-words leading-tight">
                        ${job.budget.min.toLocaleString()}-$
                        {job.budget.max.toLocaleString()}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">
                        Budget
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="text-center p-4 md:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 min-h-[140px] flex flex-col justify-center">
                      <div className="p-3 bg-blue-600/20 rounded-xl w-fit mx-auto mb-3">
                        <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white mb-1">
                        {job.proposals}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">
                        Proposals
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="text-center p-4 md:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300 min-h-[140px] flex flex-col justify-center">
                      <div className="p-3 bg-purple-600/20 rounded-xl w-fit mx-auto mb-3">
                        <Calendar className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white mb-1 break-words leading-tight">
                        {new Date(job.deadline).toLocaleDateString()}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">
                        Deadline
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div className="text-center p-4 md:p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300 min-h-[140px] flex flex-col justify-center">
                      <div className="p-3 bg-yellow-600/20 rounded-xl w-fit mx-auto mb-3">
                        <Award className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white mb-1 capitalize break-words leading-tight">
                        {job.experienceLevel}
                      </div>
                      <div className="text-xs md:text-sm text-gray-400">
                        Level
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </div>
              </div>

              {/* Skills Required */}
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Target className="w-5 h-5 mr-3 text-purple-400" />
                  Skills Required
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white rounded-full text-sm font-medium border border-purple-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="glass-card p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-400" />
                  Requirements
                </h3>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm lg:order-last order-first lg:rounded-2xl overflow-hidden lg:h-fit lg:sticky lg:top-6 border border-gray-700/50">
              {/* Apply Section */}
              <div className="p-4 md:p-6 border-b border-gray-700/50">
                {hasApplied ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Application Submitted
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      You have already applied for this job.
                    </p>
                    <Link
                      href={`/en/messages?job=${job.id}`}
                      className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Message Client
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleApply}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={!user}
                    >
                      <Briefcase className="w-4 h-4 mr-2 inline" />
                      {!user ? "Login to Apply" : "Apply for this Job"}
                    </button>
                    <Link
                      href={`/en/messages?job=${job.id}`}
                      className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Message Client
                    </Link>
                    {user && (
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="relative w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-1 bg-white/20 rounded-lg">
                              <Users className="w-5 h-5" />
                            </div>
                            <span>Подобрать фрилансеров</span>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Client Info */}
              <div className="p-4 md:p-6 border-b border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                  <div className="p-2 bg-blue-600/20 rounded-lg mr-3">
                    <Building className="w-5 h-5 text-blue-400" />
                  </div>
                  About the Client
                </h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    {job.clientInfo.avatar ? (
                      <img
                        src={job.clientInfo.avatar}
                        alt={job.clientInfo.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const nextElement = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 ring-2 ring-blue-500/20 flex items-center justify-center ${job.clientInfo.avatar ? "hidden" : "flex"}`}
                    >
                      <span className="text-white font-bold text-xl">
                        {job.clientInfo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {job.clientInfo.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white flex items-center mb-2 truncate">
                      {job.clientInfo.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center space-x-1 bg-yellow-600/20 px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span className="text-white font-medium text-sm">
                          {job.clientInfo.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-800/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/30 min-w-0">
                    <div className="text-gray-400 text-xs md:text-sm mb-1">
                      Jobs Posted
                    </div>
                    <div className="text-white font-bold text-lg break-words">
                      {job.clientInfo.jobsPosted}
                    </div>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/30 min-w-0">
                    <div className="text-gray-400 text-xs md:text-sm mb-1">
                      Total Spent
                    </div>
                    <div className="text-white font-bold text-lg break-words">
                      ${job.clientInfo.totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div className="sm:col-span-2 bg-gray-800/30 p-4 rounded-xl backdrop-blur-sm border border-gray-700/30 min-w-0">
                    <div className="text-gray-400 text-xs md:text-sm mb-1">
                      Member Since
                    </div>
                    <div className="text-white font-bold break-words">
                      {new Date(
                        job.clientInfo.memberSince,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                  <div className="p-2 bg-green-600/20 rounded-lg mr-3">
                    <Globe className="w-5 h-5 text-green-400" />
                  </div>
                  About the Company
                </h3>
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 p-4 rounded-xl border border-gray-700/30 backdrop-blur-sm mb-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-green-500/20"
                    />
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">
                        {job.company}
                      </h4>
                      <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1 rounded-lg">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {job.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {job.companyDescription}
                  </p>
                </div>
              </div>

              {/* Invited Freelancers */}
              {user &&
                user.userType === "client" &&
                jobInvitations.length > 0 && (
                  <div className="p-4 md:p-6 border-t border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                      <div className="p-2 bg-purple-600/20 rounded-lg mr-3">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <span>Приглашенные фрилансеры</span>
                      <span className="ml-2 px-2 py-1 bg-purple-600/20 text-purple-400 text-sm rounded-full">
                        {jobInvitations.length}
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {jobInvitations.slice(0, 3).map((invitation) => (
                        <div key={invitation.$id} className="group relative">
                          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/30 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {invitation.freelancerName.charAt(0)}
                              </div>
                              <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                                  invitation.status === "pending"
                                    ? "bg-yellow-500"
                                    : invitation.status === "accepted"
                                      ? "bg-green-500"
                                      : invitation.status === "declined"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                }`}
                              ></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate mb-1">
                                {invitation.freelancerName}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    invitation.status === "pending"
                                      ? "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30"
                                      : invitation.status === "accepted"
                                        ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                        : invitation.status === "declined"
                                          ? "bg-red-600/20 text-red-400 border border-red-600/30"
                                          : "bg-gray-600/20 text-gray-400 border border-gray-600/30"
                                  }`}
                                >
                                  {invitation.status === "pending"
                                    ? "Ожидает ответа"
                                    : invitation.status === "accepted"
                                      ? "Принято"
                                      : invitation.status === "declined"
                                        ? "Отклонено"
                                        : "Истекло"}
                                </span>
                                {invitation.metadata?.matchScore && (
                                  <span className="text-xs text-purple-400 bg-purple-600/20 px-2 py-1 rounded-full">
                                    {Math.round(
                                      invitation.metadata.matchScore * 100,
                                    )}
                                    % совпадение
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {jobInvitations.length > 3 && (
                        <div className="text-center">
                          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium bg-purple-600/10 hover:bg-purple-600/20 px-4 py-2 rounded-lg transition-all duration-300">
                            Показать еще {jobInvitations.length - 3} приглашений
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Applications Section for Clients */}
              {user && user.userType === "client" && (
                <div className="p-4 md:p-6 border-t border-gray-700/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <div className="p-2 bg-blue-600/20 rounded-lg mr-3">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                      </div>
                      <span>Applications</span>
                      <span className="ml-2 px-2 py-1 bg-blue-600/20 text-blue-400 text-sm rounded-full">
                        {job?.proposals || 0}
                      </span>
                    </h3>
                    <button
                      onClick={() => {
                        loadJobApplications();
                        setShowApplicationsModal(true);
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Applications
                    </button>
                  </div>

                  {/* Invited Freelancers Section */}
                  {jobInvitations.length > 0 && (
                    <div className="mt-6 border-t border-gray-700/50 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-white flex items-center">
                          <Users className="w-4 h-4 mr-2 text-purple-400" />
                          Invited Freelancers ({jobInvitations.length})
                        </h4>
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          Invite More
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {jobInvitations.map((invitation: any) => (
                          <div
                            key={invitation.$id}
                            className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 hover:bg-gray-800/70 transition-all duration-200"
                          >
                            {/* Freelancer Info */}
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                {invitation.freelancer_avatar ? (
                                  <img
                                    src={invitation.freelancer_avatar}
                                    alt={invitation.freelancer_name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-sm font-semibold">
                                    {invitation.freelancer_name?.charAt(0) || 'F'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {invitation.freelancer_name}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                  {invitation.freelancer_rating > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <Star className="w-3 h-3 fill-current text-yellow-400" />
                                      <span>{invitation.freelancer_rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  invitation.status === 'pending'
                                    ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                    : invitation.status === 'accepted'
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : invitation.status === 'declined'
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                                )}
                              >
                                {invitation.status === 'pending' && '⏳ Pending'}
                                {invitation.status === 'accepted' && '✅ Accepted'}
                                {invitation.status === 'declined' && '❌ Declined'}
                                {invitation.status === 'viewed' && '👀 Viewed'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(invitation.invited_at).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Skills */}
                            {invitation.freelancer_skills && invitation.freelancer_skills.length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1">
                                  {invitation.freelancer_skills.slice(0, 3).map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {invitation.freelancer_skills.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                                      +{invitation.freelancer_skills.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Response Message */}
                            {invitation.response_message && (
                              <div className="mb-3 p-2 bg-gray-700/50 rounded-lg">
                                <p className="text-xs text-gray-300 italic">
                                  "{invitation.response_message}"
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Link
                                href={`/en/freelancers/${invitation.freelancer_id}`}
                                className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-center text-xs font-medium transition-colors"
                              >
                                View Profile
                              </Link>
                              <Link
                                href={`/en/messages?freelancer=${invitation.freelancer_id}&job=${params.id}`}
                                className="flex-1 px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg text-center text-xs font-medium transition-colors"
                              >
                                Message
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Job Workflow - show for active jobs */}
          {job && (job.category === 'active' || job.type === 'contract') && (
            <div className="mt-8">
              <JobWorkflowTimeline />
            </div>
          )}

          {/* Chat Integration Button */}
          {user && job && (
            <div className="mt-8 p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Общение по проекту</h3>
                  <p className="text-gray-400 text-sm">
                    Обсудите детали проекта напрямую с {user.userType === 'client' ? 'фрилансером' : 'клиентом'}
                  </p>
                </div>
                <Link
                  href={`/en/messages?job=${job.id}&with=${user.userType === 'client' ? 'freelancer' : 'client'}`}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Открыть чат</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-6"></div>

      {/* Apply Job Modal */}
      {showApplyModal && job && (
        <ApplyJobModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          job={{
            id: job.id,
            title: job.title,
            budget: job.budget,
            company: job.company,
            skills: job.skills,
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Mobile Apply Button - Fixed at bottom */}
      {user && user.userType === "freelancer" && !hasApplied && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent backdrop-blur-sm border-t border-gray-700/50 z-50">
          <button
            onClick={handleApply}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center font-semibold text-lg shadow-lg"
            disabled={!user}
          >
            <Briefcase className="w-5 h-5 mr-2" />
            {!user ? "Login to Apply" : "Apply for this Job"}
          </button>
        </div>
      )}

      {/* Freelancer Invite Modal */}
      <FreelancerInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        jobId={job?.id || ""}
        jobSkills={job?.skills || []}
        jobTitle={job?.title || ""}
        onInvite={handleInviteFreelancers}
      />

      {/* Job Applications Modal */}
      {showApplicationsModal && job && (
        <JobApplicationsModal
          isOpen={showApplicationsModal}
          onClose={() => setShowApplicationsModal(false)}
          job={{
            id: job.id,
            title: job.title,
            company: job.company,
            budget: job.budget,
          }}
          onApplicationAccepted={handleAcceptApplication}
        />
      )}
    </div>
  );
}

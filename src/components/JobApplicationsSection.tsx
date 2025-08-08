"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Star,
  Clock,
  DollarSign,
  FileText,
  Check,
  XIcon,
  MessageCircle,
  Award,
  ExternalLink,
  Calendar,
  Briefcase,
  User,
  Eye,
  Filter,
  Search,
  Crown,
  Trophy,
  Heart,
  Zap,
} from "lucide-react";
import { ApplicationsService } from "@/lib/appwrite/jobs";
import Link from "next/link";
import { cn, parseAttachments } from "@/lib/utils";

interface Application {
  $id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRating: number;
  coverLetter: string;
  proposedBudget: number;
  proposedDuration: string;
  status: "pending" | "accepted" | "rejected";
  attachments: string[];
  $createdAt: string;
  clientResponse?: string;
}

interface JobApplicationsSectionProps {
  jobId: string;
  jobTitle: string;
  jobBudget: {
    min: number;
    max: number;
    currency: string;
  };
  isClient: boolean;
  onApplicationAccepted?: (application: Application) => void;
}

export default function JobApplicationsSection({
  jobId,
  jobTitle,
  jobBudget,
  isClient,
  onApplicationAccepted,
}: JobApplicationsSectionProps) {

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [sortBy, setSortBy] = useState<"newest" | "budget_low" | "budget_high" | "rating">("newest");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const jobApplications = await ApplicationsService.getJobApplications(jobId);
      
      const typedApplications: Application[] = jobApplications.map((app) => {
        try {
          const application = {
            $id: app.$id!,
            freelancerId: app.freelancerId,
            freelancerName: app.freelancerName,
            freelancerAvatar: app.freelancerAvatar || "",
            freelancerRating: app.freelancerRating || 4.5,
            coverLetter: app.coverLetter,
            proposedBudget: app.proposedBudget || 0,
            proposedDuration: app.proposedDuration || "",
            status: app.status as "pending" | "accepted" | "rejected",
            attachments: parseAttachments(app.attachments),
            $createdAt: app.$createdAt!,
            clientResponse: app.clientResponse,
          };
          return application;
        } catch (parseError) {
          console.error("Error parsing application:", parseError, app);
          // Return a safe fallback
          return {
            $id: app.$id!,
            freelancerId: app.freelancerId || "",
            freelancerName: app.freelancerName || "Unknown",
            freelancerAvatar: "",
            freelancerRating: 4.5,
            coverLetter: app.coverLetter || "",
            proposedBudget: app.proposedBudget || 0,
            proposedDuration: app.proposedDuration || "",
            status: app.status as "pending" | "accepted" | "rejected",
            attachments: [],
            $createdAt: app.$createdAt!,
            clientResponse: app.clientResponse,
          };
        }
      });
      setApplications(typedApplications);
    } catch (error) {
      console.error("Error loading applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (application: Application) => {
    if (actionLoading) return;

    setActionLoading(application.$id);
    try {
      await ApplicationsService.updateApplicationStatus(
        application.$id,
        "accepted",
        "Congratulations! Your application has been accepted. We look forward to working with you.",
      );

      setApplications((prev) =>
        prev.map((app) =>
          app.$id === application.$id
            ? { ...app, status: "accepted" as const }
            : app,
        ),
      );

      onApplicationAccepted?.(application);
      alert("Application accepted successfully! The freelancer has been notified.");
    } catch (error) {
      console.error("Error accepting application:", error);
      alert("Failed to accept application. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectApplication = async (application: Application) => {
    if (actionLoading) return;

    const reason = prompt(
      "Please provide a brief reason for rejection (optional):",
    );

    setActionLoading(application.$id);
    try {
      await ApplicationsService.updateApplicationStatus(
        application.$id,
        "rejected",
        reason ||
          "Thank you for your application. We have decided to move forward with another candidate.",
      );

      setApplications((prev) =>
        prev.map((app) =>
          app.$id === application.$id
            ? { ...app, status: "rejected" as const }
            : app,
        ),
      );

      alert("Application rejected successfully. The freelancer has been notified.");
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "accepted":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredAndSortedApplications = applications
    .filter((app) => {
      const matchesTab = activeTab === "all" || app.status === activeTab;
      const matchesSearch = searchTerm === "" || 
        app.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.coverLetter.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
        case "budget_low":
          return a.proposedBudget - b.proposedBudget;
        case "budget_high":
          return b.proposedBudget - a.proposedBudget;
        case "rating":
          return b.freelancerRating - a.freelancerRating;
        default:
          return 0;
      }
    });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="text-gray-400">Loading applications...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Applications</h2>
              <p className="text-gray-400 text-sm">{jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-purple-600/20 text-purple-400 text-sm rounded-full border border-purple-600/30">
              {stats.total} total
            </div>
            {stats.accepted > 0 && (
              <div className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full border border-green-600/30">
                {stats.accepted} accepted
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-600/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-600/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Accepted</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.accepted}</div>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-600/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XIcon className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Rejected</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {[
              { key: "all", label: "All", count: stats.total },
              { key: "pending", label: "Pending", count: stats.pending },
              { key: "accepted", label: "Accepted", count: stats.accepted },
              { key: "rejected", label: "Rejected", count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2",
                  activeTab === tab.key
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                )}
              >
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 bg-gray-700/50 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search freelancers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="budget_low">Lowest Budget</option>
              <option value="budget_high">Highest Budget</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="p-6">
        {filteredAndSortedApplications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAndSortedApplications.map((application) => (
              <div
                key={application.$id}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/30 hover:border-gray-600/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(application.status)
                    )}
                  >
                    {application.status === "pending" && "⏳ Pending"}
                    {application.status === "accepted" && "✅ Accepted"}
                    {application.status === "rejected" && "❌ Rejected"}
                  </span>
                </div>

                {/* Freelancer Info */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    {application.freelancerAvatar ? (
                      <div className="w-16 h-16 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden ring-2 ring-purple-500/20">
                        <img
                          src={application.freelancerAvatar}
                          alt={application.freelancerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl ring-2 ring-purple-500/20">
                        {application.freelancerName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {application.status === "accepted" && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                      <span>{application.freelancerName}</span>
                      {application.freelancerRating >= 4.8 && (
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      )}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{application.freelancerRating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Applied {formatDate(application.$createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget and Duration */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-600/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Proposed Budget</span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {formatCurrency(application.proposedBudget, jobBudget.currency)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Budget: {formatCurrency(jobBudget.min, jobBudget.currency)} - {formatCurrency(jobBudget.max, jobBudget.currency)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-blue-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {application.proposedDuration}
                    </div>
                  </div>
                </div>

                {/* Cover Letter Preview */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-gray-300 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Cover Letter</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-lg p-3 text-gray-300 text-sm line-clamp-3">
                    {application.coverLetter}
                  </div>
                </div>

                {/* Attachments */}
                {application.attachments && application.attachments.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-gray-300 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">
                        Attachments ({application.attachments.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {application.attachments.slice(0, 3).map((attachment, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded border border-gray-600/30"
                        >
                          {attachment}
                        </span>
                      ))}
                      {application.attachments.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                          +{application.attachments.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Client Response */}
                {application.clientResponse && (
                  <div className="mb-4 p-3 bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-600/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-purple-400 mb-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">Client Response</span>
                    </div>
                    <p className="text-gray-300 text-sm italic">
                      "{application.clientResponse}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                  <div className="flex space-x-2">
                    <Link
                      href={`/en/freelancers/${application.freelancerId}`}
                      className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-center text-xs font-medium transition-colors flex items-center space-x-1"
                    >
                      <User className="w-3 h-3" />
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <Link
                      href={`/en/messages?freelancer=${application.freelancerId}&job=${jobId}`}
                      className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-center text-xs font-medium transition-colors flex items-center space-x-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Message</span>
                    </Link>
                  </div>


                  
                  {isClient && application.status === "pending" && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRejectApplication(application)}
                        disabled={actionLoading === application.$id}
                        className="px-3 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-1 disabled:opacity-50 text-xs"
                      >
                        {actionLoading === application.$id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-300"></div>
                        ) : (
                          <XIcon className="w-3 h-3" />
                        )}
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleAcceptApplication(application)}
                        disabled={actionLoading === application.$id}
                        className="px-3 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-1 disabled:opacity-50 text-xs"
                      >
                        {actionLoading === application.$id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-300"></div>
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>Accept</span>
                      </button>
                    </div>
                  )}

                  {application.status === "accepted" && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Accepted</span>
                    </div>
                  )}

                  {application.status === "rejected" && (
                    <div className="flex items-center space-x-2 text-red-400">
                      <XIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Rejected</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-500" />
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === "all"
                ? "No Applications Yet"
                : `No ${activeTab} Applications`}
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {activeTab === "all"
                ? "This job hasn't received any applications yet. Try promoting it or adjusting the requirements."
                : `There are no ${activeTab} applications for this job.`}
            </p>

            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Show All Applications
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
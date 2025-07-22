"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  User,
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
} from "lucide-react";
import { ApplicationsService } from "@/lib/appwrite/jobs";
import { useAuthContext } from "@/contexts/AuthContext";
import Link from "next/link";

interface JobApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: string;
    budget: {
      min: number;
      max: number;
      currency: string;
    };
  };
  onApplicationAccepted: (application: Application) => void;
}

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
}

export default function JobApplicationsModal({
  isOpen,
  onClose,
  job,
  onApplicationAccepted,
}: JobApplicationsModalProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "newest" | "budget_low" | "budget_high" | "rating"
  >("newest");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("pending");

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const jobApplications = await ApplicationsService.getJobApplications(
        job.id,
      );
      const typedApplications: Application[] = jobApplications.map((app) => ({
        $id: app.$id!,
        freelancerId: app.freelancerId,
        freelancerName: app.freelancerName,
        freelancerAvatar: app.freelancerAvatar || "",
        freelancerRating: app.freelancerRating || 4.5,
        coverLetter: app.coverLetter,
        proposedBudget: app.proposedBudget || 0,
        proposedDuration: app.proposedDuration || "",
        status: app.status as "pending" | "accepted" | "rejected",
        attachments: app.attachments || [],
        $createdAt: app.$createdAt!,
      }));
      setApplications(typedApplications);
    } catch (error) {
      console.error("Error loading applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [job.id]);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, loadApplications]);

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

      onApplicationAccepted(application);

      // Show success message
      alert(
        "Application accepted successfully! The freelancer has been notified.",
      );
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

      alert(
        "Application rejected successfully. The freelancer has been notified.",
      );
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

  const sortedAndFilteredApplications = applications
    .filter((app) => filterStatus === "all" || app.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
          );
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Job Applications</h2>
            <p className="text-gray-400 mt-1">
              {job.title} at {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <label className="text-sm text-gray-400 mr-2">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as
                        | "all"
                        | "pending"
                        | "accepted"
                        | "rejected",
                    )
                  }
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">
                    Pending (
                    {applications.filter((a) => a.status === "pending").length})
                  </option>
                  <option value="accepted">
                    Accepted (
                    {applications.filter((a) => a.status === "accepted").length}
                    )
                  </option>
                  <option value="rejected">
                    Rejected (
                    {applications.filter((a) => a.status === "rejected").length}
                    )
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400 mr-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "newest"
                        | "budget_low"
                        | "budget_high"
                        | "rating",
                    )
                  }
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                  <option value="budget_low">Lowest Budget</option>
                  <option value="budget_high">Highest Budget</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              {sortedAndFilteredApplications.length} of {applications.length}{" "}
              applications
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="text-gray-400">Loading applications...</span>
              </div>
            </div>
          ) : sortedAndFilteredApplications.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {sortedAndFilteredApplications.map((application) => (
                <div
                  key={application.$id}
                  className="glass-card p-6 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
                >
                  {/* Application Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative">
                        {application.freelancerAvatar ? (
                          <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center overflow-hidden">
                            <img
                              src={application.freelancerAvatar}
                              alt={application.freelancerName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {application.freelancerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Basic Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {application.freelancerName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>
                              {application.freelancerRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Applied {formatDate(application.$createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}
                    >
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </span>
                  </div>

                  {/* Budget and Duration */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-green-400 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Proposed Budget
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {formatCurrency(
                          application.proposedBudget,
                          job.budget.currency,
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-blue-400 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {application.proposedDuration}
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
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
                  {application.attachments &&
                    application.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 text-gray-300 mb-2">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">
                            Attachments ({application.attachments.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {application.attachments.map((attachment, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded border border-gray-600/30"
                            >
                              {attachment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30">
                    <div className="flex space-x-3">
                      <Link
                        href={`/en/freelancers/${application.freelancerId}`}
                        className="btn-secondary flex items-center space-x-2 text-sm"
                      >
                        <User className="w-4 h-4" />
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <Link
                        href={`/en/messages?freelancer=${application.freelancerId}`}
                        className="btn-secondary flex items-center space-x-2 text-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Message</span>
                      </Link>
                    </div>

                    {application.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRejectApplication(application)}
                          disabled={actionLoading === application.$id}
                          className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {actionLoading === application.$id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-300"></div>
                          ) : (
                            <XIcon className="w-4 h-4" />
                          )}
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleAcceptApplication(application)}
                          disabled={actionLoading === application.$id}
                          className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          {actionLoading === application.$id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span>Accept</span>
                        </button>
                      </div>
                    )}

                    {application.status === "accepted" && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Application Accepted
                        </span>
                      </div>
                    )}

                    {application.status === "rejected" && (
                      <div className="flex items-center space-x-2 text-red-400">
                        <XIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Application Rejected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-gray-500" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {filterStatus === "all"
                  ? "No Applications Yet"
                  : `No ${filterStatus} Applications`}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {filterStatus === "all"
                  ? "Your job posting hasn't received any applications yet. Try promoting it or adjusting the requirements."
                  : `There are no ${filterStatus} applications for this job.`}
              </p>

              {filterStatus !== "all" && (
                <button
                  onClick={() => setFilterStatus("all")}
                  className="btn-primary"
                >
                  Show All Applications
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {sortedAndFilteredApplications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Manage your job applications efficiently
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Award className="w-4 h-4" />
                <span>Choose the best candidate for your project</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

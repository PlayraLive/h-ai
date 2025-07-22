"use client";

import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Briefcase,
  Calendar,
  DollarSign,
  Eye,
  ExternalLink,
} from "lucide-react";
import { JobsService } from "@/lib/appwrite/jobs";
import { useAuthContext } from "@/contexts/AuthContext";
import Link from "next/link";

interface UserJobsModalProps {
  isOpen: boolean;
  onClose: () => void;
  freelancerId?: string;
  freelancerName?: string;
}

interface Job {
  $id: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deadline: string;
  status: string;
  applicationsCount: number;
  $createdAt: string;
}

export default function UserJobsModal({
  isOpen,
  onClose,
  freelancerId,
  freelancerName,
}: UserJobsModalProps) {
  const { user } = useAuthContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadUserJobs();
    }
  }, [isOpen, user]);

  const loadUserJobs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userJobs = await JobsService.getJobsByClient(user.$id);
      // Filter only active jobs and convert to Job interface
      const activeJobs = userJobs
        .filter((job) => job.status === "active" && job.$id)
        .map((job) => ({
          $id: job.$id!,
          title: job.title,
          description: job.description,
          category: job.category,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          currency: job.currency || "USD",
          deadline: job.deadline,
          status: job.status,
          applicationsCount: job.applicationsCount || 0,
          $createdAt: job.$createdAt || new Date().toISOString(),
        }));
      setJobs(activeJobs);
    } catch (error) {
      console.error("Error loading user jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (min: number, max: number, currency: string = "USD") => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    });

    if (min === max) {
      return formatter.format(min);
    }
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleInviteToJob = (jobId: string) => {
    setSelectedJobId(jobId);
    // Here you would typically send an invitation to the freelancer
    // For now, we'll just close the modal
    setTimeout(() => {
      onClose();
      // Show success message
      alert(
        `Invitation sent to ${freelancerName || "freelancer"} for the selected job!`,
      );
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Active Jobs</h2>
            <p className="text-gray-400 mt-1">
              {freelancerName
                ? `Select a job to invite ${freelancerName}`
                : "Choose from your active job postings"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                <span className="text-gray-400">Loading your jobs...</span>
              </div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {jobs.map((job) => (
                <div
                  key={job.$id}
                  className={`glass-card p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedJobId === job.$id
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-gray-700/30 hover:border-gray-600/50 hover:bg-gray-800/30"
                  }`}
                  onClick={() => setSelectedJobId(job.$id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {job.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {job.description}
                      </p>
                    </div>

                    {selectedJobId === job.$id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {formatBudget(
                          job.budgetMin,
                          job.budgetMax,
                          job.currency,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {formatDate(job.deadline)}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{job.applicationsCount} applications</span>
                    </div>

                    <span className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs">
                      {job.category}
                    </span>
                  </div>

                  {selectedJobId === job.$id && (
                    <div className="mt-4 pt-4 border-t border-gray-700/30">
                      <div className="flex space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInviteToJob(job.$id);
                          }}
                          className="flex-1 btn-primary flex items-center justify-center space-x-2"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>Invite to This Job</span>
                        </button>

                        <Link
                          href={`/en/jobs/${job.$id}`}
                          className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-gray-500" />
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                No Active Jobs Found
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                You don&apos;t have any active job postings yet. Create your
                first job to start hiring talented freelancers!
              </p>

              <Link
                href="/en/jobs/create"
                onClick={onClose}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Your First Job</span>
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {jobs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {jobs.length} active job{jobs.length !== 1 ? "s" : ""} found
              </div>

              <div className="flex space-x-3">
                <Link
                  href="/en/jobs/create"
                  onClick={onClose}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Job</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

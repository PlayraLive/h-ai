"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Calendar,
  Award,
} from "lucide-react";
import { ApplicationsService } from "@/lib/appwrite/jobs";
import { parseAttachments } from "@/lib/utils";

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

interface ApplicationsStatsProps {
  jobId: string;
  jobBudget: {
    min: number;
    max: number;
    currency: string;
  };
}

export default function ApplicationsStats({ jobId, jobBudget }: ApplicationsStatsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("all");

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const jobApplications = await ApplicationsService.getJobApplications(jobId);
      const typedApplications: Application[] = jobApplications.map((app) => {
        try {
          return {
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

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFilteredApplications = () => {
    const now = new Date();
    const filtered = applications.filter(app => {
      const appDate = new Date(app.$createdAt);
      switch (timeRange) {
        case "7d":
          return (now.getTime() - appDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        case "30d":
          return (now.getTime() - appDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
    return filtered;
  };

  const calculateStats = () => {
    const filteredApps = getFilteredApplications();
    
    const total = filteredApps.length;
    const pending = filteredApps.filter(a => a.status === "pending").length;
    const accepted = filteredApps.filter(a => a.status === "accepted").length;
    const rejected = filteredApps.filter(a => a.status === "rejected").length;
    
    const avgBudget = filteredApps.length > 0 
      ? filteredApps.reduce((sum, app) => sum + app.proposedBudget, 0) / filteredApps.length 
      : 0;
    
    const avgRating = filteredApps.length > 0 
      ? filteredApps.reduce((sum, app) => sum + app.freelancerRating, 0) / filteredApps.length 
      : 0;
    
    const budgetRange = {
      min: filteredApps.length > 0 ? Math.min(...filteredApps.map(a => a.proposedBudget)) : 0,
      max: filteredApps.length > 0 ? Math.max(...filteredApps.map(a => a.proposedBudget)) : 0,
    };

    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;
    const responseRate = total > 0 ? ((accepted + rejected) / total) * 100 : 0;

    return {
      total,
      pending,
      accepted,
      rejected,
      avgBudget,
      avgRating,
      budgetRange,
      acceptanceRate,
      responseRate,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="text-gray-400">Loading statistics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Applications Analytics</h3>
              <p className="text-gray-400 text-sm">Detailed insights about your applications</p>
            </div>
          </div>
          
          {/* Time Range Filter */}
          <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
            {[
              { key: "7d", label: "7 Days" },
              { key: "30d", label: "30 Days" },
              { key: "all", label: "All Time" },
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => setTimeRange(range.key as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeRange === range.key
                    ? "bg-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Applications */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Total</span>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1">Applications received</div>
          </div>

          {/* Pending Applications */}
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-600/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Pending</span>
              </div>
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
            <div className="text-xs text-gray-400 mt-1">Awaiting review</div>
          </div>

          {/* Accepted Applications */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-600/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">Accepted</span>
              </div>
              <Award className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.accepted}</div>
            <div className="text-xs text-gray-400 mt-1">Successfully hired</div>
          </div>

          {/* Rejected Applications */}
          <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-600/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Rejected</span>
              </div>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.rejected}</div>
            <div className="text-xs text-gray-400 mt-1">Not selected</div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Analysis */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-400" />
              Budget Analysis
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Average Budget</span>
                <span className="text-white font-semibold">
                  {formatCurrency(stats.avgBudget, jobBudget.currency)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Budget Range</span>
                <span className="text-white font-semibold">
                  {formatCurrency(stats.budgetRange.min, jobBudget.currency)} - {formatCurrency(stats.budgetRange.max, jobBudget.currency)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Your Budget</span>
                <span className="text-white font-semibold">
                  {formatCurrency(jobBudget.min, jobBudget.currency)} - {formatCurrency(jobBudget.max, jobBudget.currency)}
                </span>
              </div>
              
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (stats.avgBudget / jobBudget.max) * 100)}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Average vs Your Budget
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
              Performance Metrics
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Acceptance Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{stats.acceptanceRate.toFixed(1)}%</span>
                  <div className="w-16 bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.acceptanceRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response Rate</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{stats.responseRate.toFixed(1)}%</span>
                  <div className="w-16 bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.responseRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">{stats.avgRating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Time Range</span>
                <span className="text-white font-semibold capitalize">{timeRange}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        {stats.total > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-600/20 rounded-xl">
            <h4 className="text-md font-semibold text-white mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2 text-purple-400" />
              Quick Insights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">
                  {stats.acceptanceRate > 20 ? "High" : stats.acceptanceRate > 10 ? "Good" : "Low"} acceptance rate
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">
                  {stats.avgBudget > jobBudget.max ? "Above" : stats.avgBudget < jobBudget.min ? "Below" : "Within"} budget range
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">
                  {stats.avgRating >= 4.5 ? "Excellent" : stats.avgRating >= 4.0 ? "Good" : "Average"} freelancer quality
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">
                  {stats.pending > 0 ? `${stats.pending} pending` : "All applications reviewed"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
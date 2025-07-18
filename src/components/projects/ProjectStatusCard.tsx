'use client';

import React from 'react';
import Link from 'next/link';
import { ProjectStatus, ProjectApplication } from '@/lib/appwrite/projects';

// Try to import from Heroicons, fallback to simple icons
let ClockIcon, CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, EyeIcon, MessageCircleIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  ClockIcon = heroicons.ClockIcon;
  CheckCircleIcon = heroicons.CheckCircleIcon;
  XCircleIcon = heroicons.XCircleIcon;
  CurrencyDollarIcon = heroicons.CurrencyDollarIcon;
  EyeIcon = heroicons.EyeIcon;
  MessageCircleIcon = heroicons.ChatBubbleLeftIcon;
} catch {
  ClockIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  XCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  CurrencyDollarIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
  EyeIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  MessageCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

interface Project {
  $id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  duration: string;
  status: ProjectStatus;
  clientId: string;
  clientName: string;
  assignedFreelancerId?: string;
  assignedFreelancerName?: string;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  paidAt?: string;
}

interface ProjectStatusCardProps {
  project: Project;
  userRole: 'client' | 'freelancer';
  applications?: ProjectApplication[];
  onStatusUpdate?: (projectId: string, newStatus: ProjectStatus) => void;
}

export default function ProjectStatusCard({ 
  project, 
  userRole, 
  applications = [],
  onStatusUpdate 
}: ProjectStatusCardProps) {
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'posted':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'applied':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'assigned':
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'review':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'cancelled':
      case 'disputed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'posted':
      case 'applied':
        return <ClockIcon className="w-4 h-4" />;
      case 'completed':
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled':
      case 'disputed':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case 'posted':
        return 'Open for Applications';
      case 'applied':
        return `${project.applicationsCount} Applications`;
      case 'assigned':
        return 'Assigned';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Under Review';
      case 'revision':
        return 'Needs Revision';
      case 'completed':
        return 'Completed';
      case 'paid':
        return 'Paid';
      case 'cancelled':
        return 'Cancelled';
      case 'disputed':
        return 'Disputed';
      default:
        return status;
    }
  };

  const canUpdateStatus = (currentStatus: ProjectStatus, userRole: 'client' | 'freelancer') => {
    if (userRole === 'client') {
      return ['applied', 'in_progress', 'review', 'completed'].includes(currentStatus);
    } else {
      return ['assigned', 'review'].includes(currentStatus);
    }
  };

  const getNextStatus = (currentStatus: ProjectStatus, userRole: 'client' | 'freelancer') => {
    if (userRole === 'client') {
      switch (currentStatus) {
        case 'applied':
          return 'assigned';
        case 'review':
          return 'completed';
        case 'completed':
          return 'paid';
        default:
          return currentStatus;
      }
    } else {
      switch (currentStatus) {
        case 'assigned':
          return 'in_progress';
        case 'in_progress':
          return 'review';
        default:
          return currentStatus;
      }
    }
  };

  const handleStatusUpdate = () => {
    if (onStatusUpdate && canUpdateStatus(project.status, userRole)) {
      const nextStatus = getNextStatus(project.status, userRole);
      onStatusUpdate(project.$id, nextStatus);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate mb-1">
            {project.title}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2">
            {project.description}
          </p>
        </div>
        
        <div className={`ml-4 px-3 py-1 rounded-full border text-xs font-medium flex items-center space-x-1 ${getStatusColor(project.status)}`}>
          {getStatusIcon(project.status)}
          <span>{getStatusText(project.status)}</span>
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Budget:</span>
          <div className="text-white font-medium">
            ${project.budget} {project.budgetType}
          </div>
        </div>
        <div>
          <span className="text-gray-400">Duration:</span>
          <div className="text-white font-medium">{project.duration}</div>
        </div>
        <div>
          <span className="text-gray-400">Category:</span>
          <div className="text-white font-medium">{project.category}</div>
        </div>
        <div>
          <span className="text-gray-400">Created:</span>
          <div className="text-white font-medium">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Assigned Freelancer (for clients) */}
      {userRole === 'client' && project.assignedFreelancerName && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Assigned Freelancer:</div>
          <div className="text-white font-medium">{project.assignedFreelancerName}</div>
        </div>
      )}

      {/* Client Info (for freelancers) */}
      {userRole === 'freelancer' && (
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Client:</div>
          <div className="text-white font-medium">{project.clientName}</div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <Link
          href={`/en/jobs/${project.$id}`}
          className="flex-1 btn-secondary text-center flex items-center justify-center space-x-2"
        >
          <EyeIcon className="w-4 h-4" />
          <span>View Details</span>
        </Link>

        {/* Status Update Button */}
        {canUpdateStatus(project.status, userRole) && (
          <button
            onClick={handleStatusUpdate}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>
              {userRole === 'client' && project.status === 'applied' && 'Review Applications'}
              {userRole === 'client' && project.status === 'review' && 'Approve Work'}
              {userRole === 'client' && project.status === 'completed' && 'Release Payment'}
              {userRole === 'freelancer' && project.status === 'assigned' && 'Start Work'}
              {userRole === 'freelancer' && project.status === 'in_progress' && 'Submit for Review'}
            </span>
          </button>
        )}

        {/* Message Button */}
        {project.assignedFreelancerId && (
          <Link
            href={`/en/messages?project=${project.$id}`}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <MessageCircleIcon className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Project Progress</span>
          <span>
            {project.status === 'paid' ? '100%' : 
             project.status === 'completed' ? '90%' :
             project.status === 'review' ? '80%' :
             project.status === 'in_progress' ? '60%' :
             project.status === 'assigned' ? '40%' :
             project.status === 'applied' ? '20%' : '10%'}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              project.status === 'paid' ? 'bg-emerald-500 w-full' :
              project.status === 'completed' ? 'bg-green-500 w-[90%]' :
              project.status === 'review' ? 'bg-orange-500 w-[80%]' :
              project.status === 'in_progress' ? 'bg-purple-500 w-[60%]' :
              project.status === 'assigned' ? 'bg-blue-500 w-[40%]' :
              project.status === 'applied' ? 'bg-yellow-500 w-[20%]' : 'bg-gray-500 w-[10%]'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

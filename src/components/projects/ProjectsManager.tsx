'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProjectService, Project, ProjectStatus } from '@/lib/appwrite/projects';
import ProjectStatusCard from './ProjectStatusCard';

// Try to import from Heroicons, fallback to simple icons
let PlusIcon, FunnelIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  PlusIcon = heroicons.PlusIcon;
  FunnelIcon = heroicons.FunnelIcon;
} catch {
  PlusIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
  FunnelIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
    </svg>
  );
}

interface ProjectsManagerProps {
  userRole: 'client' | 'freelancer';
  title?: string;
  showCreateButton?: boolean;
}

export default function ProjectsManager({ 
  userRole, 
  title = "My Projects",
  showCreateButton = true 
}: ProjectsManagerProps) {
  const { user } = useAuthContext();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        setLoading(true);
        
        const filters: any = {};
        
        if (userRole === 'client') {
          filters.clientId = user.$id;
        } else {
          filters.assignedFreelancerId = user.$id;
        }
        
        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }

        const { projects: loadedProjects } = await ProjectService.getProjects(filters, 50);
        setProjects(loadedProjects);
        
      } catch (error) {
        console.error('Error loading projects:', error);
        // For demo purposes, show mock data
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user, userRole, statusFilter]);

  const handleStatusUpdate = async (projectId: string, newStatus: ProjectStatus) => {
    if (!user) return;

    try {
      await ProjectService.updateProjectStatus(projectId, newStatus, user.$id);
      
      // Update local state
      setProjects(prev => prev.map(project => 
        project.$id === projectId 
          ? { ...project, status: newStatus, updatedAt: new Date().toISOString() }
          : project
      ));
      
      // Show success message
      alert(`Project status updated to ${newStatus}`);
      
    } catch (error: any) {
      console.error('Error updating project status:', error);
      alert(`Failed to update project status: ${error.message}`);
    }
  };

  const statusOptions: { value: ProjectStatus | 'all'; label: string; count?: number }[] = [
    { value: 'all', label: 'All Projects', count: projects.length },
    { value: 'posted', label: 'Open', count: projects.filter(p => p.status === 'posted').length },
    { value: 'applied', label: 'Applications', count: projects.filter(p => p.status === 'applied').length },
    { value: 'in_progress', label: 'In Progress', count: projects.filter(p => p.status === 'in_progress').length },
    { value: 'review', label: 'Review', count: projects.filter(p => p.status === 'review').length },
    { value: 'completed', label: 'Completed', count: projects.filter(p => p.status === 'completed').length },
    { value: 'paid', label: 'Paid', count: projects.filter(p => p.status === 'paid').length },
  ];

  const filteredProjects = statusFilter === 'all' 
    ? projects 
    : projects.filter(project => project.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-pulse">
              <div className="h-4 bg-gray-600 rounded mb-4"></div>
              <div className="h-3 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-3 bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        
        <div className="flex items-center space-x-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </option>
              ))}
            </select>
          </div>

          {/* Create Project Button (for clients) */}
          {showCreateButton && userRole === 'client' && (
            <button className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Post Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            {statusFilter === 'all' 
              ? `No projects found`
              : `No ${statusFilter} projects`
            }
          </div>
          <div className="text-gray-500 text-sm">
            {userRole === 'client' 
              ? "Start by posting your first project to find talented freelancers."
              : "Apply to projects to see them here when you're hired."
            }
          </div>
          {userRole === 'client' && (
            <button className="mt-6 btn-primary flex items-center space-x-2 mx-auto">
              <PlusIcon className="w-5 h-5" />
              <span>Post Your First Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectStatusCard
              key={project.$id}
              project={project}
              userRole={userRole}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-gray-400 text-sm">Total Projects</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-blue-400">
              {projects.filter(p => ['in_progress', 'review'].includes(p.status)).length}
            </div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-green-400">
              {projects.filter(p => ['completed', 'paid'].includes(p.status)).length}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl font-bold text-yellow-400">
              ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total Value</div>
          </div>
        </div>
      )}
    </div>
  );
}

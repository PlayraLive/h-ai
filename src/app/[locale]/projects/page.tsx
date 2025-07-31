'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  FileText,
  MessageCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  spent: number;
  progress: number;
  deadline: string;
  createdAt: string;
  client: {
    name: string;
    avatar: string;
    company: string;
  };
  freelancer?: {
    name: string;
    avatar: string;
    rating: number;
  };
  category: string;
  tags: string[];
  milestones: number;
  completedMilestones: number;
  lastActivity: string;
}

export default function ProjectsPage() {
  const { success } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Mock data
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'AI-Powered E-commerce Platform',
        description: 'Complete redesign and development of an e-commerce platform with AI-driven product recommendations and personalized shopping experience.',
        status: 'active',
        priority: 'high',
        budget: 15000,
        spent: 8500,
        progress: 65,
        deadline: '2024-03-15',
        createdAt: '2024-01-10',
        client: {
          name: 'Sarah Johnson',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          company: 'TechFlow Solutions'
        },
        freelancer: {
          name: 'Alex Chen',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          rating: 4.9
        },
        category: 'Web Development',
        tags: ['React', 'AI/ML', 'E-commerce', 'API'],
        milestones: 5,
        completedMilestones: 3,
        lastActivity: '2024-01-14T10:30:00Z'
      },
      {
        id: '2',
        title: 'Brand Identity Design',
        description: 'Complete brand identity package including logo, color palette, typography, and brand guidelines for a tech startup.',
        status: 'completed',
        priority: 'medium',
        budget: 3500,
        spent: 3200,
        progress: 100,
        deadline: '2024-01-20',
        createdAt: '2023-12-15',
        client: {
          name: 'Mike Davis',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          company: 'InnovateLab'
        },
        freelancer: {
          name: 'Emma Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          rating: 4.8
        },
        category: 'Design',
        tags: ['Branding', 'Logo Design', 'Figma', 'Adobe'],
        milestones: 3,
        completedMilestones: 3,
        lastActivity: '2024-01-20T15:45:00Z'
      },
      {
        id: '3',
        title: 'Mobile App Development',
        description: 'Native iOS and Android app development for a fitness tracking application with social features.',
        status: 'paused',
        priority: 'low',
        budget: 25000,
        spent: 12000,
        progress: 40,
        deadline: '2024-04-30',
        createdAt: '2023-11-20',
        client: {
          name: 'Lisa Chen',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
          company: 'FitTech Inc.'
        },
        category: 'Mobile Development',
        tags: ['React Native', 'iOS', 'Android', 'Firebase'],
        milestones: 6,
        completedMilestones: 2,
        lastActivity: '2024-01-05T09:15:00Z'
      }
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);





  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    success('Project Deleted', 'Project has been successfully deleted');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <TopNav />

      <div className="w-full pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-[#2A1A3E] border-b border-gray-700/50 p-4 md:p-6 lg:p-8 overflow-hidden rounded-t-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>

              <div className="relative flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Projects</h1>
                  <p className="text-gray-400">Manage and track your ongoing projects</p>
                </div>

                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <Link
                    href="/en/projects/create"
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span>New Project</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 mb-8">
              <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-xs md:text-sm">Total Projects</p>
                    <p className="text-xl md:text-2xl font-bold text-white">{projects.length}</p>
                    <p className="text-purple-400 text-xs md:text-sm">All time</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-xs md:text-sm">Active</p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {projects.filter(p => p.status === 'active').length}
                    </p>
                    <p className="text-green-400 text-xs md:text-sm">In progress</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-white">
                      {projects.filter(p => p.status === 'completed').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Budget</p>
                    <p className="text-2xl font-bold text-white">
                      ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-6 rounded-2xl mb-8">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-field pl-10 w-full"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* View Mode */}
                <div className="flex bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm transition-colors',
                      viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                    )}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm transition-colors',
                      viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                    )}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
              <div className="glass-card p-12 rounded-2xl text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your filters to see more projects.'
                    : 'Get started by creating your first project.'}
                </p>
                <Link href="/en/jobs/create" className="btn-primary">
                  Create Project
                </Link>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    viewMode={viewMode}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
}

function ProjectCard({ project, viewMode, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/20';
      case 'paused': return 'text-yellow-400 bg-yellow-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-400/20';
      case 'high': return 'text-orange-400 bg-orange-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <PauseCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1', getStatusColor(project.status))}>
                  {getStatusIcon(project.status)}
                  <span className="capitalize">{project.status}</span>
                </span>
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', getPriorityColor(project.priority))}>
                  {project.priority}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-2 line-clamp-1">{project.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
                <span>{project.progress}% complete</span>
                <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {project.freelancer && (
              <div className="flex items-center space-x-2">
                <img
                  src={project.freelancer.avatar}
                  alt={project.freelancer.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-sm">
                  <p className="text-white">{project.freelancer.name}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-gray-400">{project.freelancer.rating}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
                  <Link
                    href={`/en/projects/${project.id}`}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                  <Link
                    href={`/en/projects/${project.id}/edit`}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Project</span>
                  </Link>
                  <Link
                    href={`/en/messages?project=${project.id}`}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Messages</span>
                  </Link>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="flex items-center space-x-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors w-full text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1', getStatusColor(project.status))}>
            {getStatusIcon(project.status)}
            <span className="capitalize">{project.status}</span>
          </span>
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium capitalize', getPriorityColor(project.priority))}>
            {project.priority}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
              <Link
                href={`/en/projects/${project.id}`}
                className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </Link>
              <Link
                href={`/en/projects/${project.id}/edit`}
                className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Project</span>
              </Link>
              <Link
                href={`/en/messages?project=${project.id}`}
                className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Messages</span>
              </Link>
              <button
                onClick={() => onDelete(project.id)}
                className="flex items-center space-x-2 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors w-full text-left"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
        {project.title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

      {/* Client & Freelancer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <img
            src={project.client.avatar}
            alt={project.client.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="text-white">{project.client.name}</p>
            <p className="text-gray-400">{project.client.company}</p>
          </div>
        </div>
        
        {project.freelancer && (
          <div className="flex items-center space-x-2">
            <img
              src={project.freelancer.avatar}
              alt={project.freelancer.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-sm text-right">
              <p className="text-white">{project.freelancer.name}</p>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-gray-400">{project.freelancer.rating}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Budget & Deadline */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-1 text-green-400">
          <DollarSign className="w-4 h-4" />
          <span>${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(project.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {project.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
        {project.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-full">
            +{project.tags.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

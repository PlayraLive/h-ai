'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Progress,
  MessageCircle,
  FileText,
  Target,
  Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { projectService, ActiveProject, ProjectMessage, ProjectFile, ProjectMilestone } from '@/services/project';
import { cn } from '@/lib/utils';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ActiveProject | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const projectId = params.id as string;

  useEffect(() => {
    if (projectId && user) {
      loadProjectData();
    }
  }, [projectId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Загружаем данные проекта
      const [projectData, messagesData, filesData, milestonesData] = await Promise.all([
        projectService.getActiveProject(projectId),
        projectService.getProjectMessages(projectId),
        projectService.getProjectFiles(projectId),
        projectService.getProjectMilestones(projectId)
      ]);

      setProject(projectData);
      setMessages(messagesData);
      setFiles(filesData);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !project) return;

    try {
      const receiverId = user.$id === project.freelancerId ? project.clientId : project.freelancerId;
      
      await projectService.sendProjectMessage({
        projectId,
        senderId: user.$id!,
        receiverId,
        message: newMessage,
        messageType: 'text',
        read: false,
        timestamp: new Date().toISOString()
      });

      setNewMessage('');
      loadProjectData(); // Перезагружаем сообщения
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      await projectService.uploadProjectFile(
        file,
        projectId,
        user.$id!,
        'general',
        `Uploaded by ${user.name}`
      );
      
      loadProjectData(); // Перезагружаем файлы
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleApproveFile = async (fileId: string, approved: boolean, feedback?: string) => {
    try {
      await projectService.approveFile(fileId, approved, feedback);
      loadProjectData(); // Перезагружаем файлы
    } catch (error) {
      console.error('Error approving file:', error);
    }
  };

  const isClient = user && project && user.$id === project.clientId;
  const isFreelancer = user && project && user.$id === project.freelancerId;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading project workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Project Not Found</h1>
            <p className="text-gray-400 mb-6">The project you're looking for doesn't exist.</p>
            <Link 
              href="/en/projects" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
            >
              Back to Projects
            </Link>
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
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/en/projects"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Projects</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className={cn(
                'px-3 py-1 rounded-full text-sm font-medium',
                project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                project.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              )}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">{project.title}</h1>
                <p className="text-gray-400 mb-4">{project.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">${project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">{project.progress}% Complete</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0">
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-400">{project.progress}%</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="border-b border-gray-700/50">
              <nav className="flex space-x-1 overflow-x-auto scrollbar-hide px-4 md:px-6">
                {[
                  { id: 'chat', label: 'Chat', icon: MessageCircle },
                  { id: 'files', label: 'Files', icon: FileText },
                  { id: 'milestones', label: 'Milestones', icon: Target }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center space-x-2 py-4 px-3 md:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'chat' && (
                <div className="space-y-6">
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-800/30 rounded-xl">
                    {messages.map((message) => (
                      <div
                        key={message.$id}
                        className={cn(
                          'flex',
                          message.senderId === user?.$id ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                            message.senderId === user?.$id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                          )}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-3 bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Files</h3>
                    <p className="text-gray-400 mb-4">Drag and drop files here or click to browse</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Choose Files'}
                    </button>
                  </div>

                  {/* Files List */}
                  <div className="space-y-4">
                    {files.map((file) => (
                      <div key={file.$id} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{file.fileName}</h4>
                              <p className="text-sm text-gray-400">
                                {(file.fileSize / 1024 / 1024).toFixed(2)} MB • {file.category}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {file.approved ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-400" />
                            )}
                            
                            <button
                              onClick={() => window.open(projectService.getFileUrl(file.fileUrl), '_blank')}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => window.open(projectService.getFileDownloadUrl(file.fileUrl), '_blank')}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            
                            {isClient && !file.approved && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleApproveFile(file.$id!, true)}
                                  className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleApproveFile(file.$id!, false, 'Needs revision')}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {file.description && (
                          <p className="text-sm text-gray-300 mt-2">{file.description}</p>
                        )}
                        
                        {file.feedback && (
                          <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm text-yellow-400">Feedback: {file.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'milestones' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Milestones</h3>
                    <p className="text-gray-400">Project milestones will be displayed here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

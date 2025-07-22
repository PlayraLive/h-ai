'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  User,
  Briefcase,
  FileText,
  DollarSign,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { InvitationsService, InvitationDocument } from '@/lib/appwrite/invitations';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export default function InvitationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, initializing } = useAuthContext();
  const { success, error } = useToast();

  const [invitations, setInvitations] = useState<InvitationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined' | 'expired' | 'all'>('pending');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [currentInvitation, setCurrentInvitation] = useState<InvitationDocument | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseType, setResponseType] = useState<'accepted' | 'declined'>('accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    if (isAuthenticated && user) {
      loadInvitations();
    } else if (!initializing && !isAuthenticated) {
      router.push('/en/login?redirect=/invitations');
    }
  }, [isAuthenticated, initializing, user, activeTab]);

  const loadInvitations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let result: InvitationDocument[];

      if (activeTab === 'all') {
        result = await InvitationsService.getFreelancerInvitations(user.$id);
      } else {
        result = await InvitationsService.getFreelancerInvitations(user.$id, activeTab);
      }

      setInvitations(result);
    } catch (err) {
      console.error('Error loading invitations:', err);
      error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/en/jobs/${jobId}`);
  };

  const handleViewClient = (clientId: string) => {
    router.push(`/en/profile/${clientId}`);
  };

  const handleOpenResponseModal = (invitation: InvitationDocument) => {
    setCurrentInvitation(invitation);
    setResponseMessage('');
    setResponseType('accepted');
    setShowResponseModal(true);
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setCurrentInvitation(null);
  };

  const handleRespond = async () => {
    if (!currentInvitation) return;

    try {
      await InvitationsService.updateInvitationStatus(
        currentInvitation.$id!,
        responseType,
        responseMessage
      );

      success(`Invitation ${responseType} successfully!`);
      handleCloseResponseModal();
      loadInvitations();
    } catch (err) {
      console.error('Error responding to invitation:', err);
      error('Failed to respond to invitation');
    }
  };

  // Filter invitations based on search query
  const filteredInvitations = invitations.filter(invitation =>
    invitation.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invitation.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort invitations
  const sortedInvitations = [...filteredInvitations].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.invitedAt).getTime() - new Date(a.invitedAt).getTime();
    } else {
      return new Date(a.invitedAt).getTime() - new Date(b.invitedAt).getTime();
    }
  });

  // Count invitations by status
  const counts = {
    all: invitations.length,
    pending: invitations.filter(inv => inv.status === 'pending').length,
    accepted: invitations.filter(inv => inv.status === 'accepted').length,
    declined: invitations.filter(inv => inv.status === 'declined').length,
    expired: invitations.filter(inv => inv.status === 'expired').length
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate time remaining for pending invitations
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffTime = expiration.getTime() - now.getTime();

    if (diffTime <= 0) return 'Expired';

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-0 main-content">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Job Invitations</h1>
              <p className="text-gray-400 mt-2">
                Manage invitations from clients to work on their projects
              </p>
            </div>

            {/* Search and Filter */}
            <div className="glass-card p-6 rounded-2xl mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by job title or client name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as 'newest' | 'oldest')}
                      className="bg-gray-800 border border-gray-700 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-purple-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex space-x-1 bg-gray-800/30 rounded-lg p-1 mb-6 overflow-x-auto">
              {[
                { id: 'pending', label: 'Pending', count: counts.pending },
                { id: 'accepted', label: 'Accepted', count: counts.accepted },
                { id: 'declined', label: 'Declined', count: counts.declined },
                { id: 'expired', label: 'Expired', count: counts.expired },
                { id: 'all', label: 'All', count: counts.all }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-gray-600'
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Invitations List */}
            <div className="space-y-4">
              {loading ? (
                // Loading state
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-300">Loading invitations...</span>
                </div>
              ) : sortedInvitations.length === 0 ? (
                // Empty state
                <div className="glass-card p-12 rounded-2xl text-center">
                  <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No invitations found</h3>
                  <p className="text-gray-400 mb-6">
                    {activeTab === 'all'
                      ? "You haven't received any job invitations yet"
                      : `You have no ${activeTab} invitations`}
                  </p>
                  <button
                    onClick={() => router.push('/en/jobs')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Browse Available Jobs
                  </button>
                </div>
              ) : (
                // Invitations list
                sortedInvitations.map((invitation) => (
                  <div
                    key={invitation.$id}
                    className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Status indicator */}
                      <div className="md:w-48 flex-shrink-0">
                        <div className={cn(
                          'rounded-lg px-4 py-3 text-center',
                          invitation.status === 'pending' && 'bg-blue-600/20 border border-blue-500/30',
                          invitation.status === 'accepted' && 'bg-green-600/20 border border-green-500/30',
                          invitation.status === 'declined' && 'bg-red-600/20 border border-red-500/30',
                          invitation.status === 'expired' && 'bg-gray-600/20 border border-gray-500/30',
                        )}>
                          <div className="flex items-center justify-center mb-2">
                            {invitation.status === 'pending' && <Clock className="w-6 h-6 text-blue-400" />}
                            {invitation.status === 'accepted' && <CheckCircle className="w-6 h-6 text-green-400" />}
                            {invitation.status === 'declined' && <XCircle className="w-6 h-6 text-red-400" />}
                            {invitation.status === 'expired' && <AlertCircle className="w-6 h-6 text-gray-400" />}
                          </div>
                          <div className={cn(
                            'font-medium',
                            invitation.status === 'pending' && 'text-blue-400',
                            invitation.status === 'accepted' && 'text-green-400',
                            invitation.status === 'declined' && 'text-red-400',
                            invitation.status === 'expired' && 'text-gray-400',
                          )}>
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </div>

                          {invitation.status === 'pending' && (
                            <div className="text-xs text-gray-400 mt-1">
                              {getTimeRemaining(invitation.expiresAt)}
                            </div>
                          )}

                          {invitation.respondedAt && invitation.status !== 'pending' && (
                            <div className="text-xs text-gray-400 mt-1">
                              Responded {formatDate(invitation.respondedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Invitation details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                          <h3 className="text-xl font-semibold text-white">
                            {invitation.jobTitle}
                          </h3>
                          <div className="text-sm text-gray-400">
                            Invited {formatDate(invitation.invitedAt)}
                          </div>
                        </div>

                        <div className="flex items-center text-gray-300 text-sm mb-4">
                          <User className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="mr-4">{invitation.clientName}</span>

                          {invitation.message && (
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-1 text-gray-400" />
                              <span>Message included</span>
                            </div>
                          )}
                        </div>

                        {invitation.message && (
                          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 mb-4">
                            <p className="text-gray-300 text-sm italic">"{invitation.message}"</p>
                          </div>
                        )}

                        {/* Match score and reasons if AI matched */}
                        {invitation.metadata?.aiRecommended && invitation.matchScore && (
                          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30 mb-4">
                            <div className="flex items-center mb-2">
                              <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                              <span className="text-purple-300 font-medium">
                                {Math.round(invitation.matchScore * 100)}% match for your skills
                              </span>
                            </div>
                            {invitation.matchReasons && invitation.matchReasons.length > 0 && (
                              <ul className="text-xs text-gray-300 list-disc list-inside">
                                {invitation.matchReasons.map((reason, index) => (
                                  <li key={index}>{reason}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() => handleViewJob(invitation.jobId)}
                            className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Job</span>
                          </button>

                          <button
                            onClick={() => handleViewClient(invitation.clientId)}
                            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>View Client</span>
                          </button>

                          {invitation.status === 'pending' && (
                            <div className="flex gap-3 ml-auto">
                              <button
                                onClick={() => {
                                  setCurrentInvitation(invitation);
                                  setResponseType('accepted');
                                  handleOpenResponseModal(invitation);
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                              >
                                Accept
                              </button>

                              <button
                                onClick={() => {
                                  setCurrentInvitation(invitation);
                                  setResponseType('declined');
                                  handleOpenResponseModal(invitation);
                                }}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && currentInvitation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A2E] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  {responseType === 'accepted' ? (
                    <>
                      <CheckCircle className="w-6 h-6 mr-3 text-green-400" />
                      Accept Invitation
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 mr-3 text-red-400" />
                      Decline Invitation
                    </>
                  )}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {responseType === 'accepted'
                    ? "You're accepting the invitation to work on:"
                    : "You're declining the invitation to work on:"}
                  <span className="font-medium text-white"> {currentInvitation.jobTitle}</span>
                </p>
              </div>
              <button
                onClick={handleCloseResponseModal}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  Message to client (optional)
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={responseType === 'accepted'
                    ? "Thank you for the invitation. I'm excited to work on this project..."
                    : "Thank you for considering me, but I'm unable to accept this project because..."}
                  className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between space-x-4">
                <button
                  onClick={handleCloseResponseModal}
                  className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRespond}
                  className={`flex-1 px-4 py-3 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    responseType === 'accepted'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {responseType === 'accepted' ? 'Accept Invitation' : 'Decline Invitation'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

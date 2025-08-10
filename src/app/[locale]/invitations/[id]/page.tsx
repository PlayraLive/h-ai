'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  MessageCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  CircleCheck,
  Sparkles,
} from 'lucide-react';
import { InvitationsService, InvitationDocument } from '@/lib/appwrite/invitations';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export default function InvitationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, initializing } = useAuthContext();
  const { success, error: showError } = useToast();
  const invitationId = params.id as string;
  const jobId = searchParams.get('job');

  const [invitation, setInvitation] = useState<InvitationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState<any | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && invitationId) {
      loadInvitation();
    } else if (!initializing && !isAuthenticated) {
      router.push(`/en/login?redirect=/invitations/${invitationId}`);
    }
  }, [isAuthenticated, initializing, user, invitationId]);

  const loadInvitation = async () => {
    setLoading(true);
    try {
      const invitationData = await InvitationsService.getInvitation(invitationId);

      if (!invitationData) {
        showError('Invitation not found');
        // Получаем текущую локаль из URL
        const currentLocale = window.location.pathname.split('/')[1] || 'en';
        router.push(`/${currentLocale}/invitations`);
        return;
      }

      setInvitation(invitationData);

      // Check if the invitation belongs to the current user
      if (user && invitationData.freelancerId !== user.$id) {
        showError('You do not have permission to view this invitation');
        // Получаем текущую локаль из URL
        const currentLocale = window.location.pathname.split('/')[1] || 'en';
        router.push(`/${currentLocale}/invitations`);
        return;
      }

      // Load job details if available
      if (jobId) {
        try {
          // Here you would fetch job details using a job service
          // For now we'll use placeholder data
          setJobDetails({
            title: invitationData.jobTitle,
            id: invitationData.jobId,
            description: 'Detailed job description would appear here...',
            clientName: invitationData.clientName,
            budget: { min: 500, max: 2000, currency: 'USD' },
            duration: '2-4 weeks',
            skills: ['AI Design', 'UX/UI', 'Figma', 'Adobe Photoshop'],
            location: 'Remote'
          });
        } catch (err) {
          console.error('Error loading job details:', err);
        }
      }
    } catch (err) {
      console.error('Error loading invitation:', err);
      showError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setResponding(true);
    try {
      await InvitationsService.updateInvitationStatus(
        invitation.$id!,
        'accepted',
        responseMessage
      );

      success('Invitation accepted successfully!');
      // Reload the invitation to show updated status
      loadInvitation();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      showError('Failed to accept invitation');
    } finally {
      setResponding(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    setResponding(true);
    try {
      await InvitationsService.updateInvitationStatus(
        invitation.$id!,
        'declined',
        responseMessage
      );

      success('Invitation declined');
      // Reload the invitation to show updated status
      loadInvitation();
    } catch (err) {
      console.error('Error declining invitation:', err);
      showError('Failed to decline invitation');
    } finally {
      setResponding(false);
    }
  };

  const handleViewJob = () => {
    if (invitation) {
      // Получаем текущую локаль из URL
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/jobs/${invitation.jobId}`);
    }
  };

  const handleViewClient = () => {
    if (invitation) {
      // Получаем текущую локаль из URL
      const currentLocale = window.location.pathname.split('/')[1] || 'en';
      router.push(`/${currentLocale}/profile/${invitation.clientId}`);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-6 h-6 text-blue-400" />;
      case 'accepted': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'declined': return <XCircle className="w-6 h-6 text-red-400" />;
      case 'expired': return <AlertCircle className="w-6 h-6 text-gray-400" />;
      default: return <Briefcase className="w-6 h-6 text-purple-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-600/20 border-blue-500/30 text-blue-400';
      case 'accepted': return 'bg-green-600/20 border-green-500/30 text-green-400';
      case 'declined': return 'bg-red-600/20 border-red-500/30 text-red-400';
      case 'expired': return 'bg-gray-600/20 border-gray-500/30 text-gray-400';
      default: return 'bg-purple-600/20 border-purple-500/30 text-purple-400';
    }
  };

  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading invitation details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-950 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invitation Not Found</h2>
            <p className="text-gray-400 mb-6">This invitation may have been deleted or you don't have permission to view it.</p>
            <button
              onClick={() => {
                // Получаем текущую локаль из URL
                const currentLocale = window.location.pathname.split('/')[1] || 'en';
                router.push(`/${currentLocale}/invitations`);
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Back to Invitations
            </button>
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
            {/* Header with back button */}
            <div className="flex items-center mb-8">
              <button
                onClick={() => {
                  // Получаем текущую локаль из URL
                  const currentLocale = window.location.pathname.split('/')[1] || 'en';
                  router.push(`/${currentLocale}/invitations`);
                }}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Invitations</span>
              </button>
            </div>

            {/* Invitation Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Invitation Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 px-6 py-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-white">Job Invitation</h1>
                      <div className={`px-4 py-2 rounded-full border ${getStatusColor(invitation.status)}`}>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(invitation.status)}
                          <span className="font-medium capitalize">
                            {invitation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-4">{invitation.jobTitle}</h2>

                    <div className="flex items-center text-gray-300 text-sm mb-6">
                      <User className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="mr-4">From: {invitation.clientName}</span>

                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                      <span>Invited: {formatDate(invitation.invitedAt)}</span>
                    </div>

                    {invitation.message && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 mb-6">
                        <h3 className="text-sm uppercase text-gray-400 mb-2">Message from client</h3>
                        <p className="text-gray-300">{invitation.message}</p>
                      </div>
                    )}

                    {/* Match score and reasons if AI matched */}
                    {invitation.metadata?.aiRecommended && invitation.matchScore && (
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30 mb-6">
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
                          <span className="text-purple-300 font-medium">
                            {Math.round(invitation.matchScore * 100)}% match for your skills
                          </span>
                        </div>
                        {invitation.matchReasons && invitation.matchReasons.length > 0 && (
                          <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1 mt-2">
                            {invitation.matchReasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}

                    {/* Job Details Preview */}
                    {jobDetails && (
                      <div className="border border-gray-700/50 rounded-lg overflow-hidden">
                        <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700/50">
                          <h3 className="text-white font-medium">Job Overview</h3>
                        </div>
                        <div className="p-4 space-y-4">
                          <p className="text-gray-300">{jobDetails.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">
                                Budget: {jobDetails.budget.currency} {jobDetails.budget.min} - {jobDetails.budget.max}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">Duration: {jobDetails.duration}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">Location: {jobDetails.location}</span>
                            </div>
                          </div>

                          {jobDetails.skills && jobDetails.skills.length > 0 && (
                            <div>
                              <h4 className="text-sm uppercase text-gray-400 mb-2">Required Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {jobDetails.skills.map((skill: string, index: number) => (
                                  <span key={index} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mt-6">
                      <button
                        onClick={handleViewJob}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Full Job</span>
                      </button>

                      <button
                        onClick={handleViewClient}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>View Client Profile</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Response Section */}
                {invitation.status === 'pending' && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Your Response</h2>

                    <div className="mb-6">
                      <label className="block text-gray-300 mb-2">
                        Message to client (optional)
                      </label>
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Add a message to the client explaining why you're accepting or declining this invitation..."
                        className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAccept}
                        disabled={responding}
                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Invitation</span>
                      </button>

                      <button
                        onClick={handleDecline}
                        disabled={responding}
                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline Invitation</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Response Details (if already responded) */}
                {(invitation.status === 'accepted' || invitation.status === 'declined') && invitation.respondedAt && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Your Response</h2>

                    <div className="flex items-center text-gray-300 text-sm mb-4">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span>Responded on {formatDate(invitation.respondedAt)}</span>
                    </div>

                    {invitation.message && (
                      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <h3 className="text-sm uppercase text-gray-400 mb-2">Your message</h3>
                        <p className="text-gray-300">{invitation.message}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status Card */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Invitation Status</h3>

                  <div className={`rounded-lg p-4 border ${getStatusColor(invitation.status)} mb-4`}>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(invitation.status)}
                      <div>
                        <p className="font-medium capitalize">{invitation.status}</p>
                        {invitation.status === 'pending' && (
                          <p className="text-sm opacity-80">{getTimeRemaining(invitation.expiresAt)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Invited:</span>
                      <span className="text-gray-200">{formatDate(invitation.invitedAt)}</span>
                    </div>

                    {invitation.respondedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Responded:</span>
                        <span className="text-gray-200">{formatDate(invitation.respondedAt)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Expires:</span>
                      <span className="text-gray-200">{formatDate(invitation.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Client Info Card */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Client Information</h3>

                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {invitation.clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{invitation.clientName}</p>
                      <button
                        onClick={handleViewClient}
                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/en/messages?user=${invitation.clientId}`)}
                    className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message Client</span>
                  </button>
                </div>

                {/* Help Tips */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Tips</h3>

                  <ul className="space-y-3 text-gray-300 text-sm">
                    <li className="flex items-start space-x-2">
                      <CircleCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Review the job details carefully before responding</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CircleCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Check the client's profile and reviews</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CircleCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Include a personalized message when responding</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CircleCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Ask questions if you need more information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

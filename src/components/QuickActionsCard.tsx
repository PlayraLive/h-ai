'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Home,
  Briefcase, 
  MessageCircle, 
  DollarSign, 
  Star, 
  FileText,
  Bell,
  Settings,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { DemoMessagesCreator } from '@/lib/create-demo-messages';
import { MessagesCollectionsSetup } from '@/lib/setup-messages-collections';
import { AppwriteSetup } from '@/lib/appwrite-setup';
import { NotificationService } from '@/lib/services/notifications';
import { useAuthContext } from '@/contexts/AuthContext';

interface QuickActionsCardProps {
  userType: 'freelancer' | 'client';
}

export default function QuickActionsCard({ userType }: QuickActionsCardProps) {
  const { user } = useAuthContext();
  const [creatingDemoMessages, setCreatingDemoMessages] = useState(false);
  const [settingUpCollections, setSettingUpCollections] = useState(false);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [creatingDemoNotifications, setCreatingDemoNotifications] = useState(false);

  const demoMessagesCreator = new DemoMessagesCreator();
  const messagesSetup = new MessagesCollectionsSetup();
  const appwriteSetup = new AppwriteSetup();

  // Navigation items
  const navigationItems = [
    {
      icon: Briefcase,
      label: userType === 'freelancer' ? 'Projects' : 'Jobs',
      href: userType === 'freelancer' ? '/en/projects' : '/en/jobs',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      href: '/en/messages',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    {
      icon: DollarSign,
      label: 'Payments',
      href: '/en/payments',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20'
    },
    {
      icon: Star,
      label: 'Reviews',
      href: '/en/reviews',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20'
    },
    {
      icon: FileText,
      label: 'Reports',
      href: '/en/reports',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20'
    }
  ];

  // Setup functions
  const runDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      console.log('🔍 Running Appwrite diagnostics...');
      const result = await appwriteSetup.runDiagnostics();
      
      if (result.success) {
        console.log('✅ Diagnostics completed successfully');
        alert('✅ Diagnostics completed successfully!\n\nCheck console for details.');
      } else {
        console.error('❌ Diagnostics failed:', result.error);
        alert(`❌ Diagnostics failed:\n\n${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Error running diagnostics:', error);
      alert(`❌ Error running diagnostics:\n\n${error.message}`);
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const setupCollections = async () => {
    setSettingUpCollections(true);
    try {
      console.log('🚀 Setting up collections and attributes...');
      await messagesSetup.setupCollections();
      console.log('✅ Collections setup completed');
      alert('✅ Collections and attributes setup completed!');
    } catch (error: any) {
      console.error('❌ Error setting up collections:', error);
      alert(`❌ Error setting up collections:\n\n${error.message}`);
    } finally {
      setSettingUpCollections(false);
    }
  };

  const createDemoMessages = async () => {
    if (!user) return;
    
    setCreatingDemoMessages(true);
    try {
      console.log('📨 Creating demo messages...');
      await demoMessagesCreator.createDemoData(user.$id);
      console.log('✅ Demo messages created');
      alert('✅ Demo messages created! Check the Messages page.');
    } catch (error: any) {
      console.error('❌ Error creating demo messages:', error);
      alert(`❌ Error creating demo messages:\n\n${error.message}`);
    } finally {
      setCreatingDemoMessages(false);
    }
  };

  const createDemoNotifications = async () => {
    if (!user) return;
    
    setCreatingDemoNotifications(true);
    try {
      console.log('🔔 Creating demo notifications...');
      
      await Promise.all([
        NotificationService.createMessageNotification(
          user.$id,
          'John Doe',
          'Hi! I\'m interested in your AI development services.',
          'demo-conversation-1'
        ),
        NotificationService.createProjectNotification(
          user.$id,
          'AI Chatbot Development',
          'demo-project-1',
          'new_project'
        ),
        NotificationService.createPaymentNotification(
          user.$id,
          500,
          'USD',
          'demo-payment-1',
          'payment_received'
        )
      ]);
      
      console.log('✅ Demo notifications created');
      alert('🔔 Demo notifications created! Check the notification bell.');
    } catch (error: any) {
      console.error('❌ Error creating demo notifications:', error);
      alert(`❌ Error creating demo notifications:\n\n${error.message}`);
    } finally {
      setCreatingDemoNotifications(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      
      {/* Navigation Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={index}
              href={item.href}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-800/50 transition-colors group"
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-xs text-gray-300 text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Setup Actions */}
      <div className="border-t border-gray-800 pt-4">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Development Tools</h4>
        <div className="space-y-2">
          <button 
            onClick={runDiagnostics}
            disabled={runningDiagnostics}
            className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 text-xs py-2"
          >
            {runningDiagnostics ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle className="w-3 h-3" />
            )}
            <span>{runningDiagnostics ? 'Running...' : 'Diagnostics'}</span>
          </button>
          
          <button 
            onClick={setupCollections}
            disabled={settingUpCollections}
            className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 text-xs py-2"
          >
            {settingUpCollections ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Settings className="w-3 h-3" />
            )}
            <span>{settingUpCollections ? 'Setting up...' : 'Setup DB'}</span>
          </button>
          
          <button 
            onClick={createDemoMessages}
            disabled={creatingDemoMessages}
            className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 text-xs py-2"
          >
            {creatingDemoMessages ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MessageCircle className="w-3 h-3" />
            )}
            <span>{creatingDemoMessages ? 'Creating...' : 'Demo Messages'}</span>
          </button>
          
          <button 
            onClick={createDemoNotifications}
            disabled={creatingDemoNotifications}
            className="w-full btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50 text-xs py-2"
          >
            {creatingDemoNotifications ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Bell className="w-3 h-3" />
            )}
            <span>{creatingDemoNotifications ? 'Creating...' : 'Demo Notifications'}</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-3">
          🔍 Run tools in order: Diagnostics → Setup DB → Demo Data
        </div>
      </div>
    </div>
  );
}

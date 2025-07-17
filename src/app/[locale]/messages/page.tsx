'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video,
  Star,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  projectId?: string;
  projectTitle?: string;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const chats: Chat[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      lastMessage: 'The logo design looks great! Can we make the text a bit larger?',
      timestamp: '2 min ago',
      unread: 2,
      online: true,
      projectId: '1',
      projectTitle: 'AI Logo Design for TechCorp'
    },
    {
      id: '2',
      name: 'Mike Davis',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      lastMessage: 'Perfect! The chatbot is working exactly as expected.',
      timestamp: '1 hour ago',
      unread: 0,
      online: false,
      projectId: '2',
      projectTitle: 'Chatbot Development'
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      lastMessage: 'Thank you for the amazing video content!',
      timestamp: '3 hours ago',
      unread: 0,
      online: true,
      projectId: '3',
      projectTitle: 'AI Video Content Creation'
    }
  ];

  const messages: Record<string, Message[]> = {
    '1': [
      {
        id: '1',
        text: 'Hi! I\'ve reviewed your portfolio and I\'m impressed with your AI design work.',
        sender: 'other',
        timestamp: '10:30 AM',
        read: true
      },
      {
        id: '2',
        text: 'Thank you! I\'d love to work on your logo project. Can you share more details about your vision?',
        sender: 'me',
        timestamp: '10:32 AM',
        read: true
      },
      {
        id: '3',
        text: 'Sure! We\'re looking for a modern, tech-focused logo that represents AI innovation.',
        sender: 'other',
        timestamp: '10:35 AM',
        read: true
      },
      {
        id: '4',
        text: 'I\'ve attached the initial concepts. Let me know what you think!',
        sender: 'me',
        timestamp: '2:15 PM',
        read: true
      },
      {
        id: '5',
        text: 'The logo design looks great! Can we make the text a bit larger?',
        sender: 'other',
        timestamp: '2:18 PM',
        read: false
      }
    ],
    '2': [
      {
        id: '1',
        text: 'The chatbot integration is complete. Would you like to test it?',
        sender: 'me',
        timestamp: '9:00 AM',
        read: true
      },
      {
        id: '2',
        text: 'Perfect! The chatbot is working exactly as expected.',
        sender: 'other',
        timestamp: '11:30 AM',
        read: true
      }
    ],
    '3': [
      {
        id: '1',
        text: 'The video content has been delivered. Please review when you have time.',
        sender: 'me',
        timestamp: '8:00 AM',
        read: true
      },
      {
        id: '2',
        text: 'Thank you for the amazing video content!',
        sender: 'other',
        timestamp: '9:15 AM',
        read: true
      }
    ]
  };

  const currentChat = chats.find(chat => chat.id === selectedChat);
  const currentMessages = messages[selectedChat] || [];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      
      <div className="flex-1 flex">
        {/* Chat List */}
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedChat === chat.id ? 'bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-400">{chat.timestamp}</span>
                    </div>
                    
                    {chat.projectTitle && (
                      <p className="text-xs text-purple-400 mb-1">{chat.projectTitle}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={currentChat.avatar}
                      alt={currentChat.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {currentChat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-white font-medium">{currentChat.name}</h2>
                    {currentChat.projectTitle && (
                      <p className="text-sm text-purple-400">{currentChat.projectTitle}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {currentChat.online ? 'Online' : 'Last seen 2 hours ago'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === 'me'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-70">{message.timestamp}</span>
                        {message.sender === 'me' && (
                          <CheckCircle2 className={`w-3 h-3 ${message.read ? 'text-blue-300' : 'text-gray-300'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

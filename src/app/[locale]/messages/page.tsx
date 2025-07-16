'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Star,
  Circle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn, formatRelativeTime } from '@/lib/utils';

export default function MessagesPage({ params: { locale } }: { params: { locale: string } }) {
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: '1',
      participant: {
        name: 'Sarah Johnson',
        avatar: '/avatars/client1.jpg',
        online: true,
        title: 'Marketing Director'
      },
      lastMessage: {
        text: 'The AI-generated designs look amazing! Can we schedule a call to discuss the next phase?',
        timestamp: '2024-01-15T14:30:00Z',
        sender: 'them',
        unread: true
      },
      project: 'Brand Identity Design',
      unreadCount: 2
    },
    {
      id: '2',
      participant: {
        name: 'Mike Davis',
        avatar: '/avatars/client2.jpg',
        online: false,
        title: 'Product Manager'
      },
      lastMessage: {
        text: 'Perfect! The chatbot integration is working flawlessly. Payment has been released.',
        timestamp: '2024-01-15T10:15:00Z',
        sender: 'them',
        unread: false
      },
      project: 'AI Chatbot Development',
      unreadCount: 0
    },
    {
      id: '3',
      participant: {
        name: 'Emma Wilson',
        avatar: '/avatars/client3.jpg',
        online: true,
        title: 'Creative Director'
      },
      lastMessage: {
        text: 'Thanks for the quick turnaround! The video content exceeded our expectations.',
        timestamp: '2024-01-14T16:45:00Z',
        sender: 'them',
        unread: false
      },
      project: 'AI Video Content Creation',
      unreadCount: 0
    }
  ];

  const messages = [
    {
      id: '1',
      sender: 'them',
      text: 'Hi Alex! I saw your portfolio and I\'m impressed with your AI design work. I have a project that might be perfect for you.',
      timestamp: '2024-01-15T09:00:00Z',
      type: 'text'
    },
    {
      id: '2',
      sender: 'me',
      text: 'Thank you for reaching out! I\'d love to hear more about your project. What kind of AI design work are you looking for?',
      timestamp: '2024-01-15T09:15:00Z',
      type: 'text'
    },
    {
      id: '3',
      sender: 'them',
      text: 'We need a complete brand identity for our new fintech startup. Logo, business cards, website mockups - all created using AI tools like Midjourney.',
      timestamp: '2024-01-15T09:30:00Z',
      type: 'text'
    },
    {
      id: '4',
      sender: 'me',
      text: 'That sounds like an exciting project! I specialize in AI-generated brand identities. I can create multiple concepts using Midjourney and DALL-E, then refine them based on your feedback.',
      timestamp: '2024-01-15T09:45:00Z',
      type: 'text'
    },
    {
      id: '5',
      sender: 'them',
      text: 'Perfect! What\'s your timeline and pricing for this type of project?',
      timestamp: '2024-01-15T10:00:00Z',
      type: 'text'
    },
    {
      id: '6',
      sender: 'me',
      text: 'For a complete brand identity package, I typically charge $1,500-2,500 depending on the scope. Timeline would be 1-2 weeks. I can send you a detailed proposal with examples.',
      timestamp: '2024-01-15T10:15:00Z',
      type: 'text'
    },
    {
      id: '7',
      sender: 'them',
      text: 'The AI-generated designs look amazing! Can we schedule a call to discuss the next phase?',
      timestamp: '2024-01-15T14:30:00Z',
      type: 'text'
    }
  ];

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Handle sending message
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="pt-16 h-screen flex">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 w-full text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={cn(
                  "w-full p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors text-left",
                  selectedConversation === conversation.id && "bg-gray-800/50"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {conversation.participant.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-950"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-medium truncate">{conversation.participant.name}</h3>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{conversation.project}</p>
                    <p className={cn(
                      "text-sm truncate",
                      conversation.lastMessage.unread ? "text-white font-medium" : "text-gray-400"
                    )}>
                      {conversation.lastMessage.text}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {currentConversation.participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {currentConversation.participant.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">{currentConversation.participant.name}</h2>
                    <p className="text-sm text-gray-400">{currentConversation.project}</p>
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
                    <Info className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === 'me' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                        message.sender === 'me'
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-gray-800 text-gray-100"
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        message.sender === 'me' ? "text-purple-100" : "text-gray-400"
                      )}>
                        {formatRelativeTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="input-field w-full pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      messageText.trim()
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No conversation selected</h3>
                <p className="text-gray-400">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

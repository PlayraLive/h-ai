'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Camera, 
  Plus, 
  X, 
  Save,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Trash2
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

export default function EditProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'Alex Chen',
    title: 'AI Design Specialist & Creative Director',
    bio: 'Passionate AI design specialist with 5+ years of experience creating stunning visuals using cutting-edge AI tools.',
    location: 'San Francisco, CA',
    hourlyRate: 85,
    languages: ['English', 'Mandarin', 'Spanish'],
    skills: ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Brand Design', 'UI/UX Design'],
    portfolio: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    email: {
      newMessages: true,
      projectUpdates: true,
      paymentAlerts: true,
      marketing: false
    },
    push: {
      newMessages: true,
      projectUpdates: false,
      paymentAlerts: true
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile Information' },
    { id: 'portfolio', label: 'Portfolio & Skills' },
    { id: 'account', label: 'Account Settings' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'billing', label: 'Billing & Payments' }
  ];

  const handleSave = () => {
    console.log('Saving profile:', profileData);
    // Handle save logic
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData({
        ...profileData,
        languages: [...profileData.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setProfileData({
      ...profileData,
      languages: profileData.languages.filter(lang => lang !== languageToRemove)
    });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/${locale}/profile`}
              className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Profile</span>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
                <p className="text-gray-400">Update your profile information and settings</p>
              </div>
              <button onClick={handleSave} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-4 rounded-2xl">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg transition-colors",
                        activeTab === tab.id
                          ? "bg-purple-500/20 text-purple-400"
                          : "text-gray-300 hover:bg-gray-800/50"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="glass-card p-6 rounded-2xl">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                          {profileData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <button className="absolute -bottom-2 -right-2 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">Profile Photo</h3>
                        <p className="text-sm text-gray-400 mb-3">Upload a professional photo to build trust with clients</p>
                        <button className="btn-secondary text-sm">Change Photo</button>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="input-field w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Professional Title *
                        </label>
                        <input
                          type="text"
                          value={profileData.title}
                          onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                          className="input-field w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="input-field w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          value={profileData.hourlyRate}
                          onChange={(e) => setProfileData({ ...profileData, hourlyRate: Number(e.target.value) })}
                          className="input-field w-full"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Professional Bio
                      </label>
                      <textarea
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="input-field w-full resize-none"
                        placeholder="Tell clients about your experience and expertise..."
                      />
                    </div>

                    {/* Languages */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Languages
                      </label>
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                          className="input-field flex-1"
                          placeholder="Add a language..."
                        />
                        <button
                          type="button"
                          onClick={addLanguage}
                          className="btn-primary"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {profileData.languages.map((language, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{language}</span>
                            <button
                              type="button"
                              onClick={() => removeLanguage(language)}
                              className="hover:text-blue-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'portfolio' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Portfolio & Skills</h2>
                    
                    {/* Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        AI Skills & Tools
                      </label>
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          className="input-field flex-1"
                          placeholder="Add a skill..."
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="btn-primary"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="hover:text-purple-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Portfolio */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-300">
                          Portfolio Projects
                        </label>
                        <button className="btn-primary">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Project
                        </button>
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-white font-medium mb-2">Add Your First Project</h3>
                        <p className="text-gray-400 mb-4">Showcase your best AI work to attract more clients</p>
                        <button className="btn-secondary">Upload Project</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
                    
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value="alex.chen@example.com"
                        className="input-field w-full"
                        disabled
                      />
                      <p className="text-xs text-gray-400 mt-1">Contact support to change your email address</p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-4">
                        Change Password
                      </label>
                      <div className="space-y-4">
                        <div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="input-field w-full"
                            placeholder="Current password"
                          />
                        </div>
                        <div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="input-field w-full"
                            placeholder="New password"
                          />
                        </div>
                        <div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="input-field w-full"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span className="text-sm">{showPassword ? 'Hide' : 'Show'} passwords</span>
                          </button>
                          <button className="btn-primary">Update Password</button>
                        </div>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border border-gray-700 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-green-400" />
                          <div>
                            <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                          </div>
                        </div>
                        <button className="btn-secondary">Enable</button>
                      </div>
                    </div>

                    {/* Delete Account */}
                    <div className="border border-red-500/30 rounded-xl p-4 bg-red-500/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Trash2 className="w-5 h-5 text-red-400" />
                          <div>
                            <h3 className="text-white font-medium">Delete Account</h3>
                            <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                          </div>
                        </div>
                        <button className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
                    
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        {Object.entries(notifications.email).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-sm text-gray-400">
                                {key === 'newMessages' && 'Get notified when you receive new messages'}
                                {key === 'projectUpdates' && 'Updates about your active projects'}
                                {key === 'paymentAlerts' && 'Payment confirmations and alerts'}
                                {key === 'marketing' && 'Tips, tutorials, and platform updates'}
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setNotifications({
                                  ...notifications,
                                  email: { ...notifications.email, [key]: e.target.checked }
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Push Notifications</h3>
                      <div className="space-y-4">
                        {Object.entries(notifications.push).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-sm text-gray-400">
                                {key === 'newMessages' && 'Instant notifications for new messages'}
                                {key === 'projectUpdates' && 'Important project milestone updates'}
                                {key === 'paymentAlerts' && 'Payment confirmations and alerts'}
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setNotifications({
                                  ...notifications,
                                  push: { ...notifications.push, [key]: e.target.checked }
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Billing & Payments</h2>
                    
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Payment Methods</h3>
                      <p className="text-gray-400 mb-6">Manage your payment methods and billing information</p>
                      <button className="btn-primary">Add Payment Method</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { RealDataSeeder, SeedProgress } from '@/lib/seed-real-data';
import {
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Trash2,
  Database,
  Users,
  Briefcase,
  Star,
  MessageCircle,
  Bell,
  FileImage,
  Zap,
  BarChart3
} from 'lucide-react';

interface SeedSummary {
  users: number;
  skills: number;
  categories: number;
  projects: number;
  portfolio: number;
  reviews: number;
  notifications: number;
  conversations: number;
  messages: number;
}

export default function DataSeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [progress, setProgress] = useState<SeedProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<SeedSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const handleProgressUpdate = (progressData: SeedProgress) => {
    setProgress(progressData);
    addLog(`${progressData.stage}: ${progressData.progress}% - ${progressData.message}`);
  };

  const startSeeding = async (cleanFirst: boolean = false) => {
    setIsSeeding(true);
    setError(null);
    setLogs([]);
    setSummary(null);
    setProgress(null);

    try {
      const seeder = new RealDataSeeder(handleProgressUpdate);

      if (cleanFirst) {
        addLog('🧹 Starting data cleanup...');
        await seeder.cleanAllData();
        addLog('✅ Data cleanup completed');
      }

      addLog('🚀 Starting data seeding...');
      const result = await seeder.seedAllData();

      setSummary(result.summary);
      addLog(`🎉 Seeding completed! Created ${JSON.stringify(result.summary)}`);

    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      addLog(`❌ Error: ${errorMessage}`);
    } finally {
      setIsSeeding(false);
      setProgress(null);
    }
  };

  const cleanData = async () => {
    setIsCleaning(true);
    setError(null);
    setLogs([]);
    setSummary(null);

    try {
      const seeder = new RealDataSeeder(handleProgressUpdate);
      addLog('🧹 Starting data cleanup...');
      await seeder.cleanAllData();
      addLog('✅ Data cleanup completed');
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      addLog(`❌ Cleanup error: ${errorMessage}`);
    } finally {
      setIsCleaning(false);
      setProgress(null);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setError(null);
  };

  const getProgressBarColor = (progress: number) => {
    if (progress < 0) return 'bg-red-500';
    if (progress < 30) return 'bg-yellow-500';
    if (progress < 70) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const summaryItems = summary ? [
    { icon: Users, label: 'Users', value: summary.users, color: 'text-blue-400' },
    { icon: Zap, label: 'Skills', value: summary.skills, color: 'text-purple-400' },
    { icon: BarChart3, label: 'Categories', value: summary.categories, color: 'text-indigo-400' },
    { icon: Briefcase, label: 'Projects', value: summary.projects, color: 'text-green-400' },
    { icon: FileImage, label: 'Portfolio', value: summary.portfolio, color: 'text-pink-400' },
    { icon: Star, label: 'Reviews', value: summary.reviews, color: 'text-yellow-400' },
    { icon: Bell, label: 'Notifications', value: summary.notifications, color: 'text-orange-400' },
    { icon: MessageCircle, label: 'Messages', value: summary.messages, color: 'text-cyan-400' },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Database Seeder</h1>
            <p className="text-gray-400">Populate your database with realistic demo data</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => startSeeding(false)}
            disabled={isSeeding || isCleaning}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Seeding
              </>
            )}
          </button>

          <button
            onClick={() => startSeeding(true)}
            disabled={isSeeding || isCleaning}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Clean & Seed
          </button>

          <button
            onClick={cleanData}
            disabled={isSeeding || isCleaning}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCleaning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Clean Data
              </>
            )}
          </button>

          <button
            onClick={clearLogs}
            disabled={isSeeding || isCleaning}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Clear Logs
          </button>
        </div>
      </div>

      {/* Progress Section */}
      {progress && (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold text-white">Progress</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300 capitalize">
                  {progress.stage}
                </span>
                <span className="text-sm text-gray-400">
                  {progress.progress >= 0 ? `${progress.progress}%` : 'Error'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.progress)}`}
                  style={{
                    width: progress.progress >= 0 ? `${Math.min(progress.progress, 100)}%` : '100%'
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">{progress.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {summary && (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Seeding Summary</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryItems.map((item, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4 text-center">
                <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                <div className="text-2xl font-bold text-white">{item.value}</div>
                <div className="text-sm text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Section */}
      {error && (
        <div className="glass-card p-6 rounded-xl border-l-4 border-red-500">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Error</h2>
          </div>
          <p className="text-red-300 bg-red-900/20 p-3 rounded-lg font-mono text-sm">
            {error}
          </p>
        </div>
      )}

      {/* Logs Section */}
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Activity Logs</h2>
          <span className="text-sm text-gray-400">{logs.length} entries</span>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No logs yet. Start seeding to see activity...</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="text-sm font-mono text-gray-300 py-1 border-b border-gray-800 last:border-b-0"
                >
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-4">About Data Seeding</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-3">What gets created:</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                5 freelancers + 3 clients with realistic profiles
              </li>
              <li className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-green-400" />
                5 projects with different statuses and budgets
              </li>
              <li className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-pink-400" />
                Portfolio items for each freelancer
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                Reviews and ratings for completed projects
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                Conversations and messages between users
              </li>
              <li className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                Notifications for all users
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-3">Data Quality:</h3>
            <ul className="space-y-2 text-gray-400">
              <li>✅ Realistic AI/ML focused profiles</li>
              <li>✅ Consistent relationships between data</li>
              <li>✅ Proper ratings and review counts</li>
              <li>✅ Varied project statuses and budgets</li>
              <li>✅ High-quality stock photos</li>
              <li>✅ Professional skill sets and portfolios</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

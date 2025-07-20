'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TopNav from '@/components/TopNav';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Download,
  Plus,
  TrendingUp,
  Clock,
  Wallet,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const totalEarnings = 25600;
  const pendingPayments = 3200;
  const thisMonthEarnings = 8900;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <TopNav />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading payments...</p>
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
          <div className="relative bg-gradient-to-r from-[#1A1A2E] via-[#1A1A2E] to-[#2A1A3E] border-b border-gray-700/50 p-4 md:p-6 lg:p-8 overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Payments & Billing</h1>
                <p className="text-gray-400">Manage your payments, invoices, and billing information</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Link
                  href="/en/invoices/create"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Create Invoice</span>
                </Link>
                <button className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                  <Download className="w-4 h-4 mr-2" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6 mb-8">
            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Total Earnings</p>
                  <p className="text-xl md:text-2xl font-bold text-white break-words">${totalEarnings.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                    <p className="text-green-400 text-xs md:text-sm">+15% this month</p>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Pending Payments</p>
                  <p className="text-xl md:text-2xl font-bold text-white break-words">${pendingPayments.toLocaleString()}</p>
                  <p className="text-yellow-400 text-xs md:text-sm">2 payments</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">This Month</p>
                  <p className="text-xl md:text-2xl font-bold text-white break-words">${thisMonthEarnings.toLocaleString()}</p>
                  <p className="text-blue-400 text-xs md:text-sm">5 transactions</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 p-4 md:p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs md:text-sm">Available Balance</p>
                  <p className="text-xl md:text-2xl font-bold text-white break-words">${(totalEarnings - 1250).toLocaleString()}</p>
                  <p className="text-purple-400 text-xs md:text-sm">Ready to withdraw</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A2E]/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
            <div className="border-b border-gray-700/50">
              <nav className="flex space-x-1 overflow-x-auto scrollbar-hide px-4 md:px-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'transactions', label: 'Transactions' },
                  { id: 'methods', label: 'Payment Methods' },
                  { id: 'invoices', label: 'Invoices' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'py-4 px-3 md:px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                  <p className="text-gray-400">Payment overview coming soon...</p>
                </div>
              )}
              
              {activeTab !== 'overview' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                  <p className="text-gray-400">This section is under development.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

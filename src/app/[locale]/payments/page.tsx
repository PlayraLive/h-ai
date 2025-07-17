'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Trash2,
  Edit,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/Toast';

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'refund' | 'fee';
  amount: number;
  description: string;
  client: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  method: string;
  projectId?: string;
  invoiceId?: string;
  category: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal' | 'crypto';
  name: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  accountLast4?: string;
  email?: string;
  isDefault: boolean;
  isVerified: boolean;
}

export default function PaymentsPage() {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    // Mock data
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'received',
        amount: 2500,
        description: 'Payment for AI Logo Design Project',
        client: 'TechFlow Solutions',
        date: '2024-01-15T10:30:00Z',
        status: 'completed',
        method: 'Bank Transfer',
        projectId: 'proj_1',
        invoiceId: 'inv_001',
        category: 'Project Payment'
      },
      {
        id: '2',
        type: 'fee',
        amount: 150,
        description: 'Platform fee for January',
        client: 'H-AI Platform',
        date: '2024-01-10T09:00:00Z',
        status: 'completed',
        method: 'Auto-deduct',
        category: 'Platform Fee'
      },
      {
        id: '3',
        type: 'received',
        amount: 1200,
        description: 'Milestone payment - E-commerce Platform',
        client: 'InnovateLab',
        date: '2024-01-08T14:20:00Z',
        status: 'pending',
        method: 'PayPal',
        projectId: 'proj_2',
        category: 'Milestone Payment'
      }
    ];

    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'card',
        name: 'Visa Credit Card',
        last4: '4242',
        brand: 'Visa',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        isVerified: true
      },
      {
        id: '2',
        type: 'bank',
        name: 'Chase Business Account',
        bankName: 'Chase Bank',
        accountLast4: '8901',
        isDefault: false,
        isVerified: true
      }
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setPaymentMethods(mockPaymentMethods);
      setLoading(false);
    }, 1000);
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'received': return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'sent': return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'refund': return <ArrowDownLeft className="w-5 h-5 text-blue-400" />;
      case 'fee': return <ArrowUpRight className="w-5 h-5 text-orange-400" />;
      default: return <DollarSign className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'received': return 'bg-green-500/20';
      case 'sent': return 'bg-red-500/20';
      case 'refund': return 'bg-blue-500/20';
      case 'fee': return 'bg-orange-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'failed': case 'cancelled': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'failed': case 'cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalEarnings = transactions
    .filter(t => t.type === 'received' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = transactions
    .filter(t => t.type === 'received' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthEarnings = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const now = new Date();
      return t.type === 'received' && 
             t.status === 'completed' &&
             transactionDate.getMonth() === now.getMonth() &&
             transactionDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading payment data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Payments & Billing</h1>
                <p className="text-gray-400">Manage your payments, invoices, and billing information</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Link
                  href="/en/invoices/create"
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Invoice</span>
                </Link>
                <button className="btn-primary flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Earnings</p>
                    <p className="text-2xl font-bold text-white">${totalEarnings.toLocaleString()}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 text-sm">+15% this month</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Payments</p>
                    <p className="text-2xl font-bold text-white">${pendingPayments.toLocaleString()}</p>
                    <p className="text-yellow-400 text-sm">
                      {transactions.filter(t => t.type === 'received' && t.status === 'pending').length} payments
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">${thisMonthEarnings.toLocaleString()}</p>
                    <p className="text-blue-400 text-sm">
                      {transactions.filter(t => {
                        const transactionDate = new Date(t.date);
                        const now = new Date();
                        return transactionDate.getMonth() === now.getMonth() &&
                               transactionDate.getFullYear() === now.getFullYear();
                      }).length} transactions
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Available Balance</p>
                    <p className="text-2xl font-bold text-white">${(totalEarnings - 1250).toLocaleString()}</p>
                    <p className="text-purple-400 text-sm">Ready to withdraw</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="border-b border-gray-700">
                <nav className="flex space-x-8 px-6">
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
                        'py-4 px-2 border-b-2 font-medium text-sm transition-colors',
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
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recent Transactions */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
                          <button
                            onClick={() => setActiveTab('transactions')}
                            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                          >
                            View all →
                          </button>
                        </div>
                        <div className="space-y-3">
                          {transactions.slice(0, 5).map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
                              <div className="flex items-center space-x-3">
                                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', getTransactionColor(transaction.type))}>
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{transaction.description}</p>
                                  <p className="text-gray-400 text-xs">{transaction.client}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn('font-semibold text-sm', 
                                  transaction.type === 'received' || transaction.type === 'refund' ? 'text-green-400' : 'text-red-400'
                                )}>
                                  {transaction.type === 'received' || transaction.type === 'refund' ? '+' : '-'}${transaction.amount.toLocaleString()}
                                </p>
                                <p className="text-gray-400 text-xs">{new Date(transaction.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
                          <button
                            onClick={() => setActiveTab('methods')}
                            className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                          >
                            Manage →
                          </button>
                        </div>
                        <div className="space-y-3">
                          {paymentMethods.slice(0, 3).map((method) => (
                            <div key={method.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                  <CreditCard className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-white font-medium text-sm">{method.name}</p>
                                  <p className="text-gray-400 text-xs">
                                    {method.type === 'card' && `•••• ${method.last4}`}
                                    {method.type === 'bank' && `•••• ${method.accountLast4}`}
                                    {method.type === 'paypal' && method.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {method.isVerified && (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                )}
                                {method.isDefault && (
                                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="mt-4 w-full btn-secondary text-sm">
                          Add Payment Method
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                          href="/en/invoices/create"
                          className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors text-center group"
                        >
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-blue-400" />
                          </div>
                          <h4 className="text-white font-medium mb-1">Create Invoice</h4>
                          <p className="text-gray-400 text-sm">Send professional invoices to clients</p>
                        </Link>
                        
                        <button className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors text-center group">
                          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Download className="w-6 h-6 text-green-400" />
                          </div>
                          <h4 className="text-white font-medium mb-1">Withdraw Funds</h4>
                          <p className="text-gray-400 text-sm">Transfer earnings to your account</p>
                        </button>
                        
                        <button className="p-6 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors text-center group">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Receipt className="w-6 h-6 text-purple-400" />
                          </div>
                          <h4 className="text-white font-medium mb-1">Tax Documents</h4>
                          <p className="text-gray-400 text-sm">Download tax forms and receipts</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other tabs content would go here */}
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
    </div>
  );
}

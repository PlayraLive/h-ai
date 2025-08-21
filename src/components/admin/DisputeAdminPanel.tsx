'use client';

import React, { useState, useEffect } from 'react';
import { 
  Flag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  MessageSquare,
  Eye,
  Shield,
  Zap
} from 'lucide-react';
import { DisputeResolutionService, Dispute } from '@/services/disputeResolutionService';

interface DisputeAdminPanelProps {
  className?: string;
}

export default function DisputeAdminPanel({ className = '' }: DisputeAdminPanelProps) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    resolved: 0,
    cancelled: 0,
    adminReview: 0
  });

  useEffect(() => {
    loadDisputes();
    loadStats();
  }, []);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const adminDisputes = await DisputeResolutionService.getAdminRequiredDisputes();
      setDisputes(adminDisputes);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const disputeStats = await DisputeResolutionService.getDisputeStats();
      setStats(disputeStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_review':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'admin_review':
        return <Shield className="w-4 h-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'in_review':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'admin_review':
        return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'resolved':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'cancelled':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'high':
        return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'low':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  const handleTakeDispute = async (disputeId: string) => {
    try {
      // TODO: Implement admin taking dispute
      alert('Функция принятия спора будет добавлена позже');
    } catch (error) {
      console.error('Error taking dispute:', error);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    try {
      // TODO: Implement dispute resolution
      alert('Функция разрешения спора будет добавлена позже');
    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-gray-400">Загрузка споров...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-orange-600/20 rounded-xl">
            <Shield className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Панель администратора споров</h2>
            <p className="text-gray-400 text-sm">Управление спорами и конфликтами</p>
          </div>
        </div>
        <button
          onClick={loadDisputes}
          className="p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <Zap className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Всего</div>
        </div>
        <div className="bg-yellow-600/10 p-3 rounded-lg border border-yellow-600/20 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          <div className="text-xs text-yellow-400">Ожидают</div>
        </div>
        <div className="bg-blue-600/10 p-3 rounded-lg border border-blue-600/20 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.inReview}</div>
          <div className="text-xs text-blue-400">На рассмотрении</div>
        </div>
        <div className="bg-orange-600/10 p-3 rounded-lg border border-orange-600/20 text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.adminReview}</div>
          <div className="text-xs text-orange-400">Требуют админа</div>
        </div>
        <div className="bg-green-600/10 p-3 rounded-lg border border-green-600/20 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.resolved}</div>
          <div className="text-xs text-green-400">Разрешены</div>
        </div>
        <div className="bg-red-600/10 p-3 rounded-lg border border-red-600/20 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.cancelled}</div>
          <div className="text-xs text-red-400">Отменены</div>
        </div>
      </div>

      {/* Disputes List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4">Споры требующие вмешательства</h3>
        
        {disputes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Flag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Нет споров требующих вмешательства администратора</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div
              key={dispute.$id}
              className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 hover:border-gray-600/50 transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedDispute(dispute)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(dispute.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(dispute.status)}`}>
                      {dispute.status === 'pending' && 'Ожидает'}
                      {dispute.status === 'in_review' && 'На рассмотрении'}
                      {dispute.status === 'admin_review' && 'Требует админа'}
                      {dispute.status === 'resolved' && 'Разрешен'}
                      {dispute.status === 'cancelled' && 'Отменен'}
                    </span>
                    {dispute.adminCall && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(dispute.adminCall.urgency)}`}>
                        {dispute.adminCall.urgency === 'critical' && '🚨 Критично'}
                        {dispute.adminCall.urgency === 'high' && '🔥 Высоко'}
                        {dispute.adminCall.urgency === 'medium' && '⚡ Средне'}
                        {dispute.adminCall.urgency === 'low' && '✅ Низко'}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-white font-medium mb-1">
                    Спор #{dispute.$id?.slice(-8)} - {dispute.reason}
                  </div>
                  
                  <div className="text-gray-400 text-sm mb-2">
                    {dispute.description}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{dispute.initiatorType === 'client' ? 'Клиент' : 'Фрилансер'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{dispute.evidence?.length || 0} доказательств</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(dispute.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTakeDispute(dispute.$id!);
                    }}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                    title="Принять спор"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolveDispute(dispute.$id!);
                    }}
                    className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                    title="Разрешить спор"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Dispute Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Детали спора #{selectedDispute.$id?.slice(-8)}</h3>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/30">
                  <h4 className="font-semibold text-white mb-2">Основная информация</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Статус:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDispute.status)}`}>
                        {selectedDispute.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Причина:</span>
                      <span className="ml-2 text-white">{selectedDispute.reason}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Инициатор:</span>
                      <span className="ml-2 text-white">{selectedDispute.initiatorType}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Создан:</span>
                      <span className="ml-2 text-white">{new Date(selectedDispute.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/30">
                  <h4 className="font-semibold text-white mb-2">Описание</h4>
                  <p className="text-gray-300 text-sm">{selectedDispute.description}</p>
                </div>
              </div>
              
              {selectedDispute.adminCall && (
                <div className="bg-orange-600/10 border border-orange-600/20 p-4 rounded-xl">
                  <h4 className="font-semibold text-orange-400 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Призыв администратора
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-orange-400">Причина:</span>
                      <span className="ml-2 text-white">{selectedDispute.adminCall.reason}</span>
                    </div>
                    <div>
                      <span className="text-orange-400">Срочность:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(selectedDispute.adminCall.urgency)}`}>
                        {selectedDispute.adminCall.urgency}
                      </span>
                    </div>
                    <div>
                      <span className="text-orange-400">Вызван:</span>
                      <span className="ml-2 text-white">{new Date(selectedDispute.adminCall.calledAt).toLocaleString('ru-RU')}</span>
                    </div>
                    <div>
                      <span className="text-orange-400">Статус:</span>
                      <span className="ml-2 text-white">{selectedDispute.adminCall.status}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedDispute.evidence && selectedDispute.evidence.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/30">
                  <h4 className="font-semibold text-white mb-2">Доказательства ({selectedDispute.evidence.length})</h4>
                  <div className="space-y-2">
                    {selectedDispute.evidence.map((evidence, index) => (
                      <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
                        <div className="text-sm text-gray-300">{evidence}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => handleTakeDispute(selectedDispute.$id!)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <Shield className="w-4 h-4 mr-2 inline" />
                  Принять спор
                </button>
                <button
                  onClick={() => handleResolveDispute(selectedDispute.$id!)}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2 inline" />
                  Разрешить спор
                </button>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

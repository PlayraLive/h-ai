'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Scale, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';

interface DisputeManagerProps {
  job: {
    id: string;
    title: string;
    budget: number;
    escrowContractId?: string;
    status: string;
  };
  onDisputeAction?: (action: string, disputeId?: string) => void;
}

interface Dispute {
  id: string;
  status: 'open' | 'resolved';
  initiatorType: 'client' | 'freelancer';
  reason: string;
  description?: string;
  createdAt: string;
  resolvedAt?: string;
  clientPercentage?: number;
  freelancerPercentage?: number;
  winner?: 'client' | 'freelancer';
}

export default function DisputeManager({ job, onDisputeAction }: DisputeManagerProps) {
  const { address, isConnected } = useAccount();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    reason: '',
    description: '',
    evidence: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загружаем споры для этого джоба
  useEffect(() => {
    loadDisputes();
  }, [job.id]);

  const loadDisputes = async () => {
    try {
      setIsLoading(true);
      
      // В реальной реализации здесь будет запрос к API
      // const response = await fetch(`/api/disputes?jobId=${job.id}`);
      // const data = await response.json();
      // setDisputes(data.disputes || []);
      
      // Пока моковые данные
      setDisputes([]);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDispute = async () => {
    if (!address || !isConnected || !job.escrowContractId) return;

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/web3/start-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          contractId: job.escrowContractId,
          initiatorAddress: address,
          reason: disputeForm.reason,
          description: disputeForm.description,
          evidence: disputeForm.evidence ? [disputeForm.evidence] : []
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Добавляем новый спор в список
        const newDispute: Dispute = {
          id: data.dispute.id,
          status: 'open',
          initiatorType: data.dispute.initiatorType,
          reason: disputeForm.reason,
          description: disputeForm.description,
          createdAt: new Date().toISOString()
        };
        
        setDisputes(prev => [newDispute, ...prev]);
        setShowDisputeForm(false);
        setDisputeForm({ reason: '', description: '', evidence: '' });
        
        onDisputeAction?.('started', newDispute.id);
      } else {
        throw new Error('Failed to start dispute');
      }
    } catch (error) {
      console.error('Error starting dispute:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canStartDispute = () => {
    return isConnected && 
           job.status === 'in_progress' && 
           disputes.filter(d => d.status === 'open').length === 0;
  };

  const activeDispute = disputes.find(d => d.status === 'open');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <Scale className="w-6 h-6" />
          <span>Система споров</span>
        </h3>
        
        {canStartDispute() && (
          <button
            onClick={() => setShowDisputeForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all flex items-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Открыть спор</span>
          </button>
        )}
      </div>

      {/* Форма создания спора */}
      {showDisputeForm && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg border border-red-500">
          <h4 className="text-lg font-semibold text-white mb-4">Открыть спор</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Причина спора *
              </label>
              <select
                value={disputeForm.reason}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Выберите причину</option>
                <option value="work_not_completed">Работа не выполнена</option>
                <option value="poor_quality">Низкое качество работы</option>
                <option value="missed_deadline">Нарушен срок сдачи</option>
                <option value="scope_change">Изменение технического задания</option>
                <option value="payment_issue">Проблемы с оплатой</option>
                <option value="communication_issue">Проблемы с коммуникацией</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Подробное описание
              </label>
              <textarea
                value={disputeForm.description}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                placeholder="Опишите детали спора..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Доказательства (ссылки)
              </label>
              <input
                type="url"
                value={disputeForm.evidence}
                onChange={(e) => setDisputeForm(prev => ({ ...prev, evidence: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://example.com/evidence"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleStartDispute}
                disabled={!disputeForm.reason || isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Создание...' : 'Открыть спор'}</span>
              </button>
              
              <button
                onClick={() => setShowDisputeForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Активный спор */}
      {activeDispute && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-red-400">Активный спор</h4>
                <p className="text-sm text-gray-300 mt-1">
                  Инициатор: {activeDispute.initiatorType === 'client' ? 'Клиент' : 'Фрилансер'}
                </p>
                <p className="text-sm text-gray-300">
                  Причина: {activeDispute.reason}
                </p>
                {activeDispute.description && (
                  <p className="text-sm text-gray-400 mt-2">
                    {activeDispute.description}
                  </p>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {new Date(activeDispute.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-sm text-yellow-400 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Спор рассматривается арбитром. Все средства заблокированы.</span>
            </p>
          </div>
        </div>
      )}

      {/* История разрешенных споров */}
      {resolvedDisputes.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">История споров</h4>
          <div className="space-y-3">
            {resolvedDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="p-4 bg-gray-700 rounded-lg border border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      dispute.winner === 'client' ? "bg-blue-500" : "bg-green-500"
                    )}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        Причина: {dispute.reason}
                      </p>
                      <p className="text-sm text-gray-400">
                        Решение в пользу: {dispute.winner === 'client' ? 'клиента' : 'фрилансера'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Клиенту: {dispute.clientPercentage}% • 
                        Фрилансеру: {dispute.freelancerPercentage}%
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {dispute.resolvedAt && new Date(dispute.resolvedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Информация о системе споров */}
      {disputes.length === 0 && !showDisputeForm && (
        <div className="text-center text-gray-400">
          <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h4 className="text-lg font-semibold mb-2">Система защиты</h4>
          <p className="text-sm">
            В случае разногласий вы можете открыть спор. 
            Независимый арбитр рассмотрит дело и примет справедливое решение.
          </p>
          <div className="mt-4 p-4 bg-gray-700 rounded-lg text-left">
            <h5 className="font-semibold text-white mb-2">Как это работает:</h5>
            <ul className="text-sm space-y-1">
              <li>• Любая сторона может открыть спор</li>
              <li>• Средства блокируются до решения</li>
              <li>• Арбитр изучает доказательства</li>
              <li>• Принимается справедливое решение</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

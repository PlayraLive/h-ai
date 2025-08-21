'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, DollarSign, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useEscrow } from '@/hooks/useEscrow';
import { cn } from '@/lib/utils';

interface MilestoneManagerProps {
  job: {
    id: string;
    budget: number;
    escrowContractId?: string;
    cryptoNetwork?: string;
    status: string;
  };
  onMilestoneComplete?: (milestoneIndex: number, txHash: string) => void;
}

interface Milestone {
  index: number;
  amount: number;
  status: 'pending' | 'completed' | 'processing';
  completedAt?: string;
  txHash?: string;
}

export default function MilestoneManager({ job, onMilestoneComplete }: MilestoneManagerProps) {
  const { address, isConnected, chain } = useAccount();
  const chainId = chain?.id || 1;
  const escrow = useEscrow(chainId);

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingMilestone, setProcessingMilestone] = useState<number | null>(null);
  const [contractDetails, setContractDetails] = useState<any>(null);

  // Загружаем детали контракта
  useEffect(() => {
    if (job.escrowContractId && escrow.isContractAvailable) {
      loadContractDetails();
    }
  }, [job.escrowContractId, escrow.isContractAvailable]);

  const loadContractDetails = async () => {
    if (!job.escrowContractId) return;

    try {
      setIsLoading(true);
      
      // Получаем детали контракта из блокчейна
      const details = escrow.getContractDetails(job.escrowContractId);
      
      if (details.data) {
        setContractDetails(details.data);
        
        // Создаем milestones на основе контракта
        const totalMilestones = details.data.milestones || 1;
        const completedMilestones = details.data.completedMilestones || 0;
        const milestoneAmount = job.budget / totalMilestones;
        
        const milestonesArray: Milestone[] = Array.from({ length: totalMilestones }, (_, index) => ({
          index,
          amount: milestoneAmount,
          status: index < completedMilestones ? 'completed' : 'pending',
          completedAt: index < completedMilestones ? new Date().toISOString() : undefined
        }));
        
        setMilestones(milestonesArray);
      }
    } catch (error) {
      console.error('Error loading contract details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMilestone = async (milestoneIndex: number) => {
    if (!job.escrowContractId || !address || !isConnected) return;

    try {
      setProcessingMilestone(milestoneIndex);

      // Вызываем функцию смарт-контракта для завершения milestone
      const tx = await escrow.completeMilestone?.(job.escrowContractId, milestoneIndex);
      
      if (tx) {
        // Обновляем статус milestone
        setMilestones(prev => prev.map(m => 
          m.index === milestoneIndex 
            ? { ...m, status: 'processing', txHash: tx }
            : m
        ));

        // Вызываем API для обновления в базе данных
        const response = await fetch('/api/web3/complete-milestone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            contractId: job.escrowContractId,
            milestoneIndex,
            txHash: tx,
            amount: milestones[milestoneIndex].amount,
            clientAddress: address,
            freelancerAddress: contractDetails?.freelancer
          })
        });

        if (response.ok) {
          // Обновляем статус на завершенный
          setMilestones(prev => prev.map(m => 
            m.index === milestoneIndex 
              ? { ...m, status: 'completed', completedAt: new Date().toISOString() }
              : m
          ));

          onMilestoneComplete?.(milestoneIndex, tx);
        }
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
      // Возвращаем статус обратно
      setMilestones(prev => prev.map(m => 
        m.index === milestoneIndex 
          ? { ...m, status: 'pending' }
          : m
      ));
    } finally {
      setProcessingMilestone(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job.escrowContractId || milestones.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center text-gray-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Milestone платежи недоступны</h3>
          <p>Этот проект не использует milestone систему или контракт не найден.</p>
        </div>
      </div>
    );
  }

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const totalCount = milestones.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Milestone Платежи</h3>
        <div className="text-sm text-gray-400">
          {completedCount}/{totalCount} завершено
        </div>
      </div>

      {/* Прогресс бар */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Прогресс проекта</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Список milestones */}
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.index}
            className={cn(
              "border rounded-lg p-4 transition-all",
              milestone.status === 'completed' 
                ? "border-green-500 bg-green-500/10"
                : milestone.status === 'processing'
                ? "border-yellow-500 bg-yellow-500/10"
                : "border-gray-600 bg-gray-700/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  milestone.status === 'completed' 
                    ? "bg-green-500 text-white"
                    : milestone.status === 'processing'
                    ? "bg-yellow-500 text-white animate-pulse"
                    : "bg-gray-600 text-gray-300"
                )}>
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : milestone.status === 'processing' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-bold">{milestone.index + 1}</span>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold text-white">
                    Этап {milestone.index + 1}
                  </h4>
                  <p className="text-sm text-gray-400">
                    ${milestone.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {milestone.status === 'completed' && milestone.completedAt && (
                  <div className="text-sm text-gray-400">
                    {new Date(milestone.completedAt).toLocaleDateString()}
                  </div>
                )}
                
                {milestone.status === 'pending' && (
                  <button
                    onClick={() => handleCompleteMilestone(milestone.index)}
                    disabled={processingMilestone === milestone.index || !isConnected}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Выплатить</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                
                {milestone.status === 'processing' && (
                  <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg flex items-center space-x-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Обработка...</span>
                  </div>
                )}
              </div>
            </div>

            {milestone.txHash && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <p className="text-xs text-gray-400">
                  Транзакция: 
                  <code className="ml-2 bg-gray-700 px-2 py-1 rounded">
                    {milestone.txHash.substring(0, 20)}...
                  </code>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {completedCount === totalCount && (
        <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h4 className="font-semibold text-green-400">Проект завершен!</h4>
              <p className="text-sm text-gray-300">
                Все milestone платежи выполнены. Общая сумма: ${job.budget.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

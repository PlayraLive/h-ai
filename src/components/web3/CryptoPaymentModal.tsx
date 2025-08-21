'use client';

import { useState, useEffect } from 'react';
import { X, Wallet, ArrowRight, Shield, Clock, Star, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAccount, useBalance, useDisconnect, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { cn } from '@/lib/utils';
import { SUPPORTED_CHAINS, TOKEN_ADDRESSES, PAYMENT_CONFIG, SupportedChain, SupportedToken } from '@/lib/web3/config';
import { useEscrow } from '@/hooks/useEscrow';
import { useTronWallet } from '@/hooks/useTronWallet';

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    $id: string;
    title: string;
    freelancerId: string;
    freelancerName: string;
    selectedBudget: number;
    selectedDuration: string;
  };
  onPaymentSuccess: (txHash: string, contractId: string) => void;
}

interface PaymentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

export default function CryptoPaymentModal({ isOpen, onClose, job, onPaymentSuccess }: CryptoPaymentModalProps) {
  // Реальные Web3 хуки с Reown AppKit
  const { address, isConnected, chain } = useAccount();
  const chainId = chain?.id || 1;
  
  // Initialize escrow hook
  const escrow = useEscrow(chainId);
  
  // Initialize Tron wallet hook
  const tronWallet = useTronWallet();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { open } = useAppKit();

  const [selectedChain, setSelectedChain] = useState<SupportedChain>('polygonMumbai');
  const [selectedToken, setSelectedToken] = useState<SupportedToken>('USDC');
  const [paymentAmount, setPaymentAmount] = useState(job.selectedBudget);
  const [milestones, setMilestones] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [txHash, setTxHash] = useState<string>('');

  // Получаем баланс выбранного токена
  const { data: tokenBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES[selectedChain]?.[selectedToken] as `0x${string}`,
    query: { enabled: isConnected && !!address }
  });

  const paymentSteps: PaymentStep[] = [
    {
      id: 'connect',
      title: 'Подключить кошелек',
      description: 'Подключите Web3 кошелек для продолжения',
      status: isConnected ? 'completed' : 'current',
    },
    {
      id: 'network',
      title: 'Выбрать сеть',
      description: `Переключиться на ${SUPPORTED_CHAINS[selectedChain].name}`,
      status: isConnected && chain?.id === SUPPORTED_CHAINS[selectedChain].id ? 'completed' : 'pending',
    },
    {
      id: 'approve',
      title: 'Подтвердить токены',
      description: 'Разрешить контракту использовать ваши токены',
      status: 'pending',
    },
    {
      id: 'escrow',
      title: 'Создать escrow',
      description: 'Заблокировать средства в смарт-контракте',
      status: 'pending',
    },
    {
      id: 'complete',
      title: 'Завершено',
      description: 'Платеж успешно создан',
      status: 'pending',
    },
  ];

  const platformFee = paymentAmount * PAYMENT_CONFIG.fees.platform;
  const totalAmount = paymentAmount + platformFee;

  const handleChainChange = (chainKey: SupportedChain) => {
    setSelectedChain(chainKey);
    // Проверяем доступность токена в выбранной сети
    const availableTokens = Object.keys(TOKEN_ADDRESSES[chainKey] || {}) as SupportedToken[];
    if (!availableTokens.includes(selectedToken)) {
      setSelectedToken('USDC'); // Fallback к USDC
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: SUPPORTED_CHAINS[selectedChain].id });
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const handleCreateEscrow = async () => {
    if (!walletStatus.isConnected || !walletStatus.address) return;
    if (!job.freelancerId) return;
    
    // For Tron chains, handle differently
    if (isTronChain) {
      return handleTronEscrow();
    }
    
    if (!escrow.isContractAvailable) return;

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // 1. Check if token is supported
      if (!escrow.isTokenSupported) {
        throw new Error('Token not supported by escrow contract');
      }

      // 2. Get token address
      const tokenAddress = TOKEN_ADDRESSES[selectedChain]?.[selectedToken];
      if (!tokenAddress) {
        throw new Error('Token address not found');
      }

      // 3. Calculate deadline (30 days from now)
      const deadline = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

      setCurrentStep(3);

      // 4. Create escrow contract
      await escrow.createEscrow({
        freelancerAddress: job.freelancerId, // Assuming this is the wallet address
        tokenAddress,
        amount: job.budget.toString(),
        deadline,
        jobId: job.id,
        milestones: selectedMilestones
      });

      // 5. Wait for transaction confirmation
      if (escrow.createTxHash) {
        setTxHash(escrow.createTxHash);
        setCurrentStep(4);

        // Wait for receipt
        if (escrow.createReceipt) {
          // Extract contract ID from logs
          const contractCreatedLog = escrow.createReceipt.logs.find(
            log => log.topics[0] === '0x...' // ContractCreated event signature
          );
          
          const contractId = contractCreatedLog?.topics[1] || escrow.createTxHash;

          // Notify success
          onPaymentSuccess(escrow.createTxHash, contractId);
          
          setTimeout(() => {
            onClose();
          }, 3000);
        }
      }

    } catch (error) {
      console.error('Error creating escrow:', error);
      setCurrentStep(0);
      // Show error message to user
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Tron escrow creation
  const handleTronEscrow = async () => {
    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // Get token address
      const tokenAddress = TOKEN_ADDRESSES[selectedChain]?.[selectedToken];
      if (!tokenAddress) {
        throw new Error('Token address not found');
      }

      // Calculate total amount (including platform fee)
      const totalAmount = (parseFloat(job.budget.toString()) * 1.1).toString(); // 10% fee

      setCurrentStep(3);

      // Send TRC20 USDT to escrow (for now, send to a placeholder address)
      // In production, this would be the Tron escrow contract address
      const escrowAddress = 'TBD...'; // This should be the deployed Tron escrow contract
      
      // For now, we'll simulate the transaction
      // In production: const txHash = await tronWallet.sendTRC20(tokenAddress, escrowAddress, totalAmount);
      
      // Simulate transaction
      const mockTxHash = 'tron_tx_' + Math.random().toString(16).substring(2, 16);
      const mockContractId = 'tron_contract_' + Math.random().toString(16).substring(2, 16);
      
      setTxHash(mockTxHash);
      setCurrentStep(4);

      // Notify success
      onPaymentSuccess(mockTxHash, mockContractId);
      
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error creating Tron escrow:', error);
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const availableTokens = selectedChain ? Object.keys(TOKEN_ADDRESSES[selectedChain] || {}) as SupportedToken[] : [];
  
  // Check if selected chain is Tron
  const isTronChain = selectedChain === 'tronMainnet' || selectedChain === 'tronShasta';
  
  // Get current wallet connection status
  const getCurrentWalletStatus = () => {
    if (isTronChain) {
      return {
        isConnected: tronWallet.isConnected,
        address: tronWallet.address,
        isLoading: tronWallet.isLoading,
      };
    } else {
      return {
        isConnected,
        address,
        isLoading: false,
      };
    }
  };
  
  const walletStatus = getCurrentWalletStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Wallet className="w-7 h-7 text-blue-400" />
              <span>Криптовалютный платеж</span>
            </h2>
            <p className="text-gray-400 mt-1">Безопасная оплата через блокчейн</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            {paymentSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                  step.status === 'completed' && "bg-green-500 text-white",
                  step.status === 'current' && "bg-blue-500 text-white",
                  step.status === 'pending' && "bg-gray-600 text-gray-300",
                  step.status === 'error' && "bg-red-500 text-white"
                )}>
                  {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < paymentSteps.length - 1 && (
                  <div className={cn(
                    "w-12 h-0.5 mx-2",
                    index < currentStep ? "bg-green-500" : "bg-gray-600"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-600/30 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-2">{job.title}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Фрилансер:</span>
                <p className="text-white">{job.freelancerName}</p>
              </div>
              <div>
                <span className="text-gray-400">Срок:</span>
                <p className="text-white">{job.selectedDuration}</p>
              </div>
            </div>
          </div>

          {/* Network Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Выберите блокчейн сеть
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(SUPPORTED_CHAINS).map(([key, chainConfig]) => (
                <button
                  key={key}
                  onClick={() => handleChainChange(key as SupportedChain)}
                  className={cn(
                    "p-3 rounded-lg border transition-all text-sm",
                    selectedChain === key
                      ? "border-blue-500 bg-blue-500/20 text-blue-300"
                      : "border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500"
                  )}
                >
                  <div className="font-medium">{chainConfig.name}</div>
                  <div className="text-xs opacity-75">
                    {chainConfig.nativeCurrency.symbol}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Token Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Валюта платежа
            </label>
            <div className="flex space-x-3">
              {availableTokens.map((token) => (
                <button
                  key={token}
                  onClick={() => setSelectedToken(token)}
                  className={cn(
                    "px-4 py-2 rounded-lg border transition-all",
                    selectedToken === token
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500"
                  )}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Сумма проекта
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                min={PAYMENT_CONFIG.minAmount[selectedToken]}
                max={PAYMENT_CONFIG.maxAmount[selectedToken]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Количество вех
              </label>
              <select
                value={milestones}
                onChange={(e) => setMilestones(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'веха' : 'вехи'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Сумма проекта:</span>
              <span className="text-white">{paymentAmount} {selectedToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Комиссия платформы (10%):</span>
              <span className="text-white">{platformFee.toFixed(2)} {selectedToken}</span>
            </div>
            <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
              <span className="text-white">Итого к оплате:</span>
              <span className="text-green-400">{totalAmount.toFixed(2)} {selectedToken}</span>
            </div>
          </div>

          {/* Balance Check */}
          {isConnected && tokenBalance && (
            <div className="flex items-center space-x-2 text-sm">
              <Wallet className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Ваш баланс:</span>
              <span className={cn(
                "font-medium",
                Number(tokenBalance.formatted) >= totalAmount ? "text-green-400" : "text-red-400"
              )}>
                {Number(tokenBalance.formatted).toFixed(2)} {selectedToken}
              </span>
            </div>
          )}

          {/* Security Features */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-600/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">Защита смарт-контрактом</span>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Средства заблокированы до завершения работы</li>
              <li>• Автоматическое освобождение при выполнении</li>
              <li>• Система разрешения споров</li>
              <li>• Возврат средств при отмене до {PAYMENT_CONFIG.escrowTimeout.default / (24 * 3600)} дней</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-900/50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isProcessing}
            >
              Отмена
            </button>
            
            {!walletStatus.isConnected ? (
              <button
                onClick={() => {
                  if (isTronChain) {
                    tronWallet.connect();
                  } else {
                    open();
                  }
                }}
                disabled={walletStatus.isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {walletStatus.isLoading 
                    ? 'Подключение...' 
                    : isTronChain 
                      ? 'Подключить TronLink' 
                      : 'Подключить кошелек'
                  }
                </span>
              </button>
            ) : (!isTronChain && chain?.id !== SUPPORTED_CHAINS[selectedChain].id) ? (
              <button
                onClick={handleSwitchNetwork}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Переключить сеть</span>
              </button>
            ) : (
              <button
                onClick={handleCreateEscrow}
                disabled={isProcessing || !tokenBalance || Number(tokenBalance.formatted) < totalAmount}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Обработка...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Создать escrow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

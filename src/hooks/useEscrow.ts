import { useContractWrite, useContractRead, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { PLATFORM_CONTRACTS, TOKEN_ADDRESSES } from '@/lib/web3/config';
import FreelanceEscrowABI from '@/lib/web3/abis/FreelanceEscrow.json';
import { useTokenApproval } from './useTokenApproval';

export function useEscrow(chainId: number, tokenAddress?: string, userAddress?: string) {
  const getContractAddress = () => {
    const networkKey = Object.keys(PLATFORM_CONTRACTS).find(key => {
      const network = PLATFORM_CONTRACTS[key as keyof typeof PLATFORM_CONTRACTS];
      // Map chainId to network key
      if (chainId === 80001 && key === 'polygonMumbai') return true;
      if (chainId === 80002 && key === 'polygonAmoy') return true;
      if (chainId === 137 && key === 'polygon') return true;
      if (chainId === 84532 && key === 'baseSepolia') return true;
      if (chainId === 8453 && key === 'base') return true;
      if (chainId === 421614 && key === 'arbitrumSepolia') return true;
      if (chainId === 42161 && key === 'arbitrum') return true;
      return false;
    });
    
    if (!networkKey) return null;
    
    const contracts = PLATFORM_CONTRACTS[networkKey as keyof typeof PLATFORM_CONTRACTS];
    return contracts.escrow !== '0x...' ? contracts.escrow : null;
  };

  const contractAddress = getContractAddress();

  // Token approval hook (only if token and user addresses provided)
  const tokenApproval = useTokenApproval(
    tokenAddress || '',
    contractAddress || '',
    userAddress || ''
  );

  // Create escrow contract
  const {
    write: createContract,
    data: createData,
    error: createError,
    isLoading: isCreating
  } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'createContract',
  });

  // Fund escrow contract
  const {
    write: fundContract,
    data: fundData,
    error: fundError,
    isLoading: isFunding
  } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'fundContract',
  });

  // Complete milestone
  const {
    write: completeMilestoneContract,
    data: milestoneData,
    error: milestoneError,
    isLoading: isCompletingMilestone
  } = useContractWrite({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'completeMilestone',
  });

  // Wait for create transaction
  const {
    data: createReceipt,
    isLoading: isWaitingCreate,
    error: createReceiptError
  } = useWaitForTransactionReceipt({
    hash: createData?.hash,
  });

  // Wait for fund transaction
  const {
    data: fundReceipt,
    isLoading: isWaitingFund,
    error: fundReceiptError
  } = useWaitForTransactionReceipt({
    hash: fundData?.hash,
  });

  // Wait for milestone transaction
  const {
    data: milestoneReceipt,
    isLoading: isWaitingMilestone,
    error: milestoneReceiptError
  } = useWaitForTransactionReceipt({
    hash: milestoneData?.hash,
  });

  // Check if token is supported
  const {
    data: isTokenSupported,
    isLoading: isCheckingToken
  } = useContractRead({
    address: contractAddress as `0x${string}`,
    abi: FreelanceEscrowABI,
    functionName: 'supportedTokens',
    args: [],
    enabled: !!contractAddress,
  });

  // Get contract details
  const getContractDetails = (contractId: string) => {
    return useContractRead({
      address: contractAddress as `0x${string}`,
      abi: FreelanceEscrowABI,
      functionName: 'getContractDetails',
      args: [contractId],
      enabled: !!contractAddress && !!contractId,
    });
  };

  // Helper function to create escrow
  const createEscrow = async (params: {
    freelancerAddress: string;
    tokenAddress: string;
    amount: string; // in token units (e.g., "100" for 100 USDC)
    deadline: number; // timestamp
    jobId: string;
    milestones: number;
  }) => {
    if (!contractAddress || !createContract) {
      throw new Error('Contract not available');
    }

    // Convert amount to wei (assuming 6 decimals for USDC/USDT, 18 for DAI)
    const tokenDecimals = params.tokenAddress.toLowerCase().includes('dai') ? 18 : 6;
    const amountWei = parseUnits(params.amount, tokenDecimals);

    return createContract({
      args: [
        params.freelancerAddress,
        params.tokenAddress,
        amountWei,
        params.deadline,
        params.jobId,
        '', // IPFS hash - можно добавить позже
        params.milestones
      ]
    });
  };

  // Helper function to fund escrow
  const fundEscrow = async (contractId: string) => {
    if (!contractAddress || !fundContract) {
      throw new Error('Contract not available');
    }

    return fundContract({
      args: [contractId]
    });
  };

  // Helper function to complete milestone
  const completeMilestone = async (contractId: string, milestoneIndex: number) => {
    if (!contractAddress || !completeMilestoneContract) {
      throw new Error('Contract not available');
    }

    return completeMilestoneContract({
      args: [contractId, milestoneIndex]
    });
  };

  // Get platform fee (10%)
  const getPlatformFee = (amount: string) => {
    const numAmount = parseFloat(amount);
    return (numAmount * 0.1).toString();
  };

  // Get total amount (amount + platform fee)
  const getTotalAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    const platformFee = numAmount * 0.1;
    return (numAmount + platformFee).toString();
  };

  return {
    // Contract info
    contractAddress,
    isContractAvailable: !!contractAddress,
    
    // Create functions
    createEscrow,
    isCreating: isCreating || isWaitingCreate,
    createError: createError || createReceiptError,
    createTxHash: createData?.hash,
    createReceipt,
    
    // Fund functions
    fundEscrow,
    isFunding: isFunding || isWaitingFund,
    fundError: fundError || fundReceiptError,
    fundTxHash: fundData?.hash,
    fundReceipt,
    
    // Milestone functions
    completeMilestone,
    isCompletingMilestone: isCompletingMilestone || isWaitingMilestone,
    milestoneError: milestoneError || milestoneReceiptError,
    milestoneTxHash: milestoneData?.hash,
    milestoneReceipt,
    
    // Token approval functions
    tokenApproval: {
      ...tokenApproval,
      needsApproval: (amount: string) => tokenApproval.needsApproval(getTotalAmount(amount)),
      hasEnoughBalance: (amount: string) => tokenApproval.hasEnoughBalance(getTotalAmount(amount)),
    },
    
    // Utility functions
    isTokenSupported,
    isCheckingToken,
    getContractDetails,
    getPlatformFee,
    getTotalAmount,
  };
}

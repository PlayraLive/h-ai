import { useContractWrite, useContractRead, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import ERC20ABI from '@/lib/web3/abis/ERC20.json';

export function useTokenApproval(tokenAddress: string, spenderAddress: string, userAddress: string) {
  // Check current allowance
  const {
    data: allowance,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance
  } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'allowance',
    args: [userAddress, spenderAddress],
    enabled: !!tokenAddress && !!spenderAddress && !!userAddress,
  });

  // Get token balance
  const {
    data: balance,
    isLoading: isLoadingBalance
  } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    enabled: !!tokenAddress && !!userAddress,
  });

  // Get token decimals
  const {
    data: decimals,
    isLoading: isLoadingDecimals
  } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress,
  });

  // Get token symbol
  const {
    data: symbol,
    isLoading: isLoadingSymbol
  } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'symbol',
    enabled: !!tokenAddress,
  });

  // Approve tokens
  const {
    write: approve,
    data: approveData,
    error: approveError,
    isLoading: isApproving
  } = useContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'approve',
  });

  // Wait for approval transaction
  const {
    data: approveReceipt,
    isLoading: isWaitingApproval,
    error: approveReceiptError
  } = useWaitForTransactionReceipt({
    hash: approveData?.hash,
    onSuccess: () => {
      // Refetch allowance after successful approval
      refetchAllowance();
    }
  });

  // Helper functions
  const formatBalance = (amount: bigint | undefined, tokenDecimals: number | undefined): string => {
    if (!amount || !tokenDecimals) return '0';
    return formatUnits(amount, tokenDecimals);
  };

  const formatAllowance = (amount: bigint | undefined, tokenDecimals: number | undefined): string => {
    if (!amount || !tokenDecimals) return '0';
    return formatUnits(amount, tokenDecimals);
  };

  const needsApproval = (requiredAmount: string): boolean => {
    if (!allowance || !decimals) return true;
    const requiredAmountWei = parseUnits(requiredAmount, decimals);
    return allowance < requiredAmountWei;
  };

  const hasEnoughBalance = (requiredAmount: string): boolean => {
    if (!balance || !decimals) return false;
    const requiredAmountWei = parseUnits(requiredAmount, decimals);
    return balance >= requiredAmountWei;
  };

  const approveAmount = async (amount: string) => {
    if (!approve || !decimals) {
      throw new Error('Approve function not available');
    }

    const amountWei = parseUnits(amount, decimals);
    return approve({
      args: [spenderAddress, amountWei]
    });
  };

  const approveMax = async () => {
    if (!approve) {
      throw new Error('Approve function not available');
    }

    // Approve maximum amount (2^256 - 1)
    const maxAmount = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    return approve({
      args: [spenderAddress, maxAmount]
    });
  };

  return {
    // Token info
    symbol: symbol as string,
    decimals: decimals as number,
    
    // Balances and allowances
    balance,
    allowance,
    formattedBalance: formatBalance(balance as bigint, decimals as number),
    formattedAllowance: formatAllowance(allowance as bigint, decimals as number),
    
    // Loading states
    isLoading: isLoadingAllowance || isLoadingBalance || isLoadingDecimals || isLoadingSymbol,
    isApproving: isApproving || isWaitingApproval,
    
    // Approval functions
    approve: approveAmount,
    approveMax,
    approveError: approveError || approveReceiptError,
    approveTxHash: approveData?.hash,
    approveReceipt,
    
    // Helper functions
    needsApproval,
    hasEnoughBalance,
    refetchAllowance,
  };
}

import { useState, useEffect, useCallback } from 'react';

// Типы для TronWeb
interface TronWeb {
  ready: boolean;
  defaultAddress: {
    base58: string;
    hex: string;
  };
  trx: {
    getBalance: (address: string) => Promise<number>;
    sendTransaction: (options: any) => Promise<string>;
  };
  contract: (abi: any, address: string) => any;
  isConnected: () => boolean;
}

interface TronLinkWallet {
  ready: boolean;
  tronWeb: TronWeb;
  request: (params: { method: string; params?: any }) => Promise<any>;
}

declare global {
  interface Window {
    tronLink: TronLinkWallet;
    tronWeb: TronWeb;
  }
}

export function useTronWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Check if TronLink is installed
  const isTronLinkInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.tronLink;
  }, []);

  // Connect to TronLink wallet
  const connect = useCallback(async () => {
    if (!isTronLinkInstalled()) {
      setError('TronLink wallet not installed');
      return false;
    }

    try {
      setIsLoading(true);
      setError('');

      // Request account access
      const response = await window.tronLink.request({
        method: 'tron_requestAccounts'
      });

      if (response.code === 200) {
        const tronWeb = window.tronWeb;
        if (tronWeb && tronWeb.ready && tronWeb.defaultAddress) {
          setAddress(tronWeb.defaultAddress.base58);
          setIsConnected(true);
          
          // Get balance
          const balance = await tronWeb.trx.getBalance(tronWeb.defaultAddress.base58);
          setBalance(balance / 1000000); // Convert from SUN to TRX
          
          return true;
        }
      }
      
      throw new Error('Failed to connect to TronLink');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isTronLinkInstalled]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress('');
    setBalance(0);
    setError('');
  }, []);

  // Send TRC20 token transaction
  const sendTRC20 = useCallback(async (
    tokenAddress: string,
    toAddress: string,
    amount: string,
    decimals: number = 6
  ) => {
    if (!isConnected || !window.tronWeb) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      
      // Convert amount to smallest unit
      const amountInSmallestUnit = Math.floor(parseFloat(amount) * Math.pow(10, decimals));
      
      // Get contract instance
      const contract = await window.tronWeb.contract().at(tokenAddress);
      
      // Send transaction
      const result = await contract.transfer(toAddress, amountInSmallestUnit).send();
      
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Get TRC20 token balance
  const getTRC20Balance = useCallback(async (tokenAddress: string, userAddress?: string) => {
    if (!window.tronWeb) {
      throw new Error('TronWeb not available');
    }

    try {
      const contract = await window.tronWeb.contract().at(tokenAddress);
      const targetAddress = userAddress || address;
      const balance = await contract.balanceOf(targetAddress).call();
      
      return balance.toString();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get balance');
    }
  }, [address]);

  // Check if address is valid Tron address
  const isValidTronAddress = useCallback((addr: string) => {
    return addr.startsWith('T') && addr.length === 34;
  }, []);

  // Initialize connection on mount
  useEffect(() => {
    if (isTronLinkInstalled() && window.tronWeb && window.tronWeb.ready) {
      if (window.tronWeb.defaultAddress) {
        setAddress(window.tronWeb.defaultAddress.base58);
        setIsConnected(true);
        
        // Get initial balance
        window.tronWeb.trx.getBalance(window.tronWeb.defaultAddress.base58)
          .then(balance => setBalance(balance / 1000000))
          .catch(console.error);
      }
    }
  }, [isTronLinkInstalled]);

  return {
    // Connection state
    isConnected,
    address,
    balance, // TRX balance
    isLoading,
    error,
    
    // Connection functions
    connect,
    disconnect,
    isTronLinkInstalled,
    
    // Transaction functions
    sendTRC20,
    getTRC20Balance,
    
    // Utility functions
    isValidTronAddress,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '@/types';
import { SUPPORTED_CHAINS } from '@/utils/constants';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });
  const [mounted, setMounted] = useState(false);
  const [hasUserConnected, setHasUserConnected] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
    
    // Check if user has previously connected (but don't auto-connect)
    const wasConnected = localStorage.getItem('defi-wallet-connected');
    if (wasConnected === 'true') {
      setHasUserConnected(true);
    }
  }, []);

  const resetWallet = useCallback(() => {
    setWallet({
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
    setHasUserConnected(false);
    localStorage.removeItem('defi-wallet-connected');
  }, []);

  const updateBalance = useCallback(async (address: string, provider: ethers.BrowserProvider) => {
    try {
      const balance = await provider.getBalance(address);
      setWallet(prev => ({
        ...prev,
        balance: ethers.formatEther(balance)
      }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, []);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  }, []);

  const connectWallet = useCallback(async () => {
    if (!mounted || typeof window === 'undefined') {
      setWallet(prev => ({
        ...prev,
        error: 'Wallet connection is not available in this environment.'
      }));
      return;
    }

    // Check if MetaMask is installed
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      setWallet(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.'
      }));
      return;
    }

    setWallet(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const address = accounts[0];

      setWallet(prev => ({
        ...prev,
        address,
        chainId: Number(network.chainId),
        isConnecting: false
      }));

      // Mark that user has manually connected
      setHasUserConnected(true);
      localStorage.setItem('defi-wallet-connected', 'true');

      // Fetch balance
      await updateBalance(address, provider);

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (error.code === 4001) {
        errorMessage = 'Connection request was rejected. Please try again.';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request is already pending. Please check MetaMask.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage
      }));
    }
  }, [updateBalance, mounted]);

  const disconnectWallet = useCallback(() => {
    resetWallet();
  }, [resetWallet]);

  // Enhanced network switching with proper network configuration
  const switchNetwork = useCallback(async (chainId: number) => {
    if (!mounted || typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not available');
    }

    const network = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
    if (!network) {
      throw new Error(`Unsupported network with chain ID: ${chainId}`);
    }

    const hexChainId = `0x${chainId.toString(16)}`;

    try {
      // First, try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });

      // Update the local state
      setWallet(prev => ({
        ...prev,
        chainId,
        error: null
      }));

    } catch (switchError: any) {
      console.log('Network switch error:', switchError);
      
      // If the network doesn't exist (error code 4902), add it
      if (switchError.code === 4902) {
        try {
          // Prepare network parameters with proper structure
          const networkParams = {
            chainId: hexChainId,
            chainName: network.name,
            nativeCurrency: {
              name: network.symbol,
              symbol: network.symbol,
              decimals: 18,
            },
            rpcUrls: [network.rpc],
            blockExplorerUrls: [network.blockExplorer],
          };

          console.log('Adding network with params:', networkParams);

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
          });

          // After adding, the network should be switched automatically
          setWallet(prev => ({
            ...prev,
            chainId,
            error: null
          }));

          console.log(`Successfully added and switched to ${network.name}`);

        } catch (addError: any) {
          console.error('Failed to add network:', addError);
          
          // Provide more specific error messages
          if (addError.code === 4001) {
            throw new Error('User rejected network addition request');
          } else if (addError.code === -32602) {
            throw new Error('Invalid network parameters');
          } else if (addError.message) {
            throw new Error(`Failed to add ${network.name}: ${addError.message}`);
          } else {
            throw new Error(`Failed to add ${network.name} network to MetaMask`);
          }
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        throw new Error('User rejected network switch request');
      } else if (switchError.code === -32002) {
        // Request already pending
        throw new Error('Network switch request already pending. Please check MetaMask.');
      } else {
        console.error('Network switch failed:', switchError);
        throw new Error(`Failed to switch to ${network.name}. Please try again.`);
      }
    }
  }, [mounted]);

  // Add a helper function to get network info
  const getNetworkInfo = useCallback((chainId: number | null) => {
    if (!chainId) return null;
    return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS] || null;
  }, []);

  // Add a function to check if network is supported
  const isNetworkSupported = useCallback((chainId: number | null) => {
    if (!chainId) return false;
    return chainId in SUPPORTED_CHAINS;
  }, []);

  // Listen to account and network changes (but only if user has connected)
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.ethereum || !hasUserConnected) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected from MetaMask
        resetWallet();
      } else if (accounts[0] !== wallet.address) {
        // User switched accounts
        setWallet(prev => ({ 
          ...prev, 
          address: accounts[0],
          error: null 
        }));
        
        // Update balance for new account
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          updateBalance(accounts[0], provider);
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);
      setWallet(prev => ({
        ...prev,
        chainId: numericChainId,
        error: null
      }));

      // Update balance when chain changes
      if (wallet.address && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        updateBalance(wallet.address, provider);
      }
    };

    const handleConnect = (connectInfo: { chainId: string }) => {
      console.log('Wallet connected:', connectInfo);
      setWallet(prev => ({
        ...prev,
        error: null
      }));
    };

    const handleDisconnect = (error: { code: number; message: string }) => {
      console.log('Wallet disconnected:', error);
      resetWallet();
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [wallet.address, resetWallet, updateBalance, mounted, hasUserConnected]);

  // Check wallet connection on mount ONLY if user previously connected manually
  useEffect(() => {
    const checkConnection = async () => {
      if (!mounted || typeof window === 'undefined' || !window.ethereum || !hasUserConnected) return;

      try {
        // Check if accounts are available (user is still connected)
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();

          setWallet(prev => ({
            ...prev,
            address: accounts[0],
            chainId: Number(network.chainId),
            error: null
          }));

          await updateBalance(accounts[0], provider);
        } else {
          // User disconnected from MetaMask, clear our state
          resetWallet();
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
        // Don't auto-reset on error, just log it
      }
    };

    if (mounted) {
      checkConnection();
    }
  }, [updateBalance, mounted, hasUserConnected, resetWallet]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getNetworkInfo,
    isNetworkSupported,
    isConnected: !!wallet.address,
    isMetaMaskInstalled,
  };
};
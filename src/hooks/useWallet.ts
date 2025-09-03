'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '@/types';

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

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const resetWallet = useCallback(() => {
    setWallet({
      address: null,
      balance: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
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

  const connectWallet = useCallback(async () => {
    if (!mounted || typeof window === 'undefined' || !window.ethereum) {
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
        throw new Error('No accounts found');
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

      // Fetch balance
      await updateBalance(address, provider);

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect wallet'
      }));
    }
  }, [updateBalance, mounted]);

  const disconnectWallet = useCallback(() => {
    resetWallet();
  }, [resetWallet]);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (!mounted || typeof window === 'undefined' || !window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        throw new Error('Network not added to MetaMask');
      }
      throw error;
    }
  }, [mounted]);

  // Listen to account and network changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        resetWallet();
      } else if (accounts[0] !== wallet.address) {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
        // Update balance for new account
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          updateBalance(accounts[0], provider);
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWallet(prev => ({
        ...prev,
        chainId: parseInt(chainId, 16)
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [wallet.address, resetWallet, updateBalance, mounted]);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!mounted || typeof window === 'undefined' || !window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();

          setWallet(prev => ({
            ...prev,
            address: accounts[0],
            chainId: Number(network.chainId)
          }));

          await updateBalance(accounts[0], provider);
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    if (mounted) {
      checkConnection();
    }
  }, [updateBalance, mounted]);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isConnected: !!wallet.address,
  };
};
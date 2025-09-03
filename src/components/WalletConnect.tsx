'use client';

import React, { useState, useEffect } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { formatAddress, formatBalance } from '@/utils/helpers';
import { SUPPORTED_CHAINS } from '@/utils/constants';
import { LoadingSkeleton } from './ui/LoadingSkeleton';

export const WalletConnect: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, isConnected } = useWalletContext();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-3 bg-white dark:bg-dark-card rounded-lg shadow-md p-4">
        <LoadingSkeleton className="w-32 h-10" />
      </div>
    );
  }

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const getNetworkName = (chainId: number | null): string => {
    if (!chainId) return 'Unknown';
    return SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS]?.name || `Chain ${chainId}`;
  };

  if (wallet.isConnecting) {
    return (
      <div className="flex items-center space-x-3 bg-white dark:bg-dark-card rounded-lg shadow-md p-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Connecting wallet...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center">
        <button
          onClick={handleConnect}
          disabled={wallet.isConnecting}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.5 6h-17A1.5 1.5 0 002 7.5v9A1.5 1.5 0 003.5 18h17a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0020.5 6z"/>
            <path d="M5 10h2v4H5zm12 0h2v4h-2z"/>
          </svg>
          Connect MetaMask
        </button>
        
        {wallet.error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{wallet.error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.5 6h-17A1.5 1.5 0 002 7.5v9A1.5 1.5 0 003.5 18h17a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0020.5 6z"/>
              <path d="M5 10h2v4H5zm12 0h2v4h-2z"/>
            </svg>
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatAddress(wallet.address!)}
              </span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="ml-1 text-xs text-green-600 dark:text-green-400">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              {wallet.balance !== null ? (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {formatBalance(wallet.balance)} ETH
                </span>
              ) : (
                <LoadingSkeleton className="w-20 h-4" />
              )}
              
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getNetworkName(wallet.chainId)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={disconnectWallet}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-600 rounded-md transition-colors duration-200"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};
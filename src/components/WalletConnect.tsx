'use client';

import React, { useState, useEffect } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { formatAddress, formatBalance } from '@/utils/helpers';
import { SUPPORTED_CHAINS, type NetworkConfig } from '@/utils/constants';
import { LoadingSkeleton } from './ui/LoadingSkeleton';
import { AnimatedButton } from './ui/AnimatedButton';

export const WalletConnect: React.FC = () => {
  const { wallet, connectWallet, disconnectWallet, isConnected, switchNetwork, isNetworkSupported, isMetaMaskInstalled } = useWalletContext();
  const [mounted, setMounted] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [switchingNetwork, setSwitchingNetwork] = useState<number | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.wallet-menu') && !target.closest('.network-menu')) {
        setShowNetworkMenu(false);
        setShowWalletMenu(false);
        setNetworkError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-3">
        <LoadingSkeleton className="w-24 sm:w-32 h-8 sm:h-10 rounded-lg sm:rounded-xl" />
      </div>
    );
  }

  const handleConnect = async () => {
    try {
      setNetworkError(null);
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
      setNetworkError(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  const handleInstallMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  // getNetworkInfo function with proper typing
  const getNetworkInfo = (chainId: number | null): NetworkConfig & { isSupported: boolean } => {
    if (!chainId) {
      return { 
        name: 'Unknown Network', 
        color: '#6B7280', 
        symbol: '?',
        rpc: '',
        blockExplorer: 'https://etherscan.io',
        coingeckoId: 'ethereum',
        isSupported: false
      };
    }
    
    const network = SUPPORTED_CHAINS[chainId];
    if (network) {
      return { ...network, isSupported: true };
    }
    
    return { 
      name: `Chain ${chainId}`, 
      color: '#6B7280', 
      symbol: '?',
      rpc: '',
      blockExplorer: 'https://etherscan.io',
      coingeckoId: 'ethereum',
      isSupported: false
    };
  };

  const handleNetworkSwitch = async (chainId: number) => {
    try {
      setSwitchingNetwork(chainId);
      setNetworkError(null);
      await switchNetwork(chainId);
      setShowNetworkMenu(false);
    } catch (error: any) {
      console.error('Network switch failed:', error);
      setNetworkError(error.message || 'Failed to switch network');
    } finally {
      setSwitchingNetwork(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Loading state during connection
  if (wallet.isConnecting) {
    return (
      <div className="flex items-center space-x-2 sm:space-x-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-blue-500 border-t-transparent"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-800"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
              Connecting...
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Check your wallet
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="flex flex-col mb-4 items-center space-y-3 sm:space-y-4 px-4 sm:px-0">
        {/* Check if MetaMask is installed */}
        {!isMetaMaskInstalled() ? (
          // MetaMask not installed
          <div className="text-center space-y-3 sm:space-y-4 w-full">
            <div className="p-4 sm:p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    MetaMask Required
                  </h3>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-3 sm:mb-4">
                    To use this DeFi portfolio tracker, you need to install the MetaMask browser extension. 
                    MetaMask is a secure wallet that lets you interact with blockchain applications.
                  </p>
                  <div className="space-y-3">
                    <AnimatedButton 
                      onClick={handleInstallMetaMask}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-sm sm:text-base"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                        <span>Install MetaMask</span>
                      </div>
                    </AnimatedButton>
                    <p className="text-xs text-orange-700 dark:text-orange-300 text-center">
                      Opens in a new tab • Free to install • Takes 2 minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Alternative wallets info */}
            <div className="text-center w-full pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Don't have MetaMask? Here's what you need to know:
              </p>
              <div className="flex flex-col items-start sm:grid sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Secure & Open Source</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Works with All Browsers</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Trusted by Millions</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // MetaMask is installed
          <div className="space-y-3 sm:space-y-4 w-full">
            <AnimatedButton onClick={handleConnect} disabled={wallet.isConnecting} className="w-full">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <div className="relative">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.5 6h-17A1.5 1.5 0 002 7.5v9A1.5 1.5 0 003.5 18h17a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0020.5 6z"/>
                    <path d="M5 10h2v4H5zm12 0h2v4h-2z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                <span className="font-semibold text-sm sm:text-base">Connect Wallet</span>
              </div>
            </AnimatedButton>
            
            {/* Help text */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 px-2">
                Connect your wallet to view and manage your DeFi portfolio
              </p>
              <div className="flex items-center justify-center space-x-3 sm:space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Secure</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Read-only</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Multi-chain</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error display */}
        {(wallet.error || networkError) && (
          <div className="w-full max-w-sm p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Connection Failed
                </p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-300 mt-1">
                  {wallet.error || networkError}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setNetworkError(null);
                if (wallet.error) {
                  handleConnect();
                }
              }}
              className="mt-2 text-xs text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Connected state
  const networkInfo = getNetworkInfo(wallet.chainId);
  const supportedChains = Object.entries(SUPPORTED_CHAINS);
  const currentNetworkSupported = isNetworkSupported && isNetworkSupported(wallet.chainId);

  return (
    <div className="relative w-full mb-4 sm:w-auto">
      {/* Main wallet info card */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 p-3 sm:p-4 w-full sm:min-w-[280px]">
        <div className="flex items-center justify-between">
          {/* Left side - Avatar and info */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            {/* Wallet avatar with connection status */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 6h-17A1.5 1.5 0 002 7.5v9A1.5 1.5 0 003.5 18h17a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0020.5 6z"/>
                  <path d="M5 10h2v4H5zm12 0h2v4h-2z"/>
                </svg>
              </div>
              {/* Connection status indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 border-2 border-white dark:border-gray-900 rounded-full flex items-center justify-center ${
                currentNetworkSupported ? 'bg-green-400' : 'bg-yellow-400'
              }`}>
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${
                  currentNetworkSupported ? 'bg-green-600' : 'bg-yellow-600'
                }`}></div>
              </div>
            </div>
            
            {/* Wallet details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                <button
                  onClick={() => setShowWalletMenu(!showWalletMenu)}
                  className="wallet-menu text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
                  title={wallet.address || ''}
                >
                  {formatAddress(wallet.address!)}
                </button>
                
                {/* Copy address button */}
                <button
                  onClick={() => copyToClipboard(wallet.address!)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                  title="Copy address"
                >
                  <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Balance display */}
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {wallet.balance !== null ? (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {formatBalance(wallet.balance, 18)} ETH
                    </span>
                  ) : (
                    <LoadingSkeleton className="w-12 sm:w-16 h-3" />
                  )}
                </div>
                
                {/* Network selector */}
                <button
                  onClick={() => setShowNetworkMenu(!showNetworkMenu)}
                  className={`network-menu flex items-center space-x-1 px-1.5 sm:px-2 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group flex-shrink-0 ${
                    currentNetworkSupported 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                  }`}
                >
                  <div
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: networkInfo.color }}
                  />
                  <span className="text-xs font-medium max-w-[40px] sm:max-w-[60px] truncate">
                    {networkInfo.name}
                  </span>
                  {!currentNetworkSupported && (
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right side - Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Settings/More options */}
            <button
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="wallet-menu p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Wallet options"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {/* Disconnect button */}
            <button
              onClick={disconnectWallet}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Disconnect wallet"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Unsupported network warning */}
        {!currentNetworkSupported && (
          <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  Unsupported Network
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Switch to a supported network to use all features
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Network Selection Menu */}
      {showNetworkMenu && (
        <div className="network-menu absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Switch Network
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select a network to switch to
            </p>
          </div>
          
          {/* Network error display */}
          {networkError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">
                    Network Switch Failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    {networkError}
                  </p>
                </div>
                <button
                  onClick={() => setNetworkError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="p-2 max-h-64 overflow-y-auto">
            {supportedChains.map(([chainId, chain]) => {
              const isCurrentNetwork = wallet.chainId === parseInt(chainId);
              const isSwitching = switchingNetwork === parseInt(chainId);
              
              return (
                <button
                  key={chainId}
                  onClick={() => handleNetworkSwitch(parseInt(chainId))}
                  disabled={isCurrentNetwork || isSwitching}
                  className={`w-full flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrentNetwork 
                      ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 ring-opacity-20' 
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-sm flex-shrink-0"
                      style={{ backgroundColor: chain.color }}
                    />
                    <div className="text-left">
                      <div className={`text-xs sm:text-sm font-medium ${
                        isCurrentNetwork 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {chain.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {chain.symbol}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {isSwitching ? (
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-500 border-t-transparent" />
                    ) : isCurrentNetwork ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Networks are automatically added to MetaMask if needed
            </p>
          </div>
        </div>
      )}

      {/* Wallet Options Menu */}
      {showWalletMenu && (
        <div className="wallet-menu absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-60 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Wallet Options
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Manage your wallet connection
            </p>
          </div>
          
          <div className="p-2">
            {/* View on Explorer */}
            <button
              onClick={() => {
                const explorerUrl = networkInfo.blockExplorer;
                window.open(`${explorerUrl}/address/${wallet.address}`, '_blank');
                setShowWalletMenu(false);
              }}
              className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  View on Explorer
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Open in {networkInfo.name} explorer
                </div>
              </div>
            </button>
            
            {/* Copy Address */}
            <button
              onClick={() => {
                copyToClipboard(wallet.address!);
                setShowWalletMenu(false);
              }}
              className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                  Copy Address
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                  {formatAddress(wallet.address!)}
                </div>
              </div>
            </button>
            
            {/* Disconnect */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            <button
              onClick={() => {
                disconnectWallet();
                setShowWalletMenu(false);
              }}
              className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-hover:text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                  Disconnect Wallet
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Disconnect from this app
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for closing menus */}
      {(showNetworkMenu || showWalletMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNetworkMenu(false);
            setShowWalletMenu(false);
            setNetworkError(null);
          }} 
        />
      )}
    </div>
  );
};
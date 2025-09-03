'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { PortfolioOverview } from '@/components/PortfolioOverview';
import { DeFiPositions } from '@/components/DeFiPositions';
import { TokenList } from '@/components/TokenList';
import { useWalletContext } from '@/contexts/WalletContext';
import { usePortfolio } from '@/hooks/usePortfolio';

export default function Home() {
  const { isConnected, wallet } = useWalletContext();
  const { portfolio, loading, error, refreshPortfolio } = usePortfolio(wallet.address);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          // Welcome screen
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to DeFi Portfolio Tracker
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Connect your wallet to view and manage your DeFi positions and cryptocurrency portfolio all in one place.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center p-6 bg-white dark:bg-dark-card rounded-lg shadow-md border border-gray-200 dark:border-dark-border">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Portfolio Overview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get a comprehensive view of all your assets and their current values
                  </p>
                </div>

                <div className="text-center p-6 bg-white dark:bg-dark-card rounded-lg shadow-md border border-gray-200 dark:border-dark-border">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    DeFi Positions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Track your lending, liquidity, and staking positions across protocols
                  </p>
                </div>

                <div className="text-center p-6 bg-white dark:bg-dark-card rounded-lg shadow-md border border-gray-200 dark:border-dark-border">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Real-time Prices
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Live price updates and 24h changes for all your holdings
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Dashboard
          <div className="space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error loading portfolio
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      {error.message}
                    </p>
                  </div>
                  <button
                    onClick={refreshPortfolio}
                    className="ml-auto px-3 py-1 text-sm text-red-700 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800 rounded transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div id="overview">
              <PortfolioOverview portfolio={portfolio} loading={loading} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div id="positions">
                <DeFiPositions 
                  positions={portfolio?.defiPositions || []} 
                  loading={loading} 
                />
              </div>
              
              <div id="tokens">
                <TokenList 
                  tokens={portfolio?.tokens || []} 
                  loading={loading} 
                />
              </div>
            </div>

            {/* Refresh Button */}
            {!loading && portfolio && (
              <div className="text-center">
                <button
                  onClick={refreshPortfolio}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Portfolio
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">
              DeFi Portfolio Tracker - Built with Next.js, TypeScript, and Ethers.js
            </p>
            <p className="text-xs mt-2">
              This is a demo application. Always verify transactions and do your own research.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
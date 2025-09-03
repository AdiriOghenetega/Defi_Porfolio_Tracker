'use client';

import React from 'react';
import { Portfolio } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/helpers';
import { LoadingSkeleton } from './ui/LoadingSkeleton';

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
  loading: boolean;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  portfolio,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
        <LoadingSkeleton className="w-40 h-8 mb-4" />
        <LoadingSkeleton className="w-24 h-6 mb-2" />
        <LoadingSkeleton className="w-32 h-4" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Connect your wallet to view portfolio
        </div>
      </div>
    );
  }

  const isPositive = portfolio.last24hChange >= 0;

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Portfolio Overview
        </h2>
        <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          View Details
        </button>
      </div>

      <div className="space-y-6">
        {/* Total Value */}
        <div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {formatCurrency(portfolio.totalValue)}
          </div>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${
              isPositive 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatPercentage(portfolio.last24hChange)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              24h change
            </span>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Wallet Tokens
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(portfolio.tokens.reduce((sum, token) => sum + token.value, 0))}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {portfolio.tokens.length} tokens
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                DeFi Positions
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(portfolio.defiPositions.reduce((sum, pos) => sum + pos.totalValue, 0))}
              </span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {portfolio.defiPositions.length} positions
            </div>
          </div>
        </div>

        {/* Top Tokens */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Top Holdings
          </h3>
          <div className="space-y-2">
            {portfolio.tokens
              .sort((a, b) => b.value - a.value)
              .slice(0, 3)
              .map((token) => (
                <div key={token.address} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {token.symbol}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {token.balance} {token.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(token.value)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ${token.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
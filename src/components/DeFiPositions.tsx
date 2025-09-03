'use client';

import React, { useState } from 'react';
import { DeFiPosition } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/helpers';
import { LoadingSkeleton } from './ui/LoadingSkeleton';

interface DeFiPositionsProps {
  positions: DeFiPosition[];
  loading: boolean;
}

const ProtocolIcon: React.FC<{ protocol: string }> = ({ protocol }) => {
  const getIconColor = (protocol: string) => {
    switch (protocol.toLowerCase()) {
      case 'uniswap v3':
        return 'from-pink-500 to-purple-600';
      case 'aave':
        return 'from-blue-500 to-cyan-600';
      case 'compound':
        return 'from-green-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className={`w-10 h-10 bg-gradient-to-r ${getIconColor(protocol)} rounded-lg flex items-center justify-center`}>
      <span className="text-white font-bold text-sm">
        {protocol.charAt(0)}
      </span>
    </div>
  );
};

const PositionTypeBadge: React.FC<{ type: DeFiPosition['type'] }> = ({ type }) => {
  const getTypeColor = (type: DeFiPosition['type']) => {
    switch (type) {
      case 'liquidity':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'lending':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'staking':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'farming':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export const DeFiPositions: React.FC<DeFiPositionsProps> = ({ positions, loading }) => {
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
        <LoadingSkeleton className="w-32 h-6 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <LoadingSkeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <LoadingSkeleton className="w-24 h-4 mb-2" />
                  <LoadingSkeleton className="w-16 h-3" />
                </div>
                <LoadingSkeleton className="w-20 h-6" />
              </div>
              <LoadingSkeleton className="w-full h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          DeFi Positions
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-1v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-1c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-1" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No DeFi positions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          DeFi Positions
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {positions.length} active positions
        </div>
      </div>

      <div className="space-y-4">
        {positions.map((position) => (
          <div
            key={position.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ProtocolIcon protocol={position.protocol} />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {position.protocol}
                    </h3>
                    <PositionTypeBadge type={position.type} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {position.tokens.map(token => token.symbol).join(' / ')}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(position.totalValue)}
                </div>
                {position.apy && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {formatPercentage(position.apy)} APY
                  </div>
                )}
              </div>
            </div>

            {/* Token breakdown */}
            <div className="mt-4 space-y-2">
              {position.tokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">
                      {token.balance} {token.symbol}
                    </span>
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(token.value)}
                  </span>
                </div>
              ))}
            </div>

            {/* Rewards */}
            {position.rewards && position.rewards.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Pending Rewards
                </div>
                {position.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {reward.amount} {reward.token}
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatCurrency(reward.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Expand/Collapse button */}
            <button
              onClick={() => setExpandedPosition(
                expandedPosition === position.id ? null : position.id
              )}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center"
            >
              {expandedPosition === position.id ? 'Show Less' : 'Show More'}
              <svg
                className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                  expandedPosition === position.id ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded content */}
            {expandedPosition === position.id && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Position Type:</span>
                    <span className="ml-2 text-gray-900 dark:text-white capitalize">
                      {position.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Protocol:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {position.protocol}
                    </span>
                  </div>
                  {position.apy && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">Current APY:</span>
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        {formatPercentage(position.apy)}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Total Value:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      {formatCurrency(position.totalValue)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
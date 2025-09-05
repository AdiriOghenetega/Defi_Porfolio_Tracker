'use client';

import React, { useMemo } from 'react';
import { Portfolio } from '@/types';
import { formatCurrency, formatPercentage } from '@/utils/helpers';
import { LoadingSkeleton } from './ui/LoadingSkeleton';
import { MetricCard } from './ui/MetricCard';
import { AnimatedButton } from './ui/AnimatedButton';

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
  loading: boolean;
  onRefresh?: () => void;
  isRealTimeEnabled?: boolean;
}

// Simple chart component for portfolio performance
const PortfolioChart: React.FC<{ 
  totalValue: number; 
  last24hChange: number; 
  className?: string; 
}> = ({ totalValue, last24hChange, className = '' }) => {
  // Generate mock chart data points
  const chartData = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    const baseValue = totalValue / (1 + last24hChange / 100);
    
    // Generate 24 data points (hourly for 24h)
    for (let i = 0; i < 24; i++) {
      const progress = i / 23;
      const variation = Math.sin(progress * Math.PI) * (last24hChange / 100) * 0.5;
      const randomNoise = (Math.random() - 0.5) * 0.02; // ±1% random variation
      const value = baseValue * (1 + (progress * last24hChange / 100) + variation + randomNoise);
      
      points.push({
        x: (i / 23) * 100, // 0 to 100 for SVG viewBox
        y: 50 - ((value - baseValue) / baseValue) * 100 // Center around 50
      });
    }
    
    return points;
  }, [totalValue, last24hChange]);

  const pathData = useMemo(() => {
    if (chartData.length < 2) return '';
    
    const path = chartData
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${Math.max(10, Math.min(90, point.y))}`)
      .join(' ');
    
    return path;
  }, [chartData]);

  const isPositive = last24hChange >= 0;
  const gradientId = `chart-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          24h Performance
        </h3>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isPositive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          <svg 
            className={`w-3 h-3 ${isPositive ? 'rotate-0' : 'rotate-180'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span>{formatPercentage(Math.abs(last24hChange))}</span>
        </div>
      </div>
      
      <div className="relative h-32">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop 
                offset="0%" 
                stopColor={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} 
                stopOpacity={0.3} 
              />
              <stop 
                offset="100%" 
                stopColor={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'} 
                stopOpacity={0.1} 
              />
            </linearGradient>
          </defs>
          
          {/* Area under curve */}
          <path
            d={`${pathData} L 100 90 L 0 90 Z`}
            fill={`url(#${gradientId})`}
          />
          
          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {chartData.slice(-1).map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={Math.max(10, Math.min(90, point.y))}
              r="2"
              fill={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  portfolio,
  loading,
  onRefresh,
  isRealTimeEnabled = false,
}) => {
  const { walletValue, defiValue } = useMemo(() => {
    if (!portfolio) return { walletValue: 0, defiValue: 0 };
    
    const walletValue = portfolio.tokens.reduce((sum, token) => sum + token.value, 0);
    const defiValue = portfolio.defiPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
    
    return { walletValue, defiValue };
  }, [portfolio]);

  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <LoadingSkeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <LoadingSkeleton className="w-48 h-6" />
                <LoadingSkeleton className="w-32 h-4" />
              </div>
            </div>
            <LoadingSkeleton className="w-24 h-10 rounded-xl" />
          </div>
          
          {/* Total value skeleton */}
          <div className="text-center space-y-4">
            <LoadingSkeleton className="w-64 h-12 mx-auto" />
            <LoadingSkeleton className="w-32 h-6 mx-auto" />
          </div>
          
          {/* Metric cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-32 rounded-2xl" />
            <LoadingSkeleton className="h-32 rounded-2xl" />
            <LoadingSkeleton className="h-32 rounded-2xl" />
          </div>
          
          {/* Chart skeleton */}
          <LoadingSkeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Connect your wallet to view your portfolio overview, track your DeFi positions, and monitor your asset performance in real-time.
          </p>
          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Real-time</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Multi-chain</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = portfolio.last24hChange >= 0;

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Portfolio Overview
            </h2>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Real-time portfolio tracking
              </p>
              {isRealTimeEnabled && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Total Value Display */}
      <div className="relative z-10 text-center mb-8">
        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {formatCurrency(portfolio.totalValue)}
        </div>
        
        <div className="flex items-center justify-center space-x-3">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
            isPositive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <svg 
              className={`w-4 h-4 ${isPositive ? 'rotate-0' : 'rotate-180'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">
              {formatPercentage(Math.abs(portfolio.last24hChange))}
            </span>
          </div>
          
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {formatCurrency(Math.abs(portfolio.last24hChangeValue))} (24h)
          </span>
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Wallet Tokens"
          value={formatCurrency(walletValue)}
          subtitle={`${portfolio.tokens.length} tokens`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          gradient="from-green-400 to-emerald-600"
          trend={walletValue > defiValue ? 'up' : 'down'}
          trendValue={`${((walletValue / portfolio.totalValue) * 100).toFixed(1)}%`}
        />
        
        <MetricCard
          title="DeFi Positions"
          value={formatCurrency(defiValue)}
          subtitle={`${portfolio.defiPositions.length} positions`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          gradient="from-purple-400 to-pink-600"
          trend={portfolio.analytics.totalYield > 0 ? 'up' : 'neutral'}
          trendValue={`${((defiValue / portfolio.totalValue) * 100).toFixed(1)}%`}
        />
        
        <MetricCard
          title="Total Yield"
          value={`${portfolio.analytics.totalYield.toFixed(2)}%`}
          subtitle="Weighted APY"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
          gradient="from-orange-400 to-red-600"
          trend={portfolio.analytics.totalYield > 5 ? 'up' : portfolio.analytics.totalYield > 0 ? 'neutral' : 'down'}
          trendValue={`${portfolio.defiPositions.length} active`}
        />
      </div>
      
      {/* Performance Chart */}
      <div className="relative z-10 mb-8">
        <PortfolioChart 
          totalValue={portfolio.totalValue}
          last24hChange={portfolio.last24hChange}
        />
      </div>
      
      {/* Top Holdings Preview */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Holdings
        </h3>
        
        <div className="space-y-3">
          {portfolio.tokens
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
            .map((token, index) => (
              <div
                key={token.address}
                className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <span className="text-sm font-bold text-white">
                      {token.symbol.charAt(0)}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {parseFloat(token.balance).toLocaleString(undefined, {
                        maximumFractionDigits: token.decimals > 6 ? 6 : token.decimals
                      })} {token.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(token.value)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    ${token.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: token.price < 1 ? 6 : 2
                    })}
                  </div>
                  <div className={`text-xs font-medium ${
                    token.priceChange24h >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatPercentage(token.priceChange24h)}
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {portfolio.tokens.length > 3 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              View all {portfolio.tokens.length} tokens →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { WalletConnect } from './WalletConnect';
import { useWalletContext } from '@/contexts/WalletContext';

export const Header: React.FC = () => {
  const { isDark, toggleTheme, mounted } = useTheme();
  const { isConnected } = useWalletContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigationItems = [
    { name: 'Overview', href: '#overview', icon: '📊' },
    { name: 'Positions', href: '#positions', icon: '💎' },
    { name: 'Tokens', href: '#tokens', icon: '🪙' },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-gray-900/80 backdrop-blur-sm border-b border-white/20 dark:border-gray-700/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="relative">
                  <span className="text-white font-bold text-lg">D</span>
                  {/* Animated pulse ring */}
                  <div className="absolute inset-0 w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DeFi Portfolio
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Advanced Tracker
                </p>
              </div>
            </div>
            
            {/* Navigation - Desktop (Only show when wallet is connected) */}
            {isConnected && (
              <nav className="hidden md:flex ml-8">
                <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-1">
                  {navigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </nav>
            )}
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Connection Status Indicator (Only show when connected) */}
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800 dark:text-green-400">
                  Connected
                </span>
              </div>
            )}
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg group"
                aria-label="Toggle theme"
              >
                <div className="relative">
                  {isDark ? (
                    <svg className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.59 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
                    </svg>
                  )}
                </div>
              </button>
            )}

            {/* Mobile Menu Button (Only show when wallet is connected) */}
            {isConnected && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
          {/* Wallet Connection - ALWAYS VISIBLE ON ALL SCREEN SIZES */}
            <div className="block">
              <WalletConnect />
            </div>
        
        {/* Mobile Navigation (Only show when wallet is connected) */}
        {isConnected && mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 overflow-hidden">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
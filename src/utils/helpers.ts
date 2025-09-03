import { ethers } from 'ethers';

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string, decimals = 18): string => {
  try {
    const formatted = ethers.formatUnits(balance, decimals);
    const num = parseFloat(formatted);
    
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  } catch (error) {
    return '0';
  }
};

export const formatCurrency = (value: number): string => {
  if (value === 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  if (value < 1000) return `$${value.toFixed(2)}`;
  if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${(value / 1000000).toFixed(1)}M`;
};

export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

export const validateEthereumAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

// Rate limiting utility
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100;
  
  const current = requestCounts.get(identifier) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  requestCounts.set(identifier, current);
  return true;
};

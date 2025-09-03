'use client';

import { useState, useEffect, useCallback } from 'react';
import { Portfolio, Token, DeFiPosition, ApiError } from '@/types';
import { DEFAULT_TOKENS } from '@/utils/constants';
import { checkRateLimit } from '@/utils/helpers';

// Mock DeFi positions for demonstration
const MOCK_DEFI_POSITIONS: DeFiPosition[] = [
  {
    id: '1',
    protocol: 'Uniswap V3',
    type: 'liquidity',
    tokens: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        balance: '0.5',
        price: 2000,
        value: 1000,
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0xA0b86a33E6441E4c2b64B83Cc6d326D0e9bCa32e',
        decimals: 6,
        balance: '1000',
        price: 1,
        value: 1000,
      }
    ],
    totalValue: 2000,
    apy: 24.5,
    rewards: [
      {
        token: 'UNI',
        amount: '12.5',
        value: 87.5
      }
    ]
  },
  {
    id: '2',
    protocol: 'Aave',
    type: 'lending',
    tokens: [
      {
        symbol: 'USDT',
        name: 'Tether',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        balance: '5000',
        price: 1,
        value: 5000,
      }
    ],
    totalValue: 5000,
    apy: 3.2,
  },
  {
    id: '3',
    protocol: 'Compound',
    type: 'lending',
    tokens: [
      {
        symbol: 'ETH',
        name: 'Ethereum',
        address: '0x0000000000000000000000000000000000000000',
        decimals: 18,
        balance: '1.25',
        price: 2000,
        value: 2500,
      }
    ],
    totalValue: 2500,
    apy: 1.8,
  }
];

export const usePortfolio = (walletAddress: string | null) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchTokenPrices = useCallback(async (tokenIds: string[]): Promise<Record<string, number>> => {
    const identifier = `prices_${Date.now()}`;
    
    if (!checkRateLimit(identifier)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Price API error: ${response.status}`);
      }

      const data = await response.json();
      const prices: Record<string, number> = {};
      
      for (const [tokenId, priceData] of Object.entries(data)) {
        prices[tokenId] = (priceData as any).usd || 0;
      }
      
      return prices;
    } catch (error) {
      console.error('Failed to fetch token prices:', error);
      // Return default prices for demo
      return {
        ethereum: 2000,
        'usd-coin': 1,
        tether: 1,
      };
    }
  }, []);

  const generateMockTokens = useCallback(async (): Promise<Token[]> => {
    try {
      const prices = await fetchTokenPrices(['ethereum', 'usd-coin', 'tether']);
      
      return DEFAULT_TOKENS.map((token, index) => {
        const mockBalances = ['1.5', '2500', '1000']; // Mock balances
        const priceKeys = ['ethereum', 'usd-coin', 'tether'];
        const balance = mockBalances[index];
        const price = prices[priceKeys[index]] || 0;
        const value = parseFloat(balance) * price;

        return {
          ...token,
          balance,
          price,
          value,
        };
      });
    } catch (error) {
      console.error('Failed to generate mock tokens:', error);
      return [];
    }
  }, [fetchTokenPrices]);

  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress) {
      setPortfolio(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real application, you would fetch actual token balances from the blockchain
      // and DeFi positions from various protocols
      
      // Generate mock token portfolio
      const tokens = await generateMockTokens();
      
      // Calculate total values
      const tokenValue = tokens.reduce((sum, token) => sum + token.value, 0);
      const defiValue = MOCK_DEFI_POSITIONS.reduce((sum, position) => sum + position.totalValue, 0);
      const totalValue = tokenValue + defiValue;

      // Mock 24h change
      const last24hChange = Math.random() * 10 - 5; // Random between -5% and +5%

      setPortfolio({
        totalValue,
        tokens,
        defiPositions: MOCK_DEFI_POSITIONS,
        last24hChange,
      });

    } catch (err: any) {
      console.error('Portfolio fetch failed:', err);
      setError({
        message: err.message || 'Failed to fetch portfolio data',
        code: err.code,
      });
    } finally {
      setLoading(false);
    }
  }, [walletAddress, generateMockTokens]);

  const refreshPortfolio = useCallback(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolio,
    loading,
    error,
    refreshPortfolio,
  };
};
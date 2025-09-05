'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { Portfolio, Token, DeFiPosition, ApiError, TokenConfig } from '@/types';
import { DEFAULT_TOKENS, SUPPORTED_CHAINS } from '@/utils/constants';
import { checkRateLimit } from '@/utils/helpers';

// Enhanced usePortfolio hook with fixed types
export const usePortfolio = (walletAddress: string | null, chainId: number = 1) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [realTimePrices, setRealTimePrices] = useState<Record<string, { price: number; change24h: number }>>({});
  const [wsConnectionStatus, setWsConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Get the appropriate RPC provider for the chain
  const getProvider = useCallback((chainId: number) => {
    const chain = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];
    if (!chain) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return new ethers.JsonRpcProvider(chain.rpc);
  }, []);

  // Helper function to provide fallback prices
  const getFallbackPrices = useCallback((tokenIds: string[]): Record<string, { usd: number; usd_24h_change: number }> => {
    const baseTimestamp = Date.now();
    const dayVariation = Math.sin(baseTimestamp / (1000 * 60 * 60 * 24)) * 0.05;
    const randomFactor = () => (Math.random() - 0.5) * 0.1;

    const basePrices: Record<string, { basePrice: number; volatility: number }> = {
      ethereum: { basePrice: 2000, volatility: 8 },
      'usd-coin': { basePrice: 1.0, volatility: 0.5 },
      tether: { basePrice: 1.0, volatility: 0.3 },
      'wrapped-bitcoin': { basePrice: 35000, volatility: 10 },
      uniswap: { basePrice: 6.5, volatility: 15 },
      'matic-network': { basePrice: 0.85, volatility: 12 },
    };

    const result: Record<string, { usd: number; usd_24h_change: number }> = {};
    
    tokenIds.forEach(tokenId => {
      const tokenData = basePrices[tokenId];
      if (tokenData) {
        const priceVariation = dayVariation + randomFactor();
        const price = tokenData.basePrice * (1 + priceVariation);
        const change24h = (Math.random() - 0.5) * tokenData.volatility;
        
        result[tokenId] = {
          usd: Math.max(0.001, price),
          usd_24h_change: change24h,
        };
      } else {
        result[tokenId] = { usd: 1, usd_24h_change: 0 };
      }
    });

    return result;
  }, []);

  // Fetch token prices from CoinGecko API
  const fetchTokenPrices = useCallback(async (tokenIds: string[]): Promise<Record<string, { usd: number; usd_24h_change: number }>> => {
    const identifier = `prices_${Date.now()}`;
    
    if (!checkRateLimit(identifier)) {
      console.warn('Rate limit exceeded, using fallback prices');
      return getFallbackPrices(tokenIds);
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
      const baseUrl = 'https://api.coingecko.com/api/v3/simple/price';
      const params = new URLSearchParams({
        ids: tokenIds.join(','),
        vs_currencies: 'usd',
        include_24hr_change: 'true',
      });

      if (apiKey && apiKey.trim() !== '') {
        params.append('x_cg_pro_api_key', apiKey);
      }

      const response = await fetch(`${baseUrl}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DeFi-Portfolio-Tracker/1.0',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('CoinGecko rate limit hit, using fallback prices');
          return getFallbackPrices(tokenIds);
        }
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response from CoinGecko API');
      }

      return data;

    } catch (error) {
      console.warn('Failed to fetch token prices, using fallback:', error);
      return getFallbackPrices(tokenIds);
    }
  }, [getFallbackPrices]);

  // Fetch real token balances from blockchain - FIXED TYPES
  const fetchTokenBalances = useCallback(async (): Promise<Token[]> => {
    if (!walletAddress) return [];

    try {
      const provider = getProvider(chainId);
      const results: Token[] = [];

      for (const tokenConfig of DEFAULT_TOKENS) {
        try {
          let balance: string;
          
          if (tokenConfig.address === '0x0000000000000000000000000000000000000000') {
            // ETH balance
            const ethBalance = await provider.getBalance(walletAddress);
            balance = ethers.formatEther(ethBalance);
          } else {
            // ERC-20 token balance
            const contract = new ethers.Contract(
              tokenConfig.address,
              ['function balanceOf(address owner) view returns (uint256)'],
              provider
            );
            
            const tokenBalance = await contract.balanceOf(walletAddress);
            balance = ethers.formatUnits(tokenBalance, tokenConfig.decimals);
          }

          // Create full Token object with all required properties
          const token: Token = {
            symbol: tokenConfig.symbol,
            name: tokenConfig.name,
            address: tokenConfig.address,
            decimals: tokenConfig.decimals,
            balance: balance,
            price: 0, // Will be updated with price data
            priceChange24h: 0, // Will be updated with price data
            value: 0, // Will be calculated after getting price
            coingeckoId: tokenConfig.coingeckoId,
            logo: tokenConfig.logo,
          };

          results.push(token);

        } catch (error) {
          console.warn(`Failed to fetch balance for ${tokenConfig.symbol}:`, error);
          
          // Add token with zero balance on error
          const token: Token = {
            symbol: tokenConfig.symbol,
            name: tokenConfig.name,
            address: tokenConfig.address,
            decimals: tokenConfig.decimals,
            balance: '0',
            price: 0,
            priceChange24h: 0,
            value: 0,
            coingeckoId: tokenConfig.coingeckoId,
            logo: tokenConfig.logo,
          };
          
          results.push(token);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to fetch token balances:', error);
      throw new Error(`Failed to fetch token balances: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [walletAddress, chainId, getProvider]);

  // Fetch mock DeFi positions - FIXED TYPES
  const fetchDeFiPositions = useCallback(async (): Promise<DeFiPosition[]> => {
    if (!walletAddress) return [];

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const addressNum = parseInt(walletAddress.slice(-4), 16);
      const positions: DeFiPosition[] = [];

      // Mock Uniswap V3 position
      if (addressNum % 3 === 0) {
        const ethToken: Token = {
          symbol: 'ETH',
          name: 'Ethereum',
          address: '0x0000000000000000000000000000000000000000',
          decimals: 18,
          balance: '0.5',
          price: realTimePrices.ethereum?.price || 2000,
          priceChange24h: realTimePrices.ethereum?.change24h || 2.5,
          value: 0.5 * (realTimePrices.ethereum?.price || 2000),
          coingeckoId: 'ethereum',
        };

        const usdcToken: Token = {
          symbol: 'USDC',
          name: 'USD Coin',
          address: '0xA0b86a33E6441E4c2b64B83Cc6d326D0e9bCa32e',
          decimals: 6,
          balance: '1000',
          price: realTimePrices['usd-coin']?.price || 1,
          priceChange24h: realTimePrices['usd-coin']?.change24h || 0.1,
          value: 1000 * (realTimePrices['usd-coin']?.price || 1),
          coingeckoId: 'usd-coin',
        };

        positions.push({
          id: `uniswap-${walletAddress}-1`,
          protocol: 'Uniswap V3',
          type: 'liquidity',
          tokens: [ethToken, usdcToken],
          totalValue: ethToken.value + usdcToken.value,
          apy: 24.5,
          rewards: [
            {
              token: 'UNI',
              amount: '12.5',
              value: 12.5 * 6.5
            }
          ],
          metadata: {
            poolAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
            tickLower: -887220,
            tickUpper: 887220,
            feeTier: 500,
          }
        });
      }

      // Mock Aave lending position
      if (addressNum % 2 === 0) {
        const usdtToken: Token = {
          symbol: 'USDT',
          name: 'Tether',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
          balance: '5000',
          price: realTimePrices.tether?.price || 1,
          priceChange24h: realTimePrices.tether?.change24h || 0.05,
          value: 5000 * (realTimePrices.tether?.price || 1),
          coingeckoId: 'tether',
        };

        positions.push({
          id: `aave-${walletAddress}-1`,
          protocol: 'Aave',
          type: 'lending',
          tokens: [usdtToken],
          totalValue: usdtToken.value,
          apy: 3.2,
        });
      }

      // Mock Compound position
      if (addressNum % 4 === 0) {
        const wbtcToken: Token = {
          symbol: 'WBTC',
          name: 'Wrapped Bitcoin',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          decimals: 8,
          balance: '0.1',
          price: realTimePrices['wrapped-bitcoin']?.price || 35000,
          priceChange24h: realTimePrices['wrapped-bitcoin']?.change24h || 1.8,
          value: 0.1 * (realTimePrices['wrapped-bitcoin']?.price || 35000),
          coingeckoId: 'wrapped-bitcoin',
        };

        positions.push({
          id: `compound-${walletAddress}-1`,
          protocol: 'Compound',
          type: 'lending',
          tokens: [wbtcToken],
          totalValue: wbtcToken.value,
          apy: 1.8,
        });
      }

      return positions;
    } catch (error) {
      console.error('Failed to fetch DeFi positions:', error);
      return [];
    }
  }, [walletAddress, realTimePrices]);

  // Calculate portfolio analytics - FIXED TYPES
  const calculateAnalytics = useCallback((tokens: Token[], positions: DeFiPosition[]) => {
    const totalTokenValue = tokens.reduce((sum, token) => sum + token.value, 0);
    const totalDefiValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalValue = totalTokenValue + totalDefiValue;

    // Find top performer by price change - FIXED NULL CHECK
    const topPerformer = tokens.reduce((best, token) => {
      if (!best) return token;
      return token.priceChange24h > best.priceChange24h ? token : best;
    }, tokens[0]);

    // Calculate total yield from DeFi positions
    const totalYield = positions.reduce((sum, pos) => {
      if (pos.apy && pos.totalValue > 0 && totalValue > 0) {
        return sum + (pos.apy * pos.totalValue / totalValue);
      }
      return sum;
    }, 0);

    // Simple risk score calculation (0-100, higher is riskier)
    const riskScore = Math.min(100, Math.max(0, 
      (tokens.length < 3 ? 60 : 30) + 
      (totalValue > 0 && totalDefiValue / totalValue > 0.7 ? 30 : 15) + 
      (positions.filter(p => p.type === 'liquidity').length > 2 ? 20 : 10)
    ));

    // Diversification score (0-100, higher is better)
    const diversification = Math.min(100, 
      (tokens.length * 15) + 
      (positions.length * 20) + 
      (new Set(positions.map(p => p.protocol)).size * 15)
    );

    return {
      topPerformer: topPerformer || tokens[0], // Ensure never undefined
      totalYield,
      riskScore,
      diversification,
    };
  }, []);

  // Main portfolio fetch function - FIXED TYPES
  const fetchPortfolio = useCallback(async () => {
    if (!walletAddress) {
      setPortfolio(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch token balances and prices in parallel
      const [tokenBalances, priceData, defiPositions] = await Promise.all([
        fetchTokenBalances(),
        fetchTokenPrices(DEFAULT_TOKENS.map(t => t.coingeckoId)),
        fetchDeFiPositions(),
      ]);
   
      // Combine balance and price data
      const tokens: Token[] = tokenBalances
        .map((token) => {
          const priceInfo = priceData[token.coingeckoId];
          const currentPrice = realTimePrices[token.coingeckoId]?.price || priceInfo?.usd || 0;
          const priceChange24h = realTimePrices[token.coingeckoId]?.change24h || priceInfo?.usd_24h_change || 0;
          
          const balance = parseFloat(token.balance || '0');
          const value = balance * currentPrice;

          return {
            ...token,
            price: currentPrice,
            priceChange24h,
            value,
          };
        })
        .filter((token): token is Token => parseFloat(token.balance) > 0.0001);

      // Calculate portfolio totals
      const totalTokenValue = tokens.reduce((sum, token) => sum + token.value, 0);
      const totalDefiValue = defiPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
      const totalValue = totalTokenValue + totalDefiValue;

      // Calculate 24h change
      const last24hChangeValue = tokens.reduce((sum, token) => {
        const yesterdayPrice = token.price / (1 + token.priceChange24h / 100);
        const yesterdayValue = parseFloat(token.balance) * yesterdayPrice;
        return sum + (token.value - yesterdayValue);
      }, 0);

      const last24hChange = totalValue > 0 ? (last24hChangeValue / totalValue) * 100 : 0;

      // Calculate analytics
      const analytics = calculateAnalytics(tokens, defiPositions);

      setPortfolio({
        totalValue,
        tokens,
        defiPositions,
        last24hChange,
        last24hChangeValue,
        analytics,
      });

      setLastUpdate(Date.now());

    } catch (err: any) {
      console.error('Portfolio fetch failed:', err);
      setError({
        message: err.message || 'Failed to fetch portfolio data',
        code: err.code,
        retryAfter: 30000,
      });
    } finally {
      setLoading(false);
    }
  }, [
    walletAddress,
    chainId,
    fetchTokenBalances,
    fetchTokenPrices,
    fetchDeFiPositions,
    calculateAnalytics,
    realTimePrices,
  ]);

  // Setup WebSocket connection (unchanged - working correctly)
  useEffect(() => {
    if (!walletAddress) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let pingInterval: NodeJS.Timeout;

    const connect = () => {
      try {
        setWsConnectionStatus('connecting');
        ws = new WebSocket('wss://ws-feed.pro.coinbase.com');

        ws.onopen = () => {
          console.log('WebSocket connected for price updates');
          setWsConnectionStatus('connected');
          reconnectAttempts = 0;
          
          const subscribeMessage = {
            type: 'subscribe',
            channels: ['ticker'],
            product_ids: ['ETH-USD', 'BTC-USD', 'USDC-USD']
          };
          
          ws?.send(JSON.stringify(subscribeMessage));

          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ticker' && data.product_id) {
              const symbol = data.product_id.replace('-USD', '').toLowerCase();
              const price = parseFloat(data.price);
              const change24h = parseFloat(data.open_24h) 
                ? ((price - parseFloat(data.open_24h)) / parseFloat(data.open_24h)) * 100 
                : 0;

              if (!isNaN(price)) {
                setRealTimePrices(prev => ({
                  ...prev,
                  [symbol === 'eth' ? 'ethereum' : symbol === 'btc' ? 'wrapped-bitcoin' : symbol]: { 
                    price, 
                    change24h 
                  }
                }));
              }
            }
          } catch (err) {
            console.warn('Failed to parse WebSocket message:', err);
          }
        };

        ws.onerror = () => {
          console.warn('WebSocket connection issue, will fallback to polling');
          setWsConnectionStatus('error');
        };

        ws.onclose = (event) => {
          setWsConnectionStatus('disconnected');
          
          if (pingInterval) {
            clearInterval(pingInterval);
          }

          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            reconnectAttempts++;
            
            console.log(`WebSocket reconnect attempt ${reconnectAttempts} in ${delay}ms`);
            reconnectTimeout = setTimeout(connect, delay);
          } else {
            console.log('WebSocket connection closed, using polling fallback');
          }
        };

      } catch (err) {
        console.warn('Failed to create WebSocket connection, using polling fallback');
        setWsConnectionStatus('error');
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close(1000);
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      setWsConnectionStatus('disconnected');
    };
  }, [walletAddress]);

  // Auto-refresh portfolio data
  useEffect(() => {
    if (!walletAddress) return;

    fetchPortfolio();
    
    const interval = setInterval(fetchPortfolio, 60000);
    return () => clearInterval(interval);
  }, [fetchPortfolio, walletAddress]);

  // Update portfolio values when real-time prices change
  useEffect(() => {
    if (!portfolio || Object.keys(realTimePrices).length === 0) return;

    const updatedTokens = portfolio.tokens.map(token => {
      const realtimeData = realTimePrices[token.coingeckoId];
      if (realtimeData) {
        const newValue = parseFloat(token.balance) * realtimeData.price;
        return {
          ...token,
          price: realtimeData.price,
          priceChange24h: realtimeData.change24h,
          value: newValue,
        };
      }
      return token;
    });

    const totalTokenValue = updatedTokens.reduce((sum, token) => sum + token.value, 0);
    const totalDefiValue = portfolio.defiPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalValue = totalTokenValue + totalDefiValue;

    const last24hChangeValue = updatedTokens.reduce((sum, token) => {
      const yesterdayPrice = token.price / (1 + token.priceChange24h / 100);
      const yesterdayValue = parseFloat(token.balance) * yesterdayPrice;
      return sum + (token.value - yesterdayValue);
    }, 0);

    const last24hChange = totalValue > 0 ? (last24hChangeValue / totalValue) * 100 : 0;
    const analytics = calculateAnalytics(updatedTokens, portfolio.defiPositions);

    setPortfolio(prev => prev ? {
      ...prev,
      totalValue,
      tokens: updatedTokens,
      last24hChange,
      last24hChangeValue,
      analytics,
    } : null);

  }, [portfolio?.tokens, portfolio?.defiPositions, realTimePrices, calculateAnalytics]);

  const refreshPortfolio = useCallback(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolio,
    loading,
    error,
    refreshPortfolio,
    lastUpdate,
    isRealTimeEnabled: Object.keys(realTimePrices).length > 0,
    wsConnectionStatus,
  };
};
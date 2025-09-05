export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  balance: string;
  price: number;
  priceChange24h: number;
  value: number;
  coingeckoId: string;
  logo?: string;
}

export interface DeFiPosition {
  id: string;
  protocol: string;
  type: 'lending' | 'liquidity' | 'staking' | 'farming';
  tokens: Token[];
  totalValue: number;
  apy?: number;
  rewards?: {
    token: string;
    amount: string;
    value: number;
  }[];
  metadata?: {
    poolAddress?: string;
    tickLower?: number;
    tickUpper?: number;
    liquidity?: string;
    feeTier?: number;
  };
}

export interface Portfolio {
  totalValue: number;
  tokens: Token[];
  defiPositions: DeFiPosition[];
  last24hChange: number;
  last24hChangeValue: number;
  analytics: {
    topPerformer: Token;
    totalYield: number;
    riskScore: number;
    diversification: number;
  };
}

export interface Transaction {
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'defi' | 'mint' | 'burn';
  value: number;
  token: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  retryAfter?: number;
}

// Helper type for token config (from constants)
export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  coingeckoId: string;
  logo?: string;
}
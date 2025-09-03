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
  value: number;
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
}

export interface Portfolio {
  totalValue: number;
  tokens: Token[];
  defiPositions: DeFiPosition[];
  last24hChange: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

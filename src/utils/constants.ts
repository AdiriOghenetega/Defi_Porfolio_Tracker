export interface NetworkConfig {
  name: string;
  symbol: string;
  rpc: string;
  blockExplorer: string;
  coingeckoId: string;
  color: string;
}

export const SUPPORTED_CHAINS: Record<number, NetworkConfig> = {
  1: {
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    rpc: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://cloudflare-eth.com',
    blockExplorer: 'https://etherscan.io',
    coingeckoId: 'ethereum',
    color: '#627EEA',
  },
  137: {
    name: 'Polygon Mainnet',
    symbol: 'MATIC',
    rpc: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    coingeckoId: 'matic-network',
    color: '#8247E5',
  },
  56: {
    name: 'BNB Smart Chain Mainnet',
    symbol: 'BNB',
    rpc: 'https://bsc-dataseed1.binance.org/',
    blockExplorer: 'https://bscscan.com',
    coingeckoId: 'binancecoin',
    color: '#F3BA2F',
  },
  42161: {
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpc: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    coingeckoId: 'ethereum',
    color: '#28A0F0',
  },
  10: {
    name: 'Optimism',
    symbol: 'ETH',
    rpc: 'https://mainnet.optimism.io',
    blockExplorer: 'https://optimistic.etherscan.io',
    coingeckoId: 'ethereum',
    color: '#FF0420',
  },
  43114: {
    name: 'Avalanche C-Chain',
    symbol: 'AVAX',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    blockExplorer: 'https://snowtrace.io',
    coingeckoId: 'avalanche-2',
    color: '#E84142',
  },
  250: {
    name: 'Fantom Opera',
    symbol: 'FTM',
    rpc: 'https://rpc.ftm.tools',
    blockExplorer: 'https://ftmscan.com',
    coingeckoId: 'fantom',
    color: '#1969FF',
  },
  8453: {
    name: 'Base',
    symbol: 'ETH',
    rpc: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    coingeckoId: 'ethereum',
    color: '#0052FF',
  },
} as const;

// Network-specific token configurations
export const NETWORK_TOKENS: Record<number, TokenConfig[]> = {
  1: [ // Ethereum
    {
      symbol: 'ETH',
      name: 'Ethereum',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      coingeckoId: 'ethereum',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86a33E6441E4c2b64B83Cc6d326D0e9bCa32e',
      decimals: 6,
      coingeckoId: 'usd-coin',
      logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      coingeckoId: 'tether',
      logo: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png'
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      coingeckoId: 'wrapped-bitcoin',
      logo: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png'
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      decimals: 18,
      coingeckoId: 'uniswap',
      logo: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png'
    },
  ],
  137: [ // Polygon
    {
      symbol: 'MATIC',
      name: 'Polygon',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      coingeckoId: 'matic-network',
      logo: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (PoS)',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      decimals: 6,
      coingeckoId: 'usd-coin',
      logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
    },
    {
      symbol: 'WETH',
      name: 'Wrapped Ether',
      address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      decimals: 18,
      coingeckoId: 'ethereum',
      logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
    },
  ],
  56: [ // BSC
    {
      symbol: 'BNB',
      name: 'BNB',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      coingeckoId: 'binancecoin',
      logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
    },
    {
      symbol: 'USDT',
      name: 'Tether USD (BSC)',
      address: '0x55d398326f99059fF775485246999027B3197955',
      decimals: 18,
      coingeckoId: 'tether',
      logo: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png'
    },
    {
      symbol: 'BUSD',
      name: 'BUSD Token',
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      decimals: 18,
      coingeckoId: 'binance-usd',
      logo: 'https://assets.coingecko.com/coins/images/9576/small/BUSD.png'
    },
  ],
};

// Default tokens (for backward compatibility)
export const DEFAULT_TOKENS: TokenConfig[] = NETWORK_TOKENS[1]; // Ethereum tokens

export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  coingeckoId: string;
  logo?: string;
}

// Helper function to get tokens for a specific network
export const getNetworkTokens = (chainId: number): TokenConfig[] => {
  return NETWORK_TOKENS[chainId] || DEFAULT_TOKENS;
};

// DeFi Protocol Addresses per network
export const PROTOCOL_ADDRESSES = {
  1: { // Ethereum
    UNISWAP_V3_FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    UNISWAP_V3_POSITION_MANAGER: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    AAVE_LENDING_POOL: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    COMPOUND_COMPTROLLER: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
  },
  137: { // Polygon
    AAVE_LENDING_POOL: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
    QUICKSWAP_FACTORY: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
  },
  56: { // BSC
    PANCAKESWAP_FACTORY: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    VENUS_COMPTROLLER: '0xfD36E2c2a6789Db23113685031d7F16329158384',
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  COINGECKO: 'https://api.coingecko.com/api/v3',
  THE_GRAPH_UNISWAP: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  THE_GRAPH_AAVE: 'https://api.thegraph.com/subgraphs/name/aave/protocol-v2',
  WEBSOCKET_PRICES: 'wss://ws-feed.pro.coinbase.com',
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  COINGECKO_FREE: { requests: 10, windowMs: 60000 },
  COINGECKO_PRO: { requests: 500, windowMs: 60000 },
  THE_GRAPH: { requests: 1000, windowMs: 60000 },
} as const;

// Common MetaMask error codes
export const METAMASK_ERROR_CODES = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  UNRECOGNIZED_CHAIN: 4902,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  PENDING_REQUEST: -32002,
} as const;
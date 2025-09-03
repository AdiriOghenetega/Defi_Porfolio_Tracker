export const SUPPORTED_CHAINS = {
  1: {
    name: 'Ethereum Mainnet',
    rpc: 'https://mainnet.infura.io/v3/your-infura-key',
    blockExplorer: 'https://etherscan.io',
  },
  137: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
} as const;

export const DEFAULT_TOKENS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6441E4c2b64B83Cc6d326D0e9bCa32e',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    logo: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png'
  }
];

export const RATE_LIMIT = {
  requests: 100,
  windowMs: 60000, // 1 minute
};

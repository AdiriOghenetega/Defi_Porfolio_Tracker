# DeFi Portfolio Tracker

A comprehensive Web3 DeFi portfolio tracking application built with Next.js 14, TypeScript, and Tailwind CSS. Track your cryptocurrency holdings and DeFi positions across multiple protocols with real-time price updates.

## 🚀 Features

- **Wallet Connection**: Secure MetaMask integration with proper error handling
- **Portfolio Overview**: Real-time portfolio value and 24h change tracking
- **DeFi Position Tracking**: Monitor lending, liquidity, staking, and farming positions
- **Token Holdings**: Detailed view of all token balances with current prices
- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Prices**: Live price updates using CoinGecko API
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton loaders and optimistic UI updates

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Web3**: Ethers.js v6 for blockchain interactions
- **State Management**: React Context API with custom hooks
- **API**: CoinGecko API for price data
- **Icons**: Heroicons and custom SVG icons

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── globals.css        # Global styles and Tailwind imports
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── DeFiPositions.tsx  # DeFi positions display
│   ├── Header.tsx         # Application header
│   ├── PortfolioOverview.tsx
│   ├── TokenList.tsx      # Token holdings list
│   └── WalletConnect.tsx  # Wallet connection component
├── contexts/              # React contexts
│   └── WalletContext.tsx  # Wallet state management
├── hooks/                 # Custom React hooks
│   ├── usePortfolio.ts    # Portfolio data fetching
│   ├── useTheme.ts        # Theme management
│   └── useWallet.ts       # Wallet connection logic
├── types/                 # TypeScript type definitions
│   └── index.ts           # Main type exports
└── utils/                 # Utility functions
    ├── constants.ts       # Application constants
    └── helpers.ts         # Helper functions
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd defi-portfolio-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Optional: Add your own RPC endpoints for better performance
   NEXT_PUBLIC_ETHEREUM_RPC=your_ethereum_rpc_url
   NEXT_PUBLIC_POLYGON_RPC=your_polygon_rpc_url
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🏗 Architecture Overview

### Component Architecture

- **Separation of Concerns**: Clear separation between UI components, business logic, and data fetching
- **Custom Hooks**: Reusable hooks for wallet management, portfolio data, and theme handling
- **Context Providers**: Global state management for wallet connection
- **Error Boundaries**: Comprehensive error handling with user-friendly fallbacks

### State Management

- **WalletContext**: Global wallet connection state
- **Custom Hooks**: Encapsulated business logic with proper error handling
- **Local State**: Component-level state for UI interactions

### Security Features

- **Input Validation**: Ethereum address validation and sanitization
- **Rate Limiting**: API request rate limiting to prevent abuse
- **Error Handling**: Secure error messages without exposing sensitive data
- **Type Safety**: Full TypeScript coverage for runtime safety

## 🌐 Web3 Integration

### Supported Networks

- Ethereum Mainnet (Chain ID: 1)
- Polygon (Chain ID: 137)

### Wallet Features

- **Connection**: Secure MetaMask connection with account detection
- **Network Switching**: Automatic network switching support
- **Balance Tracking**: Real-time ETH balance updates
- **Account Changes**: Automatic reconnection on account changes

### DeFi Protocol Integration

Currently supports mock data for:
- **Uniswap V3**: Liquidity positions
- **Aave**: Lending positions  
- **Compound**: Lending positions

*Note: This is a demo application using mock DeFi data. In production, you would integrate with actual protocol APIs and smart contracts.*

## 📱 Responsive Design

- **Mobile-First**: Designed for mobile devices with progressive enhancement
- **Breakpoints**: Tailored layouts for different screen sizes
- **Touch-Friendly**: Optimized for touch interactions
- **Performance**: Optimized images and lazy loading

## 🎨 Theming

- **Dark/Light Mode**: System preference detection with manual toggle
- **CSS Variables**: Consistent color system across themes
- **Smooth Transitions**: Animated theme transitions
- **Accessibility**: WCAG compliant color contrast ratios

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

```bash
# Build the application
npm run build

# The build output will be in the `.next` folder
# Deploy the contents to your hosting provider
```

## 📈 Performance Optimizations

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Use `npm run build` to analyze bundle size
- **Caching**: Efficient API response caching
- **Loading States**: Skeleton loaders for better perceived performance

## 🔒 Security Considerations

- **Private Keys**: Never expose or handle private keys
- **RPC Endpoints**: Use environment variables for sensitive endpoints
- **Input Validation**: All user inputs are validated and sanitized
- **Error Messages**: Generic error messages to prevent information leakage
- **Rate Limiting**: API rate limiting to prevent abuse

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or run into issues, please create an issue in the GitHub repository.

---

**Note**: This is a demo application for educational purposes. Always verify transactions and do your own research before making any financial decisions in the DeFi space.
# Demos Network DApp

A complete decentralized application (DApp) for Demos Network featuring wallet integration, token/NFT creation, trading, transfers, and contribution tracking.

## Features

- 🔐 **Wallet Integration**: Connect with Demos Wallet, MetaMask, or WalletConnect
- 💰 **Token Creation**: Deploy ERC-20 tokens with custom parameters
- 🎨 **NFT Launch**: Create ERC-721 NFT collections
- 📊 **Trading**:
  - Perpetual futures trading with leverage (1x-10x)
  - Spot swaps for token exchanges
  - Real-time price updates
- 💸 **Token Transfer**: Send tokens between accounts
- 🚰 **Faucet**: Claim testnet DEMOS tokens (100 DEMOS every 24 hours)
- 👤 **Profile**: Connect GitHub, Twitter/X, Discord, and Telegram
- 🏆 **Contributions**: Track real contributions across platforms
- 📈 **Dashboard**: Analytics and portfolio overview

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Web3**: Wagmi 2.x, Viem 2.x
- **State**: Zustand
- **Data Fetching**: React Query
- **Charts**: Recharts
- **Icons**: Lucide React
- **SDK**: @kynesyslabs/demosdk

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Demos Wallet extension or MetaMask

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd maleficboss
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your configuration:
- Get a WalletConnect Project ID from https://cloud.walletconnect.com
- Add API keys for social platforms (optional for contribution tracking)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
maleficboss/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main page with tab navigation
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Header.tsx         # Wallet connection header
│   ├── Dashboard.tsx      # Analytics dashboard
│   ├── AssetCreation.tsx  # Token/NFT creation
│   ├── Trading.tsx        # Perpetuals & Spot trading
│   ├── TokenTransfer.tsx  # Send tokens
│   ├── Faucet.tsx         # Testnet token claiming
│   ├── Profile.tsx        # Social account connections
│   ├── ContributionTracker.tsx  # Real contribution stats
│   └── DemosFeatures.tsx  # Official Demos links
├── lib/                   # Utility libraries
│   ├── wagmi-config.ts    # Web3 configuration
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript type definitions
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## Configuration

### Wallet Connection

The app supports multiple wallet connection methods:
- **Injected Wallets**: Demos Wallet, MetaMask, etc.
- **WalletConnect**: Mobile wallets via QR code

### Network Configuration

Default network: **Demos Testnet**
- Chain ID: 123456
- RPC: https://testnet-rpc.demos.network
- Explorer: https://explorer.demos.network
- Native Token: DEMOS

### Environment Variables

See `.env.example` for all available configuration options.

## Features in Detail

### Asset Creation
Merge token and NFT creation into one interface with toggle between:
- **ERC-20 Tokens**: Deploy custom tokens with name, symbol, supply
- **ERC-721 NFTs**: Launch NFT collections with metadata

### Trading
Advanced trading interface with:
- **Perpetuals**: Long/short positions with up to 10x leverage
- **Spot Swap**: Exchange tokens with real-time price updates
- Real-time price charts using Recharts
- Hyperliquid-style UI

### Contribution Tracker
Track **real contributions** from connected accounts:
- **GitHub**: Live data from public API (commits, PRs, issues)
- **Discord**: Requires backend bot integration
- **Twitter/X**: Requires API access
- **Telegram**: Requires bot integration

All stats auto-refresh every 5 minutes.

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Railway
- Render
- Your own server with Docker

## Contribution Tracking Setup

To enable real contribution tracking:

1. **GitHub**: Works out of the box with public API
2. **Discord**: Set up a Discord bot and backend API
3. **Twitter**: Apply for Twitter Developer account and API access
4. **Telegram**: Create a Telegram bot via @BotFather

See documentation in each component for detailed setup instructions.

## Troubleshooting

### Wallet Not Connecting

1. Make sure you have a wallet extension installed
2. Check that you're on the correct network (Demos Testnet)
3. Try refreshing the page
4. Clear browser cache and reconnect

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: [Demos Network Docs](https://docs.demos.network)
- **Twitter**: [@demos_network](https://x.com/demos_network)
- **Discord**: [Join Community](https://discord.gg/demos)
- **Telegram**: [Join Channel](https://t.me/demos_network)

## Credits

Built with ❤️ for Demos Network
Powered by Kynesys Labs

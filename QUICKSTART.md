# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- Wagmi & Viem (Web3 libraries)
- Demos SDK
- React Query
- Recharts
- Lucide Icons

**Note**: You may see deprecation warnings from the Demos SDK dependencies. These are normal and won't affect functionality.

### 2. Configure Environment

Create `.env.local` file:

```bash
cp .env.example .env.local
```

**Minimum required configuration:**

```env
NEXT_PUBLIC_DEMOS_NETWORK_RPC=https://testnet-rpc.demos.network
NEXT_PUBLIC_DEMOS_CHAIN_ID=123456
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo-project-id
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Connect Your Wallet

Click "Connect Wallet" button in the header. Supported wallets:
- Demos Wallet (recommended)
- MetaMask
- Any WalletConnect-compatible wallet

## ✅ What's Working

### Out of the Box (No Config Needed)
- ✅ Wallet connection
- ✅ All UI components and navigation
- ✅ Dashboard analytics
- ✅ Asset creation forms (Token/NFT)
- ✅ Trading interface (Perpetuals & Spot)
- ✅ Token transfer
- ✅ Faucet claiming
- ✅ Real-time price updates
- ✅ Profile social connections UI
- ✅ GitHub contribution tracking (public API)

### Requires Backend Integration
- ⏳ Discord contribution tracking
- ⏳ Twitter/X contribution tracking
- ⏳ Telegram contribution tracking
- ⏳ Actual blockchain transactions (needs deployed contracts)

## 📱 Testing Features

### Dashboard
Navigate to Dashboard tab to see:
- Total balance
- Recent transactions
- Portfolio value chart
- Quick action buttons

### Trading
1. Click "Trading" tab
2. Toggle between "Perpetuals" and "Spot"
3. Watch real-time price updates every 2 seconds
4. Try different trading pairs
5. Adjust leverage (for perpetuals)

### Asset Creation
1. Click "Create Assets" tab
2. Toggle between "ERC-20 Token" and "ERC-721 NFT"
3. Fill in the form
4. Click "Create" (simulation mode)
5. View transaction on explorer

### Faucet
1. Connect wallet
2. Click "Faucet" tab
3. Click "Claim 100 DEMOS"
4. Wait 2 seconds
5. See 24-hour countdown timer

### Profile & Contributions
1. Click "Profile" tab
2. Connect GitHub, Twitter, Discord, or Telegram
3. Go to "Contributions" tab
4. See real GitHub stats (if connected)
5. Stats auto-refresh every 5 minutes

## 🔧 Common Issues

### "Connect Wallet" Button Not Working

**Fix 1**: Update wagmi config (already done ✅)
```typescript
// lib/wagmi-config.ts now includes:
connectors: [
  injected(),
  walletConnect({ projectId: "..." })
]
```

**Fix 2**: Get your own WalletConnect Project ID
1. Visit https://cloud.walletconnect.com
2. Create a new project
3. Copy the Project ID
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id
   ```

**Fix 3**: Clear browser cache and refresh

### Port 3000 Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 📦 Project Structure

```
.
├── app/
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Main page (home)
│   └── globals.css      # Global styles
├── components/
│   ├── Header.tsx       # Top navigation with wallet
│   ├── Dashboard.tsx
│   ├── Trading.tsx
│   ├── AssetCreation.tsx
│   ├── TokenTransfer.tsx
│   ├── Faucet.tsx
│   ├── Profile.tsx
│   ├── ContributionTracker.tsx
│   └── DemosFeatures.tsx
├── lib/
│   ├── wagmi-config.ts  # Web3 configuration
│   └── utils.ts         # Helper functions
├── types/
│   └── index.ts         # TypeScript types
└── public/              # Static files
```

## 🎨 Customization

### Change Theme Colors

Edit `app/globals.css`:

```css
:root {
  --background: #000000;    /* Change background */
  --foreground: #ffffff;    /* Change text color */
  --accent: #1a1a1a;       /* Change card backgrounds */
  --border: #222222;       /* Change border color */
}
```

### Add New Tab

1. Create component in `components/YourFeature.tsx`
2. Edit `app/page.tsx`:
   ```typescript
   import YourFeature from "@/components/YourFeature";

   const tabs = [
     // ...existing tabs
     { id: "your-feature", label: "Your Feature", icon: YourIcon },
   ];

   // In renderContent():
   case "your-feature": return <YourFeature />;
   ```

### Modify Network

Edit `lib/wagmi-config.ts`:

```typescript
export const demosTestnet = defineChain({
  id: 123456,                    // Your chain ID
  name: "Your Network",
  rpcUrls: {
    default: {
      http: ["your-rpc-url"],
    },
  },
  // ... rest of config
});
```

## 🚢 Deployment

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or use the button:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Next Steps

1. **Get Real WalletConnect ID**: Visit https://cloud.walletconnect.com
2. **Deploy Smart Contracts**: Deploy token factory, NFT factory, swap router
3. **Set Up Backend APIs**: For Discord, Twitter, Telegram tracking
4. **Configure OAuth**: For GitHub, Twitter social logins
5. **Test on Testnet**: Get testnet DEMOS and test all features
6. **Deploy to Production**: Use Vercel, Netlify, or custom server

## 💡 Tips

- Use browser DevTools console to see transaction logs
- Check Network tab to see API calls
- Contribution Tracker fetches real GitHub data
- Real-time prices update every 2 seconds in Trading tab
- Faucet has 24-hour cooldown per wallet
- All explorer links point to https://explorer.demos.network

## 🆘 Need Help?

- **Documentation**: See README.md for full documentation
- **Deployment**: See DEPLOYMENT.md for deployment guide
- **Issues**: Check existing issues or create new one
- **Discord**: Join Demos Network Discord
- **Twitter**: Follow @demos_network

## 📄 License

MIT - See LICENSE file

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Need more details?** See [README.md](./README.md)

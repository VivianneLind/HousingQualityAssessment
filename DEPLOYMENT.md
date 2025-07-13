# Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure WalletConnect

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID
4. Update `src/config/wagmi.ts`:

```typescript
export const config = getDefaultConfig({
  appName: 'Privacy Housing Assessment',
  projectId: 'YOUR_PROJECT_ID_HERE', // Replace with your actual Project ID
  chains: [sepolia],
  ssr: false,
});
```

### 3. Local Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### 5. Deploy to GitHub Pages

#### Automatic Deployment

1. Push your code to GitHub
2. Go to your repository Settings → Pages
3. Select "GitHub Actions" as the source
4. The app will automatically deploy when you push to the `main` branch

#### Manual Deployment

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## Environment Variables (for Smart Contract Development)

If you need to deploy or interact with smart contracts:

1. Copy `.env.example` to `.env`
2. Add your Sepolia RPC URL and private key:

```env
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
```

**NEVER commit your `.env` file!**

## Testing

### Connect to Sepolia Testnet

1. Open MetaMask
2. Add Sepolia network if not already added
3. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
4. Connect your wallet to the app

### Test the Application

1. **Register as Assessor**: Click "Register as Assessor"
2. **Submit Assessment**: Fill in property details and scores
3. **View Reports**: Check quality reports by assessment ID
4. **Track History**: Monitor your transactions

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### WalletConnect Issues

- Make sure you've configured your Project ID
- Check that you're using a supported wallet
- Try clearing your browser cache

### Network Issues

- Ensure you're connected to Sepolia testnet
- Make sure you have test ETH for gas fees
- Check that the contract address is correct

## Contract Address

The smart contract is deployed on Sepolia at:
```
0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640
```

You can verify it on [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640)

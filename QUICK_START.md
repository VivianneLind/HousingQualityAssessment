# Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure WalletConnect (Required)

1. Visit https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID
4. Open `src/config/wagmi.ts`
5. Replace `YOUR_PROJECT_ID_HERE` with your actual Project ID:

```typescript
export const config = getDefaultConfig({
  appName: 'Privacy Housing Assessment',
  projectId: 'your-actual-project-id', // <-- Replace this
  chains: [sepolia],
  ssr: false,
});
```

### Step 3: Run Development Server

```bash
npm run dev
```

The app will open at http://localhost:3000

## ✅ Checklist

- [ ] Node.js >= 18.0.0 installed
- [ ] Dependencies installed (`npm install`)
- [ ] WalletConnect Project ID configured
- [ ] MetaMask installed
- [ ] Connected to Sepolia testnet
- [ ] Have Sepolia test ETH

## 🔗 Quick Links

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **WalletConnect Cloud**: https://cloud.walletconnect.com
- **Contract on Etherscan**: https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640

## 🎯 First Time User Flow

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Select MetaMask (or your preferred wallet)
   - Approve the connection

2. **Register as Assessor**
   - Navigate to "Assessor Registration"
   - Click "Register as Assessor"
   - Confirm the transaction in MetaMask
   - Wait for confirmation

3. **Get Certified** (Owner Only)
   - If you're the contract owner, you'll see the "Certify Assessor" section
   - Enter the assessor's address
   - Click "Certify Assessor"

4. **Submit Assessment**
   - Enter property ID
   - Fill in quality scores (0-100) for:
     - Structural integrity
     - Safety features
     - Utility systems
     - Location quality
   - Click "Submit Assessment"
   - Confirm transaction

5. **View Reports**
   - Enter an assessment ID
   - Click "Get Report"
   - View the quality score and issue flags

## 🛠️ Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## 📦 Deploy to GitHub Pages

1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Select "GitHub Actions" as source
4. Push to `main` branch triggers auto-deployment

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### WalletConnect not working
- Make sure you've configured your Project ID
- Check that you're using a valid Project ID from https://cloud.walletconnect.com

### Transaction fails
- Make sure you have enough Sepolia ETH
- Check that you're connected to Sepolia testnet
- Ensure you're a certified assessor

### Build errors
```bash
npm run build -- --force
```

## 💡 Tips

- Use Sepolia testnet for testing (no real money)
- Get test ETH from Sepolia faucet (free)
- Register as assessor first before submitting assessments
- Wait for owner certification before submitting assessments
- All scores must be between 0-100

## 📚 Documentation

- `README.md` - Project overview
- `DEPLOYMENT.md` - Detailed deployment guide
- `UI_UX_IMPROVEMENTS.md` - UI/UX documentation
- `PROJECT_SUMMARY.md` - Technical summary

## 🆘 Need Help?

Check the documentation files or create an issue on GitHub.

---

**Happy Assessing! 🏠**

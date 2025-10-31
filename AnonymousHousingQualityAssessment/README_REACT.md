# Anonymous Housing Quality Assessment - React Application

A modern React application for privacy-preserving housing quality assessments built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Wallet Connection**: Connect MetaMask wallet to interact with the blockchain
- **Assessor Registration**: Register and certify assessors on the platform
- **Quality Assessments**: Submit detailed property assessments with structural, safety, utility, and location scores
- **Assessment Verification**: Contract owner can verify submitted assessments
- **Quality Reports**: View comprehensive quality reports for verified assessments
- **Property History**: Track assessment history for specific properties
- **System Statistics**: View overall system statistics and metrics

## Technology Stack

- **React 18**: Modern React with functional components and hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js v5**: Ethereum blockchain interaction
- **FHEVM**: Fully Homomorphic Encryption Virtual Machine

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── AssessmentSubmission.tsx
│   │   ├── AssessmentVerification.tsx
│   │   ├── AssessorRegistration.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   ├── PropertyHistory.tsx
│   │   ├── QualityReports.tsx
│   │   ├── StatusMessage.tsx
│   │   ├── SystemStatistics.tsx
│   │   └── WalletConnection.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useContract.ts
│   │   └── useWallet.ts
│   ├── lib/                 # Utility functions
│   │   └── utils.ts
│   ├── types/               # TypeScript types and interfaces
│   │   ├── contract.ts
│   │   └── index.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── contracts/               # Smart contracts
│   └── AnonymousHousingQualityAssessment.sol
├── public/                  # Static assets (original HTML)
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Smart Contract

The application connects to the deployed smart contract at:
```
Contract Address: 0xE91BF284dD61830Df29b5968bD6D30d2A910B4D5
```

You can update the contract address in `src/types/contract.ts` if needed.

## Usage

### 1. Connect Wallet
- Click "Connect MetaMask" to connect your wallet
- Make sure you're on the correct network

### 2. Register as Assessor
- Click "Register as Assessor" to register on the platform
- Check your status to see registration details

### 3. Submit Assessment
- Enter a property identifier
- Provide scores for:
  - Structural integrity (0-100)
  - Safety features (0-100)
  - Utility systems (0-100)
  - Location quality (0-100)
- Submit the assessment

### 4. Verify Assessments (Owner Only)
- If you're the contract owner, you can verify submitted assessments
- Enter the assessment ID and click "Verify Assessment"

### 5. View Quality Reports
- Enter an assessment ID to view its quality report
- See overall score and issue flags

### 6. Check Property History
- Enter a property ID to view all assessments for that property
- See assessment IDs and counts

### 7. View System Statistics
- Click "Get System Statistics" to view overall system metrics
- See total assessments and system status

## Key Components

### Custom Hooks

- **useWallet**: Manages wallet connection, network detection, and owner verification
- **useContract**: Handles all smart contract interactions

### UI Components

- **Card**: Reusable card container for sections
- **Button**: Styled button with loading states and variants
- **StatusMessage**: Display status messages with different types
- **Header**: Application header with wallet info
- **WalletConnection**: Wallet connection interface
- **AssessorRegistration**: Assessor registration and status
- **AssessmentSubmission**: Form for submitting assessments
- **AssessmentVerification**: Verify assessments (owner only)
- **QualityReports**: Display quality reports
- **PropertyHistory**: Show property assessment history
- **SystemStatistics**: Display system-wide statistics

## Environment Variables

No environment variables are required. The contract address is hardcoded in `src/types/contract.ts`.

## Browser Requirements

- Modern browser with Web3 support
- MetaMask or compatible Web3 wallet extension

## License

MIT

## Contributing

This is a demonstration application. For production use, please ensure proper security audits and testing.

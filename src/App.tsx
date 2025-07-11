import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { config } from './config/wagmi';
import { Toaster } from './components/ui/toaster';
import { AssessorManagement } from './components/AssessorManagement';
import { SubmitAssessment } from './components/SubmitAssessment';
import { ViewReports } from './components/ViewReports';
import { TransactionHistory } from './components/TransactionHistory';
import { Building2, Shield } from 'lucide-react';

const queryClient = new QueryClient();

// Disable disclaimer component
const DisclaimerComponent = () => null;

// Custom Connect Button with English text
const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected =
          ready &&
          account &&
          chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex gap-2">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center gap-2"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          showRecentTransactions={false}
          appInfo={{
            appName: 'Privacy Housing Assessment',
            disclaimer: DisclaimerComponent,
            learnMoreUrl: undefined,
          }}
        >
          <div className="min-h-screen">
            {/* Header */}
            <header className="glass-panel border-b border-primary/10 sticky top-0 z-50 transition-all duration-default">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl animate-glow">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Privacy Housing Assessment
                      </h1>
                      <p className="text-xs text-muted-foreground font-mono">
                        Powered by FHEVM & Zama
                      </p>
                    </div>
                  </div>
                  <CustomConnectButton />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-6 py-12 animate-float">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-panel border border-primary/30 rounded-full animate-glow">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                      Blockchain-Powered Privacy Protection
                    </span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-success bg-clip-text text-transparent leading-tight">
                    Privacy Housing Quality Assessment
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Submit and verify property quality assessments while preserving privacy
                    using Fully Homomorphic Encryption on the blockchain.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                    <span>Deployed on Sepolia Testnet</span>
                  </div>
                </div>

                {/* Assessor Management */}
                <AssessorManagement />

                {/* Submit Assessment */}
                <SubmitAssessment />

                {/* View Reports */}
                <ViewReports />

                {/* Transaction History */}
                <TransactionHistory />

                {/* Footer Info */}
                <div className="mt-16 pt-8 border-t border-primary/10 text-center space-y-4">
                  <div className="glass-panel inline-block px-6 py-4 rounded-full">
                    <p className="text-sm text-muted-foreground">
                      Privacy-preserving housing quality assessment system
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground/70">
                    Built with React, TypeScript, Wagmi, RainbowKit, Tailwind CSS, and Radix UI
                  </p>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground/60">
                    <span>Contract:</span>
                    <code className="font-mono px-3 py-1 glass-panel rounded-full border border-primary/20">
                      0x2Bb9...3640
                    </code>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

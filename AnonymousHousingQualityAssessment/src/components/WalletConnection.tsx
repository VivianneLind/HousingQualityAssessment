import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { WalletState } from '../types';

interface WalletConnectionProps {
  walletState: WalletState;
  connectWallet: () => Promise<any>;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({
  walletState,
  connectWallet
}) => {
  return (
    <Card title="Wallet Connection" icon="🔗">
      {!walletState.isConnected ? (
        <Button onClick={connectWallet}>
          Connect MetaMask
        </Button>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4">
          <div className="space-y-2">
            <div>
              <strong className="text-gray-700">Connected Address:</strong>{' '}
              <span className="font-mono text-sm">{walletState.address}</span>
            </div>
            <div>
              <strong className="text-gray-700">Network:</strong>{' '}
              {walletState.networkName} (Chain ID: {walletState.chainId})
            </div>
            {walletState.isOwner && (
              <div>
                <strong className="text-gray-700">Status:</strong>{' '}
                <span className="text-green-600 font-semibold">Contract Owner</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

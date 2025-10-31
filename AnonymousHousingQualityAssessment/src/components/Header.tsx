import React from 'react';
import { WalletState } from '../types';
import { formatAddress } from '../lib/utils';

interface HeaderProps {
  walletState: WalletState;
}

export const Header: React.FC<HeaderProps> = ({ walletState }) => {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏠</span>
            <h1 className="text-xl font-bold text-gray-800">Housing Quality Assessment</h1>
          </div>
          {walletState.isConnected && (
            <div className="text-sm text-gray-600">
              {walletState.networkName} | {formatAddress(walletState.address!)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

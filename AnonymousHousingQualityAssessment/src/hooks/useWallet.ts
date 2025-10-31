import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../types/contract';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    networkName: null,
    isOwner: false,
  });

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const address = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();

      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, web3Signer);

      let isOwner = false;
      try {
        const owner = await contractInstance.owner();
        isOwner = address.toLowerCase() === owner.toLowerCase();
      } catch (error) {
        console.log('Could not determine owner status');
      }

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);

      setWalletState({
        address,
        isConnected: true,
        chainId: network.chainId,
        networkName: network.name,
        isOwner,
      });

      return { success: true, address };
    } catch (error: any) {
      console.error('Connection error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      chainId: null,
      networkName: null,
      isOwner: false,
    });
    setProvider(null);
    setSigner(null);
    setContract(null);
  }, []);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Auto-connect if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          window.location.reload();
        }
      });

      // Listen for network changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [connectWallet, disconnectWallet]);

  return {
    walletState,
    provider,
    signer,
    contract,
    connectWallet,
    disconnectWallet,
  };
};

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';

// Get WalletConnect Project ID from environment variable
// To get your own Project ID, visit: https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '21fef48091f12692cad574a6f7753643';

// Custom Sepolia configuration with multiple RPC endpoints
const sepoliaWithCustomRpc = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [
        'https://blockchain.googleapis.com/v1/projects/logical-iridium-334603/locations/asia-east1/endpoints/ethereum-sepolia/rpc?key=AIzaSyA6HJzZ_EdQvqT18XTK5tQ80IRCJNItynk',
        'https://eth-sepolia.g.alchemy.com/v2/demo',
        'https://rpc.sepolia.org',
      ],
    },
    public: {
      http: ['https://rpc.sepolia.org'],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'Privacy Housing Assessment',
  projectId,
  chains: [sepoliaWithCustomRpc],
  transports: {
    [sepolia.id]: http(sepoliaWithCustomRpc.rpcUrls.default.http[0], {
      timeout: 30_000, // 30 seconds timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
  ssr: false,
});

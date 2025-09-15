# ⚛️ React Integration Guide

Complete guide for integrating the FHEVM SDK with React applications.

## Quick Start

### Installation

```bash
npm install @fhevm/sdk @rainbow-me/rainbowkit wagmi viem
```

### Basic Setup

```typescript
// app.tsx
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <YourApp />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Hooks

### `useFhevm` Hook

The main hook for initializing FHEVM.

#### Basic Usage

```typescript
import { useFhevm } from '@fhevm/sdk/react';

function MyComponent() {
  const { fhevm, isReady, error } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!isReady) return <div>Loading...</div>;

  return <div>FHEVM Ready!</div>;
}
```

#### With Loading State

```typescript
function MyComponent() {
  const { fhevm, isReady, error, reload } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  if (error) {
    return (
      <div className="error">
        <p>Failed to initialize FHEVM</p>
        <button onClick={reload}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      {!isReady && <Spinner />}
      {isReady && <EncryptionForm fhevm={fhevm} />}
    </div>
  );
}
```

#### With Custom Configuration

```typescript
function MyComponent() {
  const config = useMemo(() => ({
    chainId: 11155111,
    gatewayUrl: 'https://custom-gateway.com',
    aclAddress: '0x...'
  }), []);

  const { fhevm, isReady } = useFhevm(config);

  // Component logic...
}
```

---

### `useEncrypt` Hook

Hook for encrypting values with loading states.

#### Basic Usage

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';
import { useWriteContract } from 'wagmi';

function SubmitForm() {
  const { fhevm } = useFhevm({ chainId: 11155111, network: 'sepolia' });
  const { encrypt, isEncrypting } = useEncrypt(fhevm);
  const { writeContract } = useWriteContract();

  const handleSubmit = async (value: number) => {
    const encrypted = await encrypt(value, 'uint32');

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitValue',
      args: [encrypted]
    });
  };

  return (
    <button
      onClick={() => handleSubmit(42)}
      disabled={isEncrypting}
    >
      {isEncrypting ? 'Encrypting...' : 'Submit'}
    </button>
  );
}
```

#### With Form Input

```typescript
function EncryptionForm() {
  const { fhevm } = useFhevm({ chainId: 11155111, network: 'sepolia' });
  const { encrypt, isEncrypting, error } = useEncrypt(fhevm);
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const encrypted = await encrypt(parseInt(value), 'uint32');
      // Use encrypted value...
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />
      <button type="submit" disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt & Submit'}
      </button>
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

---

### `useDecrypt` Hook

Hook for decrypting values.

#### Basic Usage

```typescript
import { useFhevm, useDecrypt } from '@fhevm/sdk/react';
import { useReadContract } from 'wagmi';

function ViewScore() {
  const { fhevm } = useFhevm({ chainId: 11155111, network: 'sepolia' });
  const { decrypt, isDecrypting } = useDecrypt(fhevm);
  const [score, setScore] = useState<number | null>(null);

  const { data: encryptedScore } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getScore'
  });

  useEffect(() => {
    if (encryptedScore && fhevm) {
      decrypt(encryptedScore as string, CONTRACT_ADDRESS)
        .then(setScore);
    }
  }, [encryptedScore, fhevm]);

  return (
    <div>
      {isDecrypting && <p>Decrypting...</p>}
      {score !== null && <p>Your score: {score}</p>}
    </div>
  );
}
```

---

## Complete Examples

### Example 1: Encrypted Counter

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';
import { useWriteContract, useAccount } from 'wagmi';

const CONTRACT_ADDRESS = '0x...';
const CONTRACT_ABI = [...];

function EncryptedCounter() {
  const { address } = useAccount();
  const { fhevm, isReady } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  const { encrypt, isEncrypting } = useEncrypt(fhevm);
  const { writeContract, isPending } = useWriteContract();

  const increment = async (amount: number) => {
    const encrypted = await encrypt(amount, 'uint32');

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'increment',
      args: [encrypted],
    });
  };

  const isLoading = isEncrypting || isPending;

  return (
    <div className="counter">
      <h2>Encrypted Counter</h2>

      {!isReady && <p>Initializing FHEVM...</p>}

      {isReady && (
        <div className="buttons">
          <button
            onClick={() => increment(1)}
            disabled={isLoading}
          >
            +1
          </button>
          <button
            onClick={() => increment(5)}
            disabled={isLoading}
          >
            +5
          </button>
          <button
            onClick={() => increment(10)}
            disabled={isLoading}
          >
            +10
          </button>
        </div>
      )}

      {isLoading && <p>Processing...</p>}
    </div>
  );
}
```

### Example 2: Private Voting

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function PrivateVoting() {
  const { fhevm, isReady } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  const { encrypt } = useEncrypt(fhevm);
  const { writeContract } = useWriteContract();

  const vote = async (choice: number) => {
    const encrypted = await encrypt(choice, 'uint8');

    writeContract({
      address: VOTING_CONTRACT,
      abi: VOTING_ABI,
      functionName: 'castVote',
      args: [encrypted]
    });
  };

  return (
    <div className="voting">
      <h2>Private Voting</h2>

      {isReady ? (
        <>
          <button onClick={() => vote(1)}>Option 1</button>
          <button onClick={() => vote(2)}>Option 2</button>
          <button onClick={() => vote(3)}>Option 3</button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
```

### Example 3: Confidential Auction

```typescript
function ConfidentialAuction() {
  const { fhevm, isReady } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  const { encrypt, isEncrypting } = useEncrypt(fhevm);
  const [bidAmount, setBidAmount] = useState('');

  const placeBid = async () => {
    const amount = parseFloat(bidAmount);
    const encrypted = await encrypt(Math.floor(amount * 100), 'uint32');

    writeContract({
      address: AUCTION_CONTRACT,
      abi: AUCTION_ABI,
      functionName: 'placeBid',
      args: [encrypted]
    });
  };

  return (
    <div className="auction">
      <h2>Confidential Auction</h2>

      <input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
        placeholder="Your bid amount"
        disabled={!isReady}
      />

      <button
        onClick={placeBid}
        disabled={!isReady || isEncrypting || !bidAmount}
      >
        {isEncrypting ? 'Placing bid...' : 'Place Encrypted Bid'}
      </button>
    </div>
  );
}
```

---

## Advanced Patterns

### Custom Hook for Contract Interaction

```typescript
// hooks/useEncryptedContract.ts
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';
import { useWriteContract } from 'wagmi';

export function useEncryptedContract(
  address: string,
  abi: any[]
) {
  const { fhevm, isReady } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  const { encrypt } = useEncrypt(fhevm);
  const { writeContract } = useWriteContract();

  const write = async (
    functionName: string,
    value: number,
    type: EncryptionType = 'uint32'
  ) => {
    if (!isReady) {
      throw new Error('FHEVM not ready');
    }

    const encrypted = await encrypt(value, type);

    return writeContract({
      address,
      abi,
      functionName,
      args: [encrypted]
    });
  };

  return { write, isReady };
}

// Usage
function MyComponent() {
  const { write, isReady } = useEncryptedContract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI
  );

  const handleSubmit = () => {
    write('submitValue', 42, 'uint32');
  };

  return (
    <button onClick={handleSubmit} disabled={!isReady}>
      Submit
    </button>
  );
}
```

### Context Provider Pattern

```typescript
// context/FhevmContext.tsx
import { createContext, useContext } from 'react';
import { useFhevm } from '@fhevm/sdk/react';

const FhevmContext = createContext(null);

export function FhevmProvider({ children }) {
  const fhevmData = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  return (
    <FhevmContext.Provider value={fhevmData}>
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevmContext() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error('useFhevmContext must be used within FhevmProvider');
  }
  return context;
}

// Usage
function App() {
  return (
    <FhevmProvider>
      <YourComponents />
    </FhevmProvider>
  );
}

function MyComponent() {
  const { fhevm, isReady } = useFhevmContext();
  // Use fhevm...
}
```

---

## Performance Optimization

### Memoization

```typescript
import { useMemo } from 'react';

function MyComponent() {
  // ✅ Good - memoized config
  const config = useMemo(() => ({
    chainId: 11155111,
    network: 'sepolia'
  }), []);

  const { fhevm } = useFhevm(config);

  // Component logic...
}
```

### Lazy Initialization

```typescript
function MyComponent() {
  const [shouldInit, setShouldInit] = useState(false);

  const { fhevm, isReady } = useFhevm(
    shouldInit
      ? { chainId: 11155111, network: 'sepolia' }
      : null
  );

  return (
    <>
      {!shouldInit && (
        <button onClick={() => setShouldInit(true)}>
          Initialize FHEVM
        </button>
      )}

      {shouldInit && isReady && <EncryptionForm />}
    </>
  );
}
```

---

## Error Handling

### Using Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <FhevmComponents />
    </ErrorBoundary>
  );
}
```

### Graceful Degradation

```typescript
function MyComponent() {
  const { fhevm, isReady, error } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  if (error) {
    // Fallback to non-encrypted mode
    return <NonEncryptedForm />;
  }

  return isReady ? <EncryptedForm fhevm={fhevm} /> : <Loading />;
}
```

---

## Testing

### Mocking FHEVM Hooks

```typescript
// __mocks__/@fhevm/sdk/react.ts
export const useFhevm = jest.fn(() => ({
  fhevm: mockFhevmInstance,
  isReady: true,
  error: null,
  reload: jest.fn()
}));

export const useEncrypt = jest.fn(() => ({
  encrypt: jest.fn().mockResolvedValue({ data: '0x...' }),
  isEncrypting: false,
  error: null
}));

// MyComponent.test.tsx
import { useFhevm } from '@fhevm/sdk/react';

jest.mock('@fhevm/sdk/react');

test('renders when FHEVM is ready', () => {
  (useFhevm as jest.Mock).mockReturnValue({
    fhevm: mockInstance,
    isReady: true,
    error: null
  });

  render(<MyComponent />);
  expect(screen.getByText('Submit')).toBeInTheDocument();
});
```

---

## TypeScript Tips

### Type-Safe Hook Usage

```typescript
import type { FhevmInstance, EncryptionType } from '@fhevm/sdk';

interface EncryptedFormProps {
  fhevm: FhevmInstance;
  onSuccess?: (encrypted: EncryptedValue) => void;
}

function EncryptedForm({ fhevm, onSuccess }: EncryptedFormProps) {
  const { encrypt } = useEncrypt(fhevm);

  const handleSubmit = async (
    value: number,
    type: EncryptionType
  ) => {
    const encrypted = await encrypt(value, type);
    onSuccess?.(encrypted);
  };

  // Component logic...
}
```

---

<div align="center">

**Ready to build with React?**

[Getting Started](./getting-started.md) • [API Reference](./api-reference.md) • [Examples](../examples/)

</div>

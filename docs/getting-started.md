# 🚀 Getting Started with FHEVM SDK

## Quick Introduction

The **Universal FHEVM SDK** makes it incredibly easy to build privacy-preserving applications with Fully Homomorphic Encryption (FHE). This guide will get you up and running in less than 5 minutes.

## What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) allows smart contracts to perform computations on encrypted data without decrypting it. This means:

- ✅ Data remains encrypted on-chain
- ✅ Computations happen on encrypted values
- ✅ Only authorized parties can decrypt results
- ✅ Complete privacy for sensitive information

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- Basic knowledge of **React** (for React integration)
- A **MetaMask** wallet or similar Web3 wallet

## Installation

### Step 1: Install the SDK

```bash
npm install @fhevm/sdk
```

For React projects, you'll also want the React hooks:

```bash
npm install @fhevm/sdk
```

The React hooks are included in the main package under `@fhevm/sdk/react`.

### Step 2: Configure Your Project

Add these environment variables to your `.env` file:

```env
# Required
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional - Network Configuration
VITE_NETWORK=sepolia
VITE_CHAIN_ID=11155111
```

### Step 3: Set Up Wagmi (for React)

The SDK works seamlessly with Wagmi for Web3 connections:

```typescript
// src/config/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'My FHEVM App',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: true,
});
```

## Your First Encryption

### Vanilla JavaScript/TypeScript

```typescript
import { createFhevmInstance, encryptInput } from '@fhevm/sdk';

// 1. Create FHEVM instance
const fhevm = await createFhevmInstance({
  chainId: 11155111,
  network: 'sepolia'
});

// 2. Encrypt a value
const encrypted = await encryptInput(fhevm, 42, 'uint32');

// 3. Use in contract call
await contract.submitValue(encrypted);
```

### React with Hooks

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  // 1. Initialize FHEVM
  const { fhevm, isReady, error } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  // 2. Get encryption function
  const { encrypt, isEncrypting } = useEncrypt(fhevm);

  // 3. Encrypt and submit
  const handleSubmit = async (value: number) => {
    if (!isReady) return;

    const encrypted = await encrypt(value, 'uint32');
    await contract.submitValue(encrypted);
  };

  return (
    <button
      onClick={() => handleSubmit(42)}
      disabled={!isReady || isEncrypting}
    >
      {isReady ? 'Submit Encrypted Value' : 'Loading...'}
    </button>
  );
}
```

## Complete Example: Encrypted Counter

Here's a complete example of an encrypted counter application:

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

  const { encrypt } = useEncrypt(fhevm);
  const { writeContract } = useWriteContract();

  const incrementBy = async (amount: number) => {
    // Encrypt the amount
    const encrypted = await encrypt(amount, 'uint32');

    // Submit to contract
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'increment',
      args: [encrypted],
    });
  };

  return (
    <div>
      <h1>Encrypted Counter</h1>
      {!isReady && <p>Loading FHEVM...</p>}
      {isReady && (
        <>
          <button onClick={() => incrementBy(1)}>+1</button>
          <button onClick={() => incrementBy(5)}>+5</button>
          <button onClick={() => incrementBy(10)}>+10</button>
        </>
      )}
    </div>
  );
}
```

## Supported Data Types

The SDK supports encryption of these data types:

| Type | Description | Range |
|------|-------------|-------|
| `uint8` | 8-bit unsigned integer | 0 to 255 |
| `uint16` | 16-bit unsigned integer | 0 to 65,535 |
| `uint32` | 32-bit unsigned integer | 0 to 4,294,967,295 |
| `uint64` | 64-bit unsigned integer | 0 to 18,446,744,073,709,551,615 |
| `bool` | Boolean | true or false |
| `address` | Ethereum address | 20-byte address |

Example usage:

```typescript
// Encrypt different types
const encUint8 = await encrypt(255, 'uint8');
const encUint32 = await encrypt(1000000, 'uint32');
const encBool = await encrypt(true, 'bool');
const encAddress = await encrypt('0x...', 'address');
```

## Network Configuration

The SDK comes with built-in network configurations:

```typescript
import { createFhevmInstance } from '@fhevm/sdk';

// Sepolia (default)
const fhevmSepolia = await createFhevmInstance({
  chainId: 11155111,
  network: 'sepolia'
});

// Custom network
const fhevmCustom = await createFhevmInstance({
  chainId: 12345,
  gatewayUrl: 'https://your-gateway.com',
  aclAddress: '0x...',
});
```

## Error Handling

Always handle errors when working with encryption:

```typescript
import { useFhevm } from '@fhevm/sdk/react';

function MyComponent() {
  const { fhevm, isReady, error } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <div>Ready to encrypt!</div>;
}
```

## Best Practices

### 1. Always Check `isReady`

```typescript
const { fhevm, isReady } = useFhevm(config);

// ❌ Bad
const encrypted = await encrypt(value);

// ✅ Good
if (isReady) {
  const encrypted = await encrypt(value);
}
```

### 2. Handle Loading States

```typescript
const { encrypt, isEncrypting } = useEncrypt(fhevm);

return (
  <button disabled={isEncrypting}>
    {isEncrypting ? 'Encrypting...' : 'Submit'}
  </button>
);
```

### 3. Use Type Safety

```typescript
// ✅ Good - explicit type
const encrypted = await encrypt(42, 'uint32');

// ❌ Bad - might infer wrong type
const encrypted = await encrypt(42);
```

### 4. Reuse FHEVM Instance

```typescript
// ✅ Good - create once, use everywhere
const fhevm = await createFhevmInstance(config);

// ❌ Bad - creating multiple instances
const fhevm1 = await createFhevmInstance(config);
const fhevm2 = await createFhevmInstance(config);
```

## Next Steps

Now that you have the basics:

1. 📖 Read the [API Reference](./api-reference.md) for detailed documentation
2. ⚛️ Check out [React Integration](./react-integration.md) for advanced React patterns
3. 🏠 Explore the [Housing Assessment Example](../examples/nextjs-housing-assessment/)
4. 🎥 Watch the [Demo Video](../demo.mp4) for a visual walkthrough

## Common Issues

### Issue: "Cannot find FHEVM instance"

**Solution**: Make sure you've initialized the SDK:

```typescript
const fhevm = await createFhevmInstance({
  chainId: 11155111,
  network: 'sepolia'
});
```

### Issue: "Encryption failed"

**Solution**: Check that:
- Your wallet is connected
- You're on the correct network
- The value is within the type's range

### Issue: "Contract call reverted"

**Solution**: Ensure:
- The encrypted value matches the contract's expected type
- You have proper permissions to call the function
- The contract address is correct

## Getting Help

- 📚 [Full Documentation](../README.md)
- 💬 [Zama Discord](https://discord.gg/zama)
- 🐛 [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)
- 📖 [FHEVM Docs](https://docs.zama.ai/fhevm)

---

<div align="center">

**Ready to build privacy-preserving dApps?** 🚀

[API Reference](./api-reference.md) • [React Integration](./react-integration.md) • [Examples](../examples/)

</div>

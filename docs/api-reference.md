# 📚 API Reference

Complete reference for the Universal FHEVM SDK.

## Core Functions

### `createFhevmInstance()`

Creates and initializes an FHEVM instance for encryption/decryption operations.

```typescript
function createFhevmInstance(config: FhevmConfig): Promise<FhevmInstance>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `FhevmConfig` | Yes | Configuration object |
| `config.chainId` | `number` | Yes | Chain ID (e.g., 11155111 for Sepolia) |
| `config.network` | `string` | No | Network name (e.g., 'sepolia') |
| `config.gatewayUrl` | `string` | No | Custom gateway URL |
| `config.aclAddress` | `string` | No | Custom ACL contract address |

**Returns:** `Promise<FhevmInstance>`

**Example:**

```typescript
import { createFhevmInstance } from '@fhevm/sdk';

// Basic usage with network preset
const fhevm = await createFhevmInstance({
  chainId: 11155111,
  network: 'sepolia'
});

// Advanced usage with custom configuration
const fhevmCustom = await createFhevmInstance({
  chainId: 11155111,
  gatewayUrl: 'https://custom-gateway.com',
  aclAddress: '0x9D6891A6240D6130c54ae243d8005063D05fE14b'
});
```

---

### `encryptInput()`

Encrypts a value for use in FHEVM smart contracts.

```typescript
function encryptInput(
  fhevm: FhevmInstance,
  value: number | bigint | boolean | string,
  type?: EncryptionType
): Promise<EncryptedValue>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fhevm` | `FhevmInstance` | Yes | FHEVM instance from `createFhevmInstance()` |
| `value` | `number \| bigint \| boolean \| string` | Yes | Value to encrypt |
| `type` | `EncryptionType` | No | Type of encryption (auto-detected if omitted) |

**Encryption Types:**

- `'uint8'` - 8-bit unsigned integer (0 to 255)
- `'uint16'` - 16-bit unsigned integer (0 to 65,535)
- `'uint32'` - 32-bit unsigned integer (0 to 4,294,967,295)
- `'uint64'` - 64-bit unsigned integer (0 to 2^64-1)
- `'bool'` - Boolean value
- `'address'` - Ethereum address

**Returns:** `Promise<EncryptedValue>`

**Example:**

```typescript
import { encryptInput } from '@fhevm/sdk';

// Encrypt different types
const encryptedUint32 = await encryptInput(fhevm, 42, 'uint32');
const encryptedBool = await encryptInput(fhevm, true, 'bool');
const encryptedAddress = await encryptInput(
  fhevm,
  '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  'address'
);

// Auto-detection (infers uint8 for value 42)
const encrypted = await encryptInput(fhevm, 42);
```

---

### `decryptOutput()`

Decrypts an encrypted value from a smart contract.

```typescript
function decryptOutput(
  fhevm: FhevmInstance,
  ciphertext: string,
  contractAddress: string
): Promise<number | boolean | string>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fhevm` | `FhevmInstance` | Yes | FHEVM instance |
| `ciphertext` | `string` | Yes | Encrypted value to decrypt |
| `contractAddress` | `string` | Yes | Contract address that owns the ciphertext |

**Returns:** `Promise<number | boolean | string>`

**Example:**

```typescript
import { decryptOutput } from '@fhevm/sdk';

// Read encrypted value from contract
const encryptedValue = await contract.getEncryptedScore();

// Decrypt it
const decrypted = await decryptOutput(
  fhevm,
  encryptedValue,
  CONTRACT_ADDRESS
);

console.log('Decrypted value:', decrypted);
```

---

### `grantAccess()`

Grants decryption permission to an address.

```typescript
function grantAccess(
  fhevm: FhevmInstance,
  contractAddress: string,
  userAddress: string
): Promise<void>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fhevm` | `FhevmInstance` | Yes | FHEVM instance |
| `contractAddress` | `string` | Yes | Contract containing encrypted data |
| `userAddress` | `string` | Yes | Address to grant access to |

**Returns:** `Promise<void>`

**Example:**

```typescript
import { grantAccess } from '@fhevm/sdk';

// Grant decryption access to a user
await grantAccess(fhevm, CONTRACT_ADDRESS, userAddress);
```

---

## React Hooks

### `useFhevm()`

React hook for initializing and managing FHEVM instance.

```typescript
function useFhevm(config: FhevmConfig): UseFhevmReturn
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `FhevmConfig` | Yes | Configuration object (same as `createFhevmInstance`) |

**Returns:** `UseFhevmReturn`

```typescript
interface UseFhevmReturn {
  fhevm: FhevmInstance | null;
  isReady: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}
```

**Example:**

```typescript
import { useFhevm } from '@fhevm/sdk/react';

function MyComponent() {
  const { fhevm, isReady, error, reload } = useFhevm({
    chainId: 11155111,
    network: 'sepolia'
  });

  if (error) {
    return (
      <div>
        Error: {error.message}
        <button onClick={reload}>Retry</button>
      </div>
    );
  }

  if (!isReady) {
    return <div>Loading FHEVM...</div>;
  }

  return <div>FHEVM Ready!</div>;
}
```

---

### `useEncrypt()`

React hook for encrypting values.

```typescript
function useEncrypt(fhevm: FhevmInstance | null): UseEncryptReturn
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fhevm` | `FhevmInstance \| null` | Yes | FHEVM instance from `useFhevm()` |

**Returns:** `UseEncryptReturn`

```typescript
interface UseEncryptReturn {
  encrypt: (
    value: number | bigint | boolean | string,
    type?: EncryptionType
  ) => Promise<EncryptedValue>;
  isEncrypting: boolean;
  error: Error | null;
}
```

**Example:**

```typescript
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

function EncryptForm() {
  const { fhevm } = useFhevm({ chainId: 11155111, network: 'sepolia' });
  const { encrypt, isEncrypting, error } = useEncrypt(fhevm);

  const handleSubmit = async (value: number) => {
    const encrypted = await encrypt(value, 'uint32');
    // Use encrypted value...
  };

  return (
    <button
      onClick={() => handleSubmit(42)}
      disabled={isEncrypting}
    >
      {isEncrypting ? 'Encrypting...' : 'Encrypt & Submit'}
    </button>
  );
}
```

---

### `useDecrypt()`

React hook for decrypting values.

```typescript
function useDecrypt(fhevm: FhevmInstance | null): UseDecryptReturn
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fhevm` | `FhevmInstance \| null` | Yes | FHEVM instance from `useFhevm()` |

**Returns:** `UseDecryptReturn`

```typescript
interface UseDecryptReturn {
  decrypt: (
    ciphertext: string,
    contractAddress: string
  ) => Promise<number | boolean | string>;
  isDecrypting: boolean;
  error: Error | null;
}
```

**Example:**

```typescript
import { useFhevm, useDecrypt } from '@fhevm/sdk/react';

function ViewScore() {
  const { fhevm } = useFhevm({ chainId: 11155111, network: 'sepolia' });
  const { decrypt, isDecrypting } = useDecrypt(fhevm);
  const [score, setScore] = useState<number | null>(null);

  const handleDecrypt = async (encryptedScore: string) => {
    const decrypted = await decrypt(encryptedScore, CONTRACT_ADDRESS);
    setScore(decrypted as number);
  };

  return (
    <div>
      {isDecrypting && <p>Decrypting...</p>}
      {score !== null && <p>Score: {score}</p>}
    </div>
  );
}
```

---

## Type Definitions

### `FhevmConfig`

```typescript
interface FhevmConfig {
  chainId: number;
  network?: string;
  gatewayUrl?: string;
  aclAddress?: string;
  kmsVerifierAddress?: string;
}
```

### `FhevmInstance`

```typescript
interface FhevmInstance {
  encrypt: (value: any, type: string) => Promise<EncryptedValue>;
  decrypt: (ciphertext: string) => Promise<any>;
  // Internal properties...
}
```

### `EncryptedValue`

```typescript
interface EncryptedValue {
  data: Uint8Array;
  handles: string[];
  inputProof: string;
}
```

### `EncryptionType`

```typescript
type EncryptionType =
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'bool'
  | 'address';
```

---

## Utility Functions

### `validateAddress()`

Validates an Ethereum address.

```typescript
function validateAddress(address: string): boolean
```

**Example:**

```typescript
import { validateAddress } from '@fhevm/sdk';

const isValid = validateAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
console.log(isValid); // true
```

---

### `getSupportedTypes()`

Returns list of supported encryption types.

```typescript
function getSupportedTypes(): EncryptionType[]
```

**Example:**

```typescript
import { getSupportedTypes } from '@fhevm/sdk';

const types = getSupportedTypes();
// ['uint8', 'uint16', 'uint32', 'uint64', 'bool', 'address']
```

---

## Network Configurations

### Built-in Networks

```typescript
const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    gatewayUrl: 'https://gateway.sepolia.zama.ai',
    aclAddress: '0x9D6891A6240D6130c54ae243d8005063D05fE14b'
  },
  // More networks...
};
```

---

## Error Handling

### Common Errors

```typescript
// FhevmNotReadyError
if (!fhevm) {
  throw new Error('FHEVM instance not ready');
}

// EncryptionError
try {
  const encrypted = await encrypt(value);
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error('Encryption failed:', error.message);
  }
}

// DecryptionError
try {
  const decrypted = await decrypt(ciphertext, contractAddress);
} catch (error) {
  if (error instanceof DecryptionError) {
    console.error('Decryption failed:', error.message);
  }
}
```

---

## Best Practices

### 1. Type Safety

Always specify types explicitly for production code:

```typescript
// ✅ Good
const encrypted = await encryptInput(fhevm, 42, 'uint32');

// ⚠️ Use with caution (auto-detection)
const encrypted = await encryptInput(fhevm, 42);
```

### 2. Error Boundaries

Use React error boundaries with hooks:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Error loading FHEVM</div>}>
  <MyFhevmComponent />
</ErrorBoundary>
```

### 3. Memoization

Memoize config objects to prevent unnecessary re-renders:

```typescript
import { useMemo } from 'react';

const config = useMemo(() => ({
  chainId: 11155111,
  network: 'sepolia'
}), []);

const { fhevm } = useFhevm(config);
```

---

## Advanced Usage

### Custom Network Configuration

```typescript
const customConfig: FhevmConfig = {
  chainId: 12345,
  gatewayUrl: 'https://my-gateway.com',
  aclAddress: '0x...',
  kmsVerifierAddress: '0x...'
};

const fhevm = await createFhevmInstance(customConfig);
```

### Batch Encryption

```typescript
const values = [1, 2, 3, 4, 5];

const encrypted = await Promise.all(
  values.map(v => encryptInput(fhevm, v, 'uint32'))
);
```

### Permission Management

```typescript
// Grant access to multiple users
const users = ['0x...', '0x...', '0x...'];

await Promise.all(
  users.map(user => grantAccess(fhevm, CONTRACT_ADDRESS, user))
);
```

---

<div align="center">

**Need more help?**

[Getting Started](./getting-started.md) • [React Integration](./react-integration.md) • [Examples](../examples/)

</div>

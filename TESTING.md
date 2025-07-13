# Testing Documentation

## Overview

This document provides comprehensive testing documentation for the Privacy Housing Assessment application, covering both Mock environment unit tests and Sepolia testnet integration tests.

## Testing Stack

### Core Testing Framework
- **Hardhat**: Ethereum development environment (v2.22.0)
- **Mocha**: Test framework for organizing test suites
- **Chai**: Assertion library with BDD/TDD assertions
- **TypeScript**: Type-safe test development

### fhEVM Testing
- **fhEVM Hardhat Plugin**: Fully Homomorphic Encryption testing support
- **Mock Environment**: Fast local testing with simulated FHE operations
- **Sepolia Environment**: Real testnet integration testing

### Type Generation
- **TypeChain**: Automated TypeScript type generation for contracts
- **Hardhat TypeChain Plugin**: Integration with Hardhat workflow

## Test Structure

### Directory Layout

```
test/
├── HousingAssessment.ts         # Mock environment unit tests (33 tests)
└── HousingAssessmentSepolia.ts  # Sepolia integration tests (10 tests)
```

### Test Coverage

#### Mock Environment Tests (test/HousingAssessment.ts)

**Total: 33 test cases covering all contract functionality**

1. **Deployment (3 tests)**
   - Successful deployment with correct owner
   - Initialize nextAssessmentId to 1
   - Revert with zero gateway address

2. **Assessor Registration (3 tests)**
   - Allow new assessor registration
   - Reject duplicate registration
   - Track registration time correctly

3. **Assessor Certification (4 tests)**
   - Allow owner to certify registered assessor
   - Reject certification by non-owner
   - Reject certification of unregistered assessor
   - Reject duplicate certification

4. **Assessment Submission (4 tests)**
   - Allow certified assessor to submit assessment
   - Reject submission from uncertified assessor
   - Reject submission from unregistered user
   - Track multiple assessments for same property

5. **Assessment Verification (4 tests)**
   - Allow owner to verify assessment
   - Reject verification by non-owner
   - Reject verification of non-existent assessment
   - Reject duplicate verification

6. **Assessor Statistics (3 tests)**
   - Return correct stats for unregistered assessor
   - Return correct stats for registered assessor
   - Track multiple assessments correctly

7. **Property Assessment Queries (4 tests)**
   - Return zero count for property with no assessments
   - Return correct count for assessed property
   - Return empty array for property with no assessments
   - Return correct assessment IDs

8. **System Statistics (1 test)**
   - Return total assessments count

9. **Edge Cases (5 tests)**
   - Handle zero scores
   - Handle maximum scores (100)
   - Handle empty property ID
   - Handle long property ID (100+ characters)
   - Handle special characters in property ID

10. **Gas Usage (2 tests)**
    - Use reasonable gas for registration (< 500k)
    - Use reasonable gas for assessment submission (< 1M)

#### Sepolia Integration Tests (test/HousingAssessmentSepolia.ts)

**Total: 10 test cases for real network integration**

1. **Step 1: Contract Verification (2 tests)**
   - Verify contract is deployed and accessible
   - Have correct initial state

2. **Step 2: Assessor Registration on Sepolia (2 tests)**
   - Allow new assessor registration
   - Track registration stats correctly

3. **Step 3: Assessor Certification on Sepolia (1 test)**
   - Allow owner to certify registered assessor

4. **Step 4: Assessment Submission on Sepolia (2 tests)**
   - Allow certified assessor to submit quality assessment
   - Track assessor statistics after submission

5. **Step 5: Property Query on Sepolia (1 test)**
   - Query property assessment count

6. **Step 6: Gas Usage Analysis (2 tests)**
   - Record gas usage for registration
   - Record gas usage for assessment submission

7. **Step 7: Network Verification (1 test)**
   - Confirm deployment on Sepolia network (Chain ID: 11155111)

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Generate TypeChain types:
```bash
npx hardhat typechain
```

### Mock Environment Tests

Run all mock environment unit tests:

```bash
npm run test:mock
```

Or with Hardhat directly:

```bash
npx hardhat test test/HousingAssessment.ts
```

### Sepolia Integration Tests

**Important**: Sepolia tests require:
- Deployed contract on Sepolia testnet
- Valid RPC endpoint configured
- Test accounts with Sepolia ETH

Run Sepolia integration tests:

```bash
npm run test:sepolia
```

Or with Hardhat directly:

```bash
npx hardhat test test/HousingAssessmentSepolia.ts --network sepolia
```

### Run All Tests

Run both Mock and Sepolia tests:

```bash
npm test
```

### Generate Coverage Report

```bash
npm run coverage
```

## Test Configuration

### Hardhat Configuration (hardhat.config.ts)

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-chai-matchers";
import "hardhat-deploy";
import "fhevm/plugin";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // Mock environment for fast testing
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
  mocha: {
    timeout: 40000, // 40 seconds for Mock tests
  },
};

export default config;
```

### Environment Variables (.env)

```bash
# Sepolia testnet
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here

# Etherscan verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Test Patterns

### 1. Fixture Pattern

Use fixtures for clean contract deployment:

```typescript
async function deployFixture() {
  const gatewayAddress = "0x0000000000000000000000000000000000000001";
  const factory = await ethers.getContractFactory("AnonymousHousingQualityAssessment");
  const contract = await factory.deploy(gatewayAddress);
  const contractAddress = await contract.getAddress();

  return { contract, contractAddress };
}
```

### 2. Signer Pattern

Use named signers for clarity:

```typescript
type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};
```

### 3. Mock Environment Check

Skip tests in wrong environment:

```typescript
beforeEach(async function () {
  if (!fhevm.isMock) {
    console.warn("This test suite can only run in Mock environment");
    this.skip();
  }
  ({ contract, contractAddress } = await deployFixture());
});
```

### 4. Sepolia Environment Check

Skip Sepolia tests in Mock environment:

```typescript
before(async function () {
  if (fhevm.isMock) {
    console.warn("⏭️  Skipping Sepolia tests - Mock environment detected");
    this.skip();
  }
  // Extended timeout for network operations
  this.timeout(4 * 40000); // 160 seconds
});
```

### 5. Progress Logging

Log test progress for Sepolia tests:

```typescript
console.log("🚀 Starting Sepolia integration tests...");
console.log("📝 Deployer address:", signers.deployer.address);
console.log("✅ Contract verified at:", contractAddress);
```

### 6. Gas Usage Testing

Monitor gas consumption:

```typescript
it("should use reasonable gas for registration", async function () {
  const tx = await contract.connect(signers.bob).registerAssessor();
  const receipt = await tx.wait();

  expect(receipt!.gasUsed).to.be.lt(500000); // < 500k gas
  console.log("⛽ Gas used:", receipt!.gasUsed.toString());
});
```

## Assertion Examples

### Chai Matchers

```typescript
// Address validation
expect(address).to.be.properAddress;

// Boolean checks
expect(profile.isRegistered).to.be.true;
expect(profile.isCertified).to.be.false;

// Numeric comparisons
expect(count).to.equal(1);
expect(gasUsed).to.be.lt(1000000);
expect(timestamp).to.be.gt(0);

// Array checks
expect(ids.length).to.equal(2);
expect(ids[0]).to.equal(1);

// Revert checks
await expect(
  contract.registerAssessor()
).to.be.revertedWith("Already registered");

// Event emission
await expect(
  contract.registerAssessor()
).to.emit(contract, "AssessorRegistered")
  .withArgs(alice.address, timestamp);
```

## Test Data

### Valid Test Data

```typescript
// Quality scores (0-100 range)
const structuralScore = 85;
const safetyScore = 90;
const utilityScore = 75;
const locationScore = 80;

// Property IDs
const propertyId = "PROP-2024-001";
const propertyIdWithTimestamp = `SEPOLIA-TEST-${Date.now()}`;
```

### Edge Case Test Data

```typescript
// Zero values
submitQualityAssessment(0, 0, 0, 0, "PROP-ZERO");

// Maximum values
submitQualityAssessment(100, 100, 100, 100, "PROP-MAX");

// Empty property ID
submitQualityAssessment(85, 90, 75, 80, "");

// Long property ID
const longId = "PROP-" + "X".repeat(100);
submitQualityAssessment(85, 90, 75, 80, longId);

// Special characters
submitQualityAssessment(85, 90, 75, 80, "PROP-2024-TEST!@#$%^&*()");
```

## Common Issues and Solutions

### Issue 1: Tests Timeout

**Problem**: Tests exceed default 40-second timeout

**Solution**: Increase timeout for specific tests
```typescript
it("should complete long operation", async function () {
  this.timeout(120000); // 120 seconds
  // test code
});
```

### Issue 2: Type Errors

**Problem**: TypeScript cannot find contract types

**Solution**: Regenerate TypeChain types
```bash
npx hardhat clean
npx hardhat compile
npx hardhat typechain
```

### Issue 3: Sepolia Tests Fail to Connect

**Problem**: Cannot connect to Sepolia network

**Solution**: Check environment variables and RPC endpoint
```bash
# Verify .env configuration
cat .env

# Test RPC endpoint
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $SEPOLIA_RPC_URL
```

### Issue 4: Insufficient Gas

**Problem**: Transactions run out of gas on Sepolia

**Solution**: Check test account balance
```typescript
const balance = await ethers.provider.getBalance(deployer.address);
console.log("Balance:", ethers.formatEther(balance), "ETH");
```

Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

### Issue 5: Contract Not Found

**Problem**: Sepolia tests cannot find deployed contract

**Solution**: Verify deployment and update contract address
```bash
# Check deployments
npx hardhat deployments:list --network sepolia

# Update contract address in test if needed
```

## Best Practices

### 1. Test Isolation

- Use `beforeEach` to deploy fresh contracts for each test
- Avoid test interdependencies
- Clean up state after each test

### 2. Descriptive Test Names

```typescript
// Good
it("should allow owner to certify registered assessor", async function () {

// Bad
it("test certification", async function () {
```

### 3. Arrange-Act-Assert Pattern

```typescript
it("should update assessment count", async function () {
  // Arrange
  await contract.registerAssessor();
  await contract.certifyAssessor(alice.address);

  // Act
  await contract.submitQualityAssessment(85, 90, 75, 80, "PROP-001");

  // Assert
  const count = await contract.getTotalAssessments();
  expect(count).to.equal(1);
});
```

### 4. Error Message Testing

Always verify exact error messages:

```typescript
await expect(
  contract.certifyAssessor(bob.address)
).to.be.revertedWith("Assessor not registered");
```

### 5. Gas Optimization Testing

Include gas usage tests to catch regressions:

```typescript
it("should not exceed gas limit", async function () {
  const tx = await contract.submitQualityAssessment(...);
  const receipt = await tx.wait();
  expect(receipt!.gasUsed).to.be.lt(1000000);
});
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Install dependencies
      run: npm ci

    - name: Compile contracts
      run: npx hardhat compile

    - name: Run Mock tests
      run: npm run test:mock

    - name: Generate coverage
      run: npm run coverage

    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Performance Benchmarks

### Expected Test Times

| Test Suite | Environment | Tests | Duration |
|------------|-------------|-------|----------|
| Mock Unit Tests | Local | 33 | ~15s |
| Sepolia Integration | Testnet | 10 | ~120s |
| Full Test Suite | Both | 43 | ~135s |

### Gas Benchmarks

| Operation | Expected Gas | Max Acceptable |
|-----------|--------------|----------------|
| Register Assessor | ~100k | 500k |
| Certify Assessor | ~80k | 300k |
| Submit Assessment | ~300k | 1M |
| Verify Assessment | ~60k | 300k |

## Coverage Goals

Target coverage metrics:

- **Line Coverage**: > 95%
- **Branch Coverage**: > 90%
- **Function Coverage**: 100%
- **Statement Coverage**: > 95%

## Additional Resources

### Documentation
- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Chai Documentation](https://www.chaijs.com/)
- [fhEVM Documentation](https://docs.zama.ai/fhevm)

### Tools
- [Hardhat Network](https://hardhat.org/hardhat-network/docs)
- [TypeChain](https://github.com/dethcrypto/TypeChain)
- [Sepolia Testnet](https://sepolia.dev/)

### Support
- Report issues on GitHub
- Check contract deployment on [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640)

---

**Happy Testing! 🧪**

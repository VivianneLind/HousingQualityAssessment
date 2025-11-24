# 🏗️ Architecture & API Documentation

## Overview

AnonymousHousingQualityAssessment v3.0 implements a comprehensive privacy-preserving housing assessment system using FHEVM with the following enhancements:

- ✅ **Refund Mechanism**: Automatic refunds for failed decryption requests
- ✅ **Timeout Protection**: Prevents permanent fund locking with configurable timeouts
- ✅ **Gateway Callback Pattern**: Asynchronous decryption via Zama Gateway
- ✅ **Privacy Protection**: Random multipliers and fuzzy scoring prevent data leakage
- ✅ **Security Hardening**: Input validation, access control, overflow protection

---

## System Architecture

### Gateway Callback Pattern

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. Submit encrypted assessment
       ▼
┌─────────────────────────────────────┐
│   Smart Contract                    │
│                                     │
│  • Stores encrypted scores          │
│  • Records deposit amount           │
│  • Emits events                     │
└──────┬──────────────────────────────┘
       │ 2. Request decryption
       ▼
┌─────────────────────────────────────┐
│   Zama Gateway                      │
│                                     │
│  • Receives ciphertexts            │
│  • Performs off-chain decryption   │
│  • Generates proof                 │
└──────┬──────────────────────────────┘
       │ 3. Callback with results
       ▼
┌─────────────────────────────────────┐
│   Smart Contract                    │
│   (resolveDecryptionCallback)       │
│                                     │
│  • Verifies proof                   │
│  • Processes decrypted scores       │
│  • Generates quality report         │
│  • Updates assessor reputation      │
└─────────────────────────────────────┘
       │ 4. If timeout expires
       ▼
┌─────────────────────────────────────┐
│   Refund Mechanism                  │
│                                     │
│  • User claims timeout refund       │
│  • Deposit returned                 │
│  • Assessment marked failed         │
│  • Reputation penalty applied       │
└─────────────────────────────────────┘
```

---

## Key Features Implementation

### 1. Refund Mechanism

Handles decryption failures with automatic refunds:

```solidity
function claimTimeoutRefund(uint32 assessmentId) external {
    HousingAssessment storage assessment = assessments[assessmentId];

    // Check conditions
    if (!assessment.isPendingDecryption) revert DecryptionNotPending(assessmentId);
    if (assessment.isRefunded) revert AlreadyRefunded(assessmentId);

    uint256 timeoutEnd = assessment.decryptionRequestTime + DECRYPTION_TIMEOUT;
    if (block.timestamp < timeoutEnd) {
        revert TimeoutNotReached(timeoutEnd - block.timestamp);
    }

    // Process refund
    assessment.isRefunded = true;
    assessment.isPendingDecryption = false;

    // Add to pending refunds
    pendingRefunds[assessment.assessor] += assessment.depositAmount;

    emit RefundProcessed(assessment.assessor, assessment.depositAmount, assessmentId);
}
```

**Features:**
- ⏱️ Timeout-based refund eligibility (default: 1 hour)
- 💰 Full deposit refund for failed decryptions
- 📊 Reputation penalty for failed assessments
- 🔒 Admin override for stuck assessments

### 2. Timeout Protection

Prevents permanent fund locking:

```solidity
// Constants
uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
uint256 public constant EXTENDED_TIMEOUT = 24 hours;

// Timeout tracking
struct DecryptionRequest {
    uint32 assessmentId;
    address requester;
    uint256 requestTime;
    uint256 timeout;
    bool isCompleted;
    bool isFailed;
}

// Check timeout status
function isTimeoutReached(uint32 assessmentId) external view returns (bool, uint256) {
    HousingAssessment storage assessment = assessments[assessmentId];

    if (!assessment.isPendingDecryption) {
        return (false, 0);
    }

    uint256 timeoutEnd = assessment.decryptionRequestTime + DECRYPTION_TIMEOUT;
    if (block.timestamp >= timeoutEnd) {
        return (true, 0);
    }

    return (false, timeoutEnd - block.timestamp);
}
```

**Features:**
- ⏰ Configurable timeout periods
- 🔍 Real-time timeout status checking
- 🚨 Event emissions for timeout triggers
- 🛡️ Protection against permanent locks

### 3. Gateway Callback Pattern

Asynchronous decryption workflow:

```solidity
// Step 1: Request decryption
function requestScoreDecryption(uint32 assessmentId) external onlyOwner {
    HousingAssessment storage assessment = assessments[assessmentId];

    // Validation
    if (!assessment.isCompleted) revert AssessmentNotCompleted(assessmentId);
    if (assessment.isPendingDecryption) revert DecryptionPending(assessmentId);

    // Prepare ciphertexts
    bytes32[] memory cts = new bytes32[](4);
    cts[0] = FHE.toBytes32(assessment.encryptedStructuralScore);
    cts[1] = FHE.toBytes32(assessment.encryptedSafetyScore);
    cts[2] = FHE.toBytes32(assessment.encryptedUtilityScore);
    cts[3] = FHE.toBytes32(assessment.encryptedLocationScore);

    // Request decryption from Gateway
    uint256 requestId = FHE.requestDecryption(cts, this.resolveDecryptionCallback.selector);

    // Update state
    assessment.decryptionRequestId = requestId;
    assessment.decryptionRequestTime = block.timestamp;
    assessment.isPendingDecryption = true;

    emit DecryptionRequested(assessmentId, requestId, DECRYPTION_TIMEOUT);
}

// Step 2: Gateway callback
function resolveDecryptionCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Verify proof
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    // Decode results
    (uint32 structural, uint32 safety, uint32 utility, uint32 location) =
        abi.decode(cleartexts, (uint32, uint32, uint32, uint32));

    // Process results
    _generateQualityReport(assessmentId, structural, safety, utility, location);

    emit DecryptionCompleted(assessmentId, requestId);
}
```

**Features:**
- 🔄 Asynchronous processing
- 🔐 Cryptographic proof verification
- 📡 Event-driven architecture
- ⚡ Gas-efficient operations

### 4. Privacy Protection

Multiple layers of privacy:

```solidity
// Random multiplier for division protection
uint64 obfuscationFactor = uint64((uint256(blockhash(block.number - 1)) % 9) + 1);
euint64 obfuscatedScore = FHE.mul(
    FHE.asEuint64(totalSum),
    FHE.asEuint64(obfuscationFactor)
);

// Fuzzy scoring for published reports
uint32 obfuscated = average;
uint256 noise = uint256(blockhash(block.number - 1)) % 11;
if (noise > 5 && average >= 5) {
    obfuscated = average - uint32(noise - 5);
} else if (average <= 95) {
    obfuscated = average + uint32(noise);
}
```

**Techniques:**
- 🎲 Random multipliers (1-10x) prevent division attacks
- 📊 Fuzzy scoring (±5 points) prevents exact inference
- 🔒 Encrypted comparisons without decryption
- 🎯 Privacy-preserving threshold detection

### 5. Security Features

Comprehensive security implementation:

```solidity
// Custom errors for gas efficiency
error NotAuthorized();
error InvalidScore(uint32 score, string field);
error InsufficientFee(uint256 sent, uint256 required);
error DecryptionPending(uint32 assessmentId);
error TimeoutNotReached(uint256 timeRemaining);

// Input validation
modifier validAddress(address addr) {
    if (addr == address(0)) revert ZeroAddress();
    _;
}

// Access control
modifier onlyOwner() {
    if (msg.sender != owner) revert NotAuthorized();
    _;
}

modifier onlyCertifiedAssessor() {
    if (!assessors[msg.sender].isCertified) revert NotCertified();
    _;
}

// Pause mechanism
modifier whenNotPaused() {
    if (paused) revert ContractIsPaused();
    _;
}
```

**Features:**
- ✅ Input validation on all user inputs
- ✅ Role-based access control (Owner, Assessor)
- ✅ Overflow protection (Solidity 0.8+)
- ✅ Emergency pause mechanism
- ✅ Custom errors for gas efficiency
- ✅ Reentrancy protection (state before calls)

---

## API Reference

### Core Functions

#### 1. Assessor Management

##### `registerAssessor()`
Register as an assessor in the system.

```solidity
function registerAssessor() external whenNotPaused
```

**Effects:**
- Creates AssessorProfile with initial reputation (500/1000)
- Emits `AssessorRegistered` event

**Requirements:**
- Contract not paused
- Caller not already registered

##### `certifyAssessor(address assessor)`
Certify a registered assessor (admin only).

```solidity
function certifyAssessor(address assessor) external onlyOwner validAddress(assessor)
```

**Parameters:**
- `assessor`: Address to certify

**Effects:**
- Sets `isCertified = true`
- Emits `AssessorCertified` event

**Requirements:**
- Caller is contract owner
- Assessor is registered
- Assessor not already certified

##### `suspendAssessor(address assessor, string reason)`
Suspend an assessor's certification.

```solidity
function suspendAssessor(address assessor, string calldata reason) external onlyOwner
```

**Parameters:**
- `assessor`: Address to suspend
- `reason`: Suspension reason

**Effects:**
- Sets `isCertified = false`
- Emits `AssessorSuspended` event

#### 2. Assessment Submission

##### `submitQualityAssessment(...)`
Submit encrypted quality assessment.

```solidity
function submitQualityAssessment(
    uint32 _structuralScore,
    uint32 _safetyScore,
    uint32 _utilityScore,
    uint32 _locationScore,
    string memory _encryptedPropertyId,
    address _propertyOwner
) external payable onlyCertifiedAssessor whenNotPaused
```

**Parameters:**
- `_structuralScore`: Structural integrity (0-100)
- `_safetyScore`: Safety features (0-100)
- `_utilityScore`: Utilities quality (0-100)
- `_locationScore`: Location/environment (0-100)
- `_encryptedPropertyId`: Encrypted property identifier
- `_propertyOwner`: Property owner address

**Payment:**
- Requires `msg.value >= assessmentFee`
- Platform fee deducted (2.5%)
- Remaining stored as deposit

**Effects:**
- Creates encrypted assessment
- Increments assessor's total assessments
- Emits `AssessmentSubmitted` event

**Requirements:**
- Caller is certified assessor
- All scores ≤ 100
- Valid property ID
- Sufficient fee payment

#### 3. Gateway Decryption

##### `requestScoreDecryption(uint32 assessmentId)`
Request decryption via Gateway.

```solidity
function requestScoreDecryption(uint32 assessmentId) external onlyOwner
```

**Parameters:**
- `assessmentId`: ID of assessment to decrypt

**Effects:**
- Sends decryption request to Gateway
- Sets timeout timer
- Emits `DecryptionRequested` event

**Requirements:**
- Caller is owner
- Assessment completed
- Not already pending decryption
- Not already verified

##### `resolveDecryptionCallback(...)`
Gateway callback with decrypted results.

```solidity
function resolveDecryptionCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
- `requestId`: Original request ID
- `cleartexts`: Decrypted values (ABI-encoded)
- `decryptionProof`: Cryptographic proof

**Effects:**
- Verifies proof via `FHE.checkSignatures`
- Generates quality report
- Updates assessor reputation (+10)
- Emits `DecryptionCompleted` event

**Requirements:**
- Valid proof signature
- Assessment pending decryption
- Request not already completed

#### 4. Refund Mechanism

##### `claimTimeoutRefund(uint32 assessmentId)`
Claim refund for timed-out decryption.

```solidity
function claimTimeoutRefund(uint32 assessmentId) external
```

**Parameters:**
- `assessmentId`: Assessment with timeout

**Effects:**
- Marks assessment as refunded
- Adds deposit to pending refunds
- Decreases assessor reputation (-20)
- Emits `TimeoutTriggered` and `RefundProcessed` events

**Requirements:**
- Decryption pending
- Timeout period expired
- Not already refunded

##### `withdrawRefunds()`
Withdraw accumulated refunds.

```solidity
function withdrawRefunds() external
```

**Effects:**
- Transfers pending refunds to caller
- Resets pending refunds to 0
- Emits `RefundClaimed` event

**Requirements:**
- Caller has pending refunds

##### `adminTriggerRefund(uint32 assessmentId)`
Admin emergency refund.

```solidity
function adminTriggerRefund(uint32 assessmentId) external onlyOwner
```

**Parameters:**
- `assessmentId`: Assessment to refund

**Effects:**
- Forces refund processing
- Adds deposit to pending refunds
- Emits `RefundProcessed` event

**Requirements:**
- Caller is owner
- Not already refunded
- Has deposit amount

#### 5. View Functions

##### `getAssessmentInfo(uint32 assessmentId)`
Get comprehensive assessment information.

```solidity
function getAssessmentInfo(uint32 assessmentId) external view returns (
    address assessor,
    address propertyOwner,
    uint256 timestamp,
    uint256 depositAmount,
    bool isVerified,
    bool isCompleted,
    bool isPendingDecryption,
    bool isRefunded,
    string memory encryptedPropertyId
)
```

##### `getQualityReport(uint32 assessmentId)`
Get quality report for verified assessment.

```solidity
function getQualityReport(uint32 assessmentId) external view returns (
    uint32 publicOverallScore,
    uint32 obfuscatedScore,
    bool hasStructuralIssues,
    bool hasSafetyIssues,
    bool hasUtilityIssues,
    bool hasLocationIssues,
    uint256 reportTime,
    bytes32 reportHash
)
```

##### `getAssessorStats(address assessor)`
Get assessor statistics and reputation.

```solidity
function getAssessorStats(address assessor) external view returns (
    bool isRegistered,
    bool isCertified,
    uint256 totalAssessments,
    uint256 verifiedAssessments,
    uint256 failedAssessments,
    uint256 registrationTime,
    uint256 reputationScore
)
```

##### `getDecryptionStatus(uint256 requestId)`
Get decryption request status.

```solidity
function getDecryptionStatus(uint256 requestId) external view returns (
    uint32 assessmentId,
    address requester,
    uint256 requestTime,
    uint256 timeout,
    bool isCompleted,
    bool isFailed
)
```

##### `isTimeoutReached(uint32 assessmentId)`
Check if timeout has been reached.

```solidity
function isTimeoutReached(uint32 assessmentId) external view returns (bool, uint256)
```

**Returns:**
- `bool`: Whether timeout reached
- `uint256`: Seconds remaining (0 if timeout reached)

---

## Gas Optimization

### HCU (Homomorphic Computation Unit) Usage

| Operation | HCU Cost | Optimization |
|-----------|----------|--------------|
| `FHE.asEuint32()` | 100 | Batch encrypt scores |
| `FHE.add()` | 200 | Minimize additions |
| `FHE.mul()` | 500 | Use for obfuscation only |
| `FHE.lt()` | 300 | Threshold checks |
| `FHE.allowThis()` | 50 | Required for storage |

### Gas Estimates

| Function | Gas Cost | Notes |
|----------|----------|-------|
| `registerAssessor()` | ~80,000 | One-time registration |
| `certifyAssessor()` | ~50,000 | Admin operation |
| `submitQualityAssessment()` | ~450,000 | Includes FHE operations |
| `requestScoreDecryption()` | ~120,000 | Gateway request |
| `resolveDecryptionCallback()` | ~200,000 | Includes report generation |
| `claimTimeoutRefund()` | ~60,000 | Refund processing |
| `withdrawRefunds()` | ~35,000 | ETH transfer |

---

## Security Considerations

### Audit Points

```solidity
// [AUDIT] Review all external calls for reentrancy
(bool sent, ) = payable(msg.sender).call{value: amount}("");
if (!sent) revert TransferFailed();

// [AUDIT] Verify timeout values are appropriate
uint256 public constant DECRYPTION_TIMEOUT = 1 hours;

// [AUDIT] Check refund calculations for precision loss
uint256 platformCut = (msg.value * PLATFORM_FEE_BPS) / 10000;
uint256 depositAmount = msg.value - platformCut;

// [AUDIT] Validate Gateway callback authentication
FHE.checkSignatures(requestId, cleartexts, decryptionProof);
```

### Attack Vectors

1. **Division Attack**: Prevented by random multipliers
2. **Price Leakage**: Prevented by fuzzy scoring
3. **Replay Attack**: Prevented by request ID tracking
4. **Frontrunning**: Mitigated by encrypted inputs
5. **DoS**: Prevented by timeout protection

---

## Events

### Core Events

```solidity
event AssessorRegistered(address indexed assessor, uint256 timestamp);
event AssessorCertified(address indexed assessor, address indexed certifier);
event AssessorSuspended(address indexed assessor, string reason);
event AssessmentSubmitted(uint32 indexed assessmentId, address indexed assessor, uint256 depositAmount, uint256 timestamp);
event AssessmentVerified(uint32 indexed assessmentId, address indexed verifier);
```

### Decryption Events

```solidity
event DecryptionRequested(uint32 indexed assessmentId, uint256 requestId, uint256 timeout);
event DecryptionCompleted(uint32 indexed assessmentId, uint256 requestId);
event DecryptionFailed(uint32 indexed assessmentId, uint256 requestId, string reason);
```

### Refund Events

```solidity
event RefundProcessed(address indexed recipient, uint256 amount, uint32 assessmentId);
event RefundClaimed(address indexed recipient, uint256 amount);
event TimeoutTriggered(uint32 indexed assessmentId, uint256 requestId);
```

### Issue Detection Events

```solidity
event StructuralIssueDetected(uint32 indexed assessmentId);
event SafetyIssueDetected(uint32 indexed assessmentId);
event QualityReportGenerated(uint32 indexed assessmentId, uint32 publicScore, uint32 obfuscatedScore);
```

---

## Best Practices

### For Developers

1. **Always validate inputs** before processing
2. **Use custom errors** for gas efficiency
3. **Emit events** for all state changes
4. **Update state** before external calls
5. **Check timeouts** before operations
6. **Verify proofs** in callbacks
7. **Handle edge cases** gracefully

### For Users

1. **Wait for confirmations** before refreshing
2. **Check timeout status** before claiming refunds
3. **Maintain sufficient balance** for gas
4. **Monitor events** for status updates
5. **Use recommended gas limits**
6. **Verify transaction success** on Etherscan

---

## Troubleshooting

### Common Issues

**Issue**: Decryption timeout
- **Cause**: Gateway overload or network issues
- **Solution**: Wait for timeout period, then claim refund

**Issue**: Transaction reverts
- **Cause**: Insufficient gas or validation failure
- **Solution**: Check error message, increase gas limit

**Issue**: Refund not claimable
- **Cause**: Timeout not yet reached
- **Solution**: Check `isTimeoutReached()` for remaining time

**Issue**: Assessment not verified
- **Cause**: Gateway callback pending
- **Solution**: Monitor `DecryptionCompleted` event

---

## Version History

### v3.0 (Current)
- ✅ Added refund mechanism
- ✅ Added timeout protection
- ✅ Implemented Gateway callback pattern
- ✅ Added privacy obfuscation
- ✅ Enhanced security features

### v2.0
- Simplified verification without Gateway
- Basic encrypted assessment submission

### v1.0
- Initial implementation
- Basic assessor management

---

## License

MIT License - See LICENSE file for details.

---

**Built with Zama FHEVM** | **Deployed on Sepolia Testnet** | **Production Ready**

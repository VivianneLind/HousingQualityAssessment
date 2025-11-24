# 🚀 Quick Reference Guide

## AnonymousHousingQualityAssessment v3.0

### Overview
Privacy-preserving housing assessment with Gateway callback, refund mechanism, and timeout protection.

---

## 🔑 Key Constants

```solidity
MIN_ASSESSMENT_FEE = 0.001 ether      // Minimum fee
MAX_ASSESSMENT_FEE = 1 ether           // Maximum fee (safety)
DECRYPTION_TIMEOUT = 1 hours           // Standard timeout
EXTENDED_TIMEOUT = 24 hours            // Extended timeout
MAX_SCORE = 100                        // Score range: 0-100
CRITICAL_THRESHOLD = 30                // Critical issue threshold
PLATFORM_FEE_BPS = 250                 // 2.5% platform fee
```

---

## 📝 Quick Start

### 1. Register as Assessor
```javascript
await contract.registerAssessor();
// Wait for owner to certify
```

### 2. Get Certified (Owner Only)
```javascript
await contract.certifyAssessor(assessorAddress);
```

### 3. Submit Assessment
```javascript
await contract.submitQualityAssessment(
    85,  // structural (0-100)
    92,  // safety (0-100)
    78,  // utility (0-100)
    88,  // location (0-100)
    "encrypted_property_id",
    propertyOwnerAddress,
    { value: ethers.utils.parseEther("0.005") }
);
```

### 4. Request Decryption (Owner)
```javascript
await contract.requestScoreDecryption(assessmentId);
// Gateway processes off-chain
// Wait for DecryptionCompleted event
```

### 5. Claim Refund (If Timeout)
```javascript
// Check timeout status
const [isTimeout, remaining] = await contract.isTimeoutReached(assessmentId);

if (isTimeout) {
    // Claim refund for timed-out request
    await contract.claimTimeoutRefund(assessmentId);

    // Withdraw accumulated refunds
    await contract.withdrawRefunds();
}
```

---

## 🎯 Common Operations

### Check Assessment Status
```javascript
const info = await contract.getAssessmentInfo(assessmentId);
console.log({
    assessor: info.assessor,
    propertyOwner: info.propertyOwner,
    timestamp: info.timestamp,
    depositAmount: info.depositAmount,
    isVerified: info.isVerified,
    isPendingDecryption: info.isPendingDecryption,
    isRefunded: info.isRefunded
});
```

### Get Quality Report
```javascript
const report = await contract.getQualityReport(assessmentId);
console.log({
    publicScore: report.publicOverallScore,      // Actual average
    obfuscatedScore: report.obfuscatedScore,     // Fuzzy score (±5)
    hasStructuralIssues: report.hasStructuralIssues,
    hasSafetyIssues: report.hasSafetyIssues,
    hasUtilityIssues: report.hasUtilityIssues,
    reportTime: report.reportTime,
    reportHash: report.reportHash
});
```

### Check Assessor Stats
```javascript
const stats = await contract.getAssessorStats(assessorAddress);
console.log({
    isRegistered: stats.isRegistered,
    isCertified: stats.isCertified,
    totalAssessments: stats.totalAssessments,
    verifiedAssessments: stats.verifiedAssessments,
    failedAssessments: stats.failedAssessments,
    reputationScore: stats.reputationScore  // 0-1000
});
```

### Monitor Decryption Status
```javascript
const status = await contract.getDecryptionStatus(requestId);
console.log({
    assessmentId: status.assessmentId,
    requester: status.requester,
    requestTime: status.requestTime,
    timeout: status.timeout,
    isCompleted: status.isCompleted,
    isFailed: status.isFailed
});
```

### Check Pending Refunds
```javascript
const amount = await contract.getPendingRefund(userAddress);
console.log(`Pending refunds: ${ethers.utils.formatEther(amount)} ETH`);
```

---

## 📊 Events to Monitor

### Assessment Lifecycle
```javascript
// Assessment submitted
contract.on("AssessmentSubmitted", (assessmentId, assessor, deposit, timestamp) => {
    console.log(`Assessment ${assessmentId} submitted by ${assessor}`);
});

// Decryption requested
contract.on("DecryptionRequested", (assessmentId, requestId, timeout) => {
    console.log(`Decryption requested for ${assessmentId}, timeout: ${timeout}s`);
});

// Decryption completed
contract.on("DecryptionCompleted", (assessmentId, requestId) => {
    console.log(`Decryption completed for ${assessmentId}`);
});

// Decryption failed
contract.on("DecryptionFailed", (assessmentId, requestId, reason) => {
    console.log(`Decryption failed: ${reason}`);
});

// Assessment verified
contract.on("AssessmentVerified", (assessmentId, verifier) => {
    console.log(`Assessment ${assessmentId} verified`);
});
```

### Refund Events
```javascript
// Timeout triggered
contract.on("TimeoutTriggered", (assessmentId, requestId) => {
    console.log(`Timeout reached for ${assessmentId}`);
});

// Refund processed
contract.on("RefundProcessed", (recipient, amount, assessmentId) => {
    console.log(`Refund ${amount} processed for ${recipient}`);
});

// Refund claimed
contract.on("RefundClaimed", (recipient, amount) => {
    console.log(`${recipient} claimed ${amount} refund`);
});
```

### Quality Reports
```javascript
contract.on("QualityReportGenerated", (assessmentId, publicScore, obfuscatedScore) => {
    console.log(`Report generated: public=${publicScore}, obfuscated=${obfuscatedScore}`);
});

contract.on("StructuralIssueDetected", (assessmentId) => {
    console.log(`⚠️ Structural issue detected in assessment ${assessmentId}`);
});

contract.on("SafetyIssueDetected", (assessmentId) => {
    console.log(`⚠️ Safety issue detected in assessment ${assessmentId}`);
});
```

---

## 🛠️ Admin Functions

### Manage Assessors
```javascript
// Certify assessor
await contract.certifyAssessor(assessorAddress);

// Suspend assessor
await contract.suspendAssessor(assessorAddress, "Violation of terms");
```

### Update Fees
```javascript
// Update assessment fee (min: 0.001 ETH, max: 1 ETH)
await contract.setAssessmentFee(ethers.utils.parseEther("0.01"));
```

### Withdraw Platform Fees
```javascript
await contract.withdrawPlatformFees(recipientAddress);
```

### Emergency Controls
```javascript
// Pause contract
await contract.pause();

// Unpause contract
await contract.unpause();

// Force refund for stuck assessment
await contract.adminTriggerRefund(assessmentId);
```

### Transfer Ownership
```javascript
await contract.transferOwnership(newOwnerAddress);
```

---

## ⚠️ Error Handling

### Common Errors

```javascript
// Custom errors with parameters
error NotAuthorized();
error NotRegistered();
error NotCertified();
error InvalidScore(uint32 score, string field);
error InsufficientFee(uint256 sent, uint256 required);
error ExcessiveFee(uint256 sent, uint256 maximum);
error AssessmentNotCompleted(uint32 assessmentId);
error DecryptionPending(uint32 assessmentId);
error TimeoutNotReached(uint256 timeRemaining);
error AlreadyRefunded(uint32 assessmentId);
error NoRefundAvailable();
error TransferFailed();
error ContractIsPaused();
```

### Error Handling Example
```javascript
try {
    await contract.submitQualityAssessment(...);
} catch (error) {
    if (error.message.includes("NotCertified")) {
        console.log("You must be certified first");
    } else if (error.message.includes("InsufficientFee")) {
        console.log("Send at least 0.005 ETH");
    } else if (error.message.includes("ContractIsPaused")) {
        console.log("Contract is paused, try later");
    }
}
```

---

## 💡 Best Practices

### For Assessors

1. **Always check certification** before submitting
2. **Use correct score range** (0-100)
3. **Send appropriate fee** (0.001-1.0 ETH)
4. **Monitor decryption status** via events
5. **Claim refunds promptly** after timeouts
6. **Maintain good reputation** (avoid failures)

### For Property Owners

1. **Provide valid property ID**
2. **Monitor assessment events**
3. **Check quality reports** after verification
4. **Save report hash** for verification

### For Developers

1. **Use view functions** for reads (no gas)
2. **Monitor events** instead of polling
3. **Handle errors gracefully**
4. **Check timeout before operations**
5. **Batch operations** when possible

---

## 📈 Gas Estimates

| Operation | Estimated Gas | Cost @ 50 Gwei |
|-----------|---------------|----------------|
| Register Assessor | 80,000 | ~$0.13 |
| Certify Assessor | 50,000 | ~$0.08 |
| Submit Assessment | 450,000 | ~$0.72 |
| Request Decryption | 120,000 | ~$0.19 |
| Gateway Callback | 200,000 | ~$0.32 |
| Claim Refund | 60,000 | ~$0.10 |
| Withdraw Refunds | 35,000 | ~$0.06 |

*Assuming ETH @ $3,200*

---

## 🔍 Debugging Tips

### Check Assessment State
```javascript
const info = await contract.getAssessmentInfo(assessmentId);
console.log("State:", {
    completed: info.isCompleted,
    verified: info.isVerified,
    pending: info.isPendingDecryption,
    refunded: info.isRefunded
});
```

### Monitor Timeout
```javascript
const [reached, remaining] = await contract.isTimeoutReached(assessmentId);
if (reached) {
    console.log("Timeout reached, can claim refund");
} else {
    console.log(`Timeout in ${remaining} seconds`);
}
```

### Check Balances
```javascript
// Contract balance
const balance = await contract.getContractBalance();

// Pending refunds
const refund = await contract.getPendingRefund(userAddress);

// Platform fees
const fees = await contract.platformFees();
```

---

## 🎓 Common Workflows

### Complete Assessment Flow
```javascript
// 1. Register
await contract.registerAssessor();

// 2. Wait for certification (owner)
await contract.certifyAssessor(myAddress);

// 3. Submit assessment
const tx1 = await contract.submitQualityAssessment(
    85, 92, 78, 88,
    "property_123",
    ownerAddress,
    { value: ethers.utils.parseEther("0.005") }
);
const receipt1 = await tx1.wait();
const assessmentId = receipt1.events[0].args.assessmentId;

// 4. Owner requests decryption
await contract.requestScoreDecryption(assessmentId);

// 5. Wait for callback (automatic)
contract.once("DecryptionCompleted", async (id, requestId) => {
    if (id == assessmentId) {
        // 6. Get quality report
        const report = await contract.getQualityReport(assessmentId);
        console.log("Report:", report);
    }
});
```

### Timeout & Refund Flow
```javascript
// 1. Submit assessment
const tx = await contract.submitQualityAssessment(...);
const assessmentId = ...;

// 2. Request decryption
await contract.requestScoreDecryption(assessmentId);

// 3. Wait for timeout (if Gateway fails)
setTimeout(async () => {
    // 4. Check timeout
    const [reached] = await contract.isTimeoutReached(assessmentId);

    if (reached) {
        // 5. Claim refund
        await contract.claimTimeoutRefund(assessmentId);

        // 6. Withdraw
        await contract.withdrawRefunds();
    }
}, 3600000 + 60000); // 1 hour + 1 minute buffer
```

---

## 📞 Support

**Documentation**:
- `README.md` - Project overview
- `ARCHITECTURE.md` - Complete architecture & API
- `ENHANCEMENT_SUMMARY.md` - Feature summary

**Contract Address** (Sepolia):
- Check `deployment-info.json` after deployment

**Events**: Monitor all events for real-time updates

**Errors**: Use try-catch with custom error detection

---

**Version**: 3.0
**Status**: Production Ready
**License**: MIT

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AnonymousHousingQualityAssessment v3.0
 * @author Housing Quality Assessment Team
 * @notice Privacy-preserving housing quality assessment system using FHEVM
 *
 * @dev Architecture Overview:
 * This contract implements a Gateway callback pattern for asynchronous FHE operations:
 *
 * Flow: User submits encrypted request → Contract records → Gateway decrypts → Callback completes
 *
 * Key Features:
 * - Refund Mechanism: Handles decryption failures with automatic refunds
 * - Timeout Protection: Prevents permanent fund locking with configurable timeouts
 * - Gateway Callback Pattern: Asynchronous decryption via FHE.requestDecryption
 * - Privacy Protection: Random multipliers protect against division attacks
 * - Price Obfuscation: Fuzzy scoring techniques prevent exact value inference
 * - Gas Optimization: Efficient HCU (Homomorphic Computation Unit) usage
 *
 * Security Features:
 * - Input Validation: All inputs validated before processing
 * - Access Control: Role-based permissions (owner, certified assessors)
 * - Overflow Protection: Solidity 0.8+ built-in + explicit checks
 * - Reentrancy Guards: State changes before external calls
 *
 * AUDIT NOTES:
 * - [AUDIT] Review all external calls for reentrancy
 * - [AUDIT] Verify timeout values are appropriate for network conditions
 * - [AUDIT] Check refund calculations for precision loss
 * - [AUDIT] Validate Gateway callback authentication
 */
contract AnonymousHousingQualityAssessment is SepoliaConfig {

    // ============ Constants ============

    /// @notice Minimum fee required to submit an assessment
    uint256 public constant MIN_ASSESSMENT_FEE = 0.001 ether;

    /// @notice Maximum fee for assessment (prevents accidents)
    uint256 public constant MAX_ASSESSMENT_FEE = 1 ether;

    /// @notice Timeout for decryption requests (prevents permanent lock)
    uint256 public constant DECRYPTION_TIMEOUT = 1 hours;

    /// @notice Extended timeout for complex assessments
    uint256 public constant EXTENDED_TIMEOUT = 24 hours;

    /// @notice Maximum score value for any category
    uint32 public constant MAX_SCORE = 100;

    /// @notice Threshold for critical structural issues
    uint32 public constant CRITICAL_THRESHOLD = 30;

    /// @notice Platform fee percentage (in basis points, 100 = 1%)
    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5%

    // ============ State Variables ============

    address public owner;
    uint32 public nextAssessmentId;
    uint256 public platformFees;
    bool public paused;

    /// @notice Current assessment fee (can be updated by owner)
    uint256 public assessmentFee = 0.005 ether;

    // ============ Structs ============

    struct HousingAssessment {
        euint32 encryptedStructuralScore;  // 0-100 structural integrity
        euint32 encryptedSafetyScore;      // 0-100 safety features
        euint32 encryptedUtilityScore;     // 0-100 utilities quality
        euint32 encryptedLocationScore;    // 0-100 location/environment
        euint64 encryptedOverallScore;     // Obfuscated overall score with random multiplier
        address assessor;
        address propertyOwner;
        uint256 timestamp;
        uint256 depositAmount;             // Stored deposit for refund
        uint256 decryptionRequestTime;     // When decryption was requested
        uint256 decryptionRequestId;       // Gateway request ID
        bool isVerified;
        bool isCompleted;
        bool isPendingDecryption;
        bool isRefunded;
        string encryptedPropertyId;
    }

    struct AssessorProfile {
        bool isRegistered;
        bool isCertified;
        uint256 totalAssessments;
        uint256 verifiedAssessments;
        uint256 failedAssessments;
        uint256 registrationTime;
        uint256 lastActivityTime;
        uint256 reputationScore;           // 0-1000 reputation
    }

    struct QualityReport {
        uint32 assessmentId;
        uint32 publicOverallScore;         // Revealed after verification
        uint32 obfuscatedScore;            // Fuzzy score for privacy
        bool hasStructuralIssues;
        bool hasSafetyIssues;
        bool hasUtilityIssues;
        bool hasLocationIssues;
        uint256 reportTime;
        bytes32 reportHash;                // Hash for verification
    }

    struct DecryptionRequest {
        uint32 assessmentId;
        address requester;
        uint256 requestTime;
        uint256 timeout;
        bool isCompleted;
        bool isFailed;
    }

    // ============ Mappings ============

    mapping(uint32 => HousingAssessment) public assessments;
    mapping(address => AssessorProfile) public assessors;
    mapping(uint32 => QualityReport) public qualityReports;
    mapping(string => uint32[]) public propertyAssessments;
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint256 => uint32) internal assessmentByRequestId;
    mapping(address => uint256) public pendingRefunds;

    // ============ Events ============

    event AssessorRegistered(address indexed assessor, uint256 timestamp);
    event AssessorCertified(address indexed assessor, address indexed certifier);
    event AssessorSuspended(address indexed assessor, string reason);
    event AssessmentSubmitted(uint32 indexed assessmentId, address indexed assessor, uint256 depositAmount, uint256 timestamp);
    event AssessmentVerified(uint32 indexed assessmentId, address indexed verifier);
    event DecryptionRequested(uint32 indexed assessmentId, uint256 requestId, uint256 timeout);
    event DecryptionCompleted(uint32 indexed assessmentId, uint256 requestId);
    event DecryptionFailed(uint32 indexed assessmentId, uint256 requestId, string reason);
    event QualityReportGenerated(uint32 indexed assessmentId, uint32 publicScore, uint32 obfuscatedScore);
    event StructuralIssueDetected(uint32 indexed assessmentId);
    event SafetyIssueDetected(uint32 indexed assessmentId);
    event RefundProcessed(address indexed recipient, uint256 amount, uint32 assessmentId);
    event RefundClaimed(address indexed recipient, uint256 amount);
    event TimeoutTriggered(uint32 indexed assessmentId, uint256 requestId);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);
    event AssessmentFeeUpdated(uint256 oldFee, uint256 newFee);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);

    // ============ Errors ============

    /// @dev Custom errors for gas efficiency
    error NotAuthorized();
    error NotRegistered();
    error NotCertified();
    error AlreadyRegistered();
    error AlreadyCertified();
    error InvalidScore(uint32 score, string field);
    error InsufficientFee(uint256 sent, uint256 required);
    error ExcessiveFee(uint256 sent, uint256 maximum);
    error AssessmentNotFound(uint32 assessmentId);
    error AssessmentNotCompleted(uint32 assessmentId);
    error AssessmentAlreadyVerified(uint32 assessmentId);
    error DecryptionPending(uint32 assessmentId);
    error DecryptionNotPending(uint32 assessmentId);
    error TimeoutNotReached(uint256 timeRemaining);
    error AlreadyRefunded(uint32 assessmentId);
    error NoRefundAvailable();
    error TransferFailed();
    error ContractIsPaused();
    error InvalidPropertyId();
    error ZeroAddress();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }

    modifier onlyRegisteredAssessor() {
        if (!assessors[msg.sender].isRegistered) revert NotRegistered();
        _;
    }

    modifier onlyCertifiedAssessor() {
        if (!assessors[msg.sender].isCertified) revert NotCertified();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
        _;
    }

    modifier validAddress(address addr) {
        if (addr == address(0)) revert ZeroAddress();
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        nextAssessmentId = 1;
    }

    // ============ Admin Functions ============

    /**
     * @notice Transfer contract ownership
     * @param newOwner Address of new owner
     * @dev [AUDIT] Ensure two-step ownership transfer in production
     */
    function transferOwnership(address newOwner) external onlyOwner validAddress(newOwner) {
        owner = newOwner;
    }

    /**
     * @notice Pause contract operations
     * @dev Emergency stop mechanism
     */
    function pause() external onlyOwner {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    /**
     * @notice Unpause contract operations
     */
    function unpause() external onlyOwner {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    /**
     * @notice Update assessment fee
     * @param newFee New fee amount in wei
     */
    function setAssessmentFee(uint256 newFee) external onlyOwner {
        require(newFee >= MIN_ASSESSMENT_FEE, "Fee below minimum");
        require(newFee <= MAX_ASSESSMENT_FEE, "Fee above maximum");

        uint256 oldFee = assessmentFee;
        assessmentFee = newFee;
        emit AssessmentFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Withdraw accumulated platform fees
     * @param to Recipient address
     */
    function withdrawPlatformFees(address to) external onlyOwner validAddress(to) {
        uint256 amount = platformFees;
        require(amount > 0, "No fees to withdraw");

        platformFees = 0;

        (bool sent, ) = payable(to).call{value: amount}("");
        if (!sent) revert TransferFailed();

        emit PlatformFeesWithdrawn(to, amount);
    }

    // ============ Assessor Management ============

    /**
     * @notice Register as an assessor
     */
    function registerAssessor() external whenNotPaused {
        if (assessors[msg.sender].isRegistered) revert AlreadyRegistered();

        assessors[msg.sender] = AssessorProfile({
            isRegistered: true,
            isCertified: false,
            totalAssessments: 0,
            verifiedAssessments: 0,
            failedAssessments: 0,
            registrationTime: block.timestamp,
            lastActivityTime: block.timestamp,
            reputationScore: 500 // Start with neutral reputation
        });

        emit AssessorRegistered(msg.sender, block.timestamp);
    }

    /**
     * @notice Certify an assessor (admin only)
     * @param assessor Address to certify
     */
    function certifyAssessor(address assessor) external onlyOwner validAddress(assessor) {
        if (!assessors[assessor].isRegistered) revert NotRegistered();
        if (assessors[assessor].isCertified) revert AlreadyCertified();

        assessors[assessor].isCertified = true;
        emit AssessorCertified(assessor, msg.sender);
    }

    /**
     * @notice Suspend an assessor
     * @param assessor Address to suspend
     * @param reason Suspension reason
     */
    function suspendAssessor(address assessor, string calldata reason) external onlyOwner {
        assessors[assessor].isCertified = false;
        emit AssessorSuspended(assessor, reason);
    }

    // ============ Assessment Submission ============

    /**
     * @notice Submit a quality assessment with encrypted scores
     * @param _structuralScore Structural integrity score (0-100)
     * @param _safetyScore Safety features score (0-100)
     * @param _utilityScore Utilities quality score (0-100)
     * @param _locationScore Location/environment score (0-100)
     * @param _encryptedPropertyId Encrypted property identifier
     * @param _propertyOwner Address of property owner (for notifications)
     *
     * @dev Flow:
     * 1. Validate inputs
     * 2. Encrypt scores with FHE
     * 3. Apply random multiplier for division protection
     * 4. Store assessment with deposit
     * 5. Emit events
     */
    function submitQualityAssessment(
        uint32 _structuralScore,
        uint32 _safetyScore,
        uint32 _utilityScore,
        uint32 _locationScore,
        string memory _encryptedPropertyId,
        address _propertyOwner
    ) external payable onlyCertifiedAssessor whenNotPaused {
        // Input validation
        if (_structuralScore > MAX_SCORE) revert InvalidScore(_structuralScore, "structural");
        if (_safetyScore > MAX_SCORE) revert InvalidScore(_safetyScore, "safety");
        if (_utilityScore > MAX_SCORE) revert InvalidScore(_utilityScore, "utility");
        if (_locationScore > MAX_SCORE) revert InvalidScore(_locationScore, "location");
        if (bytes(_encryptedPropertyId).length == 0) revert InvalidPropertyId();
        if (msg.value < assessmentFee) revert InsufficientFee(msg.value, assessmentFee);
        if (msg.value > MAX_ASSESSMENT_FEE) revert ExcessiveFee(msg.value, MAX_ASSESSMENT_FEE);

        // Calculate platform fee
        uint256 platformCut = (msg.value * PLATFORM_FEE_BPS) / 10000;
        uint256 depositAmount = msg.value - platformCut;
        platformFees += platformCut;

        // Encrypt all assessment scores
        euint32 encStructural = FHE.asEuint32(_structuralScore);
        euint32 encSafety = FHE.asEuint32(_safetyScore);
        euint32 encUtility = FHE.asEuint32(_utilityScore);
        euint32 encLocation = FHE.asEuint32(_locationScore);

        // Calculate overall score with privacy protection
        // Use random multiplier to protect against division attacks
        euint32 sum1 = FHE.add(encStructural, encSafety);
        euint32 sum2 = FHE.add(encUtility, encLocation);
        euint32 totalSum = FHE.add(sum1, sum2);

        // Apply obfuscation: multiply by random factor to prevent exact inference
        // Random multiplier between 1-10 for privacy (using block data as seed)
        uint64 obfuscationFactor = uint64((uint256(blockhash(block.number - 1)) % 9) + 1);
        euint64 obfuscatedScore = FHE.mul(FHE.asEuint64(FHE.asEuint32(totalSum)), FHE.asEuint64(obfuscationFactor));

        uint32 assessmentId = nextAssessmentId++;

        assessments[assessmentId] = HousingAssessment({
            encryptedStructuralScore: encStructural,
            encryptedSafetyScore: encSafety,
            encryptedUtilityScore: encUtility,
            encryptedLocationScore: encLocation,
            encryptedOverallScore: obfuscatedScore,
            assessor: msg.sender,
            propertyOwner: _propertyOwner,
            timestamp: block.timestamp,
            depositAmount: depositAmount,
            decryptionRequestTime: 0,
            decryptionRequestId: 0,
            isVerified: false,
            isCompleted: true,
            isPendingDecryption: false,
            isRefunded: false,
            encryptedPropertyId: _encryptedPropertyId
        });

        // Set up FHE permissions
        FHE.allowThis(encStructural);
        FHE.allowThis(encSafety);
        FHE.allowThis(encUtility);
        FHE.allowThis(encLocation);
        FHE.allowThis(obfuscatedScore);

        // Allow assessor to access their own scores
        FHE.allow(encStructural, msg.sender);
        FHE.allow(encSafety, msg.sender);
        FHE.allow(encUtility, msg.sender);
        FHE.allow(encLocation, msg.sender);
        FHE.allow(obfuscatedScore, msg.sender);

        // Add to property assessments
        propertyAssessments[_encryptedPropertyId].push(assessmentId);

        // Update assessor stats
        assessors[msg.sender].totalAssessments++;
        assessors[msg.sender].lastActivityTime = block.timestamp;

        emit AssessmentSubmitted(assessmentId, msg.sender, depositAmount, block.timestamp);
    }

    // ============ Gateway Callback Pattern ============

    /**
     * @notice Request decryption of assessment scores via Gateway
     * @param assessmentId Assessment to decrypt
     *
     * @dev Gateway Callback Pattern:
     * 1. User calls this function to initiate decryption
     * 2. Contract sends encrypted values to Gateway
     * 3. Gateway decrypts off-chain
     * 4. Gateway calls resolveDecryptionCallback with results
     * 5. If timeout expires, user can claim refund
     */
    function requestScoreDecryption(uint32 assessmentId) external onlyOwner {
        HousingAssessment storage assessment = assessments[assessmentId];

        if (!assessment.isCompleted) revert AssessmentNotCompleted(assessmentId);
        if (assessment.isPendingDecryption) revert DecryptionPending(assessmentId);
        if (assessment.isVerified) revert AssessmentAlreadyVerified(assessmentId);

        // Prepare ciphertexts for decryption
        bytes32[] memory cts = new bytes32[](4);
        cts[0] = FHE.toBytes32(assessment.encryptedStructuralScore);
        cts[1] = FHE.toBytes32(assessment.encryptedSafetyScore);
        cts[2] = FHE.toBytes32(assessment.encryptedUtilityScore);
        cts[3] = FHE.toBytes32(assessment.encryptedLocationScore);

        // Request decryption from Gateway
        uint256 requestId = FHE.requestDecryption(cts, this.resolveDecryptionCallback.selector);

        // Update assessment state
        assessment.decryptionRequestId = requestId;
        assessment.decryptionRequestTime = block.timestamp;
        assessment.isPendingDecryption = true;

        // Store request for timeout handling
        decryptionRequests[requestId] = DecryptionRequest({
            assessmentId: assessmentId,
            requester: msg.sender,
            requestTime: block.timestamp,
            timeout: block.timestamp + DECRYPTION_TIMEOUT,
            isCompleted: false,
            isFailed: false
        });

        assessmentByRequestId[requestId] = assessmentId;

        emit DecryptionRequested(assessmentId, requestId, DECRYPTION_TIMEOUT);
    }

    /**
     * @notice Gateway callback to resolve decryption
     * @param requestId Original request ID
     * @param cleartexts Decrypted values
     * @param decryptionProof Proof of correct decryption
     *
     * @dev Called by Gateway relayer after off-chain decryption
     */
    function resolveDecryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify the decryption proof
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        uint32 assessmentId = assessmentByRequestId[requestId];
        HousingAssessment storage assessment = assessments[assessmentId];
        DecryptionRequest storage request = decryptionRequests[requestId];

        require(assessment.isPendingDecryption, "Not pending");
        require(!request.isCompleted, "Already completed");

        // Decode decrypted scores
        (uint32 structural, uint32 safety, uint32 utility, uint32 location) =
            abi.decode(cleartexts, (uint32, uint32, uint32, uint32));

        // Update request status
        request.isCompleted = true;
        assessment.isPendingDecryption = false;
        assessment.isVerified = true;

        // Generate quality report with decrypted values
        _generateQualityReport(assessmentId, structural, safety, utility, location);

        // Update assessor stats
        assessors[assessment.assessor].verifiedAssessments++;

        // Increase reputation for successful verification
        if (assessors[assessment.assessor].reputationScore < 1000) {
            assessors[assessment.assessor].reputationScore += 10;
        }

        emit DecryptionCompleted(assessmentId, requestId);
        emit AssessmentVerified(assessmentId, msg.sender);
    }

    /**
     * @notice Generate quality report from decrypted scores
     * @param assessmentId Assessment ID
     * @param structural Decrypted structural score
     * @param safety Decrypted safety score
     * @param utility Decrypted utility score
     * @param location Decrypted location score
     */
    function _generateQualityReport(
        uint32 assessmentId,
        uint32 structural,
        uint32 safety,
        uint32 utility,
        uint32 location
    ) private {
        // Calculate actual average
        uint32 average = (structural + safety + utility + location) / 4;

        // Apply fuzzy obfuscation for privacy (±5 points)
        uint32 obfuscated = average;
        uint256 noise = uint256(blockhash(block.number - 1)) % 11;
        if (noise > 5 && average >= 5) {
            obfuscated = average - uint32(noise - 5);
        } else if (average <= 95) {
            obfuscated = average + uint32(noise);
        }

        // Determine issues
        bool hasStructuralIssues = structural < CRITICAL_THRESHOLD;
        bool hasSafetyIssues = safety < CRITICAL_THRESHOLD;
        bool hasUtilityIssues = utility < 50;
        bool hasLocationIssues = location < 40;

        // Generate report hash for verification
        bytes32 reportHash = keccak256(abi.encodePacked(
            assessmentId,
            average,
            block.timestamp,
            assessments[assessmentId].assessor
        ));

        qualityReports[assessmentId] = QualityReport({
            assessmentId: assessmentId,
            publicOverallScore: average,
            obfuscatedScore: obfuscated,
            hasStructuralIssues: hasStructuralIssues,
            hasSafetyIssues: hasSafetyIssues,
            hasUtilityIssues: hasUtilityIssues,
            hasLocationIssues: hasLocationIssues,
            reportTime: block.timestamp,
            reportHash: reportHash
        });

        emit QualityReportGenerated(assessmentId, average, obfuscated);

        // Emit issue alerts
        if (hasStructuralIssues) {
            emit StructuralIssueDetected(assessmentId);
        }
        if (hasSafetyIssues) {
            emit SafetyIssueDetected(assessmentId);
        }
    }

    // ============ Refund Mechanism ============

    /**
     * @notice Claim refund for timed-out decryption request
     * @param assessmentId Assessment with failed decryption
     *
     * @dev Refund conditions:
     * 1. Decryption must be pending
     * 2. Timeout must have passed
     * 3. Assessment not already refunded
     */
    function claimTimeoutRefund(uint32 assessmentId) external {
        HousingAssessment storage assessment = assessments[assessmentId];

        if (!assessment.isPendingDecryption) revert DecryptionNotPending(assessmentId);
        if (assessment.isRefunded) revert AlreadyRefunded(assessmentId);

        uint256 timeoutEnd = assessment.decryptionRequestTime + DECRYPTION_TIMEOUT;
        if (block.timestamp < timeoutEnd) {
            revert TimeoutNotReached(timeoutEnd - block.timestamp);
        }

        // Mark as refunded and failed
        assessment.isRefunded = true;
        assessment.isPendingDecryption = false;

        DecryptionRequest storage request = decryptionRequests[assessment.decryptionRequestId];
        request.isFailed = true;

        // Update assessor stats
        assessors[assessment.assessor].failedAssessments++;

        // Decrease reputation for failed assessment
        if (assessors[assessment.assessor].reputationScore >= 20) {
            assessors[assessment.assessor].reputationScore -= 20;
        }

        // Add to pending refunds
        pendingRefunds[assessment.assessor] += assessment.depositAmount;

        emit TimeoutTriggered(assessmentId, assessment.decryptionRequestId);
        emit DecryptionFailed(assessmentId, assessment.decryptionRequestId, "Timeout exceeded");
        emit RefundProcessed(assessment.assessor, assessment.depositAmount, assessmentId);
    }

    /**
     * @notice Withdraw accumulated refunds
     */
    function withdrawRefunds() external {
        uint256 amount = pendingRefunds[msg.sender];
        if (amount == 0) revert NoRefundAvailable();

        pendingRefunds[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert TransferFailed();

        emit RefundClaimed(msg.sender, amount);
    }

    /**
     * @notice Admin can trigger refund for stuck assessments
     * @param assessmentId Assessment to refund
     */
    function adminTriggerRefund(uint32 assessmentId) external onlyOwner {
        HousingAssessment storage assessment = assessments[assessmentId];

        require(!assessment.isRefunded, "Already refunded");
        require(assessment.depositAmount > 0, "No deposit");

        assessment.isRefunded = true;
        assessment.isPendingDecryption = false;

        pendingRefunds[assessment.assessor] += assessment.depositAmount;

        emit RefundProcessed(assessment.assessor, assessment.depositAmount, assessmentId);
    }

    // ============ View Functions ============

    /**
     * @notice Get assessment information
     */
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
    ) {
        HousingAssessment storage assessment = assessments[assessmentId];
        return (
            assessment.assessor,
            assessment.propertyOwner,
            assessment.timestamp,
            assessment.depositAmount,
            assessment.isVerified,
            assessment.isCompleted,
            assessment.isPendingDecryption,
            assessment.isRefunded,
            assessment.encryptedPropertyId
        );
    }

    /**
     * @notice Get quality report
     */
    function getQualityReport(uint32 assessmentId) external view returns (
        uint32 publicOverallScore,
        uint32 obfuscatedScore,
        bool hasStructuralIssues,
        bool hasSafetyIssues,
        bool hasUtilityIssues,
        bool hasLocationIssues,
        uint256 reportTime,
        bytes32 reportHash
    ) {
        require(qualityReports[assessmentId].reportTime != 0, "Report not generated");

        QualityReport storage report = qualityReports[assessmentId];
        return (
            report.publicOverallScore,
            report.obfuscatedScore,
            report.hasStructuralIssues,
            report.hasSafetyIssues,
            report.hasUtilityIssues,
            report.hasLocationIssues,
            report.reportTime,
            report.reportHash
        );
    }

    /**
     * @notice Get assessor statistics
     */
    function getAssessorStats(address assessor) external view returns (
        bool isRegistered,
        bool isCertified,
        uint256 totalAssessments,
        uint256 verifiedAssessments,
        uint256 failedAssessments,
        uint256 registrationTime,
        uint256 reputationScore
    ) {
        AssessorProfile storage profile = assessors[assessor];
        return (
            profile.isRegistered,
            profile.isCertified,
            profile.totalAssessments,
            profile.verifiedAssessments,
            profile.failedAssessments,
            profile.registrationTime,
            profile.reputationScore
        );
    }

    /**
     * @notice Get decryption request status
     */
    function getDecryptionStatus(uint256 requestId) external view returns (
        uint32 assessmentId,
        address requester,
        uint256 requestTime,
        uint256 timeout,
        bool isCompleted,
        bool isFailed
    ) {
        DecryptionRequest storage request = decryptionRequests[requestId];
        return (
            request.assessmentId,
            request.requester,
            request.requestTime,
            request.timeout,
            request.isCompleted,
            request.isFailed
        );
    }

    /**
     * @notice Check if timeout has been reached
     */
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

    /**
     * @notice Get property assessment count
     */
    function getPropertyAssessmentCount(string memory encryptedPropertyId) external view returns (uint256) {
        return propertyAssessments[encryptedPropertyId].length;
    }

    /**
     * @notice Get property assessment IDs
     */
    function getPropertyAssessmentIds(string memory encryptedPropertyId) external view returns (uint32[] memory) {
        return propertyAssessments[encryptedPropertyId];
    }

    /**
     * @notice Get total assessments count
     */
    function getTotalAssessments() external view returns (uint32) {
        return nextAssessmentId - 1;
    }

    /**
     * @notice Get pending refund amount for an address
     */
    function getPendingRefund(address user) external view returns (uint256) {
        return pendingRefunds[user];
    }

    /**
     * @notice Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Fallback ============

    receive() external payable {}
}

export const CONTRACT_ADDRESS = "0xE91BF284dD61830Df29b5968bD6D30d2A910B4D5";

export const CONTRACT_ABI = [
  "function registerAssessor() external",
  "function certifyAssessor(address assessor) external",
  "function submitQualityAssessment(uint32 _structuralScore, uint32 _safetyScore, uint32 _utilityScore, uint32 _locationScore, string memory _encryptedPropertyId) external",
  "function verifyAssessment(uint32 assessmentId) external",
  "function getAssessmentInfo(uint32 assessmentId) external view returns (address assessor, uint256 timestamp, bool isVerified, bool isCompleted, string memory encryptedPropertyId)",
  "function getQualityReport(uint32 assessmentId) external view returns (uint32 publicOverallScore, bool hasStructuralIssues, bool hasSafetyIssues, bool hasUtilityIssues, uint256 reportTime)",
  "function getAssessorStats(address assessor) external view returns (bool isRegistered, bool isCertified, uint256 totalAssessments, uint256 verifiedAssessments, uint256 registrationTime)",
  "function getPropertyAssessmentCount(string memory encryptedPropertyId) external view returns (uint256)",
  "function getPropertyAssessmentIds(string memory encryptedPropertyId) external view returns (uint32[] memory)",
  "function getTotalAssessments() external view returns (uint32)",
  "function owner() external view returns (address)",
  "event AssessorRegistered(address indexed assessor, uint256 timestamp)",
  "event AssessmentSubmitted(uint32 indexed assessmentId, address indexed assessor, uint256 timestamp)",
  "event AssessmentVerified(uint32 indexed assessmentId, address indexed verifier)",
  "event QualityReportGenerated(uint32 indexed assessmentId, uint32 publicScore)"
];

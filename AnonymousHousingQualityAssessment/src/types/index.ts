import { ethers } from 'ethers';

export interface AssessorStats {
  isRegistered: boolean;
  isCertified: boolean;
  totalAssessments: ethers.BigNumber;
  verifiedAssessments: ethers.BigNumber;
  registrationTime: ethers.BigNumber;
}

export interface QualityReport {
  publicOverallScore: number;
  hasStructuralIssues: boolean;
  hasSafetyIssues: boolean;
  hasUtilityIssues: boolean;
  reportTime: ethers.BigNumber;
}

export interface AssessmentInfo {
  assessor: string;
  timestamp: ethers.BigNumber;
  isVerified: boolean;
  isCompleted: boolean;
  encryptedPropertyId: string;
}

export interface AssessmentFormData {
  propertyId: string;
  structuralScore: number;
  safetyScore: number;
  utilityScore: number;
  locationScore: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  networkName: string | null;
  isOwner: boolean;
}

export type StatusType = 'success' | 'error' | 'info' | 'warning';

export interface StatusMessage {
  message: string;
  type: StatusType;
}

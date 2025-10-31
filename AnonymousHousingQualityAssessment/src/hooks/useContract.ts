import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { AssessorStats, QualityReport, AssessmentFormData } from '../types';

export const useContract = (contract: ethers.Contract | null) => {
  const [loading, setLoading] = useState(false);

  const registerAssessor = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    try {
      const tx = await contract.registerAssessor();
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getAssessorStats = useCallback(async (address: string): Promise<AssessorStats | null> => {
    if (!contract) return null;

    try {
      const stats = await contract.getAssessorStats(address);
      return {
        isRegistered: stats.isRegistered,
        isCertified: stats.isCertified,
        totalAssessments: stats.totalAssessments,
        verifiedAssessments: stats.verifiedAssessments,
        registrationTime: stats.registrationTime,
      };
    } catch (error) {
      console.error('Error fetching assessor stats:', error);
      return null;
    }
  }, [contract]);

  const submitAssessment = useCallback(async (data: AssessmentFormData) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    try {
      const tx = await contract.submitQualityAssessment(
        data.structuralScore,
        data.safetyScore,
        data.utilityScore,
        data.locationScore,
        data.propertyId
      );
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const verifyAssessment = useCallback(async (assessmentId: number) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    try {
      const tx = await contract.verifyAssessment(assessmentId);
      await tx.wait();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getQualityReport = useCallback(async (assessmentId: number): Promise<QualityReport | null> => {
    if (!contract) return null;

    setLoading(true);
    try {
      const report = await contract.getQualityReport(assessmentId);
      return {
        publicOverallScore: report.publicOverallScore,
        hasStructuralIssues: report.hasStructuralIssues,
        hasSafetyIssues: report.hasSafetyIssues,
        hasUtilityIssues: report.hasUtilityIssues,
        reportTime: report.reportTime,
      };
    } catch (error) {
      console.error('Error fetching quality report:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getPropertyHistory = useCallback(async (propertyId: string) => {
    if (!contract) return null;

    setLoading(true);
    try {
      const count = await contract.getPropertyAssessmentCount(propertyId);
      const assessmentIds = await contract.getPropertyAssessmentIds(propertyId);
      return {
        count: count.toNumber(),
        assessmentIds: assessmentIds.map((id: ethers.BigNumber) => id.toNumber()),
      };
    } catch (error) {
      console.error('Error fetching property history:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  const getSystemStats = useCallback(async () => {
    if (!contract) return null;

    setLoading(true);
    try {
      const totalAssessments = await contract.getTotalAssessments();
      const owner = await contract.owner();
      return {
        totalAssessments: totalAssessments.toNumber(),
        owner,
      };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return {
    loading,
    registerAssessor,
    getAssessorStats,
    submitAssessment,
    verifyAssessment,
    getQualityReport,
    getPropertyHistory,
    getSystemStats,
  };
};

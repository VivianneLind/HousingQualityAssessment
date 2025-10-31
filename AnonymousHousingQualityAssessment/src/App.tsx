import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusMessage } from './components/StatusMessage';
import { WalletConnection } from './components/WalletConnection';
import { AssessorRegistration } from './components/AssessorRegistration';
import { AssessmentSubmission } from './components/AssessmentSubmission';
import { AssessmentVerification } from './components/AssessmentVerification';
import { QualityReports } from './components/QualityReports';
import { PropertyHistory } from './components/PropertyHistory';
import { SystemStatistics } from './components/SystemStatistics';
import { useWallet } from './hooks/useWallet';
import { useContract } from './hooks/useContract';
import { StatusMessage as StatusMessageType } from './types';

function App() {
  const { walletState, contract, connectWallet } = useWallet();
  const contractHooks = useContract(contract);
  const [status, setStatus] = useState<StatusMessageType>({
    message: 'Connect your wallet to get started',
    type: 'info'
  });

  const updateStatus = (message: string, type: StatusMessageType['type']) => {
    setStatus({ message, type });

    // Auto-clear success messages
    if (type === 'success') {
      setTimeout(() => {
        setStatus({ message: 'Ready for next action', type: 'info' });
      }, 5000);
    }
  };

  const handleConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      updateStatus('Wallet connected successfully!', 'success');
    } else {
      updateStatus(`Connection failed: ${result.error}`, 'error');
    }
  };

  const handleRegisterAssessor = async () => {
    const result = await contractHooks.registerAssessor();
    if (result.success) {
      updateStatus('Assessor registered successfully!', 'success');
    } else {
      updateStatus(`Registration failed: ${result.error}`, 'error');
    }
    return result;
  };

  const handleSubmitAssessment = async (data: any) => {
    const result = await contractHooks.submitAssessment(data);
    if (result.success) {
      updateStatus('Assessment submitted successfully!', 'success');
    } else {
      updateStatus(`Submission failed: ${result.error}`, 'error');
    }
    return result;
  };

  const handleVerifyAssessment = async (assessmentId: number) => {
    const result = await contractHooks.verifyAssessment(assessmentId);
    if (result.success) {
      updateStatus('Assessment verified successfully!', 'success');
    } else {
      updateStatus(`Verification failed: ${result.error}`, 'error');
    }
    return result;
  };

  const handleGetQualityReport = async (assessmentId: number) => {
    const report = await contractHooks.getQualityReport(assessmentId);
    if (report) {
      updateStatus('Quality report retrieved successfully!', 'success');
    } else {
      updateStatus('Failed to get quality report', 'error');
    }
    return report;
  };

  const handleGetPropertyHistory = async (propertyId: string) => {
    const history = await contractHooks.getPropertyHistory(propertyId);
    if (history) {
      updateStatus('Property history retrieved successfully!', 'success');
    } else {
      updateStatus('Failed to get property history', 'error');
    }
    return history;
  };

  const handleGetSystemStats = async () => {
    const stats = await contractHooks.getSystemStats();
    if (stats) {
      updateStatus('System statistics retrieved successfully!', 'success');
    } else {
      updateStatus('Failed to get system statistics', 'error');
    }
    return stats;
  };

  useEffect(() => {
    if (walletState.isConnected) {
      updateStatus('Wallet connected successfully!', 'success');
    }
  }, [walletState.isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-800">
      <Header walletState={walletState} />

      <div className="max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-5xl font-bold text-white text-center mb-8 drop-shadow-lg">
          Anonymous Housing Quality Assessment System
        </h1>

        <StatusMessage message={status.message} type={status.type} />

        <WalletConnection walletState={walletState} connectWallet={handleConnect} />

        {walletState.isConnected && (
          <>
            <AssessorRegistration
              registerAssessor={handleRegisterAssessor}
              getAssessorStats={contractHooks.getAssessorStats}
              userAddress={walletState.address}
              loading={contractHooks.loading}
            />

            <AssessmentSubmission
              submitAssessment={handleSubmitAssessment}
              loading={contractHooks.loading}
              onSuccess={() => {
                if (walletState.address) {
                  contractHooks.getAssessorStats(walletState.address);
                }
              }}
            />

            <AssessmentVerification
              verifyAssessment={handleVerifyAssessment}
              isOwner={walletState.isOwner}
              loading={contractHooks.loading}
            />

            <QualityReports
              getQualityReport={handleGetQualityReport}
              loading={contractHooks.loading}
            />

            <PropertyHistory
              getPropertyHistory={handleGetPropertyHistory}
              loading={contractHooks.loading}
            />

            <SystemStatistics
              getSystemStats={handleGetSystemStats}
              loading={contractHooks.loading}
            />
          </>
        )}
      </div>

      <footer className="bg-white/95 backdrop-blur-sm text-center py-8 mt-12 text-gray-600">
        <p className="font-semibold">Anonymous Housing Quality Assessment System</p>
        <p className="text-sm mt-2">Powered by FHEVM & Zama</p>
        <p className="text-sm">Ensuring privacy-preserving property evaluations on the blockchain</p>
      </footer>
    </div>
  );
}

export default App;

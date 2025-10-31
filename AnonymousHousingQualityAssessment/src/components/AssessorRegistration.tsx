import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AssessorStats } from '../types';

interface AssessorRegistrationProps {
  registerAssessor: () => Promise<any>;
  getAssessorStats: (address: string) => Promise<AssessorStats | null>;
  userAddress: string | null;
  loading: boolean;
}

export const AssessorRegistration: React.FC<AssessorRegistrationProps> = ({
  registerAssessor,
  getAssessorStats,
  userAddress,
  loading
}) => {
  const [stats, setStats] = useState<AssessorStats | null>(null);

  const handleRegister = async () => {
    const result = await registerAssessor();
    if (result.success && userAddress) {
      const updatedStats = await getAssessorStats(userAddress);
      setStats(updatedStats);
    }
  };

  const handleCheckStatus = async () => {
    if (userAddress) {
      const updatedStats = await getAssessorStats(userAddress);
      setStats(updatedStats);
    }
  };

  useEffect(() => {
    if (userAddress) {
      handleCheckStatus();
    }
  }, [userAddress]);

  return (
    <Card title="Assessor Registration" icon="👤">
      <div className="flex gap-4 mb-6">
        <Button onClick={handleRegister} loading={loading}>
          Register as Assessor
        </Button>
        <Button onClick={handleCheckStatus} variant="secondary" loading={loading}>
          Check My Status
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
            <strong className="text-gray-700 block mb-1">Registered:</strong>
            <span className="text-lg">{stats.isRegistered ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
            <strong className="text-gray-700 block mb-1">Certified:</strong>
            <span className="text-lg">{stats.isCertified ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
            <strong className="text-gray-700 block mb-1">Total Assessments:</strong>
            <span className="text-lg">{stats.totalAssessments.toString()}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
            <strong className="text-gray-700 block mb-1">Verified Assessments:</strong>
            <span className="text-lg">{stats.verifiedAssessments.toString()}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

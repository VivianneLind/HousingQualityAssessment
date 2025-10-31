import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface AssessmentVerificationProps {
  verifyAssessment: (assessmentId: number) => Promise<any>;
  isOwner: boolean;
  loading: boolean;
}

export const AssessmentVerification: React.FC<AssessmentVerificationProps> = ({
  verifyAssessment,
  isOwner,
  loading
}) => {
  const [assessmentId, setAssessmentId] = useState<string>('');

  const handleVerify = async () => {
    const id = parseInt(assessmentId);
    if (!id || id < 1) {
      alert('Please enter a valid assessment ID');
      return;
    }

    const result = await verifyAssessment(id);
    if (result.success) {
      setAssessmentId('');
    }
  };

  return (
    <Card title="Verify Assessments (Owner Only)" icon="✅">
      {!isOwner ? (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-lg">
          Only the contract owner can verify assessments.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-700 mb-2">Assessment ID:</label>
            <input
              type="number"
              value={assessmentId}
              onChange={(e) => setAssessmentId(e.target.value)}
              min="1"
              placeholder="Enter assessment ID to verify"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          <Button onClick={handleVerify} loading={loading}>
            Verify Assessment
          </Button>
        </div>
      )}
    </Card>
  );
};

import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { QualityReport } from '../types';
import { formatDate } from '../lib/utils';

interface QualityReportsProps {
  getQualityReport: (assessmentId: number) => Promise<QualityReport | null>;
  loading: boolean;
}

export const QualityReports: React.FC<QualityReportsProps> = ({
  getQualityReport,
  loading
}) => {
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [report, setReport] = useState<QualityReport | null>(null);

  const handleGetReport = async () => {
    const id = parseInt(assessmentId);
    if (!id || id < 1) {
      alert('Please enter a valid assessment ID');
      return;
    }

    const fetchedReport = await getQualityReport(id);
    setReport(fetchedReport);
  };

  return (
    <Card title="Quality Reports" icon="📊">
      <div className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Assessment ID:</label>
          <input
            type="number"
            value={assessmentId}
            onChange={(e) => setAssessmentId(e.target.value)}
            min="1"
            placeholder="Enter assessment ID for report"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <Button onClick={handleGetReport} variant="secondary" loading={loading}>
          Get Quality Report
        </Button>

        {report && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Quality Report for Assessment #{assessmentId}
            </h3>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-green-600">
                {report.publicOverallScore}/100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg text-center font-semibold ${
                report.hasStructuralIssues
                  ? 'bg-red-200 text-red-800 border border-red-300'
                  : 'bg-green-200 text-green-800 border border-green-300'
              }`}>
                Structural Issues: {report.hasStructuralIssues ? 'Yes' : 'No'}
              </div>
              <div className={`p-4 rounded-lg text-center font-semibold ${
                report.hasSafetyIssues
                  ? 'bg-red-200 text-red-800 border border-red-300'
                  : 'bg-green-200 text-green-800 border border-green-300'
              }`}>
                Safety Issues: {report.hasSafetyIssues ? 'Yes' : 'No'}
              </div>
              <div className={`p-4 rounded-lg text-center font-semibold ${
                report.hasUtilityIssues
                  ? 'bg-red-200 text-red-800 border border-red-300'
                  : 'bg-green-200 text-green-800 border border-green-300'
              }`}>
                Utility Issues: {report.hasUtilityIssues ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="text-center text-gray-600">
              <strong>Report Generated:</strong> {formatDate(report.reportTime.toNumber())}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

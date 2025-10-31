import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface SystemStatisticsProps {
  getSystemStats: () => Promise<any>;
  loading: boolean;
}

export const SystemStatistics: React.FC<SystemStatisticsProps> = ({
  getSystemStats,
  loading
}) => {
  const [stats, setStats] = useState<any>(null);

  const handleGetStats = async () => {
    const fetchedStats = await getSystemStats();
    setStats(fetchedStats);
  };

  return (
    <Card title="System Statistics" icon="📈">
      <Button onClick={handleGetStats} variant="secondary" loading={loading}>
        Get System Statistics
      </Button>

      {stats && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">System Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-300 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-orange-700">{stats.totalAssessments}</div>
              <div className="text-orange-800 font-semibold mt-2">Total Assessments</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-300 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-700">Active</div>
              <div className="text-green-800 font-semibold mt-2">System Status</div>
            </div>
          </div>
          <div className="text-center text-gray-600 text-sm">
            <strong>Contract Owner:</strong>
            <div className="font-mono mt-1">{stats.owner}</div>
          </div>
        </div>
      )}
    </Card>
  );
};

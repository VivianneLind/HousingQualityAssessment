import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface PropertyHistoryProps {
  getPropertyHistory: (propertyId: string) => Promise<any>;
  loading: boolean;
}

export const PropertyHistory: React.FC<PropertyHistoryProps> = ({
  getPropertyHistory,
  loading
}) => {
  const [propertyId, setPropertyId] = useState<string>('');
  const [history, setHistory] = useState<any>(null);

  const handleGetHistory = async () => {
    if (!propertyId.trim()) {
      alert('Please enter a property ID');
      return;
    }

    const fetchedHistory = await getPropertyHistory(propertyId);
    setHistory(fetchedHistory);
  };

  return (
    <Card title="Property History" icon="🏘️">
      <div className="space-y-4">
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Property ID:</label>
          <input
            type="text"
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="Enter property ID"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <Button onClick={handleGetHistory} variant="secondary" loading={loading}>
          Get Property Assessment History
        </Button>

        {history && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Assessment History for Property: {propertyId}
            </h3>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-300 rounded-lg p-6 text-center mb-4">
              <div className="text-4xl font-bold text-orange-700">{history.count}</div>
              <div className="text-orange-800 font-semibold mt-2">Total Assessments</div>
            </div>

            {history.assessmentIds && history.assessmentIds.length > 0 ? (
              <div>
                <strong className="text-gray-700">Assessment IDs:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {history.assessmentIds.map((id: number) => (
                    <span
                      key={id}
                      className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold"
                    >
                      #{id}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-center">
                No assessments found for this property.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

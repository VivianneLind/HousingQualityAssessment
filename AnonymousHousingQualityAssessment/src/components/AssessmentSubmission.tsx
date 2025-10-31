import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AssessmentFormData } from '../types';
import { validateAllScores } from '../lib/utils';

interface AssessmentSubmissionProps {
  submitAssessment: (data: AssessmentFormData) => Promise<any>;
  loading: boolean;
  onSuccess: () => void;
}

export const AssessmentSubmission: React.FC<AssessmentSubmissionProps> = ({
  submitAssessment,
  loading,
  onSuccess
}) => {
  const [formData, setFormData] = useState<AssessmentFormData>({
    propertyId: '',
    structuralScore: 85,
    safetyScore: 90,
    utilityScore: 75,
    locationScore: 80,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'propertyId' ? value : parseInt(value) || 0
    }));
  };

  const handleSubmit = async () => {
    if (!formData.propertyId.trim()) {
      alert('Please enter a property ID');
      return;
    }

    const scores = [
      formData.structuralScore,
      formData.safetyScore,
      formData.utilityScore,
      formData.locationScore
    ];

    if (!validateAllScores(scores)) {
      alert('All scores must be between 0 and 100');
      return;
    }

    const result = await submitAssessment(formData);
    if (result.success) {
      setFormData({
        propertyId: '',
        structuralScore: 85,
        safetyScore: 90,
        utilityScore: 75,
        locationScore: 80,
      });
      onSuccess();
    }
  };

  const ScoreInput = ({
    label,
    name,
    value,
    description
  }: {
    label: string;
    name: keyof AssessmentFormData;
    value: number;
    description: string;
  }) => (
    <div>
      <label className="block font-semibold text-gray-700 mb-2">{label}:</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={handleInputChange}
        min="0"
        max="100"
        className="w-32 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
      />
      <div className="text-sm text-gray-600 mt-1">{description}</div>
    </div>
  );

  return (
    <Card title="Submit Quality Assessment" icon="🏗️">
      <div className="space-y-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-2">Property Identifier:</label>
          <input
            type="text"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleInputChange}
            placeholder="Enter property identifier (e.g., PROP-2024-001)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreInput
            label="Structural Score (0-100)"
            name="structuralScore"
            value={formData.structuralScore}
            description="Foundation, walls, roof integrity"
          />
          <ScoreInput
            label="Safety Score (0-100)"
            name="safetyScore"
            value={formData.safetyScore}
            description="Fire safety, electrical, emergency exits"
          />
          <ScoreInput
            label="Utility Score (0-100)"
            name="utilityScore"
            value={formData.utilityScore}
            description="Plumbing, heating, electrical systems"
          />
          <ScoreInput
            label="Location Score (0-100)"
            name="locationScore"
            value={formData.locationScore}
            description="Neighborhood, access, environment"
          />
        </div>

        <Button onClick={handleSubmit} loading={loading}>
          Submit Assessment
        </Button>
      </div>
    </Card>
  );
};

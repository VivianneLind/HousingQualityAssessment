import React from 'react';
import { StatusType } from '../types';

interface StatusMessageProps {
  message: string;
  type: StatusType;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ message, type }) => {
  const typeClasses = {
    success: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300',
    error: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300',
    info: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
  };

  return (
    <div className={`p-4 rounded-lg mb-6 font-medium text-center border ${typeClasses[type]}`}>
      {message}
    </div>
  );
};

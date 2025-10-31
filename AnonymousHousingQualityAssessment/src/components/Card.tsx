import React from 'react';

interface CardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
};

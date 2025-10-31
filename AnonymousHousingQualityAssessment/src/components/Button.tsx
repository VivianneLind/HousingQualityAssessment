import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  disabled = false,
  variant = 'primary',
  loading = false
}) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white hover:shadow-lg hover:-translate-y-0.5",
    danger: "bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white hover:shadow-lg hover:-translate-y-0.5"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading && (
        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

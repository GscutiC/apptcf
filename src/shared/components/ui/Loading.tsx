import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Cargando...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div 
          className="w-full h-full border-4 rounded-full"
          style={{ 
            borderColor: 'var(--color-neutral-200, #e5e7eb)',
            borderTopColor: 'var(--color-primary-600, #2563eb)'
          }}
        ></div>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--color-neutral-600, #4b5563)' }}>{message}</p>
    </div>
  );
};

export default Loading;
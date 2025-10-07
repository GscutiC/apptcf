import React from 'react';

interface MigrationPanelProps {
  className?: string;
}

export const MigrationPanel: React.FC<MigrationPanelProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
           Sistema Limpio
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-green-700">
            <span className="text-xl"></span>
            <span>Sistema optimizado y listo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * StatusBadge Component - Display application status with icon and color
 */

import React from 'react';
import { ApplicationStatus } from '../../types';
import { STATUS_CONFIG } from '../../utils';

interface StatusBadgeProps {
  status: ApplicationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  if (!config) {
    return <span className="text-gray-500">Estado desconocido</span>;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border ${sizeClasses[size]}
      `}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;

/**
 * PriorityIndicator Component - Display priority level with icon and color
 */

import React from 'react';
import { PRIORITY_CONFIG, PRIORITY_THRESHOLDS } from '../../utils';

interface PriorityIndicatorProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showLabel?: boolean;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({
  score,
  size = 'md',
  showScore = true,
  showLabel = true
}) => {
  const getPriorityLevel = (priorityScore: number): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (priorityScore >= PRIORITY_THRESHOLDS.HIGH) return 'HIGH';
    if (priorityScore >= PRIORITY_THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  };

  const level = getPriorityLevel(score);
  const config = PRIORITY_CONFIG[level];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${config.bgColor} ${config.textColor}
        border border-${config.color}-300 ${sizeClasses[size]}
      `}
    >
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
      {showScore && (
        <span className="font-semibold">{score.toFixed(0)}</span>
      )}
    </div>
  );
};

export default PriorityIndicator;

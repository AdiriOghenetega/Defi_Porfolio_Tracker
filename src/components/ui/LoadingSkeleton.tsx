import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  lines = 1 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-300 dark:bg-gray-700 rounded ${
            lines > 1 ? 'h-4 mb-2 last:mb-0' : 'h-full'
          }`}
        />
      ))}
    </div>
  );
};
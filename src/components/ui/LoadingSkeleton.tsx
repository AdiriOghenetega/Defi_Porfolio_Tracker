import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  animate?: boolean;
  rounded?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  lines = 1,
  animate = true,
  rounded = false
}) => {
  const skeletonLines = Array.from({ length: lines }, (_, index) => (
    <div
      key={index}
      className={`bg-gray-300 dark:bg-gray-700 ${
        animate ? 'animate-pulse' : ''
      } ${
        rounded ? 'rounded-full' : 'rounded'
      } ${
        lines > 1 ? 'h-4 mb-2 last:mb-0' : 'h-full w-full'
      } ${
        lines > 1 && index === lines - 1 ? 'w-3/4' : 'w-full'
      }`}
      style={{
        animationDelay: animate ? `${index * 0.1}s` : undefined,
      }}
    />
  ));

  return (
    <div className={`${animate ? 'animate-shimmer' : ''} ${className}`}>
      {lines === 1 ? (
        <div className={`bg-gray-300 dark:bg-gray-700 ${animate ? 'animate-pulse' : ''} ${rounded ? 'rounded-full' : 'rounded'} h-full w-full`} />
      ) : (
        <div className="space-y-2">
          {skeletonLines}
        </div>
      )}
    </div>
  );
};
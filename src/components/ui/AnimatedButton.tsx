import React from 'react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}) => {
  const baseClasses = 'group relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden';
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-500 to-purple-600 
      hover:from-blue-600 hover:to-purple-700 
      text-white shadow-lg hover:shadow-xl 
      focus:ring-blue-500
      disabled:from-gray-400 disabled:to-gray-500
    `,
    secondary: `
      bg-gray-100 hover:bg-gray-200 
      dark:bg-gray-800 dark:hover:bg-gray-700 
      text-gray-900 dark:text-white 
      shadow-md hover:shadow-lg
      focus:ring-gray-500
      disabled:bg-gray-300 disabled:dark:bg-gray-700
    `,
    outline: `
      border-2 border-gray-300 hover:border-gray-400 
      dark:border-gray-600 dark:hover:border-gray-500 
      text-gray-700 dark:text-gray-300 
      hover:bg-gray-50 dark:hover:bg-gray-800 
      focus:ring-gray-500
      disabled:border-gray-200 disabled:dark:border-gray-700
    `,
    ghost: `
      text-gray-700 dark:text-gray-300 
      hover:bg-gray-100 dark:hover:bg-gray-800 
      focus:ring-gray-500
      disabled:text-gray-400
    `,
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12',
  };
  
  const disabledClasses = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabledClasses}
    ${!disabled && !loading ? 'hover:scale-100 hover:-translate-y-0.5 active:scale-95' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();
  
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Background glow effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
      )}
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-2">
        {loading && (
          <div className="relative">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 w-4 h-4 border-2 border-current opacity-20 rounded-full" />
          </div>
        )}
        <span className={loading ? 'opacity-70' : ''}>{children}</span>
      </div>
    </button>
  );
};
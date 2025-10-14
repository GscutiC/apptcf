/**
 * Button Component - Reusable button with variants
 * ✅ Actualizado para usar CSS Variables personalizadas del módulo Techo Propio
 */

import React, { ButtonHTMLAttributes, ReactNode, CSSProperties, useState } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  style,
  ...buttonProps
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Función para obtener estilos según el variant
  const getVariantStyles = (): CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(to right, var(--tp-primary, #2563eb), var(--tp-secondary, #2563eb))',
          color: 'white'
        };
      case 'secondary':
        return {
          backgroundColor: '#e5e7eb',
          color: '#1f2937'
        };
      case 'danger':
        return {
          backgroundColor: 'var(--tp-accent, #dc2626)',
          color: 'white'
        };
      case 'success':
        return {
          backgroundColor: 'var(--tp-primary, #16a34a)',
          color: 'white'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#374151'
        };
      default:
        return {};
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
  `;

  const variantStyles = getVariantStyles();
  const combinedStyles: CSSProperties = {
    ...variantStyles,
    ...(isHovered && variant === 'ghost' ? { backgroundColor: '#f3f4f6' } : {}),
    ...(isHovered && variant === 'secondary' ? { backgroundColor: '#d1d5db' } : {}),
    ...style
  };

  return (
    <button
      className={`${baseClasses} ${className}`}
      disabled={disabled || isLoading}
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...buttonProps}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {leftIcon && <span>{leftIcon}</span>}
          {children}
          {rightIcon && <span>{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

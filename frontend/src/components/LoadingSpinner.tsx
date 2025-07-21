import React, { useEffect, useState } from 'react';

export type LoadingSpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type LoadingSpinnerColor = 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error';
export type LoadingSpinnerVariant = 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';
export type LoadingSpinnerPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'inline';

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: LoadingSpinnerSize;
  /** Color theme of the spinner */
  color?: LoadingSpinnerColor;
  /** Variant/style of the spinner animation */
  variant?: LoadingSpinnerVariant;
  /** Loading text to display */
  text?: string;
  /** Position of the spinner */
  position?: LoadingSpinnerPosition;
  /** Whether to show a backdrop overlay */
  overlay?: boolean;
  /** Custom overlay opacity (0-100) */
  overlayOpacity?: number;
  /** Whether to blur the background when overlay is shown */
  blurBackground?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Custom styles for the container */
  style?: React.CSSProperties;
  /** Delay before showing the spinner (in milliseconds) */
  delay?: number;
  /** Minimum time to show the spinner (in milliseconds) */
  minDuration?: number;
  /** Whether the spinner is visible */
  visible?: boolean;
  /** Custom aria-label for accessibility */
  ariaLabel?: string;
  /** Progress percentage (0-100) for progress variant */
  progress?: number;
  /** Whether to show progress percentage text */
  showProgress?: boolean;
  /** Custom loading messages that cycle */
  loadingMessages?: string[];
  /** Interval for cycling loading messages (in milliseconds) */
  messageInterval?: number;
  /** Whether to animate the text */
  animateText?: boolean;
  /** Custom icon to display instead of spinner */
  customIcon?: React.ReactNode;
  /** Whether to show pulsing animation */
  pulse?: boolean;
  /** Test ID for testing purposes */
  testId?: string;
}

/**
 * A comprehensive loading spinner component with multiple variants and customization options
 * Supports different animations, sizes, colors, positioning, and advanced features like
 * overlay, progress tracking, cycling messages, and accessibility features
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  variant = 'spinner',
  text,
  position = 'inline',
  overlay = false,
  overlayOpacity = 50,
  blurBackground = false,
  className = '',
  style,
  delay = 0,
  minDuration = 0,
  visible = true,
  ariaLabel,
  progress,
  showProgress = false,
  loadingMessages = [],
  messageInterval = 2000,
  animateText = true,
  customIcon,
  pulse = false,
  testId = 'loading-spinner'
}) => {
  const [showSpinner, setShowSpinner] = useState(!delay);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [startTime] = useState(Date.now());

  // Handle delay and minimum duration
  useEffect(() => {
    let delayTimeout: ReturnType<typeof setTimeout>;
    let minDurationTimeout: ReturnType<typeof setTimeout>;

    if (delay > 0 && visible) {
      delayTimeout = setTimeout(() => {
        setShowSpinner(true);
      }, delay);
    }

    if (!visible && minDuration > 0) {
      const elapsed = Date.now() - startTime;
      const remaining = minDuration - elapsed;
      
      if (remaining > 0) {
        minDurationTimeout = setTimeout(() => {
          setShowSpinner(false);
        }, remaining);
      } else {
        setShowSpinner(false);
      }
    } else if (!visible) {
      setShowSpinner(false);
    }

    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
      if (minDurationTimeout) clearTimeout(minDurationTimeout);
    };
  }, [visible, delay, minDuration, startTime]);

  // Handle cycling loading messages
  useEffect(() => {
    if (loadingMessages.length > 1 && showSpinner) {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, messageInterval);

      return () => clearInterval(interval);
    }
  }, [loadingMessages.length, messageInterval, showSpinner]);

  // Don't render if not visible
  if (!visible || !showSpinner) {
    return null;
  }

  // Size classes mapping
  const sizeClasses = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
    xl: 'loading-xl',
    '2xl': 'w-16 h-16'
  };

  // Color classes mapping
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    neutral: 'text-neutral',
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
  };

  // Variant classes mapping
  const variantClasses = {
    spinner: 'loading-spinner',
    dots: 'loading-dots',
    ring: 'loading-ring',
    ball: 'loading-ball',
    bars: 'loading-bars',
    infinity: 'loading-infinity'
  };

  // Position classes mapping
  const getPositionClasses = () => {
    switch (position) {
      case 'center':
        return 'flex flex-col items-center justify-center h-screen w-full fixed inset-0 z-50';
      case 'top':
        return 'flex flex-col items-center justify-start pt-8 w-full';
      case 'bottom':
        return 'flex flex-col items-center justify-end pb-8 w-full';
      case 'left':
        return 'flex flex-row items-center justify-start pl-8 h-full';
      case 'right':
        return 'flex flex-row items-center justify-end pr-8 h-full';
      case 'inline':
      default:
        return 'flex items-center gap-3';
    }
  };

  // Get current loading message
  const getCurrentMessage = () => {
    if (loadingMessages.length > 0) {
      return loadingMessages[currentMessageIndex];
    }
    return text;
  };

  // Build spinner classes
  const spinnerClasses = [
    'loading',
    variantClasses[variant],
    sizeClasses[size],
    colorClasses[color],
    pulse ? 'animate-pulse' : ''
  ].filter(Boolean).join(' ');

  // Build text classes
  const textClasses = [
    'text-sm font-medium',
    colorClasses[color],
    animateText ? 'animate-pulse' : '',
    position === 'left' || position === 'right' ? 'ml-2' : 'mt-2'
  ].filter(Boolean).join(' ');

  // Overlay styles
  const overlayStyles = overlay ? {
    backgroundColor: `rgba(0, 0, 0, ${overlayOpacity / 100})`,
    backdropFilter: blurBackground ? 'blur(4px)' : 'none'
  } : {};

  // Progress bar component
  const ProgressBar = () => {
    if (typeof progress !== 'number') return null;
    
    return (
      <div className="w-full max-w-xs mt-3">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 bg-${color}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        {showProgress && (
          <div className={`text-xs mt-1 text-center ${colorClasses[color]}`}>
            {Math.round(progress)}%
          </div>
        )}
      </div>
    );
  };

  // Spinner content
  const SpinnerContent = () => (
    <div className={`${getPositionClasses()} ${className}`} style={{ ...overlayStyles, ...style }}>
      <div className="flex flex-col items-center">
        {customIcon ? (
          <div className={`${sizeClasses[size]} ${colorClasses[color]} flex items-center justify-center`}>
            {customIcon}
          </div>
        ) : (
          <span
            className={spinnerClasses}
            aria-label={ariaLabel || 'Loading'}
            data-testid={testId}
            role="status"
            aria-live="polite"
          />
        )}
        
        {getCurrentMessage() && (
          <span className={textClasses}>
            {getCurrentMessage()}
          </span>
        )}

        <ProgressBar />
      </div>
    </div>
  );

  return <SpinnerContent />;
};

export default LoadingSpinner;

// Example usage:
// import LoadingSpinner from '../components/LoadingSpinner';
// import { useLoadingSpinner } from '../hooks/useLoadingSpinner';
// import { LoadingSpinnerPresets } from '../utils/loadingSpinnerPresets';
//
// // Basic usage
// <LoadingSpinner />
//
// // Advanced usage
// <LoadingSpinner 
//   size="lg" 
//   color="primary" 
//   variant="dots"
//   text="Loading data..." 
//   position="center"
//   overlay
//   blurBackground
//   progress={75}
//   showProgress
// />
//
// // With cycling messages
// <LoadingSpinner 
//   loadingMessages={['Loading...', 'Please wait...', 'Almost done...']}
//   messageInterval={1500}
// />
//
// // Using presets
// <LoadingSpinner {...LoadingSpinnerPresets.page} />
// <LoadingSpinner {...LoadingSpinnerPresets.button} />

// Example usage:
// <LoadingSpinner size="lg" color="primary" text="Loading data..." centered />
// <LoadingSpinner size="sm" color="info" text="Processing..." />
// <LoadingSpinner />

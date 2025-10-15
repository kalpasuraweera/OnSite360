import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoClose, IoCheckmark, IoWarning, IoInformation, IoAlert, IoCopy, IoRefresh, IoArrowForward } from 'react-icons/io5';
import type { ToastType } from '../hooks/useToast';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type ToastAnimationType = 'slide' | 'fade' | 'bounce' | 'zoom' | 'flip';
export type ToastSoundType = 'success' | 'error' | 'warning' | 'info' | 'none';

interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onRemove: (id: string) => void;
  actions?: ToastAction[];
  persistOnHover?: boolean;
  showCloseButton?: boolean;
  showProgressBar?: boolean;
  customIcon?: React.ReactNode;
  timestamp?: Date;
  showTimestamp?: boolean;
  allowHtml?: boolean;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: string;
  animation?: ToastAnimationType;
  sound?: ToastSoundType;
  priority?: number;
  groupKey?: string;
  dismissible?: boolean;
  expandable?: boolean;
  richContent?: React.ReactNode;
  metadata?: Record<string, any>;
  onShow?: () => void;
  onHide?: () => void;
  onClick?: () => void;
  onActionClick?: (actionIndex: number) => void;
  ariaLabel?: string;
  testId?: string;
}

interface ToastContainerProps {
  position?: ToastPosition;
  maxToasts?: number;
  spacing?: number;
  animation?: ToastAnimationType;
  pauseOnHover?: boolean;
  pauseOnFocusLoss?: boolean;
  reverseOrder?: boolean;
  className?: string;
  style?: React.CSSProperties;
  enableSounds?: boolean;
  groupSimilar?: boolean;
  newestOnTop?: boolean;
  showToastCount?: boolean;
  containerAriaLabel?: string;
  zIndex?: number;
}

/**
 * Advanced Toast component with rich features
 * Supports multiple actions, animations, sounds, grouping, and accessibility
 */
const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onRemove,
  actions = [],
  persistOnHover = true,
  showCloseButton = true,
  showProgressBar = false,
  customIcon,
  timestamp = new Date(),
  showTimestamp = false,
  allowHtml = false,
  className = '',
  style,
  maxWidth = '400px',
  animation = 'slide',
  sound = 'none',
  priority = 0,
  groupKey,
  dismissible = true,
  expandable = false,
  richContent,
  metadata,
  onShow,
  onHide,
  onClick,
  onActionClick,
  ariaLabel,
  testId = 'toast'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(100);
  const [remainingTime, setRemainingTime] = useState(duration);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const toastRef = useRef<HTMLDivElement>(null);

  // Accessibility
  const [isScreenReaderAnnounced, setIsScreenReaderAnnounced] = useState(false);

  // Play notification sound
  const playSound = useCallback(() => {
    if (sound === 'none') return;
    
    try {
      // Create audio context for sound (would need actual sound files in real implementation)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different toast types
      const frequencies = {
        success: 800,
        error: 300,
        warning: 600,
        info: 500
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Could not play toast notification sound:', error);
    }
  }, [sound, type]);

  // Auto-remove functionality
  const scheduleRemoval = useCallback(() => {
    if (duration <= 0) return;
    
    const timeLeft = remainingTime;
    startTimeRef.current = Date.now();
    
    timerRef.current = setTimeout(() => {
      handleRemove();
    }, timeLeft);

    // Progress bar animation
    if (showProgressBar) {
      const interval = 50; // Update every 50ms
      progressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.max(0, ((timeLeft - elapsed) / timeLeft) * 100);
        setProgress(newProgress);
        
        if (newProgress <= 0) {
          if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
          }
        }
      }, interval);
    }
  }, [remainingTime, duration, showProgressBar]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    
    const elapsed = Date.now() - startTimeRef.current;
    setRemainingTime(prev => Math.max(0, prev - elapsed));
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    if (!isPaused) return;
    setIsPaused(false);
    scheduleRemoval();
  }, [isPaused, scheduleRemoval]);

  const handleRemove = useCallback(() => {
    setIsLeaving(true);
    onHide?.();
    
    setTimeout(() => {
      onRemove(id);
    }, 300); // Match animation duration
  }, [id, onRemove, onHide]);

  // Initialize toast
  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => {
      setIsVisible(true);
      onShow?.();
      
      // Announce to screen readers
      if (!isScreenReaderAnnounced) {
        setIsScreenReaderAnnounced(true);
      }
      
      // Play sound
      playSound();
    }, 10);

    // Schedule auto-removal
    scheduleRemoval();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [scheduleRemoval, onShow, playSound, isScreenReaderAnnounced]);

  // Handle hover behavior
  useEffect(() => {
    if (persistOnHover) {
      if (isHovered && !isPaused) {
        pauseTimer();
      } else if (!isHovered && isPaused) {
        resumeTimer();
      }
    }
  }, [isHovered, persistOnHover, isPaused, pauseTimer, resumeTimer]);

  // Focus management for accessibility
  useEffect(() => {
    if (isVisible && toastRef.current && priority > 5) {
      toastRef.current.focus();
    }
  }, [isVisible, priority]);

  const getToastStyles = () => {
    const baseStyles = "alert shadow-lg border-l-4 transition-all duration-300 transform relative overflow-hidden";
    
    const typeStyles = {
      success: "alert-success border-l-success",
      error: "alert-error border-l-error",
      warning: "alert-warning border-l-warning",
      info: "alert-info border-l-info"
    };

    return `${baseStyles} ${typeStyles[type]} ${className}`;
  };

  const getAnimationClasses = () => {
    const baseTransition = 'transition-all duration-300 ease-in-out';
    
    if (isLeaving) {
      switch (animation) {
        case 'slide':
          return `${baseTransition} translate-x-full opacity-0`;
        case 'fade':
          return `${baseTransition} opacity-0`;
        case 'bounce':
          return `${baseTransition} scale-75 opacity-0`;
        case 'zoom':
          return `${baseTransition} scale-0 opacity-0`;
        case 'flip':
          return `${baseTransition} rotate-y-90 opacity-0`;
        default:
          return `${baseTransition} translate-x-full opacity-0`;
      }
    }
    
    if (isVisible) {
      switch (animation) {
        case 'slide':
          return `${baseTransition} translate-x-0 opacity-100`;
        case 'fade':
          return `${baseTransition} opacity-100`;
        case 'bounce':
          return `${baseTransition} scale-100 opacity-100 animate-bounce`;
        case 'zoom':
          return `${baseTransition} scale-100 opacity-100`;
        case 'flip':
          return `${baseTransition} rotate-y-0 opacity-100`;
        default:
          return `${baseTransition} translate-x-0 opacity-100`;
      }
    }
    
    // Initial state
    switch (animation) {
      case 'slide':
        return `${baseTransition} translate-x-full opacity-0`;
      case 'fade':
        return `${baseTransition} opacity-0`;
      case 'bounce':
        return `${baseTransition} scale-75 opacity-0`;
      case 'zoom':
        return `${baseTransition} scale-0 opacity-0`;
      case 'flip':
        return `${baseTransition} rotate-y-90 opacity-0`;
      default:
        return `${baseTransition} translate-x-full opacity-0`;
    }
  };

  const getIcon = () => {
    if (customIcon) return customIcon;
    
    const iconProps = { size: 20, className: "flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <IoCheckmark {...iconProps} />;
      case 'error':
        return <IoAlert {...iconProps} />;
      case 'warning':
        return <IoWarning {...iconProps} />;
      case 'info':
        return <IoInformation {...iconProps} />;
      default:
        return <IoInformation {...iconProps} />;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handleActionClick = (action: ToastAction, index: number) => {
    if (action.disabled) return;
    
    action.onClick();
    onActionClick?.(index);
  };

  const handleToastClick = () => {
    if (onClick) {
      onClick();
    } else if (expandable && message) {
      setIsExpanded(!isExpanded);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textToCopy = `${title}${message ? '\n' + message : ''}`;
      await navigator.clipboard.writeText(textToCopy);
      
      // Could show a mini toast here
    } catch (error) {
      console.warn('Could not copy to clipboard:', error);
    }
  };

  const retryAction = () => {
    // Placeholder for retry functionality
    console.log('Retry action triggered for toast:', id);
  };

  return (
    <div
      ref={toastRef}
      className={`${getToastStyles()} ${getAnimationClasses()} mb-2 cursor-pointer`}
      style={{ 
        maxWidth, 
        ...style,
        zIndex: 1000 + priority 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleToastClick}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-label={ariaLabel || `${type} notification: ${title}`}
      data-testid={testId}
      tabIndex={dismissible ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && dismissible) {
          handleRemove();
        }
      }}
    >
      {/* Progress bar */}
      {showProgressBar && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
          <div
            className="h-full bg-current transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 w-full">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-sm flex items-center gap-2">
                {title}
                {showTimestamp && (
                  <span className="text-xs opacity-60 font-normal">
                    {formatTimestamp(timestamp)}
                  </span>
                )}
                {groupKey && (
                  <span className="badge badge-xs opacity-60">
                    {groupKey}
                  </span>
                )}
              </div>
              
              {message && (
                <div className={`text-xs opacity-90 mt-1 ${
                  expandable ? 'cursor-pointer' : ''
                } ${
                  isExpanded ? '' : 'line-clamp-2'
                }`}>
                  {allowHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: message }} />
                  ) : (
                    message
                  )}
                  {expandable && message.length > 100 && (
                    <button
                      className="text-current underline ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* Rich content */}
              {richContent && (
                <div className="mt-2">
                  {richContent}
                </div>
              )}

              {/* Metadata */}
              {metadata && Object.keys(metadata).length > 0 && isExpanded && (
                <div className="mt-2 text-xs opacity-70">
                  <details className="cursor-pointer">
                    <summary>Details</summary>
                    <pre className="mt-1 p-2 bg-black bg-opacity-10 rounded text-xs overflow-x-auto">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {(actions.length > 0 || type === 'error') && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(action, index);
                  }}
                  disabled={action.disabled}
                  className={`btn btn-xs ${
                    action.variant === 'primary' ? 'btn-primary' :
                    action.variant === 'secondary' ? 'btn-secondary' :
                    action.variant === 'outline' ? 'btn-outline' :
                    'btn-ghost'
                  } ${action.disabled ? 'btn-disabled' : ''}`}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
              
              {/* Default actions for error toasts */}
              {type === 'error' && actions.length === 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    retryAction();
                  }}
                  className="btn btn-xs btn-ghost"
                >
                  <IoRefresh size={12} className="mr-1" />
                  Retry
                </button>
              )}
              
              {/* Copy action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard();
                }}
                className="btn btn-xs btn-ghost"
                title="Copy to clipboard"
              >
                <IoCopy size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Close button and controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {expandable && message && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="btn btn-xs btn-ghost btn-circle"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <IoArrowForward 
                size={12} 
                className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              />
            </button>
          )}
          
          {showCloseButton && dismissible && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="btn btn-xs btn-ghost btn-circle"
              aria-label="Close notification"
              title="Close"
            >
              <IoClose size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Pause indicator */}
      {isPaused && persistOnHover && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-current rounded-full opacity-60" />
      )}
    </div>
  );
};

/**
 * Advanced Toast Container component
 * Manages positioning, stacking, and global toast behavior
 */
const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 10,
  spacing = 8,
  animation = 'slide',
  pauseOnHover = true,
  pauseOnFocusLoss = true,
  reverseOrder = false,
  className = '',
  style,
  enableSounds = false,
  groupSimilar = false,
  newestOnTop = true,
  showToastCount = false,
  containerAriaLabel = 'Notifications',
  zIndex = 9999
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle focus loss
  useEffect(() => {
    if (!pauseOnFocusLoss) return;

    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };

    const handleFocus = () => setIsPaused(false);
    const handleBlur = () => setIsPaused(true);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [pauseOnFocusLoss]);

  const getPositionClasses = () => {
    const baseClasses = 'fixed flex flex-col pointer-events-none';
    
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4 ${reverseOrder ? 'flex-col-reverse' : ''}`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4 ${reverseOrder ? 'flex-col-reverse' : ''}`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2 ${reverseOrder ? 'flex-col-reverse' : ''}`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${getPositionClasses()} ${className}`}
      style={{ 
        zIndex, 
        gap: `${spacing}px`,
        ...style 
      }}
      aria-label={containerAriaLabel}
      aria-live="polite"
      role="region"
    >
      {/* Toast count indicator */}
      {showToastCount && (
        <div className="pointer-events-auto mb-2">
          <div className="badge badge-info badge-sm">
            Active notifications: 0
          </div>
        </div>
      )}

      {/* Toast components will be rendered here by the toast manager */}
      {/* This is a placeholder container - actual toasts are managed externally */}
    </div>
  );
};

export { Toast, ToastContainer };
export default Toast;

// Example usage:
// import { useToast } from '../hooks/useToast';
// const { success, error, warning, info } = useToast();
// 
// success('Success!', 'Your changes have been saved successfully.');
// error('Error!', 'Something went wrong. Please try again.');
// warning('Warning!', 'This action cannot be undone.');
// info('Info', 'New features are available in the latest update.');

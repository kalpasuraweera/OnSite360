import { useState, useCallback, useRef, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type ToastAnimationType = 'slide' | 'fade' | 'bounce' | 'zoom' | 'flip';

interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface BaseToastData {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
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
  priority?: number;
  groupKey?: string;
  dismissible?: boolean;
  expandable?: boolean;
  richContent?: React.ReactNode;
  metadata?: Record<string, unknown>;
  onShow?: () => void;
  onHide?: () => void;
  onClick?: () => void;
  onActionClick?: (actionIndex: number) => void;
  ariaLabel?: string;
  testId?: string;
}

interface ToastData extends BaseToastData {
  id: string;
  createdAt: Date;
}

interface ToastQueueItem extends ToastData {
  isQueued: boolean;
}

interface ToastManagerOptions {
  maxToasts?: number;
  defaultDuration?: number;
  position?: ToastPosition;
  enableQueue?: boolean;
  enableGrouping?: boolean;
  enableSounds?: boolean;
  enablePersistence?: boolean;
  storageKey?: string;
  globalPause?: boolean;
  deduplication?: boolean;
  deduplicationTime?: number;
}

interface ToastHistory {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  timestamp: Date;
  dismissed: boolean;
  dismissedAt?: Date;
  interacted: boolean;
  interactionCount: number;
}

interface ToastStats {
  totalShown: number;
  totalDismissed: number;
  totalInteracted: number;
  averageViewTime: number;
  typeBreakdown: Record<ToastType, number>;
  hourlyBreakdown: Record<string, number>;
}

/**
 * Comprehensive Toast Manager Hook
 * Provides advanced toast management with queue, grouping, persistence, and analytics
 */
export const useToast = (options: ToastManagerOptions = {}) => {
  const {
    maxToasts = 5,
    defaultDuration = 5000,
    position = 'top-right',
    enableQueue = true,
    enableGrouping = false,
    enableSounds = false,
    enablePersistence = false,
    storageKey = 'toast-history',
    globalPause = false,
    deduplication = true,
    deduplicationTime = 1000
  } = options;

  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [queue, setQueue] = useState<ToastQueueItem[]>([]);
  const [history, setHistory] = useState<ToastHistory[]>([]);
  const [isPaused, setIsPaused] = useState(globalPause);
  const [stats, setStats] = useState<ToastStats>({
    totalShown: 0,
    totalDismissed: 0,
    totalInteracted: 0,
    averageViewTime: 0,
    typeBreakdown: { success: 0, error: 0, warning: 0, info: 0 },
    hourlyBreakdown: {}
  });

  const toastTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const deduplicationCache = useRef<Map<string, number>>(new Map());
  const viewStartTimes = useRef<Map<string, number>>(new Map());

  // Load history from localStorage if persistence is enabled
  useEffect(() => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        const savedHistory = localStorage.getItem(storageKey);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setHistory(parsedHistory.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
            dismissedAt: item.dismissedAt ? new Date(item.dismissedAt) : undefined
          })));
        }
      } catch (error) {
        console.warn('Failed to load toast history from localStorage:', error);
      }
    }
  }, [enablePersistence, storageKey]);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: ToastHistory[]) => {
    if (enablePersistence && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newHistory));
      } catch (error) {
        console.warn('Failed to save toast history to localStorage:', error);
      }
    }
  }, [enablePersistence, storageKey]);

  // Process queue
  useEffect(() => {
    if (enableQueue && queue.length > 0 && toasts.length < maxToasts && !isPaused) {
      const nextToast = queue[0];
      if (nextToast) {
        setQueue(prev => prev.slice(1));
        showToastInternal({ ...nextToast, isQueued: false });
      }
    }
  }, [queue, toasts.length, maxToasts, enableQueue, isPaused]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create deduplication key
  const createDeduplicationKey = useCallback((toast: Partial<BaseToastData>) => {
    return `${toast.type}-${toast.title}-${toast.message || ''}`;
  }, []);

  // Check if toast should be deduplicated
  const shouldDeduplicate = useCallback((toast: Partial<BaseToastData>) => {
    if (!deduplication) return false;
    
    const key = createDeduplicationKey(toast);
    const lastShown = deduplicationCache.current.get(key);
    
    if (lastShown && Date.now() - lastShown < deduplicationTime) {
      return true;
    }
    
    deduplicationCache.current.set(key, Date.now());
    return false;
  }, [deduplication, deduplicationTime, createDeduplicationKey]);

  // Internal show toast function
  const showToastInternal = useCallback((toastData: Omit<ToastData, 'id' | 'createdAt'> & { isQueued?: boolean }) => {
    if (shouldDeduplicate(toastData)) {
      return null; // Don't show duplicate
    }

    const id = generateId();
    const createdAt = new Date();
    const newToast: ToastData = {
      ...toastData,
      id,
      createdAt,
      duration: toastData.duration ?? defaultDuration,
      timestamp: toastData.timestamp ?? createdAt,
      onShow: () => {
        viewStartTimes.current.set(id, Date.now());
        toastData.onShow?.();
      },
      onHide: () => {
        const startTime = viewStartTimes.current.get(id);
        if (startTime) {
          const viewTime = Date.now() - startTime;
          updateStats(prev => ({
            ...prev,
            totalDismissed: prev.totalDismissed + 1,
            averageViewTime: (prev.averageViewTime + viewTime) / 2
          }));
          viewStartTimes.current.delete(id);
        }
        toastData.onHide?.();
      }
    };

    // Add to active toasts or queue
    if (toasts.length >= maxToasts && enableQueue) {
      setQueue(prev => [...prev, { ...newToast, isQueued: true }]);
    } else {
      setToasts(prev => [...prev, newToast]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalShown: prev.totalShown + 1,
        typeBreakdown: {
          ...prev.typeBreakdown,
          [newToast.type]: prev.typeBreakdown[newToast.type] + 1
        }
      }));

      // Add to history
      const historyItem: ToastHistory = {
        id,
        type: newToast.type,
        title: newToast.title,
        message: newToast.message,
        timestamp: createdAt,
        dismissed: false,
        interacted: false,
        interactionCount: 0
      };
      
      setHistory(prev => {
        const newHistory = [...prev, historyItem];
        saveHistory(newHistory);
        return newHistory;
      });
    }

    return id;
  }, [
    toasts.length,
    maxToasts,
    enableQueue,
    shouldDeduplicate,
    generateId,
    defaultDuration,
    saveHistory
  ]);

  // Update stats helper
  const updateStats = useCallback((updater: (prev: ToastStats) => ToastStats) => {
    setStats(updater);
  }, []);

  // Main show toast function
  const showToast = useCallback((toast: Omit<BaseToastData, 'type'> & { type: ToastType }) => {
    return showToastInternal(toast);
  }, [showToastInternal]);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    
    // Clear timer
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }

    // Update history
    setHistory(prev => {
      const newHistory = prev.map(item =>
        item.id === id
          ? { ...item, dismissed: true, dismissedAt: new Date() }
          : item
      );
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    // Clear all timers
    toastTimers.current.forEach(timer => clearTimeout(timer));
    toastTimers.current.clear();
    
    setToasts([]);
    setQueue([]);
    
    // Update history
    setHistory(prev => {
      const newHistory = prev.map(item =>
        !item.dismissed
          ? { ...item, dismissed: true, dismissedAt: new Date() }
          : item
      );
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Group similar toasts
  const groupSimilarToasts = useCallback((newToast: ToastData) => {
    if (!enableGrouping) return false;
    
    const similarToast = toasts.find(toast =>
      toast.type === newToast.type &&
      toast.title === newToast.title &&
      toast.groupKey === newToast.groupKey
    );

    if (similarToast) {
      // Update existing toast instead of creating new one
      setToasts(prev => prev.map(toast =>
        toast.id === similarToast.id
          ? { ...toast, message: `${toast.message || ''}\n${newToast.message || ''}` }
          : toast
      ));
      return true;
    }

    return false;
  }, [toasts, enableGrouping]);

  // Convenience methods for different toast types
  const success = useCallback((title: string, message?: string, options?: Partial<BaseToastData>) => {
    return showToast({ type: 'success', title, message, ...options });
  }, [showToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<BaseToastData>) => {
    return showToast({ type: 'error', title, message, ...options });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<BaseToastData>) => {
    return showToast({ type: 'warning', title, message, ...options });
  }, [showToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<BaseToastData>) => {
    return showToast({ type: 'info', title, message, ...options });
  }, [showToast]);

  // Advanced methods
  const showPersistent = useCallback((toast: Omit<BaseToastData, 'duration'>) => {
    return showToast({ ...toast, duration: 0 }); // 0 duration = persistent
  }, [showToast]);

  const showWithActions = useCallback((
    type: ToastType,
    title: string,
    message: string,
    actions: ToastAction[]
  ) => {
    return showToast({ type, title, message, actions });
  }, [showToast]);

  const showProgress = useCallback((
    title: string,
    message?: string,
    initialProgress = 0
  ) => {
    const id = showToast({
      type: 'info',
      title,
      message,
      showProgressBar: true,
      duration: 0, // Don't auto-dismiss
      dismissible: false
    });

    const updateProgress = (progress: number) => {
      setToasts(prev => prev.map(toast =>
        toast.id === id
          ? { ...toast, metadata: { ...toast.metadata, progress } }
          : toast
      ));
    };

    return { id, updateProgress };
  }, [showToast]);

  // Pause/resume functionality
  const pauseAll = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeAll = useCallback(() => {
    setIsPaused(false);
  }, []);

  // History management
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  }, [enablePersistence, storageKey]);

  const getHistory = useCallback((filters?: {
    type?: ToastType;
    since?: Date;
    dismissed?: boolean;
  }) => {
    let filtered = [...history];

    if (filters?.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    if (filters?.since) {
      filtered = filtered.filter(item => item.timestamp >= filters.since!);
    }

    if (typeof filters?.dismissed === 'boolean') {
      filtered = filtered.filter(item => item.dismissed === filters.dismissed);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [history]);

  // Analytics
  const getStats = useCallback(() => {
    return { ...stats };
  }, [stats]);

  const resetStats = useCallback(() => {
    setStats({
      totalShown: 0,
      totalDismissed: 0,
      totalInteracted: 0,
      averageViewTime: 0,
      typeBreakdown: { success: 0, error: 0, warning: 0, info: 0 },
      hourlyBreakdown: {}
    });
  }, []);

  // Export/import functionality
  const exportHistory = useCallback(() => {
    return JSON.stringify(history, null, 2);
  }, [history]);

  const importHistory = useCallback((jsonHistory: string) => {
    try {
      const imported = JSON.parse(jsonHistory);
      const parsedHistory = imported.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
        dismissedAt: item.dismissedAt ? new Date(item.dismissedAt) : undefined
      }));
      setHistory(parsedHistory);
      saveHistory(parsedHistory);
    } catch (error) {
      console.error('Failed to import toast history:', error);
    }
  }, [saveHistory]);

  return {
    // Core functionality
    toasts,
    queue,
    showToast,
    removeToast,
    clearAllToasts,

    // Convenience methods
    success,
    error,
    warning,
    info,

    // Advanced methods
    showPersistent,
    showWithActions,
    showProgress,

    // State management
    isPaused,
    pauseAll,
    resumeAll,

    // History and analytics
    history,
    getHistory,
    clearHistory,
    stats,
    getStats,
    resetStats,

    // Import/export
    exportHistory,
    importHistory,

    // Configuration
    position,
    maxToasts,
    enableQueue,
    enableGrouping,
    enableSounds,
    enablePersistence
  };
};

/**
 * Hook for managing multiple toast instances
 * Useful when you have different toast contexts or need isolated toast management
 */
export const useMultipleToastManagers = () => {
  const [managers, setManagers] = useState<Map<string, ReturnType<typeof useToast>>>(new Map());

  const createManager = useCallback((key: string, options?: ToastManagerOptions) => {
    const manager = useToast(options);
    setManagers(prev => new Map(prev).set(key, manager));
    return manager;
  }, []);

  const getManager = useCallback((key: string) => {
    return managers.get(key);
  }, [managers]);

  const removeManager = useCallback((key: string) => {
    const manager = managers.get(key);
    if (manager) {
      manager.clearAllToasts();
      setManagers(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }
  }, [managers]);

  const clearAllManagers = useCallback(() => {
    managers.forEach(manager => manager.clearAllToasts());
    setManagers(new Map());
  }, [managers]);

  return {
    managers: Array.from(managers.entries()),
    createManager,
    getManager,
    removeManager,
    clearAllManagers
  };
};

// Example usage with comprehensive features:
// const toast = useToast({
//   maxToasts: 3,
//   defaultDuration: 4000,
//   position: 'top-right',
//   enableQueue: true,
//   enableGrouping: true,
//   enablePersistence: true,
//   deduplication: true
// });
//
// // Basic usage
// toast.success('Success!', 'Your changes have been saved successfully.');
// toast.error('Error!', 'Something went wrong. Please try again.');
//
// // Advanced usage with actions
// toast.showWithActions('warning', 'Unsaved Changes', 'You have unsaved changes.', [
//   { label: 'Save', onClick: () => console.log('Save'), variant: 'primary' },
//   { label: 'Discard', onClick: () => console.log('Discard'), variant: 'outline' }
// ]);
//
// // Progress toast
// const { id, updateProgress } = toast.showProgress('Uploading...', 'Please wait while we upload your file.');
// updateProgress(50); // Update to 50%
// updateProgress(100); // Complete
//
// // Persistent toast
// toast.showPersistent({ type: 'info', title: 'System Maintenance', message: 'Scheduled maintenance in 10 minutes.' });
//
// // Analytics
// const stats = toast.getStats();
// console.log(`Total toasts shown: ${stats.totalShown}`);
//
// // History
// const recentErrors = toast.getHistory({ type: 'error', since: new Date(Date.now() - 86400000) });
// console.log('Recent errors:', recentErrors);

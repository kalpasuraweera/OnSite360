import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import { IoClose, IoExpand, IoContract, IoMove, IoPin, IoPinOutline, IoLayers, IoSettings, IoArrowBack, IoArrowForward, IoRefresh, IoDownload, IoShare, IoInformationCircle, IoWarning, IoCheckmarkCircle, IoCloseCircle, IoHelp, IoAlert, IoStop, IoPlay, IoPause, IoVolumeHigh, IoVolumeMute, IoSunny, IoMoon, IoChevronUp, IoChevronDown, IoChevronBack, IoChevronForward, IoEllipsisHorizontal, IoFilter, IoSearch, IoAdd, IoRemove, IoCopy, IoTrash, IoSave, IoFolderOpen, IoDocument, IoImage, IoVideocam, IoMusicalNotes, IoCode, IoColorPalette, IoGrid, IoList, IoCalendar, IoTime, IoLocation, IoPerson, IoMail, IoCall, IoGlobe, IoLockClosed, IoLockOpen, IoEye, IoEyeOff, IoNotifications, IoNotificationsOff, IoHeart, IoHeartOutline, IoStar, IoStarOutline, IoBookmark, IoBookmarkOutline, IoFlag, IoFlagOutline, IoThumbsUp, IoThumbsDown, IoChatbubble, IoSend, IoAttach, IoLinkOutline, IoResize, IoFlash, IoFlashOff, IoWifi, IoWifiOutline, IoBluetooth, IoBluetoothOutline } from 'react-icons/io5';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | 'auto';

export type ModalPosition = 
  | 'center' | 'top' | 'bottom' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  | 'custom';

export type ModalAnimation = 
  | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
  | 'zoom' | 'rotate' | 'bounce' | 'flip' | 'scale' | 'none';

export type ModalType = 
  | 'default' | 'alert' | 'confirm' | 'prompt' | 'info' | 'success' | 'warning' | 'error'
  | 'loading' | 'progress' | 'form' | 'gallery' | 'video' | 'iframe' | 'drawer'
  | 'tooltip' | 'popover' | 'dropdown' | 'context-menu' | 'notification'
  | 'wizard' | 'stepper' | 'carousel' | 'tabs' | 'accordion' | 'timeline';

export type ModalTheme = 
  | 'light' | 'dark' | 'auto' | 'glass' | 'blur' | 'gradient' | 'minimal'
  | 'material' | 'ios' | 'android' | 'windows' | 'mac' | 'custom';

export type ModalTrigger = 
  | 'click' | 'hover' | 'focus' | 'manual' | 'auto' | 'scroll' | 'time'
  | 'keypress' | 'gesture' | 'voice' | 'api' | 'external';

export type ModalCloseReason = 
  | 'backdrop' | 'escape' | 'button' | 'api' | 'timeout' | 'error'
  | 'navigation' | 'external' | 'gesture' | 'voice';

export type ModalButton = {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  autoFocus?: boolean;
  closeModal?: boolean;
  action?: () => void | Promise<void>;
  hotkey?: string;
  tooltip?: string;
  confirmation?: {
    enabled: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
  };
  style?: React.CSSProperties;
  className?: string;
};

export type ModalStep = {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  completed?: boolean;
  disabled?: boolean;
  optional?: boolean;
  validation?: () => boolean | Promise<boolean>;
  onEnter?: () => void | Promise<void>;
  onExit?: () => void | Promise<void>;
  buttons?: ModalButton[];
  metadata?: Record<string, unknown>;
};

export type ModalTab = {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
  badge?: string | number;
  tooltip?: string;
  lazy?: boolean;
  keepAlive?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onClose?: () => void;
};

export type ModalEvent = {
  type: string;
  timestamp: Date;
  modalId: string;
  data?: unknown;
  preventDefault?: () => void;
  stopPropagation?: () => void;
};

export type ModalPermission = {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;
  admin?: boolean;
  custom?: Record<string, boolean>;
};

export type ModalAccessibility = {
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  focusTrap?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  announcements?: {
    onOpen?: string;
    onClose?: string;
    onProgress?: string;
    onError?: string;
  };
  keyboardNavigation?: {
    enabled: boolean;
    escapeClose?: boolean;
    enterSubmit?: boolean;
    tabNavigation?: boolean;
    arrowNavigation?: boolean;
    customKeys?: Record<string, () => void>;
  };
  screenReader?: {
    skipContent?: boolean;
    liveRegion?: 'polite' | 'assertive' | 'off';
    descriptions?: Record<string, string>;
  };
  highContrast?: boolean;
  reducedMotion?: boolean;
  colorBlindness?: {
    enabled: boolean;
    type?: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  };
};

export type ModalAnalytics = {
  enabled: boolean;
  trackingId?: string;
  events: {
    open?: boolean;
    close?: boolean;
    interact?: boolean;
    convert?: boolean;
    error?: boolean;
    custom?: Record<string, boolean>;
  };
  metadata?: Record<string, unknown>;
  onEvent?: (event: ModalEvent) => void;
};

export type ModalSecurity = {
  preventScreenshot?: boolean;
  contentSecurityPolicy?: string;
  sanitizeContent?: boolean;
  allowedDomains?: string[];
  encryption?: {
    enabled: boolean;
    algorithm?: string;
    key?: string;
  };
  authentication?: {
    required: boolean;
    provider?: string;
    level?: 'basic' | 'advanced' | 'enterprise';
  };
  permissions?: ModalPermission;
  auditLog?: boolean;
};

export type ModalPerformance = {
  lazy?: boolean;
  preload?: boolean;
  cache?: boolean;
  virtualScrolling?: boolean;
  debounce?: number;
  throttle?: number;
  renderThreshold?: number;
  maxConcurrent?: number;
  memoryLimit?: number;
  performanceMonitoring?: {
    enabled: boolean;
    metrics: string[];
    threshold: number;
    onSlowRender?: (duration: number) => void;
  };
};

export type ModalConfiguration = {
  id: string;
  title?: string;
  description?: string;
  content: React.ReactNode;
  
  // Appearance
  type: ModalType;
  size: ModalSize;
  position: ModalPosition;
  theme: ModalTheme;
  animation: ModalAnimation;
  
  // Behavior
  trigger: ModalTrigger;
  persistent?: boolean;
  modal?: boolean; // Background interaction
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  focus?: boolean;
  autoOpen?: boolean;
  autoClose?: number; // milliseconds
  
  // Content
  header?: {
    visible: boolean;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actions?: ModalButton[];
    closable?: boolean;
    draggable?: boolean;
    style?: React.CSSProperties;
    className?: string;
  };
  
  body?: {
    padding?: boolean;
    scrollable?: boolean;
    maxHeight?: number | string;
    minHeight?: number | string;
    style?: React.CSSProperties;
    className?: string;
  };
  
  footer?: {
    visible: boolean;
    content?: React.ReactNode;
    buttons?: ModalButton[];
    align?: 'left' | 'center' | 'right' | 'space-between';
    sticky?: boolean;
    style?: React.CSSProperties;
    className?: string;
  };
  
  // Layout and positioning
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  
  customPosition?: {
    x: number;
    y: number;
  };
  
  offset?: {
    x: number;
    y: number;
  };
  
  // Advanced features
  resizable?: boolean;
  draggable?: boolean;
  fullscreen?: boolean;
  minimizable?: boolean;
  pinnable?: boolean;
  stackable?: boolean;
  
  // Multi-modal features
  steps?: ModalStep[];
  tabs?: ModalTab[];
  navigation?: {
    enabled: boolean;
    showProgress?: boolean;
    allowSkip?: boolean;
    validation?: boolean;
    buttons?: {
      previous?: ModalButton;
      next?: ModalButton;
      finish?: ModalButton;
      cancel?: ModalButton;
    };
  };
  
  // Events
  onOpen?: (modal: ModalConfiguration) => void | Promise<void>;
  onClose?: (modal: ModalConfiguration, reason: ModalCloseReason) => void | Promise<void>;
  onBeforeOpen?: (modal: ModalConfiguration) => boolean | Promise<boolean>;
  onBeforeClose?: (modal: ModalConfiguration, reason: ModalCloseReason) => boolean | Promise<boolean>;
  onResize?: (modal: ModalConfiguration, dimensions: { width: number; height: number }) => void;
  onDrag?: (modal: ModalConfiguration, position: { x: number; y: number }) => void;
  onFocus?: (modal: ModalConfiguration) => void;
  onBlur?: (modal: ModalConfiguration) => void;
  onMinimize?: (modal: ModalConfiguration) => void;
  onMaximize?: (modal: ModalConfiguration) => void;
  onPin?: (modal: ModalConfiguration, pinned: boolean) => void;
  onStepChange?: (modal: ModalConfiguration, step: ModalStep, index: number) => void;
  onTabChange?: (modal: ModalConfiguration, tab: ModalTab, index: number) => void;
  onError?: (error: Error, modal: ModalConfiguration) => void;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  
  // Custom properties
  customProps?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  
  // System features
  accessibility: ModalAccessibility;
  analytics?: ModalAnalytics;
  security?: ModalSecurity;
  performance?: ModalPerformance;
  
  // Responsive design
  responsive?: {
    enabled: boolean;
    breakpoints: Record<string, Partial<ModalConfiguration>>;
    mobileFirst?: boolean;
  };
  
  // Internationalization
  i18n?: {
    enabled: boolean;
    locale?: string;
    fallback?: string;
    translations?: Record<string, Record<string, string>>;
  };
  
  // Version and compatibility
  version?: string;
  compatibility?: {
    browsers: string[];
    devices: string[];
    frameworks: string[];
  };
};

interface ModalContextType {
  modals: ModalConfiguration[];
  activeModal: string | null;
  openModal: (config: ModalConfiguration) => string;
  closeModal: (id: string, reason?: ModalCloseReason) => void;
  closeAllModals: (reason?: ModalCloseReason) => void;
  updateModal: (id: string, updates: Partial<ModalConfiguration>) => void;
  getModal: (id: string) => ModalConfiguration | undefined;
  isModalOpen: (id: string) => boolean;
  getActiveModal: () => ModalConfiguration | undefined;
  setActiveModal: (id: string | null) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: React.ReactNode;
  defaultTheme?: ModalTheme;
  maxConcurrent?: number;
  animations?: boolean;
  globalSecurity?: ModalSecurity;
  globalAccessibility?: ModalAccessibility;
  globalAnalytics?: ModalAnalytics;
  globalPerformance?: ModalPerformance;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({
  children,
  defaultTheme = 'light',
  maxConcurrent = 10,
  animations = true,
  globalSecurity,
  globalAccessibility,
  globalAnalytics,
  globalPerformance
}) => {
  const [modals, setModals] = useState<ModalConfiguration[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const modalCounterRef = useRef(0);

  const openModal = useCallback((config: ModalConfiguration): string => {
    const modalId = config.id || `modal-${modalCounterRef.current++}`;
    const modalConfig: ModalConfiguration = {
      ...config,
      id: modalId,
      theme: config.theme || defaultTheme,
      accessibility: {
        ...globalAccessibility,
        ...config.accessibility
      },
      analytics: config.analytics || globalAnalytics,
      security: {
        ...globalSecurity,
        ...config.security
      },
      performance: {
        ...globalPerformance,
        ...config.performance
      }
    };

    setModals(prev => {
      // Check max concurrent limit
      if (prev.length >= maxConcurrent) {
        console.warn(`Maximum concurrent modals limit (${maxConcurrent}) reached`);
        return prev;
      }
      
      // Check if modal already exists
      const existingIndex = prev.findIndex(m => m.id === modalId);
      if (existingIndex !== -1) {
        // Update existing modal
        const updated = [...prev];
        updated[existingIndex] = modalConfig;
        return updated;
      }
      
      // Add new modal
      return [...prev, modalConfig];
    });

    setActiveModal(modalId);
    return modalId;
  }, [defaultTheme, maxConcurrent, globalAccessibility, globalAnalytics, globalSecurity, globalPerformance]);

  const closeModal = useCallback((id: string, reason: ModalCloseReason = 'api') => {
    setModals(prev => prev.filter(modal => {
      if (modal.id === id) {
        // Call onClose event
        modal.onClose?.(modal, reason);
        
        // Track analytics
        if (modal.analytics?.enabled && modal.analytics.events.close) {
          const event: ModalEvent = {
            type: 'close',
            timestamp: new Date(),
            modalId: id,
            data: { reason }
          };
          modal.analytics.onEvent?.(event);
        }
        
        return false;
      }
      return true;
    }));

    // Update active modal
    setActiveModal(prev => prev === id ? null : prev);
  }, []);

  const closeAllModals = useCallback((reason: ModalCloseReason = 'api') => {
    modals.forEach(modal => {
      modal.onClose?.(modal, reason);
      
      if (modal.analytics?.enabled && modal.analytics.events.close) {
        const event: ModalEvent = {
          type: 'close',
          timestamp: new Date(),
          modalId: modal.id,
          data: { reason }
        };
        modal.analytics.onEvent?.(event);
      }
    });
    
    setModals([]);
    setActiveModal(null);
  }, [modals]);

  const updateModal = useCallback((id: string, updates: Partial<ModalConfiguration>) => {
    setModals(prev => prev.map(modal => 
      modal.id === id ? { ...modal, ...updates } : modal
    ));
  }, []);

  const getModal = useCallback((id: string) => {
    return modals.find(modal => modal.id === id);
  }, [modals]);

  const isModalOpen = useCallback((id: string) => {
    return modals.some(modal => modal.id === id);
  }, [modals]);

  const getActiveModal = useCallback(() => {
    return activeModal ? modals.find(modal => modal.id === activeModal) : undefined;
  }, [activeModal, modals]);

  const contextValue: ModalContextType = {
    modals,
    activeModal,
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    getModal,
    isModalOpen,
    getActiveModal,
    setActiveModal
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <ModalRenderer animations={animations} />
    </ModalContext.Provider>
  );
};

interface ModalRendererProps {
  animations: boolean;
}

const ModalRenderer: React.FC<ModalRendererProps> = ({ animations }) => {
  const { modals, activeModal, closeModal } = useModal();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const activeModalConfig = modals.find(m => m.id === activeModal);
        if (activeModalConfig && activeModalConfig.keyboard !== false) {
          closeModal(activeModal!, 'escape');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modals, activeModal, closeModal]);

  if (!modals.length) return null;

  return (
    <>
      {modals.map(modal => (
        <ModalInstance
          key={modal.id}
          config={modal}
          isActive={modal.id === activeModal}
          animations={animations}
        />
      ))}
    </>
  );
};

interface ModalInstanceProps {
  config: ModalConfiguration;
  isActive: boolean;
  animations: boolean;
}

const ModalInstance: React.FC<ModalInstanceProps> = ({ config, isActive, animations }) => {
  const { closeModal, updateModal } = useModal();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [position, setPosition] = useState(config.customPosition || { x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver>();
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout>();

  // Size mapping
  const sizeClasses: Record<ModalSize, string> = {
    xs: 'w-80 max-w-xs',
    sm: 'w-96 max-w-sm',
    md: 'w-128 max-w-md',
    lg: 'w-160 max-w-lg',
    xl: 'w-192 max-w-xl',
    '2xl': 'w-224 max-w-2xl',
    '3xl': 'w-256 max-w-3xl',
    '4xl': 'w-288 max-w-4xl',
    '5xl': 'w-320 max-w-5xl',
    full: 'w-full h-full',
    auto: 'w-auto h-auto'
  };

  // Position classes
  const positionClasses: Record<ModalPosition, string> = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
    left: 'items-center justify-start pl-16',
    right: 'items-center justify-end pr-16',
    'top-left': 'items-start justify-start pt-16 pl-16',
    'top-right': 'items-start justify-end pt-16 pr-16',
    'bottom-left': 'items-end justify-start pb-16 pl-16',
    'bottom-right': 'items-end justify-end pb-16 pr-16',
    custom: ''
  };

  // Animation classes
  const animationClasses: Record<ModalAnimation, { enter: string; exit: string }> = {
    fade: {
      enter: 'animate-fadeIn',
      exit: 'animate-fadeOut'
    },
    'slide-up': {
      enter: 'animate-slideInUp',
      exit: 'animate-slideOutDown'
    },
    'slide-down': {
      enter: 'animate-slideInDown',
      exit: 'animate-slideOutUp'
    },
    'slide-left': {
      enter: 'animate-slideInLeft',
      exit: 'animate-slideOutLeft'
    },
    'slide-right': {
      enter: 'animate-slideInRight',
      exit: 'animate-slideOutRight'
    },
    zoom: {
      enter: 'animate-zoomIn',
      exit: 'animate-zoomOut'
    },
    rotate: {
      enter: 'animate-rotateIn',
      exit: 'animate-rotateOut'
    },
    bounce: {
      enter: 'animate-bounceIn',
      exit: 'animate-bounceOut'
    },
    flip: {
      enter: 'animate-flipInY',
      exit: 'animate-flipOutY'
    },
    scale: {
      enter: 'animate-scaleIn',
      exit: 'animate-scaleOut'
    },
    none: {
      enter: '',
      exit: ''
    }
  };

  // Theme classes
  const themeClasses: Record<ModalTheme, string> = {
    light: 'bg-white text-gray-900 border border-gray-200',
    dark: 'bg-gray-800 text-white border border-gray-700',
    auto: 'bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700',
    glass: 'bg-white/80 backdrop-blur-lg text-gray-900 border border-white/20',
    blur: 'bg-gray-900/50 backdrop-blur-md text-white border border-white/10',
    gradient: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0',
    minimal: 'bg-white text-gray-900 border-0 shadow-xl',
    material: 'bg-white text-gray-900 border-0 shadow-2xl rounded-lg',
    ios: 'bg-white text-gray-900 border-0 shadow-xl rounded-xl',
    android: 'bg-white text-gray-900 border border-gray-200 rounded-lg',
    windows: 'bg-white text-gray-900 border border-gray-300 rounded-none',
    mac: 'bg-white text-gray-900 border-0 shadow-2xl rounded-lg',
    custom: config.className || ''
  };

  // Event handlers
  const handleClose = useCallback((reason: ModalCloseReason = 'button') => {
    if (config.onBeforeClose) {
      const canClose = config.onBeforeClose(config, reason);
      if (canClose === false || (canClose instanceof Promise && !canClose)) {
        return;
      }
    }

    closeModal(config.id, reason);
  }, [config, closeModal]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && config.backdrop !== 'static') {
      handleClose('backdrop');
    }
  }, [config.backdrop, handleClose]);

  const handleDragStart = useCallback((event: React.MouseEvent) => {
    if (!config.draggable || isFullscreen) return;

    setIsDragging(true);
    setDragStart({
      x: event.clientX - position.x,
      y: event.clientY - position.y
    });
  }, [config.draggable, isFullscreen, position]);

  const handleDragMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;

    const newPosition = {
      x: event.clientX - dragStart.x,
      y: event.clientY - dragStart.y
    };

    setPosition(newPosition);
    config.onDrag?.(config, newPosition);
  }, [isDragging, dragStart, config]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized(!isMinimized);
    config.onMinimize?.(config);
  }, [isMinimized, config]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    config.onMaximize?.(config);
  }, [isFullscreen, config]);

  const handlePin = useCallback(() => {
    setIsPinned(!isPinned);
    config.onPin?.(config, !isPinned);
  }, [isPinned, config]);

  const handleStepChange = useCallback((newStep: number) => {
    if (!config.steps || newStep < 0 || newStep >= config.steps.length) return;

    const step = config.steps[newStep];
    if (step.disabled) return;

    // Validate current step if navigation validation is enabled
    if (config.navigation?.validation && currentStep < newStep) {
      const currentStepConfig = config.steps[currentStep];
      if (currentStepConfig.validation && !currentStepConfig.validation()) {
        return;
      }
    }

    // Call step exit handler
    const currentStepConfig = config.steps[currentStep];
    currentStepConfig.onExit?.();

    setCurrentStep(newStep);

    // Call step enter handler
    step.onEnter?.();
    config.onStepChange?.(config, step, newStep);
  }, [config, currentStep]);

  const handleTabChange = useCallback((newTab: number) => {
    if (!config.tabs || newTab < 0 || newTab >= config.tabs.length) return;

    const tab = config.tabs[newTab];
    if (tab.disabled) return;

    // Call tab deactivate handler
    const currentTabConfig = config.tabs[currentTab];
    currentTabConfig.onDeactivate?.();

    setCurrentTab(newTab);

    // Call tab activate handler
    tab.onActivate?.();
    config.onTabChange?.(config, tab, newTab);
  }, [config, currentTab]);

  const handleButtonClick = useCallback(async (button: ModalButton) => {
    if (button.disabled) return;

    // Show confirmation if required
    if (button.confirmation?.enabled) {
      const confirmed = window.confirm(
        button.confirmation.message || `Are you sure you want to ${button.label.toLowerCase()}?`
      );
      if (!confirmed) return;
    }

    // Set loading state
    if (button.loading !== false) {
      setLoadingStates(prev => ({ ...prev, [button.id]: true }));
    }

    try {
      // Execute button action
      await button.action?.();

      // Close modal if specified
      if (button.closeModal) {
        handleClose('button');
      }
    } catch (error) {
      console.error('Button action error:', error);
      config.onError?.(error as Error, config);
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({ ...prev, [button.id]: false }));
    }
  }, [config, handleClose]);

  // Effects
  useEffect(() => {
    setIsVisible(true);

    // Call onOpen event
    config.onOpen?.(config);

    // Track analytics
    if (config.analytics?.enabled && config.analytics.events.open) {
      const event: ModalEvent = {
        type: 'open',
        timestamp: new Date(),
        modalId: config.id
      };
      config.analytics.onEvent?.(event);
    }

    // Set auto close timer
    if (config.autoClose) {
      autoCloseTimeoutRef.current = setTimeout(() => {
        handleClose('timeout');
      }, config.autoClose);
    }

    // Set up drag handlers
    if (config.draggable) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      if (config.draggable) {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      }
    };
  }, [config, handleClose, handleDragMove, handleDragEnd]);

  useEffect(() => {
    // Set up resize observer
    if (modalRef.current && config.resizable) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
          config.onResize?.(config, { width, height });
        }
      });

      resizeObserverRef.current.observe(modalRef.current);

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, [config]);

  // Render helper functions
  const renderHeader = useCallback(() => {
    if (!config.header?.visible) return null;

    return (
      <div
        ref={headerRef}
        className={`modal-header flex items-center justify-between p-4 border-b ${config.header.className || ''}`}
        style={config.header.style}
        onMouseDown={config.draggable ? handleDragStart : undefined}
      >
        <div className="flex items-center space-x-3">
          {config.header.icon && (
            <div className="modal-header-icon">{config.header.icon}</div>
          )}
          <div>
            {config.header.title && (
              <h3 className="modal-title text-lg font-semibold">
                {config.header.title}
              </h3>
            )}
            {config.header.subtitle && (
              <p className="modal-subtitle text-sm text-gray-500">
                {config.header.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {config.header.actions?.map(action => (
            <button
              key={action.id}
              className={`btn btn-sm ${action.className || ''}`}
              style={action.style}
              disabled={action.disabled || loadingStates[action.id]}
              onClick={() => handleButtonClick(action)}
              title={action.tooltip}
            >
              {loadingStates[action.id] ? (
                <div className="loading loading-spinner loading-xs" />
              ) : (
                <>
                  {action.icon && action.iconPosition !== 'right' && action.icon}
                  {action.label}
                  {action.icon && action.iconPosition === 'right' && action.icon}
                </>
              )}
            </button>
          ))}

          {config.minimizable && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleMinimize}
              title={isMinimized ? 'Restore' : 'Minimize'}
            >
              {isMinimized ? <IoChevronUp /> : <IoChevronDown />}
            </button>
          )}

          {config.fullscreen && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <IoContract /> : <IoExpand />}
            </button>
          )}

          {config.pinnable && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={handlePin}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              {isPinned ? <IoPin /> : <IoPinOutline />}
            </button>
          )}

          {config.header.closable !== false && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => handleClose('button')}
              title="Close"
            >
              <IoClose />
            </button>
          )}
        </div>
      </div>
    );
  }, [
    config.header, config.draggable, config.minimizable, config.fullscreen,
    config.pinnable, isMinimized, isFullscreen, isPinned, loadingStates,
    handleDragStart, handleMinimize, handleFullscreen, handlePin,
    handleClose, handleButtonClick
  ]);

  const renderBody = useCallback(() => {
    return (
      <div
        ref={bodyRef}
        className={`modal-body ${config.body?.padding !== false ? 'p-4' : ''} ${
          config.body?.scrollable ? 'overflow-auto' : ''
        } ${config.body?.className || ''}`}
        style={{
          maxHeight: config.body?.maxHeight,
          minHeight: config.body?.minHeight,
          ...config.body?.style
        }}
      >
        {/* Steps content */}
        {config.steps && config.steps.length > 0 && (
          <div className="modal-steps">
            {/* Step progress */}
            {config.navigation?.showProgress && (
              <div className="steps-progress mb-6">
                <div className="flex justify-between">
                  {config.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`step ${index <= currentStep ? 'step-primary' : ''} ${
                        step.completed ? 'step-success' : ''
                      } ${step.disabled ? 'step-disabled' : ''}`}
                      onClick={() => !step.disabled && handleStepChange(index)}
                    >
                      <div className="step-icon">
                        {step.icon || (index + 1)}
                      </div>
                      <div className="step-content">
                        <div className="step-title">{step.title}</div>
                        {step.description && (
                          <div className="step-description">{step.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="progress mt-4">
                  <div
                    className="progress-bar progress-bar-primary"
                    style={{
                      width: `${((currentStep + 1) / config.steps.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Current step content */}
            <div className="step-content">
              {config.steps[currentStep]?.content}
            </div>
          </div>
        )}

        {/* Tabs content */}
        {config.tabs && config.tabs.length > 0 && (
          <div className="modal-tabs">
            <div className="tabs tabs-bordered mb-4">
              {config.tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`tab ${index === currentTab ? 'tab-active' : ''} ${
                    tab.disabled ? 'tab-disabled' : ''
                  }`}
                  onClick={() => !tab.disabled && handleTabChange(index)}
                  disabled={tab.disabled}
                  title={tab.tooltip}
                >
                  {tab.icon && <span className="tab-icon mr-2">{tab.icon}</span>}
                  <span className="tab-label">{tab.label}</span>
                  {tab.badge && (
                    <span className="badge badge-sm ml-2">{tab.badge}</span>
                  )}
                  {tab.closable && (
                    <button
                      className="btn btn-xs btn-ghost ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        tab.onClose?.();
                      }}
                    >
                      <IoClose size={12} />
                    </button>
                  )}
                </button>
              ))}
            </div>

            <div className="tab-content">
              {config.tabs[currentTab]?.content}
            </div>
          </div>
        )}

        {/* Regular content */}
        {!config.steps && !config.tabs && config.content}
      </div>
    );
  }, [
    config.body, config.steps, config.tabs, config.content, config.navigation,
    currentStep, currentTab, handleStepChange, handleTabChange
  ]);

  const renderFooter = useCallback(() => {
    if (!config.footer?.visible) return null;

    const buttons = config.steps 
      ? config.steps[currentStep]?.buttons || []
      : config.footer.buttons || [];

    return (
      <div
        ref={footerRef}
        className={`modal-footer flex items-center p-4 border-t ${
          config.footer.align === 'center' ? 'justify-center' :
          config.footer.align === 'right' ? 'justify-end' :
          config.footer.align === 'space-between' ? 'justify-between' :
          'justify-start'
        } ${config.footer.sticky ? 'sticky bottom-0 bg-inherit' : ''} ${
          config.footer.className || ''
        }`}
        style={config.footer.style}
      >
        {config.footer.content && (
          <div className="footer-content">{config.footer.content}</div>
        )}

        {buttons.length > 0 && (
          <div className="flex space-x-2">
            {/* Navigation buttons for steps */}
            {config.steps && config.navigation?.enabled && (
              <>
                {currentStep > 0 && (
                  <button
                    className="btn btn-outline"
                    onClick={() => handleStepChange(currentStep - 1)}
                  >
                    <IoChevronBack />
                    {config.navigation.buttons?.previous?.label || 'Previous'}
                  </button>
                )}

                {currentStep < config.steps.length - 1 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStepChange(currentStep + 1)}
                    disabled={
                      config.navigation.validation &&
                      config.steps[currentStep].validation &&
                      !config.steps[currentStep].validation!()
                    }
                  >
                    {config.navigation.buttons?.next?.label || 'Next'}
                    <IoChevronForward />
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={() => handleClose('button')}
                  >
                    {config.navigation.buttons?.finish?.label || 'Finish'}
                  </button>
                )}
              </>
            )}

            {/* Custom buttons */}
            {buttons.map(button => (
              <button
                key={button.id}
                className={`btn ${
                  button.variant === 'primary' ? 'btn-primary' :
                  button.variant === 'secondary' ? 'btn-secondary' :
                  button.variant === 'success' ? 'btn-success' :
                  button.variant === 'warning' ? 'btn-warning' :
                  button.variant === 'error' ? 'btn-error' :
                  button.variant === 'info' ? 'btn-info' :
                  button.variant === 'outline' ? 'btn-outline' :
                  button.variant === 'ghost' ? 'btn-ghost' :
                  button.variant === 'link' ? 'btn-link' :
                  'btn-primary'
                } ${
                  button.size === 'xs' ? 'btn-xs' :
                  button.size === 'sm' ? 'btn-sm' :
                  button.size === 'lg' ? 'btn-lg' :
                  button.size === 'xl' ? 'btn-xl' :
                  ''
                } ${button.className || ''}`}
                style={button.style}
                disabled={button.disabled || loadingStates[button.id]}
                autoFocus={button.autoFocus}
                onClick={() => handleButtonClick(button)}
                title={button.tooltip}
              >
                {loadingStates[button.id] ? (
                  <div className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    {button.icon && button.iconPosition !== 'right' && (
                      <span className="btn-icon mr-2">{button.icon}</span>
                    )}
                    <span className="btn-label">{button.label}</span>
                    {button.icon && button.iconPosition === 'right' && (
                      <span className="btn-icon ml-2">{button.icon}</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [
    config.footer, config.steps, config.navigation, currentStep,
    loadingStates, handleStepChange, handleClose, handleButtonClick
  ]);

  if (!isVisible || isMinimized) return null;

  return (
    <div
      className={`modal modal-open ${config.backdrop ? 'modal-backdrop' : ''}`}
      onClick={handleBackdropClick}
      style={{
        zIndex: 1000 + (isActive ? 100 : 0),
        ...(config.overlayStyle || {})
      }}
    >
      <div
        className={`modal-overlay fixed inset-0 ${
          config.backdrop ? 'bg-black bg-opacity-50' : ''
        } ${config.overlayClassName || ''}`}
      />

      <div
        className={`modal-container fixed inset-0 flex ${
          config.position !== 'custom' ? positionClasses[config.position] : ''
        } p-4 z-10`}
      >
        <div
          ref={modalRef}
          className={`modal-content relative ${sizeClasses[config.size]} ${
            themeClasses[config.theme]
          } ${
            animations ? animationClasses[config.animation].enter : ''
          } ${
            isFullscreen ? 'w-full h-full max-w-none max-h-none' : ''
          } ${
            config.resizable ? 'resize overflow-auto' : ''
          } ${
            isDragging ? 'cursor-move' : ''
          } rounded-lg shadow-xl ${config.contentClassName || ''}`}
          style={{
            ...(config.position === 'custom' ? {
              position: 'absolute',
              left: position.x,
              top: position.y
            } : {}),
            width: config.width,
            height: config.height,
            maxWidth: config.maxWidth,
            maxHeight: config.maxHeight,
            minWidth: config.minWidth,
            minHeight: config.minHeight,
            ...config.contentStyle
          }}
          role={config.accessibility.role || 'dialog'}
          aria-modal="true"
          aria-labelledby={config.accessibility.ariaLabelledBy}
          aria-describedby={config.accessibility.ariaDescribedBy}
          aria-label={config.accessibility.ariaLabel}
          tabIndex={config.accessibility.tabIndex || -1}
        >
          {renderHeader()}
          {renderBody()}
          {renderFooter()}

          {/* Resize handles */}
          {config.resizable && !isFullscreen && (
            <>
              <div className="resize-handle resize-handle-n" />
              <div className="resize-handle resize-handle-e" />
              <div className="resize-handle resize-handle-s" />
              <div className="resize-handle resize-handle-w" />
              <div className="resize-handle resize-handle-ne" />
              <div className="resize-handle resize-handle-nw" />
              <div className="resize-handle resize-handle-se" />
              <div className="resize-handle resize-handle-sw" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for creating and managing modals
export const useModalManager = () => {
  const { openModal, closeModal, closeAllModals, updateModal, getModal, isModalOpen } = useModal();

  const createAlert = useCallback((
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    const iconMap = {
      info: <IoInformationCircle className="text-blue-500" size={24} />,
      success: <IoCheckmarkCircle className="text-green-500" size={24} />,
      warning: <IoWarning className="text-yellow-500" size={24} />,
      error: <IoCloseCircle className="text-red-500" size={24} />
    };

    return openModal({
      id: `alert-${Date.now()}`,
      type: 'alert',
      size: 'md',
      position: 'center',
      theme: 'light',
      animation: 'fade',
      trigger: 'manual',
      header: {
        visible: true,
        title,
        icon: iconMap[type],
        closable: true
      },
      content: <div className="text-center py-4">{message}</div>,
      footer: {
        visible: true,
        align: 'center',
        buttons: [
          {
            id: 'ok',
            label: 'OK',
            variant: 'primary',
            closeModal: true,
            action: () => {}
          }
        ]
      },
      accessibility: {
        ariaLabel: `${type} alert: ${title}`,
        focusTrap: true,
        autoFocus: true,
        restoreFocus: true
      }
    });
  }, [openModal]);

  const createConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void
  ) => {
    return openModal({
      id: `confirm-${Date.now()}`,
      type: 'confirm',
      size: 'md',
      position: 'center',
      theme: 'light',
      animation: 'zoom',
      trigger: 'manual',
      header: {
        visible: true,
        title,
        icon: <IoHelp className="text-yellow-500" size={24} />,
        closable: true
      },
      content: <div className="text-center py-4">{message}</div>,
      footer: {
        visible: true,
        align: 'center',
        buttons: [
          {
            id: 'cancel',
            label: 'Cancel',
            variant: 'outline',
            closeModal: true,
            action: onCancel
          },
          {
            id: 'confirm',
            label: 'Confirm',
            variant: 'primary',
            closeModal: true,
            action: onConfirm
          }
        ]
      },
      accessibility: {
        ariaLabel: `Confirmation dialog: ${title}`,
        focusTrap: true,
        autoFocus: true,
        restoreFocus: true
      }
    });
  }, [openModal]);

  const createPrompt = useCallback((
    title: string,
    message: string,
    defaultValue: string = '',
    onSubmit: (value: string) => void | Promise<void>
  ) => {
    let inputValue = defaultValue;

    return openModal({
      id: `prompt-${Date.now()}`,
      type: 'prompt',
      size: 'md',
      position: 'center',
      theme: 'light',
      animation: 'slide-down',
      trigger: 'manual',
      header: {
        visible: true,
        title,
        icon: <IoDocument className="text-blue-500" size={24} />,
        closable: true
      },
      content: (
        <div className="py-4">
          <p className="mb-4">{message}</p>
          <input
            type="text"
            className="input input-bordered w-full"
            defaultValue={defaultValue}
            onChange={(e) => { inputValue = e.target.value; }}
            autoFocus
          />
        </div>
      ),
      footer: {
        visible: true,
        align: 'right',
        buttons: [
          {
            id: 'cancel',
            label: 'Cancel',
            variant: 'outline',
            closeModal: true,
            action: () => {}
          },
          {
            id: 'submit',
            label: 'Submit',
            variant: 'primary',
            closeModal: true,
            action: () => onSubmit(inputValue)
          }
        ]
      },
      accessibility: {
        ariaLabel: `Input prompt: ${title}`,
        focusTrap: true,
        autoFocus: true,
        restoreFocus: true
      }
    });
  }, [openModal]);

  const createLoading = useCallback((
    title: string = 'Loading...',
    message?: string,
    progress?: number
  ) => {
    return openModal({
      id: `loading-${Date.now()}`,
      type: 'loading',
      size: 'sm',
      position: 'center',
      theme: 'light',
      animation: 'fade',
      trigger: 'manual',
      persistent: true,
      backdrop: 'static',
      keyboard: false,
      header: {
        visible: false
      },
      content: (
        <div className="text-center py-8">
          <div className="loading loading-lg loading-primary mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          {message && <p className="text-gray-600 mb-4">{message}</p>}
          {typeof progress === 'number' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              ></div>
            </div>
          )}
        </div>
      ),
      footer: {
        visible: false
      },
      accessibility: {
        ariaLabel: title,
        focusTrap: false
      }
    });
  }, [openModal]);

  return {
    openModal,
    closeModal,
    closeAllModals,
    updateModal,
    getModal,
    isModalOpen,
    createAlert,
    createConfirm,
    createPrompt,
    createLoading
  };
};

export default ModalProvider;

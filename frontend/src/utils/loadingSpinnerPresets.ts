import type { 
  LoadingSpinnerSize, 
  LoadingSpinnerColor, 
  LoadingSpinnerVariant, 
  LoadingSpinnerPosition 
} from '../components/LoadingSpinner';

/**
 * Preset configurations for common loading spinner use cases
 * These presets provide sensible defaults for different scenarios
 */
export const LoadingSpinnerPresets = {
  // Full page loading overlay
  page: {
    size: 'lg' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    overlay: true,
    overlayOpacity: 60,
    blurBackground: true,
    text: 'Loading page...',
    variant: 'spinner' as LoadingSpinnerVariant,
    color: 'primary' as LoadingSpinnerColor,
    animateText: true
  },

  // Button loading state
  button: {
    size: 'sm' as LoadingSpinnerSize,
    position: 'inline' as LoadingSpinnerPosition,
    variant: 'spinner' as LoadingSpinnerVariant,
    color: 'neutral' as LoadingSpinnerColor,
    pulse: false
  },

  // Card/component loading
  card: {
    size: 'md' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    text: 'Loading content...',
    variant: 'dots' as LoadingSpinnerVariant,
    color: 'info' as LoadingSpinnerColor,
    animateText: true
  },

  // Form submission loading
  form: {
    size: 'sm' as LoadingSpinnerSize,
    position: 'inline' as LoadingSpinnerPosition,
    text: 'Saving...',
    color: 'success' as LoadingSpinnerColor,
    variant: 'spinner' as LoadingSpinnerVariant,
    pulse: true
  },

  // Data fetching with progress
  dataFetch: {
    size: 'md' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    text: 'Fetching data...',
    variant: 'ring' as LoadingSpinnerVariant,
    color: 'primary' as LoadingSpinnerColor,
    showProgress: true,
    animateText: true
  },

  // File upload loading
  upload: {
    size: 'lg' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    variant: 'bars' as LoadingSpinnerVariant,
    color: 'warning' as LoadingSpinnerColor,
    overlay: true,
    overlayOpacity: 40,
    loadingMessages: [
      'Uploading file...',
      'Processing upload...',
      'Almost done...',
      'Finalizing...'
    ],
    messageInterval: 2000,
    showProgress: true
  },

  // Search/filter loading
  search: {
    size: 'sm' as LoadingSpinnerSize,
    position: 'inline' as LoadingSpinnerPosition,
    text: 'Searching...',
    variant: 'dots' as LoadingSpinnerVariant,
    color: 'info' as LoadingSpinnerColor,
    delay: 300 // Don't show immediately for fast searches
  },

  // Authentication loading
  auth: {
    size: 'md' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    text: 'Authenticating...',
    variant: 'infinity' as LoadingSpinnerVariant,
    color: 'accent' as LoadingSpinnerColor,
    overlay: true,
    overlayOpacity: 70,
    blurBackground: true
  },

  // Minimal inline loading
  minimal: {
    size: 'xs' as LoadingSpinnerSize,
    position: 'inline' as LoadingSpinnerPosition,
    variant: 'spinner' as LoadingSpinnerVariant,
    color: 'neutral' as LoadingSpinnerColor,
    pulse: false
  },

  // Error state loading (for retries)
  retry: {
    size: 'md' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    text: 'Retrying...',
    variant: 'ring' as LoadingSpinnerVariant,
    color: 'error' as LoadingSpinnerColor,
    animateText: true,
    pulse: true
  },

  // Dashboard/analytics loading
  analytics: {
    size: 'lg' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    variant: 'ball' as LoadingSpinnerVariant,
    color: 'secondary' as LoadingSpinnerColor,
    loadingMessages: [
      'Loading dashboard...',
      'Analyzing data...',
      'Generating insights...',
      'Preparing visualization...'
    ],
    messageInterval: 1800,
    animateText: true
  },

  // Modal/dialog loading
  modal: {
    size: 'md' as LoadingSpinnerSize,
    position: 'center' as LoadingSpinnerPosition,
    text: 'Loading...',
    variant: 'spinner' as LoadingSpinnerVariant,
    color: 'primary' as LoadingSpinnerColor,
    overlay: false, // Modal already provides backdrop
    animateText: true
  }
};

/**
 * Utility function to create custom presets
 * Allows merging base presets with custom overrides
 */
export const createCustomPreset = (
  basePreset: keyof typeof LoadingSpinnerPresets,
  overrides: Partial<typeof LoadingSpinnerPresets[keyof typeof LoadingSpinnerPresets]>
) => {
  return {
    ...LoadingSpinnerPresets[basePreset],
    ...overrides
  };
};

/**
 * Common loading messages for different scenarios
 */
export const LoadingMessages = {
  general: [
    'Loading...',
    'Please wait...',
    'Almost there...',
    'Just a moment...'
  ],
  
  dataProcessing: [
    'Processing data...',
    'Analyzing information...',
    'Calculating results...',
    'Generating report...'
  ],
  
  fileOperations: [
    'Reading file...',
    'Processing content...',
    'Validating data...',
    'Saving changes...'
  ],
  
  networkOperations: [
    'Connecting...',
    'Sending request...',
    'Waiting for response...',
    'Processing response...'
  ],
  
  userActions: [
    'Preparing...',
    'Initializing...',
    'Setting up...',
    'Finalizing...'
  ]
};

// Example usage:
// import { LoadingSpinnerPresets, createCustomPreset } from '../utils/loadingSpinnerPresets';
//
// // Using a preset
// <LoadingSpinner {...LoadingSpinnerPresets.page} />
//
// // Creating a custom preset
// const customPreset = createCustomPreset('card', { color: 'warning', text: 'Custom loading...' });
// <LoadingSpinner {...customPreset} />

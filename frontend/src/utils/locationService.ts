// Location service for PWA geolocation functionality

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationError {
  code: number;
  message: string;
}

// Check if geolocation is supported
export const isGeolocationSupported = (): boolean => {
  return 'geolocation' in navigator;
};

// Get current location with high accuracy for mobile devices
export const getCurrentLocation = (
  options?: PositionOptions
): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        code: -1,
        message: 'Geolocation is not supported by this browser.',
      } as LocationError);
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        const locationError: LocationError = {
          code: error.code,
          message: getErrorMessage(error.code),
        };
        reject(locationError);
      },
      defaultOptions
    );
  });
};

// Watch location changes (useful for tracking during activities)
export const watchLocation = (
  onLocationUpdate: (coordinates: LocationCoordinates) => void,
  onError: (error: LocationError) => void,
  options?: PositionOptions
): number => {
  if (!isGeolocationSupported()) {
    onError({
      code: -1,
      message: 'Geolocation is not supported by this browser.',
    });
    return -1;
  }

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute for tracking
    ...options,
  };

  return navigator.geolocation.watchPosition(
    (position) => {
      onLocationUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      onError({
        code: error.code,
        message: getErrorMessage(error.code),
      });
    },
    defaultOptions
  );
};

// Stop watching location
export const clearLocationWatch = (watchId: number): void => {
  if (watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
};

// Convert error codes to user-friendly messages
const getErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      return 'Location access was denied. Please enable location access in your browser settings.';
    case 2:
      return 'Location information is unavailable. Please check your device settings.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while retrieving location.';
  }
};

// Format coordinates for display
export const formatCoordinates = (coordinates: LocationCoordinates): string => {
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`;
};

// Check if user has granted location permission
export const checkLocationPermission = async (): Promise<PermissionState> => {
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state;
    } catch (error) {
      console.warn('Unable to check location permission:', error);
      return 'prompt';
    }
  }
  return 'prompt';
};

// Request location permission (for better UX)
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const permission = await checkLocationPermission();
    if (permission === 'granted') {
      return true;
    }
    
    // Try to get location to trigger permission prompt
    await getCurrentLocation({ timeout: 5000 });
    return true;
  } catch (error) {
    console.warn('Location permission denied:', error);
    return false;
  }
};

// Calculate distance between two coordinates (in meters)
export const calculateDistance = (
  coords1: LocationCoordinates,
  coords2: LocationCoordinates
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coords1.latitude * Math.PI) / 180;
  const φ2 = (coords2.latitude * Math.PI) / 180;
  const Δφ = ((coords2.latitude - coords1.latitude) * Math.PI) / 180;
  const Δλ = ((coords2.longitude - coords1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
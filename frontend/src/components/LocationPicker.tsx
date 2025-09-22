import { useState, useEffect } from "react";
import { MdLocationOn, MdMyLocation, MdLocationOff, MdEdit } from "react-icons/md";
import {
  getCurrentLocation,
  isGeolocationSupported,
  formatCoordinates,
  type LocationCoordinates,
  type LocationError,
} from "../utils/locationService";

interface LocationPickerProps {
  location?: string;
  coordinates?: LocationCoordinates;
  onLocationChange: (location: string, coordinates?: LocationCoordinates) => void;
  disabled?: boolean;
  className?: string;
  showManualEntry?: boolean;
  placeholder?: string;
}

export default function LocationPicker({
  location = "",
  coordinates,
  onLocationChange,
  disabled = false,
  className = "",
  showManualEntry = true,
  placeholder = "Enter location or use GPS",
}: LocationPickerProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string>("");
  const [manualEntry, setManualEntry] = useState(false);
  const [tempLocation, setTempLocation] = useState(location);

  useEffect(() => {
    setTempLocation(location);
  }, [location]);

  const handleGetCurrentLocation = async () => {
    if (!isGeolocationSupported()) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    setError("");
    setIsGettingLocation(true);

    try {
      const coords = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      });

      // Try to get a readable address from coordinates
      const locationString = await reverseGeocode(coords);
      
      onLocationChange(locationString, coords);
      setManualEntry(false);
    } catch (error) {
      const locationError = error as LocationError;
      setError(locationError.message);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const reverseGeocode = async (coords: LocationCoordinates): Promise<string> => {
    try {
      // Using a simple format as fallback - in production you might want to use a geocoding service
      return `${formatCoordinates(coords)}`;
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      return `${formatCoordinates(coords)}`;
    }
  };

  const handleManualLocationSubmit = () => {
    if (tempLocation.trim()) {
      onLocationChange(tempLocation.trim());
      setManualEntry(false);
    }
  };

  const handleManualLocationCancel = () => {
    setTempLocation(location);
    setManualEntry(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Location Display */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium flex items-center gap-2">
            <MdLocationOn className="text-primary" />
            Location
          </span>
        </label>
        
        {!manualEntry ? (
          <div className="relative">
            <div
              className={`
                input input-bordered flex items-center gap-2 min-h-12 p-3
                ${location ? 'text-base-content' : 'text-base-content/50'}
                ${disabled ? 'input-disabled' : 'cursor-pointer hover:border-primary'}
              `}
              onClick={showManualEntry && !disabled ? () => setManualEntry(true) : undefined}
            >
              <div className="flex-1">
                {location ? (
                  <div className="mobile-text">
                    <div className="font-medium">{location}</div>
                    {coordinates && (
                      <div className="text-xs text-base-content/60 mt-1">
                        {formatCoordinates(coordinates)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="mobile-text">{placeholder}</span>
                )}
              </div>
              
              {showManualEntry && !disabled && (
                <MdEdit className="text-base-content/50" />
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              placeholder={placeholder}
              className="input input-bordered flex-1 mobile-input"
              autoFocus
            />
            <button
              type="button"
              onClick={handleManualLocationSubmit}
              className="btn btn-primary mobile-button"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleManualLocationCancel}
              className="btn btn-ghost mobile-button"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* GPS and Manual Entry Buttons */}
      {!manualEntry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={disabled || isGettingLocation}
            className="btn btn-outline btn-primary mobile-button gap-2 w-full"
          >
            {isGettingLocation ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                <span className="mobile-text">Getting Location...</span>
              </>
            ) : (
              <>
                <MdMyLocation className="text-lg" />
                <span className="mobile-text">Use Current Location</span>
              </>
            )}
          </button>
          
          {showManualEntry && (
            <button
              type="button"
              onClick={() => setManualEntry(true)}
              disabled={disabled}
              className="btn btn-outline btn-secondary mobile-button gap-2 w-full"
            >
              <MdEdit className="text-lg" />
              <span className="mobile-text">Enter Manually</span>
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mobile-text">
          <MdLocationOff className="text-lg" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="btn btn-ghost btn-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Location Permission Info */}
      {!location && !error && isGeolocationSupported() && (
        <div className="alert alert-info mobile-text">
          <MdLocationOn className="text-lg" />
          <div>
            <div className="font-medium">Location Services</div>
            <div className="text-xs opacity-80">
              Allow location access for automatic positioning
            </div>
          </div>
        </div>
      )}

      {/* Offline/No GPS Info */}
      {!isGeolocationSupported() && (
        <div className="alert alert-warning mobile-text">
          <MdLocationOff className="text-lg" />
          <div>
            <div className="font-medium">GPS Not Available</div>
            <div className="text-xs opacity-80">
              Please enter location manually
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
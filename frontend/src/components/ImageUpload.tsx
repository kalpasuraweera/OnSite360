import { useState, useRef } from "react";
import { MdCloudUpload, MdPhoto, MdDelete, MdCameraAlt } from "react-icons/md";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  allowCamera?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  images = [],
  onImagesChange,
  maxImages = 5,
  maxFileSize = 5,
  allowCamera = true,
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError("");
    setUploading(true);

    try {
      const validFiles: File[] = [];
      
      // Validate files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not a valid image file.`);
          continue;
        }
        
        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
          setError(`${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
          continue;
        }
        
        // Check total images limit
        if (images.length + validFiles.length >= maxImages) {
          setError(`Maximum ${maxImages} images allowed.`);
          break;
        }
        
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      // Upload files
      const uploadPromises = validFiles.map(uploadFile);
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Filter out any failed uploads (null values)
      const successfulUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (successfulUrls.length > 0) {
        onImagesChange([...images, ...successfulUrls]);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Replace with your actual upload endpoint
      const response = await fetch('/v1/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url || data.filePath; // Adjust based on your API response
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const openCameraDialog = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className={`mobile-container ${className}`}>
      {/* Upload Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled || uploading || images.length >= maxImages}
          className="btn btn-outline btn-primary mobile-button gap-2 w-full"
        >
          <MdPhoto className="text-lg" />
          <span className="mobile-text">Choose Photos</span>
        </button>
        
        {allowCamera && (
          <button
            type="button"
            onClick={openCameraDialog}
            disabled={disabled || uploading || images.length >= maxImages}
            className="btn btn-outline btn-secondary mobile-button gap-2 w-full"
          >
            <MdCameraAlt className="text-lg" />
            <span className="mobile-text">Take Photo</span>
          </button>
        )}
      </div>

      {/* Drag and Drop Area */}
      {images.length < maxImages && (
        <div
          className={`
            border-2 border-dashed border-base-300 rounded-lg p-6 text-center
            ${!disabled && !uploading ? 'hover:border-primary hover:bg-base-200 cursor-pointer' : ''}
            ${uploading ? 'opacity-50' : ''}
            transition-all duration-200
          `}
          onClick={!disabled && !uploading ? openFileDialog : undefined}
        >
          <MdCloudUpload className="mx-auto text-4xl text-base-content/50 mb-2" />
          <p className="mobile-text text-base-content/70 mb-1">
            {uploading ? 'Uploading...' : 'Tap to select photos or drag and drop'}
          </p>
          <p className="text-xs text-base-content/50">
            Up to {maxImages} images, max {maxFileSize}MB each
          </p>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      
      {allowCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mobile-text mt-3">
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

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="mt-4">
          <h4 className="mobile-subheading mb-3">
            Uploaded Images ({images.length}/{maxImages})
          </h4>
          <div className="mobile-grid-cards">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group bg-base-100 rounded-lg overflow-hidden border border-base-300"
              >
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 sm:h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={disabled}
                    className="btn btn-error btn-sm gap-1"
                  >
                    <MdDelete className="text-sm" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
                <div className="absolute top-2 right-2 bg-base-100/90 text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mobile-text">
            <span className="loading loading-spinner loading-sm"></span>
            <span>Uploading images...</span>
          </div>
          <progress className="progress progress-primary w-full mt-2"></progress>
        </div>
      )}
    </div>
  );
}
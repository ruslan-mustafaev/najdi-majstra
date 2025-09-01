import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Plus, Trash2 } from 'lucide-react';

interface PhotoUploadProps {
  type: 'profile' | 'work';
  currentPhotos?: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  type,
  currentPhotos = [],
  onPhotosChange,
  maxPhotos = type === 'profile' ? 1 : 10,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      const newPhotos: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Iba obrázky sú povolené');
          continue;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Súbor je príliš veľký. Maximálna veľkosť je 5MB');
          continue;
        }

        // For now, create a temporary URL for preview
        // TODO: Upload to Supabase Storage
        const tempUrl = URL.createObjectURL(file);
        newPhotos.push(tempUrl);
      }

      // Check if we don't exceed max photos
      const totalPhotos = currentPhotos.length + newPhotos.length;
      if (totalPhotos > maxPhotos) {
        alert(`Maximálny počet fotiek je ${maxPhotos}`);
        return;
      }

      // Update photos
      onPhotosChange([...currentPhotos, ...newPhotos]);
      
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Chyba pri nahrávaní fotiek');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (type === 'profile') {
    return (
      <div className={`relative ${className}`}>
        <div className="relative w-32 h-32 mx-auto">
          {currentPhotos.length > 0 ? (
            <img
              src={currentPhotos[0]}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <Camera size={32} className="text-gray-400" />
            </div>
          )}
          
          {/* Upload button overlay */}
          <button
            onClick={triggerFileSelect}
            disabled={uploading}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <Upload size={24} className="text-white" />
            )}
          </button>

          {/* Remove button */}
          {currentPhotos.length > 0 && (
            <button
              onClick={() => removePhoto(0)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <p className="text-center text-sm text-gray-600 mt-2">
          Kliknite pre nahratie profilovej fotky
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing photos */}
        {currentPhotos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo}
              alt={`Ukážka práce ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => removePhoto(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {currentPhotos.length < maxPhotos && (
          <button
            onClick={triggerFileSelect}
            disabled={uploading}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-[#4169e1] hover:bg-blue-50 transition-colors disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4169e1]"></div>
            ) : (
              <>
                <Plus size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Pridať fotku</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-sm text-gray-600 mt-2">
        Maximálne {maxPhotos} fotiek. Podporované formáty: JPG, PNG. Max veľkosť: 5MB
      </p>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { uploadImage, compressImage, validateImage, deleteImage } from '../lib/imageUpload';
import { useAuth } from '../hooks/useAuth';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string, path: string) => void;
  onImageRemoved?: (path: string) => void;
  folder: 'profiles' | 'work-images';
  className?: string;
  multiple?: boolean;
  maxImages?: number;
  currentImages?: Array<{ url: string; path: string }>;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  folder,
  className = '',
  multiple = false,
  maxImages = 5,
  currentImages = []
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || !user) return;

    const filesToUpload = Array.from(files);
    
    // Проверяем лимит изображений для множественной загрузки
    if (multiple && currentImages.length + filesToUpload.length > maxImages) {
      alert(`Максимум ${maxImages} изображений`);
      return;
    }

    setUploading(true);

    try {
      for (const file of filesToUpload) {
        // Валидация файла
        const validationError = validateImage(file);
        if (validationError) {
          alert(validationError);
          continue;
        }

        // Сжимаем изображение
        const compressedFile = await compressImage(file);

        // Загружаем в Supabase
        const result = await uploadImage(compressedFile, folder, user.id);
        
        if (result.error) {
          alert(result.error);
        } else {
          onImageUploaded(result.url, result.path);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка при загрузке изображения');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (path: string) => {
    if (onImageRemoved) {
      const success = await deleteImage(path);
      if (success) {
        onImageRemoved(path);
      } else {
        alert('Ошибка при удалении изображения');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Текущие изображения */}
      {multiple && currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {currentImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`Работа ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(image.path)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Одиночное изображение */}
      {!multiple && currentImageUrl && (
        <div className="relative group inline-block">
          <img
            src={currentImageUrl}
            alt="Текущее изображение"
            className="w-32 h-32 object-cover rounded-lg"
          />
          {onImageRemoved && (
            <button
              onClick={() => handleRemoveImage('')}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {/* Зона загрузки */}
      {(!multiple || currentImages.length < maxImages) && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!uploading ? openFileDialog : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-gray-600">Загружаем изображение...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              {folder === 'profiles' ? (
                <Camera className="text-gray-400" size={32} />
              ) : (
                <ImageIcon className="text-gray-400" size={32} />
              )}
              <div>
                <p className="text-gray-600 font-medium">
                  {folder === 'profiles' 
                    ? 'Загрузить фото профиля'
                    : multiple 
                      ? 'Загрузить изображения работ'
                      : 'Загрузить изображение'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Перетащите файлы сюда или нажмите для выбора
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPEG, PNG, WebP до 5MB
                  {multiple && ` (максимум ${maxImages})`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
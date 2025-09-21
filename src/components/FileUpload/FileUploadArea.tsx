import React, { useRef, useState } from 'react';
import { Upload, X, Image, Video, User, AlertCircle, CheckCircle } from 'lucide-react';
import { FileType } from '../../lib/fileUpload';

interface FileUploadAreaProps {
  fileType: FileType;
  onFilesSelected: (files: FileList | File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
  currentFiles?: string[];
  onRemoveFile?: (fileUrl: string) => void;
}

const FILE_TYPE_CONFIG = {
  avatar: {
    title: 'Profilová fotka',
    description: 'Nahrajte svoju profilovú fotografiu',
    icon: User,
    accept: 'image/*',
    multiple: false,
    maxSize: '5MB'
  },
  'work-images': {
    title: 'Ukážky práce',
    description: 'Nahrajte fotografie svojej práce (max 10 súborov)',
    icon: Image,
    accept: 'image/*',
    multiple: true,
    maxSize: '10MB každá'
  },
  'work-videos': {
    title: 'Video ukážky',
    description: 'Nahrajte videá svojej práce (max 5 súborov)',
    icon: Video,
    accept: 'video/*',
    multiple: true,
    maxSize: '100MB každé'
  }
};

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  fileType,
  onFilesSelected,
  isUploading = false,
  maxFiles = 1,
  currentFiles = [],
  onRemoveFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = FILE_TYPE_CONFIG[fileType];
  const Icon = config.icon;

  const handleClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setError(null);
      
      // Проверяем лимит файлов
      if (config.multiple && files.length > maxFiles) {
        setError(`Môžete vybrať maximálne ${maxFiles} súborov`);
        return;
      }

      onFilesSelected(files);
    }
    
    // Очищаем input для возможности повторного выбора того же файла
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setError(null);
      
      // Проверяем лимит файлов
      if (config.multiple && files.length > maxFiles) {
        setError(`Môžete vybrať maximálne ${maxFiles} súborov`);
        return;
      }

      onFilesSelected(files);
    }
  };

  const handleRemoveFile = (fileUrl: string) => {
    if (onRemoveFile) {
      onRemoveFile(fileUrl);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : isUploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={config.accept}
          multiple={config.multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isUploading ? 'bg-gray-200' : 'bg-blue-100'
          }`}>
            {isUploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <Icon size={32} className="text-blue-600" />
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {config.title}
            </h3>
            <p className="text-gray-600 mb-2">
              {config.description}
            </p>
            <p className="text-sm text-gray-500">
              Kliknite alebo pretiahnite súbory sem • Max veľkosť: {config.maxSize}
            </p>
          </div>

          {!isUploading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <Upload size={20} />
              <span className="font-medium">
                {config.multiple ? 'Vybrať súbory' : 'Vybrať súbor'}
              </span>
            </div>
          )}

          {isUploading && (
            <p className="text-blue-600 font-medium">Nahrávam súbory...</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Current Files */}
      {currentFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Aktuálne súbory:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentFiles.map((fileUrl, index) => (
              <div key={index} className="relative group">
                {fileType === 'avatar' || fileType === 'work-images' ? (
                  <img
                    src={fileUrl}
                    alt={`Súbor ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <video
                    src={fileUrl}
                    className="w-full aspect-square object-cover rounded-lg shadow-md"
                    controls
                  />
                )}
                
                {onRemoveFile && (
                  <button
                    onClick={() => handleRemoveFile(fileUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
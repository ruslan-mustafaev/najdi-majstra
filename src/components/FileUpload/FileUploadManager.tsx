import React, { useState, useEffect } from 'react';
import { FileUploadArea } from './FileUploadArea';
import { 
  uploadSingleFile, 
  uploadMultipleFiles, 
  deleteFileByUrl, 
  getUserFiles,
  updateMasterProfile,
  FileType 
} from '../../lib/fileUpload';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadManagerProps {
  fileType: FileType;
  onUploadComplete?: (urls: string[]) => void;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  fileType,
  onUploadComplete
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const maxFiles = fileType === 'avatar' ? 1 : fileType === 'work-images' ? 10 : 5;

  // Загружаем существующие файлы при монтировании компонента
  useEffect(() => {
    if (user?.id) {
      loadCurrentFiles();
    }
  }, [user?.id, fileType]);

  const loadCurrentFiles = async () => {
    if (!user?.id) return;

    try {
      const files = await getUserFiles(user.id, fileType);
      setCurrentFiles(files);
    } catch (error) {
      console.error('Error loading current files:', error);
    }
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!user?.id) {
      setUploadStatus({
        type: 'error',
        message: 'Musíte byť prihlásený pre nahrávanie súborov'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      if (fileType === 'avatar') {
        // Загрузка одного файла (аватарка)
        const file = Array.from(files)[0];
        const result = await uploadSingleFile(file, fileType, user.id);

        if (result.success && result.url) {
          // Обновляем профиль в базе данных
          await updateMasterProfile(user.id, {
            profile_image_url: result.url
          });

          setCurrentFiles([result.url]);
          setUploadStatus({
            type: 'success',
            message: 'Profilová fotka bola úspešne nahraná!'
          });

          if (onUploadComplete) {
            onUploadComplete([result.url]);
          }
        } else {
          setUploadStatus({
            type: 'error',
            message: result.error || 'Chyba pri nahrávaní súboru'
          });
        }
      } else {
        // Загрузка нескольких файлов
        const result = await uploadMultipleFiles(files, fileType, user.id);

        if (result.success && result.urls) {
          // Объединяем с существующими файлами (убираем дубликаты)
          const newUrls = result.urls.filter(url => !currentFiles.includes(url));
          const allFiles = [...currentFiles, ...newUrls];
          
          // Обновляем профиль в базе данных
          const updateData = fileType === 'work-images' 
            ? { work_images_urls: allFiles }
            : { work_video_url: allFiles }; // Для видео теперь сохраняем все

          await updateMasterProfile(user.id, updateData);

          setCurrentFiles(allFiles);
          setUploadStatus({
            type: 'success',
            message: `${newUrls.length} súborov bolo úspešne nahraných!`
          });

          if (onUploadComplete) {
            onUploadComplete(allFiles);
          }
        } else {
          setUploadStatus({
            type: 'error',
            message: result.errors?.join(', ') || 'Chyba pri nahrávaní súborov'
          });
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: 'Nastala neočakávaná chyba pri nahrávaní'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (fileUrl: string) => {
    if (!user?.id) return;

    try {
      // Сначала удаляем из storage
      const storageSuccess = await deleteFileByUrl(fileUrl);
      
      // Обновляем состояние и базу данных независимо от результата удаления из storage
      const updatedFiles = currentFiles.filter(url => url !== fileUrl);
      setCurrentFiles(updatedFiles);

      // Обновляем профиль в базе данных
      const updateData = fileType === 'avatar' 
        ? { profile_image_url: null }
        : fileType === 'work-images'
        ? { work_images_urls: updatedFiles }
        : { work_video_url: updatedFiles }; // Сохраняем массив видео

      const dbSuccess = await updateMasterProfile(user.id, updateData);

      if (dbSuccess) {
        setUploadStatus({
          type: 'success',
          message: storageSuccess ? 'Súbor bol úspešne odstránený' : 'Súbor bol odstránený z profilu'
        });

        if (onUploadComplete) {
          onUploadComplete(updatedFiles);
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Chyba pri aktualizácii profilu'
        });
      }
    } catch (error) {
      console.error('Remove file error:', error);
      setUploadStatus({
        type: 'error',
        message: 'Nastala chyba pri odstraňovaní súboru'
      });
    }
  };

  // Автоматически скрываем сообщения через 5 секунд
  useEffect(() => {
    if (uploadStatus.type) {
      const timer = setTimeout(() => {
        setUploadStatus({ type: null, message: '' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [uploadStatus]);

  return (
    <div className="space-y-4">
      <FileUploadArea
        fileType={fileType}
        onFilesSelected={handleFilesSelected}
        isUploading={isUploading}
        maxFiles={maxFiles}
        currentFiles={currentFiles}
        onRemoveFile={handleRemoveFile}
      />

      {/* Status Message */}
      {uploadStatus.type && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
};
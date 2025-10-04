import { supabase } from './supabase';
import imageCompression from 'browser-image-compression';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface MultipleUploadResult {
  success: boolean;
  urls?: string[];
  errors?: string[];
}

// Типы файлов
export type FileType = 'avatar' | 'work-images' | 'work-videos';

// Конфигурация для разных типов файлов
const FILE_CONFIG = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxFiles: 1,
    folder: 'avatars'
  },
  'work-images': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxFiles: 10,
    folder: 'work-images'
  },
  'work-videos': {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
    maxFiles: 5, // Увеличиваем до 5 видео
    folder: 'work-videos'
  }
};

// Валидация файла
const validateFile = (file: File, fileType: FileType): string | null => {
  const config = FILE_CONFIG[fileType];
  
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    return `Súbor je príliš veľký. Maximálna veľkosť: ${maxSizeMB}MB`;
  }
  
  if (!config.allowedTypes.includes(file.type)) {
    return `Nepodporovaný typ súboru. Povolené: ${config.allowedTypes.join(', ')}`;
  }
  
  return null;
};

// Генерация уникального имени файла
const generateFileName = (file: File, userId: string, fileType: FileType, isWebP: boolean = false): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = isWebP ? 'webp' : file.name.split('.').pop();

  // Путь должен начинаться с userId для соответствия RLS политике
  return `${userId}/${timestamp}_${randomString}.${extension}`;
};

// Оптимизация изображения
const optimizeImage = async (file: File, fileType: FileType): Promise<File> => {
  // Только для изображений
  if (!file.type.startsWith('image/')) {
    return file;
  }

  console.log('=== IMAGE OPTIMIZATION START ===');
  console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
  console.log('Original file type:', file.type);

  try {
    // Конфигурация оптимизации
    const options = {
      maxSizeMB: fileType === 'avatar' ? 0.5 : 1, // Аватар: 500KB, Фото работ: 1MB
      maxWidthOrHeight: fileType === 'avatar' ? 800 : 2000, // Аватар: 800px, Фото работ: 2000px
      useWebWorker: true,
      fileType: 'image/webp' as const, // Конвертация в WebP
      initialQuality: 0.8, // Качество 80%
    };

    // Сжатие и конвертация в WebP
    const optimizedFile = await imageCompression(file, options);

    console.log('Optimized file size:', (optimizedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('Optimized file type:', optimizedFile.type);
    console.log('Compression ratio:', ((1 - optimizedFile.size / file.size) * 100).toFixed(1), '% smaller');
    console.log('=== IMAGE OPTIMIZATION END ===');

    // Создаем новый File объект с правильным именем и расширением .webp
    const webpFileName = file.name.replace(/\.[^.]+$/, '.webp');
    const webpFile = new File([optimizedFile], webpFileName, {
      type: 'image/webp',
      lastModified: Date.now()
    });

    return webpFile;
  } catch (error) {
    console.error('Image optimization failed, using original file:', error);
    return file; // Fallback к оригинальному файлу при ошибке
  }
};

// Загрузка одного файла (для аватарки)
export const uploadSingleFile = async (
  file: File, 
  fileType: FileType,
  userId: string
): Promise<UploadResult> => {
  try {
    console.log('=== UPLOAD DEBUG START ===');
    console.log('File:', file.name, file.size, file.type);
    console.log('FileType:', fileType);
    console.log('UserId parameter received:', userId);
    
    // Валидация
    const validationError = validateFile(file, fileType);
    if (validationError) {
      console.log('Validation error:', validationError);
      return { success: false, error: validationError };
    }

    // Оптимизация изображения (если это изображение)
    const optimizedFile = await optimizeImage(file, fileType);
    console.log('Using file for upload:', optimizedFile.name, optimizedFile.size, optimizedFile.type);

    // Проверяем аутентификацию пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth error:', authError);
      throw new Error('Пользователь не аутентифицирован');
    }

    // === КРИТИЧЕСКАЯ ОТЛАДКА АУТЕНТИФИКАЦИИ ===
    console.log('=== AUTH DEBUG ===');
    console.log('User from getUser():', user.id);
    console.log('User email:', user.email);
    console.log('Passed userId parameter:', userId);
    console.log('Do IDs match?', user.id === userId);

    // Проверяем сессию детально
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('=== SESSION DEBUG ===');
    console.log('Session exists:', !!session);
    console.log('Session user ID:', session?.user?.id);
    console.log('Access token exists:', !!session?.access_token);
    console.log('Access token preview:', session?.access_token?.substring(0, 50) + '...');
    console.log('Session error:', sessionError);

    // Проверяем что auth.uid() видит на сервере
    const { data: authCheck, error: authCheckError } = await supabase.rpc('get_current_user_id');
    console.log('=== SERVER AUTH CHECK ===');
    console.log('Server auth.uid():', authCheck);
    console.log('Server auth error:', authCheckError);

    // ВСЕГДА используем user.id из аутентифицированного пользователя
    const actualUserId = user.id;
    const isWebP = optimizedFile.type === 'image/webp';
    const fileName = generateFileName(file, actualUserId, fileType, isWebP);

    console.log('=== FILE PATH DEBUG ===');
    console.log('Generated filename:', fileName);
    console.log('First part of path:', fileName.split('/')[0]);
    console.log('Actual user ID:', actualUserId);
    console.log('Path matches user ID?', actualUserId === fileName.split('/')[0]);

    // Если это аватарка, сначала удаляем старую
    if (fileType === 'avatar') {
      console.log('Deleting old avatar files...');
      // await deleteOldAvatar(actualUserId); // Временно отключаем
    }
    
    console.log('=== UPLOAD ATTEMPT ===');
    console.log('Uploading to bucket: profile-images');
    console.log('File path:', fileName);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    // Проверяем bucket существование
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets?.map(b => b.name), bucketsError);
    
    // Загружаем файл (оптимизированный)
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, optimizedFile, {
        cacheControl: '3600',
        upsert: false, // Не перезаписываем, создаем новые
        contentType: optimizedFile.type
      });

    if (error) {
      console.error('=== STORAGE ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('File path that failed:', fileName);
      console.error('User ID used:', actualUserId);
      
      throw new Error(`Ошибка загрузки: ${error.message}`);
    }

    console.log('=== UPLOAD SUCCESS ===');
    console.log('Upload data:', data);
    
    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    console.log('Public URL generated:', urlData.publicUrl);
    console.log('=== UPLOAD DEBUG END ===');

    return { 
      success: true, 
      url: urlData.publicUrl 
    };

  } catch (error) {
    console.error('=== UPLOAD FAILED ===', {
      error: error instanceof Error ? error.message : error,
      file: file.name,
      type: fileType,
      userId: userId,
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Nastala neočakávaná chyba pri nahrávaní súboru'
    };
  }
};

// Загрузка нескольких файлов (для фотографий работ и видео)
export const uploadMultipleFiles = async (
  files: FileList | File[], 
  fileType: FileType,
  userId: string
): Promise<MultipleUploadResult> => {
  try {
    console.log('=== MULTIPLE UPLOAD START ===');
    const fileArray = Array.from(files);
    const config = FILE_CONFIG[fileType];

    console.log('Files to upload:', fileArray.length);

    // Проверяем аутентификацию
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Multiple upload auth error:', authError);
      return { 
        success: false, 
        errors: ['Пользователь не аутентифицирован'] 
      };
    }

    console.log('Multiple upload user ID:', user.id);

    // Проверяем количество файлов
    if (fileArray.length > config.maxFiles) {
      return { 
        success: false, 
        errors: [`Môžete nahrať maximálne ${config.maxFiles} súborov`] 
      };
    }

    // Валидируем все файлы
    const validationErrors: string[] = [];
    fileArray.forEach((file, index) => {
      const error = validateFile(file, fileType);
      if (error) {
        validationErrors.push(`Súbor ${index + 1}: ${error}`);
      }
    });

    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    // Загружаем все файлы
    const uploadPromises = fileArray.map(async (file, index) => {
      console.log(`Uploading file ${index + 1}/${fileArray.length}: ${file.name}`);

      // Оптимизация изображения (если это изображение)
      const optimizedFile = await optimizeImage(file, fileType);
      console.log(`Optimized file ${index + 1}:`, optimizedFile.name, optimizedFile.size);

      // ВСЕГДА используем user.id
      const isWebP = optimizedFile.type === 'image/webp';
      const fileName = generateFileName(file, user.id, fileType, isWebP);
      console.log(`Generated path: ${fileName}`);

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, optimizedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: optimizedFile.type
        });

      if (error) {
        console.error(`Upload error for ${file.name}:`, error);
        throw new Error(`Chyba pri nahrávaní ${file.name}: ${error.message}`);
      }

      console.log(`Successfully uploaded: ${fileName}`);

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    });

    console.log('Waiting for all uploads to complete...');
    const urls = await Promise.all(uploadPromises);

    console.log('=== MULTIPLE UPLOAD SUCCESS ===');
    console.log('Uploaded URLs:', urls);

    return { 
      success: true, 
      urls 
    };

  } catch (error) {
    console.error('=== MULTIPLE UPLOAD FAILED ===', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Nastala neočakávaná chyba'] 
    };
  }
};

// Удаление старой аватарки
const deleteOldAvatar = async (userId: string): Promise<void> => {
  try {
    console.log('Deleting old avatars for user:', userId);
    
    // Получаем список файлов пользователя
    const { data: files, error } = await supabase.storage
      .from('profile-images')
      .list(userId, {
        limit: 100,
        offset: 0
      });

    if (error) {
      console.error('Error listing files for deletion:', error);
      return;
    }

    if (!files || files.length === 0) {
      console.log('No old files to delete');
      return;
    }

    console.log('Found files to delete:', files.length);

    // Удаляем все старые файлы
    const filesToDelete = files.map(file => `${userId}/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from('profile-images')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Error deleting old files:', deleteError);
    } else {
      console.log('Successfully deleted old files:', filesToDelete.length);
    }
  } catch (error) {
    console.error('Error in deleteOldAvatar:', error);
  }
};

// Удаление файла по URL
export const deleteFileByUrl = async (fileUrl: string): Promise<boolean> => {
  try {
    console.log('Deleting file by URL:', fileUrl);
    
    // Извлекаем путь к файлу из URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folderPath = urlParts.slice(-3, -1).join('/'); // Получаем путь к папке
    const fullPath = `${folderPath}/${fileName}`;

    console.log('Extracted file path:', fullPath);

    const { error } = await supabase.storage
      .from('profile-images')
      .remove([fullPath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    console.log('File deleted successfully:', fullPath);
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
};

// Получение всех файлов пользователя определенного типа
export const getUserFiles = async (
  userId: string, 
  fileType: FileType
): Promise<string[]> => {
  try {
    console.log('Getting user files:', userId, fileType);
    
    // Сначала проверяем, существует ли профиль мастера
    const { data: master, error } = await supabase
      .from('masters')
      .select('profile_image_url, work_images_urls, work_video_url')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Database error when getting master files:', error);
      return [];
    }

    if (!master) {
      console.log('No master profile found, creating basic profile for user:', userId);
      
      // Если профиль мастера не существует, создаем базовую запись
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        return [];
      }

      const { data: newMaster, error: createError } = await supabase
        .from('masters')
        .insert({
          user_id: userId,
          name: user.user.user_metadata?.full_name || 'Nový majster',
          profession: 'Majster',
          email: user.user.email || '',
          phone: user.user.user_metadata?.phone || '',
          location: user.user.user_metadata?.location || '',
          description: 'Profesionálny majster',
          is_active: true,
          profile_completed: false
        })
        .select('profile_image_url, work_images_urls, work_video_url')
        .single();

      if (createError) {
        console.error('Error creating master profile:', createError);
        return [];
      }

      console.log('Created new master profile');
      return getFilesFromMaster(newMaster, fileType);
    }

    return getFilesFromMaster(master, fileType);
  } catch (error) {
    console.error('Unexpected error in getUserFiles:', error);
    return [];
  }
};

// Вспомогательная функция для извлечения файлов из объекта мастера
const getFilesFromMaster = (master: any, fileType: FileType): string[] => {
  try {
    // Возвращаем соответствующие файлы в зависимости от типа
    switch (fileType) {
      case 'avatar':
        return master.profile_image_url ? [master.profile_image_url] : [];
      case 'work-images':
        return master.work_images_urls || [];
      case 'work-videos':
        return master.work_video_url || []; // Теперь это уже массив
      default:
        return [];
    }
  } catch (error) {
    console.error('Error extracting files from master data:', error);
    return [];
  }
};

// Обновление профиля мастера с новыми URL файлов
export const updateMasterProfile = async (
  userId: string,
  updates: {
    profile_image_url?: string;
    work_images_urls?: string[];
    work_video_url?: string[]; // Изменяем на массив
  }
): Promise<boolean> => {
  try {
    console.log('Updating master profile:', userId, updates);
    
    const { error } = await supabase
      .from('masters')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Update profile error:', error);
      return false;
    }

    console.log('Master profile updated successfully');
    return true;
  } catch (error) {
    console.error('Update master profile error:', error);
    return false;
  }
};
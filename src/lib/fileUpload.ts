import { supabase } from './supabase';

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
    maxFiles: 5,
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
const generateFileName = (file: File, userId: string, fileType: FileType): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  
  // Путь должен начинаться с userId для соответствия RLS политике
  return `${userId}/${fileType}/${timestamp}_${randomString}.${extension}`;
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
    console.log('UserId:', userId);
    
    // Валидация
    const validationError = validateFile(file, fileType);
    if (validationError) {
      console.log('Validation error:', validationError);
      return { success: false, error: validationError };
    }

    // Если это аватарка, сначала удаляем старую
    if (fileType === 'avatar') {
      await deleteOldAvatar(userId);
    }

    // Генерируем имя файла
    const fileName = generateFileName(file, userId, fileType);

    // Проверяем аутентификацию пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth error:', authError);
      throw new Error('Пользователь не аутентифицирован');
    }
    
    console.log('Uploading file:', {
      fileName,
      userId: user.id,
      fileType,
      bucketId: 'profile-images',
      fileSize: file.size,
      fileType: file.type
    });

    // Проверяем существование bucket
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets, bucketsError);
    
    // Проверяем политики
    const { data: policies, error: policiesError } = await supabase
      .from('storage.objects')
      .select('*')
      .limit(1);
    console.log('Storage access test:', policies, policiesError);

    // Загружаем файл
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Разрешаем перезапись файлов
      });

    if (error) {
      console.error('Supabase storage error:', {
        message: error.message,
        details: JSON.stringify(error, null, 2),
        fileName,
        userId: user.id,
        bucket: 'profile-images'
      });
      
      throw new Error(`Ошибка загрузки: ${error.message}`);
    }

    console.log('Upload successful:', data);
    
    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    console.log('Public URL:', urlData.publicUrl);
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
      error: 'Nastala neočakávaná chyba pri nahrávaní súboru' 
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
    const fileArray = Array.from(files);
    const config = FILE_CONFIG[fileType];

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
    const uploadPromises = fileArray.map(async (file) => {
      const fileName = generateFileName(file, userId, fileType);
      
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Chyba pri nahrávaní ${file.name}: ${error.message}`);
      }

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);

    return { 
      success: true, 
      urls 
    };

  } catch (error) {
    console.error('Multiple upload error:', error);
    return { 
      success: false, 
      errors: [error instanceof Error ? error.message : 'Nastala neočakávaná chyba'] 
    };
  }
};

// Удаление старой аватарки
const deleteOldAvatar = async (userId: string): Promise<void> => {
  try {
    // Получаем список файлов пользователя в папке avatars
    const { data: files, error } = await supabase.storage
      .from('profile-images')
      .list(`avatars/${userId}`, {
        limit: 100,
        offset: 0
      });

    if (error || !files || files.length === 0) {
      return; // Нет старых файлов для удаления
    }

    // Удаляем все старые аватарки
    const filesToDelete = files.map(file => `avatars/${userId}/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from('profile-images')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Error deleting old avatar:', deleteError);
    }
  } catch (error) {
    console.error('Error in deleteOldAvatar:', error);
  }
};

// Удаление файла по URL
export const deleteFileByUrl = async (fileUrl: string): Promise<boolean> => {
  try {
    // Извлекаем путь к файлу из URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folderPath = urlParts.slice(-3, -1).join('/'); // Получаем путь к папке
    const fullPath = `${folderPath}/${fileName}`;

    const { error } = await supabase.storage
      .from('profile-images')
      .remove([fullPath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

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
      // Если профиль мастера не существует, создаем базовую запись
      console.log('No master profile found, creating basic profile for user:', userId);
      
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

      // Используем новый профиль
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
        return master.work_video_url ? [master.work_video_url] : [];
      default:
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
    work_video_url?: string;
  }
): Promise<boolean> => {
  try {
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

    return true;
  } catch (error) {
    console.error('Update master profile error:', error);
    return false;
  }
};
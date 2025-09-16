import { supabase, supabaseAdmin } from './supabase';

export interface ImageUploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Загружает изображение в Supabase Storage
 */
export const uploadImage = async (
  file: File,
  folder: 'profiles' | 'work-images',
  userId: string
): Promise<ImageUploadResult> => {
  try {
    // Используем admin клиент для загрузки файлов (обходит RLS)
    const client = supabaseAdmin || supabase;
    
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      throw new Error('Файл должен быть изображением');
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Размер файла не должен превышать 5MB');
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

    // Загружаем файл
    const { data, error } = await client.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = client.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      path: fileName
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Ошибка загрузки изображения'
    };
  }
};

/**
 * Удаляет изображение из Supabase Storage
 */
export const deleteImage = async (path: string): Promise<boolean> => {
  try {
    // Используем admin клиент для удаления файлов
    const client = supabaseAdmin || supabase;
    
    const { error } = await client.storage
      .from('profile-images')
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Сжимает изображение перед загрузкой
 */
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Вычисляем новые размеры
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Рисуем сжатое изображение
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Валидация изображения
 */
export const validateImage = (file: File): string | null => {
  // Проверяем тип файла
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Поддерживаются только форматы: JPEG, PNG, WebP';
  }

  // Проверяем размер файла (максимум 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return 'Размер файла не должен превышать 5MB';
  }

  return null;
};
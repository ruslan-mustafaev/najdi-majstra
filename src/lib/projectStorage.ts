// Новая система хранения проектов
import { supabase } from './supabase';

export interface ProjectFile {
  path: string;
  url: string;
  name: string;
  size: number;
}

export class ProjectStorageManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Генерация путей для проектов
  private getProjectPath(projectId: string, fileName: string): string {
    return `${this.userId}/projects/${projectId}/${fileName}`;
  }

  // Загрузка фотографий проекта
  async uploadProjectPhotos(projectId: string, files: File[]): Promise<ProjectFile[]> {
    const uploadPromises = files.map(async (file, index) => {
      const fileName = `photo_${index + 1}_${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = this.getProjectPath(projectId, fileName);

      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
        name: fileName,
        size: file.size
      };
    });

    return Promise.all(uploadPromises);
  }

  // Получение всех фотографий проекта
  async getProjectPhotos(projectId: string): Promise<ProjectFile[]> {
    const { data: files, error } = await supabase.storage
      .from('profile-images')
      .list(`${this.userId}/projects/${projectId}`, {
        limit: 10,
        offset: 0
      });

    if (error) throw error;

    return files.map(file => {
      const filePath = `${this.userId}/projects/${projectId}/${file.name}`;
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        size: file.metadata?.size || 0
      };
    });
  }

  // Удаление фотографии проекта
  async deleteProjectPhoto(projectId: string, fileName: string): Promise<boolean> {
    const filePath = this.getProjectPath(projectId, fileName);
    
    const { error } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    return !error;
  }

  // Удаление всех фотографий проекта
  async deleteAllProjectPhotos(projectId: string): Promise<boolean> {
    const { data: files, error: listError } = await supabase.storage
      .from('profile-images')
      .list(`${this.userId}/projects/${projectId}`);

    if (listError || !files) return false;

    const filePaths = files.map(file => 
      `${this.userId}/projects/${projectId}/${file.name}`
    );

    const { error } = await supabase.storage
      .from('profile-images')
      .remove(filePaths);

    return !error;
  }
}
import { storage, ID } from '@/lib/appwrite';

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '687796f2002638a8a945';

export class StorageService {
  
  // Upload single image
  static async uploadImage(file: File, folder: string = 'portfolio'): Promise<string> {
    try {
      console.log('Uploading image:', file.name);
      
      // Create unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      
      // Upload file to Appwrite Storage
      const response = await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
      );
      
      console.log('Image uploaded successfully:', response.$id);
      
      // Return the file URL
      const fileUrl = storage.getFileView(BUCKET_ID, response.$id);
      return fileUrl.toString();
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Upload error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  // Upload multiple images
  static async uploadImages(files: File[], folder: string = 'portfolio'): Promise<string[]> {
    try {
      console.log(`Uploading ${files.length} images...`);
      
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const urls = await Promise.all(uploadPromises);
      
      console.log('All images uploaded successfully');
      return urls;
      
    } catch (error: any) {
      console.error('Error uploading images:', error);
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  }

  // Delete image
  static async deleteImage(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(BUCKET_ID, fileId);
      console.log('Image deleted successfully:', fileId);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  // Get optimized image URL
  static getOptimizedImageUrl(
    fileId: string, 
    width?: number, 
    height?: number, 
    quality?: number
  ): string {
    try {
      const url = storage.getFilePreview(
        BUCKET_ID,
        fileId,
        width,
        height,
        'center',
        quality || 80,
        0,
        'ffffff',
        0,
        1,
        0,
        'webp'
      );
      return url.toString();
    } catch (error) {
      console.error('Error getting optimized image URL:', error);
      return '';
    }
  }

  // Validate image file
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please upload images smaller than 10MB.'
      };
    }

    return { valid: true };
  }

  // Validate multiple image files
  static validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check number of files
    if (files.length > 10) {
      errors.push('Too many files. Maximum 10 images allowed.');
    }

    // Validate each file
    files.forEach((file, index) => {
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        errors.push(`File ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Compress image before upload (client-side)
  static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Create thumbnail
  static async createThumbnail(file: File, size: number = 400): Promise<File> {
    return this.compressImage(file, size, 0.7);
  }
}

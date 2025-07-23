import { Client, Storage, ID, InputFile } from 'appwrite';

// Initialize Appwrite client for storage
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const storage = new Storage(client);

// Storage bucket IDs
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PORTFOLIO: 'portfolio',
  PROJECTS: 'projects',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents',
  THUMBNAILS: 'thumbnails',
  TEMP: 'temp'
};

// File types configuration
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  VIDEOS: ['video/mp4', 'video/webm', 'video/quicktime'],
  DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

export const MAX_FILE_SIZES = {
  AVATAR: 5 * 1024 * 1024, // 5MB
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 20 * 1024 * 1024 // 20MB
};

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  $id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeOriginal: number;
  $createdAt: string;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
  fileType?: string;
  size?: number;
}

export class StorageService {
  // Validate file before upload
  static validateFile(file: File, maxSize: number, allowedTypes: string[]): FileValidation {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
        size: file.size
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`,
        fileType: file.type
      };
    }

    return {
      isValid: true,
      fileType: file.type,
      size: file.size
    };
  }

  // Upload file to specific bucket
  static async uploadFile(
    bucketId: string,
    file: File,
    fileId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const uploadFileId = fileId || ID.unique();

      // Create InputFile from File
      const inputFile = InputFile.fromFile(file, file.name);

      const response = await storage.createFile(
        bucketId,
        uploadFileId,
        inputFile,
        undefined, // permissions - will use bucket defaults
        onProgress ? (progress) => {
          onProgress({
            loaded: progress.chunksUploaded * progress.chunkSize,
            total: progress.chunksTotal * progress.chunkSize,
            percentage: Math.round((progress.chunksUploaded / progress.chunksTotal) * 100)
          });
        } : undefined
      );

      return {
        $id: response.$id,
        name: response.name,
        url: this.getFileUrl(bucketId, response.$id),
        mimeType: response.mimeType,
        sizeOriginal: response.sizeOriginal,
        $createdAt: response.$createdAt
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error.message || 'Unknown error'}`);
    }
  }

  // Upload avatar with validation and optimization
  static async uploadAvatar(file: File, userId: string, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    const validation = this.validateFile(file, MAX_FILE_SIZES.AVATAR, ALLOWED_FILE_TYPES.IMAGES);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return this.uploadFile(STORAGE_BUCKETS.AVATARS, file, `avatar_${userId}`, onProgress);
  }

  // Upload portfolio image
  static async uploadPortfolioImage(file: File, portfolioId: string, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    const validation = this.validateFile(file, MAX_FILE_SIZES.IMAGE, ALLOWED_FILE_TYPES.IMAGES);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return this.uploadFile(STORAGE_BUCKETS.PORTFOLIO, file, `portfolio_${portfolioId}_${Date.now()}`, onProgress);
  }

  // Upload project attachment
  static async uploadProjectFile(file: File, projectId: string, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    let maxSize = MAX_FILE_SIZES.DOCUMENT;
    let allowedTypes = ALLOWED_FILE_TYPES.DOCUMENTS;

    // Determine file type and limits
    if (ALLOWED_FILE_TYPES.IMAGES.includes(file.type)) {
      maxSize = MAX_FILE_SIZES.IMAGE;
      allowedTypes = ALLOWED_FILE_TYPES.IMAGES;
    } else if (ALLOWED_FILE_TYPES.VIDEOS.includes(file.type)) {
      maxSize = MAX_FILE_SIZES.VIDEO;
      allowedTypes = ALLOWED_FILE_TYPES.VIDEOS;
    }

    const validation = this.validateFile(file, maxSize, allowedTypes);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const bucketId = ALLOWED_FILE_TYPES.VIDEOS.includes(file.type)
      ? STORAGE_BUCKETS.VIDEOS
      : STORAGE_BUCKETS.PROJECTS;

    return this.uploadFile(bucketId, file, `project_${projectId}_${Date.now()}`, onProgress);
  }

  // Upload video (for reels/solutions)
  static async uploadVideo(file: File, videoId: string, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    const validation = this.validateFile(file, MAX_FILE_SIZES.VIDEO, ALLOWED_FILE_TYPES.VIDEOS);

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return this.uploadFile(STORAGE_BUCKETS.VIDEOS, file, `video_${videoId}`, onProgress);
  }

  // Get file URL for viewing
  static getFileUrl(bucketId: string, fileId: string): string {
    try {
      return storage.getFileView(bucketId, fileId).toString();
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '';
    }
  }

  // Get file download URL
  static getFileDownloadUrl(bucketId: string, fileId: string): string {
    try {
      return storage.getFileDownload(bucketId, fileId).toString();
    } catch (error) {
      console.error('Error getting download URL:', error);
      return '';
    }
  }

  // Get optimized image URL with transformations
  static getOptimizedImageUrl(
    bucketId: string,
    fileId: string,
    width?: number,
    height?: number,
    quality?: number,
    format?: 'webp' | 'png' | 'jpg'
  ): string {
    try {
      let url = storage.getFileView(bucketId, fileId);

      const params = new URLSearchParams();

      if (width) params.append('width', width.toString());
      if (height) params.append('height', height.toString());
      if (quality) params.append('quality', quality.toString());
      if (format) params.append('output', format);

      if (params.toString()) {
        url = new URL(url.toString());
        url.search = params.toString();
        return url.toString();
      }

      return url.toString();
    } catch (error) {
      console.error('Error getting optimized image URL:', error);
      return '';
    }
  }

  // Generate thumbnail URL
  static getThumbnailUrl(bucketId: string, fileId: string, size: number = 300): string {
    return this.getOptimizedImageUrl(bucketId, fileId, size, size, 80, 'webp');
  }

  // Delete file
  static async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message || 'Unknown error'}`);
    }
  }

  // Get file metadata
  static async getFileInfo(bucketId: string, fileId: string) {
    try {
      return await storage.getFile(bucketId, fileId);
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error(`Failed to get file info: ${error.message || 'Unknown error'}`);
    }
  }

  // List files in bucket
  static async listFiles(bucketId: string, limit: number = 25, offset: number = 0) {
    try {
      return await storage.listFiles(bucketId, [], limit, offset);
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error.message || 'Unknown error'}`);
    }
  }

  // Upload multiple files
  static async uploadMultipleFiles(
    bucketId: string,
    files: File[],
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadFile(
          bucketId,
          file,
          undefined,
          onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        results.push(result);
      } catch (error) {
        console.error(`Error uploading file ${i + 1}:`, error);
        throw error;
      }
    }

    return results;
  }

  // Create presigned URL for large file uploads
  static async createPresignedUploadUrl(bucketId: string, fileId: string): Promise<string> {
    try {
      // Note: This is a placeholder. Appwrite doesn't have presigned URLs like AWS S3
      // For large files, you might need to implement chunked uploads
      return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}`;
    } catch (error) {
      console.error('Error creating presigned URL:', error);
      throw new Error(`Failed to create presigned URL: ${error.message || 'Unknown error'}`);
    }
  }

  // Helper method to format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper method to get file extension
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  // Helper method to generate unique filename
  static generateUniqueFilename(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = this.getFileExtension(originalName);
    const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '_');

    return `${prefix ? prefix + '_' : ''}${baseName}_${timestamp}_${random}.${extension}`;
  }

  // Batch delete files
  static async deleteMultipleFiles(bucketId: string, fileIds: string[]): Promise<void> {
    const deletePromises = fileIds.map(fileId => this.deleteFile(bucketId, fileId));

    try {
      await Promise.allSettled(deletePromises);
    } catch (error) {
      console.error('Error in batch file deletion:', error);
      throw new Error('Some files failed to delete');
    }
  }

  // Check if file exists
  static async fileExists(bucketId: string, fileId: string): Promise<boolean> {
    try {
      await this.getFileInfo(bucketId, fileId);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get file type category
  static getFileCategory(mimeType: string): 'image' | 'video' | 'document' | 'other' {
    if (ALLOWED_FILE_TYPES.IMAGES.includes(mimeType)) return 'image';
    if (ALLOWED_FILE_TYPES.VIDEOS.includes(mimeType)) return 'video';
    if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(mimeType)) return 'document';
    return 'other';
  }
}

export default StorageService;

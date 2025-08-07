"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

interface FileWithPreview {
  file: File;
  id: string;
  preview?: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
}

export default function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10, // 10MB
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  className = ''
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): FileWithPreview['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: FileWithPreview['type']) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Файл слишком большой. Максимальный размер: ${maxSize}MB`;
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return 'Неподдерживаемый тип файла';
    }

    return null;
  };

  const handleFileSelect = (files: FileList) => {
    const newFiles: FileWithPreview[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
        return;
      }

      if (selectedFiles.length + newFiles.length >= maxFiles) {
        errors.push(`Максимальное количество файлов: ${maxFiles}`);
        return;
      }

      const fileWithPreview: FileWithPreview = {
        file,
        id: Math.random().toString(36).substr(2, 9),
        type: getFileType(file)
      };

      // Create preview for images
      if (fileWithPreview.type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string;
          setSelectedFiles(prev => [...prev, fileWithPreview]);
        };
        reader.readAsDataURL(file);
      } else {
        newFiles.push(fileWithPreview);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles.map(f => f.file));
      setSelectedFiles([]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* File Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
          isDragOver
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Перетащите файлы сюда или кликните для выбора
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Максимум {maxFiles} файлов, до {maxSize}MB каждый
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Выбранные файлы ({selectedFiles.length})
            </h4>
            <button
              onClick={handleUpload}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
            >
              Прикрепить
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedFiles.map((fileWithPreview) => (
              <div
                key={fileWithPreview.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                {fileWithPreview.preview ? (
                  <img
                    src={fileWithPreview.preview}
                    alt={fileWithPreview.file.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    {getFileIcon(fileWithPreview.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {fileWithPreview.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(fileWithPreview.file.size)}
                  </p>
                </div>
                
                <button
                  onClick={() => removeFile(fileWithPreview.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { User, Camera, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onImageChange?: (file: File) => void;
  className?: string;
  fallbackText?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-lg',
};

export default function UserAvatar({
  src,
  alt = 'User avatar',
  size = 'md',
  editable = false,
  onImageChange,
  className,
  fallbackText,
}: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const showImage = src && !imageError;
  const initials = getInitials(fallbackText || alt);

  return (
    <div 
      className={cn(
        'relative inline-block',
        editable && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        'relative rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center',
        sizeClasses[size]
      )}>
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {fallbackText ? (
              <span className="font-semibold text-white">
                {initials}
              </span>
            ) : (
              <User className={cn(
                'text-white',
                size === 'sm' && 'w-4 h-4',
                size === 'md' && 'w-6 h-6',
                size === 'lg' && 'w-8 h-8',
                size === 'xl' && 'w-12 h-12'
              )} />
            )}
          </div>
        )}

        {/* Editable overlay */}
        {editable && isHovered && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Camera className={cn(
              'text-white',
              size === 'sm' && 'w-3 h-3',
              size === 'md' && 'w-4 h-4',
              size === 'lg' && 'w-5 h-5',
              size === 'xl' && 'w-6 h-6'
            )} />
          </div>
        )}
      </div>

      {/* File input for editable avatar */}
      {editable && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      )}

      {/* Online indicator */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></div>
    </div>
  );
}

// Avatar group component for showing multiple users
interface AvatarGroupProps {
  users: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ users, max = 3, size = 'md', className }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          className="relative ring-2 ring-gray-800 rounded-full"
          style={{ zIndex: displayUsers.length - index }}
        >
          <UserAvatar
            src={user.avatar}
            alt={user.name}
            size={size}
            fallbackText={user.name}
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative ring-2 ring-gray-800 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium',
            sizeClasses[size]
          )}
          style={{ zIndex: 0 }}
        >
          <span className="text-xs">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}

// Status avatar component
interface StatusAvatarProps extends UserAvatarProps {
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export function StatusAvatar({ status = 'offline', ...props }: StatusAvatarProps) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  return (
    <div className="relative inline-block">
      <UserAvatar {...props} />
      <div className={cn(
        'absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-gray-800 rounded-full',
        statusColors[status]
      )} />
    </div>
  );
}

// Upload avatar component
interface UploadAvatarProps {
  onUpload: (file: File) => void;
  currentSrc?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function UploadAvatar({ onUpload, currentSrc, size = 'xl', className }: UploadAvatarProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onUpload(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative rounded-full border-2 border-dashed transition-colors',
          isDragging 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-gray-600 hover:border-gray-500',
          sizeClasses[size]
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentSrc ? (
          <img
            src={currentSrc}
            alt="Current avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Upload className={cn(
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-6 h-6',
              size === 'lg' && 'w-8 h-8',
              size === 'xl' && 'w-12 h-12'
            )} />
            {size !== 'sm' && (
              <span className="text-xs mt-1">Upload</span>
            )}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bot, Play, Pause, Loader } from 'lucide-react';

interface VideoAvatarProps {
  specialistId: string;
  specialistName: string;
  specialistType?: 'ai_specialist' | 'freelancer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  fallbackIcon?: React.ReactNode;
  onVideoReady?: () => void;
  onError?: (error: string) => void;
}

interface VideoAvatarData {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  style: string;
}

export default function VideoAvatar({
  specialistId,
  specialistName,
  specialistType = 'ai_specialist',
  size = 'md',
  className = '',
  autoPlay = true,
  showControls = false,
  fallbackIcon,
  onVideoReady,
  onError
}: VideoAvatarProps) {
  const [videoData, setVideoData] = useState<VideoAvatarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Размеры для разных вариантов
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Цвета градиентов для разных специалистов
  const specialistGradients = {
    'alex-ai': 'from-purple-500 to-pink-500',
    'viktor-reels': 'from-orange-500 to-red-500',
    'max-powerful': 'from-indigo-500 to-cyan-500',
    default: 'from-gray-500 to-gray-700'
  };

  const gradient = specialistGradients[specialistId as keyof typeof specialistGradients] || specialistGradients.default;

  // Загружаем или генерируем видео аватарку
  useEffect(() => {
    const loadOrGenerateAvatar = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Сначала пытаемся найти существующую видео аватарку
        const existingVideo = await checkExistingAvatar(specialistId);
        
        if (existingVideo) {
          setVideoData(existingVideo);
          setIsLoading(false);
          onVideoReady?.();
          return;
        }

        // Если нет, генерируем новую
        const response = await fetch('/api/generate-video-avatar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            specialistId,
            specialistName,
            specialistType,
            style: 'professional',
            duration: 5
          })
        });

        const result = await response.json();

        if (result.success && result.data) {
          setVideoData(result.data);
          onVideoReady?.();
        } else {
          throw new Error(result.error || 'Не удалось загрузить видео аватарку');
        }

      } catch (err: any) {
        console.error('❌ VideoAvatar Error:', err);
        setError(err.message);
        setShowFallback(true);
        onError?.(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrGenerateAvatar();
  }, [specialistId, specialistName, specialistType, onVideoReady, onError]);

  // Проверяем существующую видео аватарку (используем новые позитивные HTML файлы)
  const checkExistingAvatar = async (id: string): Promise<VideoAvatarData | null> => {
    // Используем позитивные HTML аватары вместо видео
    const existingAvatars: Record<string, VideoAvatarData> = {
      'alex-ai': {
        videoUrl: '/videos/specialists/alex-ai-intro.mp4.html',
        thumbnailUrl: '/images/specialists/alex-ai-thumb.svg',
        duration: 5,
        style: 'professional'
      },
      'viktor-reels': {
        videoUrl: '/videos/specialists/viktor-reels-intro.mp4.html',
        thumbnailUrl: '/images/specialists/viktor-reels-thumb.svg',
        duration: 5,
        style: 'creative'
      },
      'luna-design': {
        videoUrl: '/videos/specialists/luna-design-intro.mp4.html',
        thumbnailUrl: '/images/specialists/luna-design-thumb.svg',
        duration: 5,
        style: 'design'
      },
      'max-bot': {
        videoUrl: '/videos/specialists/max-bot-intro.mp4.html',
        thumbnailUrl: '/images/specialists/max-bot-thumb.svg',
        duration: 5,
        style: 'tech'
      }
    };

    return existingAvatars[id] || null;
  };

  // Обработчики воспроизведения
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoClick = () => {
    if (!showControls) return;
    
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (autoPlay) {
      // Перезапускаем видео для бесконечного воспроизведения
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
          setIsPlaying(true);
        }
      }, 500);
    }
  };

  const handleVideoCanPlay = () => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Fallback компонент
  const FallbackAvatar = () => (
    <div className={cn(
      sizeClasses[size],
      `bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white font-bold shadow-lg`,
      className
    )}>
      {fallbackIcon || (
        specialistType === 'ai_specialist' ? (
          <Bot className={cn(
            'text-white',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-6 h-6',
            size === 'lg' && 'w-8 h-8',
            size === 'xl' && 'w-12 h-12'
          )} />
        ) : (
          <span className={cn(
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-xl'
          )}>
            {specialistName.charAt(0).toUpperCase()}
          </span>
        )
      )}
    </div>
  );

  // Показываем fallback в случае ошибки или загрузки
  if (isLoading) {
    return (
      <div className={cn(
        sizeClasses[size],
        `bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center`,
        className
      )}>
        <Loader className={cn(
          'text-white animate-spin',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-4 h-4',
          size === 'lg' && 'w-5 h-5',
          size === 'xl' && 'w-6 h-6'
        )} />
      </div>
    );
  }

  if (error || showFallback || !videoData) {
    return <FallbackAvatar />;
  }

  return (
    <div className={cn(
      "relative group",
      sizeClasses[size],
      className
    )}>
      {/* HTML аватарка */}
      {videoData.videoUrl.endsWith('.html') ? (
        <iframe
          src={videoData.videoUrl}
          className={cn(
            "w-full h-full rounded-full shadow-lg cursor-pointer border-0",
            "border-2 border-transparent",
            isPlaying && "border-purple-400 shadow-purple-500/25"
          )}
          style={{ pointerEvents: 'none' }}
          onLoad={() => setIsPlaying(true)}
          onError={() => {
            console.error('HTML avatar failed to load, showing fallback');
            setShowFallback(true);
          }}
        />
      ) : (
        // Видео аватарка (для обратной совместимости)
        <video
          ref={videoRef}
          className={cn(
            "w-full h-full rounded-full object-cover shadow-lg cursor-pointer",
            "border-2 border-transparent",
            isPlaying && "border-purple-400 shadow-purple-500/25"
          )}
          muted
          loop={autoPlay}
          playsInline
          preload="metadata"
          poster={videoData.thumbnailUrl}
          onCanPlay={handleVideoCanPlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleVideoEnded}
          onClick={handleVideoClick}
          onError={() => {
            console.error('Video failed to load, showing fallback');
            setShowFallback(true);
          }}
        >
          <source src={videoData.videoUrl} type="video/mp4" />
          Ваш браузер не поддерживает видео
        </video>
      )}

      {/* Индикатор воспроизведения */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-full ring-2 ring-purple-400 ring-opacity-50 animate-pulse" />
      )}

      {/* Контролы воспроизведения */}
      {showControls && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </div>
      )}

      {/* Статус-индикатор (онлайн) */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
    </div>
  );
}
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bot, Play, Pause, Loader } from 'lucide-react';

interface FullScreenVideoAvatarProps {
  specialistId: string;
  specialistName: string;
  specialistType?: 'ai_specialist' | 'freelancer';
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  onVideoReady?: () => void;
  onError?: (error: string) => void;
  isHovered?: boolean;
}

interface VideoAvatarData {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  style: string;
}

export default function FullScreenVideoAvatar({
  specialistId,
  specialistName,
  specialistType = 'ai_specialist',
  className = '',
  autoPlay = true,
  showControls = false,
  onVideoReady,
  onError,
  isHovered = false
}: FullScreenVideoAvatarProps) {
  const [videoData, setVideoData] = useState<VideoAvatarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Цвета градиентов для разных специалистов
  const specialistGradients = {
    'alex-ai': 'from-purple-600 via-purple-500 to-pink-500',
    'viktor-reels': 'from-orange-600 via-orange-500 to-red-500',
    'max-powerful': 'from-indigo-600 via-indigo-500 to-cyan-500',
    default: 'from-gray-600 via-gray-500 to-gray-700'
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
        console.error('❌ FullScreenVideoAvatar Error:', err);
        setError(err.message);
        setShowFallback(true);
        onError?.(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrGenerateAvatar();
  }, [specialistId, specialistName, specialistType, onVideoReady, onError]);

  // Проверяем существующую видео аватарку (исправленные пути)
  const checkExistingAvatar = async (id: string): Promise<VideoAvatarData | null> => {
    // Используем актуальные пути к демо файлам
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
      'max-bot': {
        videoUrl: '/videos/specialists/max-bot-intro.mp4.html',
        thumbnailUrl: '/images/specialists/max-bot-thumb.svg',
        duration: 5,
        style: 'tech'
      },
      'luna-design': {
        videoUrl: '/videos/specialists/luna-design-intro.mp4.html',
        thumbnailUrl: '/images/specialists/luna-design-thumb.svg',
        duration: 5,
        style: 'design'
      }
    };

    return existingAvatars[id] || null;
  };

  // Управление воспроизведением при наведении
  useEffect(() => {
    if (!videoRef.current || !videoData) return;

    if (isHovered && autoPlay) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isHovered, autoPlay, videoData]);

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
    if (autoPlay && isHovered && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Fallback компонент
  const FallbackAvatar = () => (
    <div className={cn(
      `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`,
      className
    )}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-pulse" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        {specialistType === 'ai_specialist' ? (
          <Bot className="w-24 h-24 text-white/80 mx-auto mb-4" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto">
            <span className="text-4xl font-bold text-white">
              {specialistName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h3 className="text-2xl font-bold text-white/90">{specialistName}</h3>
        <p className="text-white/70 mt-2">AI Specialist</p>
      </div>
      
      {/* Particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );

  // Показываем fallback в случае ошибки или загрузки
  if (isLoading) {
    return (
      <div className={cn(
        `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`,
        className
      )}>
        <div className="text-center">
          <Loader className="w-12 h-12 text-white/80 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || showFallback || !videoData) {
    return <FallbackAvatar />;
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* HTML или видео аватарка */}
      {videoData.videoUrl.endsWith('.html') ? (
        <iframe
          src={videoData.videoUrl}
          className="w-full h-full border-0"
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
          className="w-full h-full object-cover"
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
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Контролы воспроизведения */}
      {showControls && (
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 flex items-center justify-center transition-all opacity-0 hover:opacity-100">
          <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-all duration-300">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
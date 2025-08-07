import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to parse attachments from different formats
export function parseAttachments(attachments: any): string[] {
  if (!attachments) return [];
  
  // If it's already an array
  if (Array.isArray(attachments)) {
    return attachments.filter(item => typeof item === 'string');
  }
  
  // If it's a string, try to parse as JSON
  if (typeof attachments === 'string') {
    try {
      const parsed = JSON.parse(attachments);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => typeof item === 'string');
      }
      return [attachments];
    } catch (e) {
      // If parsing fails, treat as single attachment
      return [attachments];
    }
  }
  
  // If it's any other type, return empty array
  return [];
}

// Мобильные утилиты
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTouch = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Haptic feedback для мобильных устройств
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  
  const patterns = {
    light: 25,
    medium: 50,
    heavy: 100
  };
  
  navigator.vibrate(patterns[type]);
};

// Форматирование времени для сообщений
export const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 24 * 7) {
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

// Определение размера файла в человеко-читаемом формате
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Touch gesture utilities
export interface TouchGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  isHorizontal: boolean;
  isVertical: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
}

export const createTouchGesture = (startEvent: Touch, currentEvent: Touch): TouchGesture => {
  const startX = startEvent.clientX;
  const startY = startEvent.clientY;
  const currentX = currentEvent.clientX;
  const currentY = currentEvent.clientY;
  const deltaX = currentX - startX;
  const deltaY = currentY - startY;
  
  const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
  const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
  
  let direction: 'left' | 'right' | 'up' | 'down' | null = null;
  
  if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
    if (isHorizontal) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (isVertical) {
      direction = deltaY > 0 ? 'down' : 'up';
    }
  }
  
  return {
    startX,
    startY,
    currentX,
    currentY,
    deltaX,
    deltaY,
    isHorizontal,
    isVertical,
    direction
  };
};

// Проверка поддержки веб-технологий
export const supportsWebRTC = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

export const supportsWebSockets = () => {
  return typeof WebSocket !== 'undefined';
};

export const supportsServiceWorker = () => {
  return 'serviceWorker' in navigator;
};

// Throttle функция для performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Debounce функция
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Проверка сетевого соединения
export const getNetworkStatus = () => {
  if (typeof navigator === 'undefined') return { online: true, type: 'unknown' };
  
  return {
    online: navigator.onLine,
    type: (navigator as any).connection?.effectiveType || 'unknown'
  };
};

// Безопасное копирование в буфер обмена
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// URL validation
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Эмодзи утилиты
export const extractEmojis = (text: string): string[] => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.match(emojiRegex) || [];
};

export const removeEmojis = (text: string): string => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.replace(emojiRegex, '');
};

// Форматирование валюты
export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Форматирование относительного времени
export const formatRelativeTime = (date: string | Date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return 'только что';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин. назад`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  } else if (diffInDays < 7) {
    return `${diffInDays} дн. назад`;
  } else {
    return targetDate.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

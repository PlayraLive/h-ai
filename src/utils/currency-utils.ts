// Утилиты для форматирования валюты и времени

// Форматирование валюты
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Форматирование относительного времени
export const formatRelativeTime = (date: string | Date): string => {
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
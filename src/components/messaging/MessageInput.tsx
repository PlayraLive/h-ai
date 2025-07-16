// Компонент поля ввода сообщений с расширенными возможностями
'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, options?: SendMessageOptions) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface SendMessageOptions {
  messageType?: 'text' | 'file' | 'image' | 'video' | 'audio';
  attachments?: string[];
  isUrgent?: boolean;
  mentions?: string[];
}

export function MessageInput({
  onSendMessage,
  onTyping,
  placeholder = 'Напишите сообщение...',
  disabled = false,
  className = ''
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Обработка изменения текста
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    adjustTextareaHeight();

    // Индикатор печати
    if (onTyping) {
      onTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  // Отправка сообщения
  const handleSend = useCallback(async () => {
    if ((!message.trim() && attachments.length === 0) || disabled) return;

    try {
      let attachmentUrls: string[] = [];
      
      // Загружаем файлы если есть
      if (attachments.length > 0) {
        setIsUploading(true);
        attachmentUrls = await uploadFiles(attachments);
      }

      // Определяем тип сообщения
      let messageType: SendMessageOptions['messageType'] = 'text';
      if (attachments.length > 0) {
        const firstFile = attachments[0];
        if (firstFile.type.startsWith('image/')) {
          messageType = 'image';
        } else if (firstFile.type.startsWith('video/')) {
          messageType = 'video';
        } else if (firstFile.type.startsWith('audio/')) {
          messageType = 'audio';
        } else {
          messageType = 'file';
        }
      }

      // Отправляем сообщение
      await onSendMessage(message.trim(), {
        messageType,
        attachments: attachmentUrls,
        mentions: extractMentions(message)
      });

      // Очищаем форму
      setMessage('');
      setAttachments([]);
      adjustTextareaHeight();
      
      if (onTyping) {
        onTyping(false);
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    } finally {
      setIsUploading(false);
    }
  }, [message, attachments, disabled, onSendMessage, onTyping, adjustTextareaHeight]);

  // Обработка нажатия клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Обработка файлов
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  // Удаление файла
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Добавление эмодзи
  const addEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      
      // Восстанавливаем позицию курсора
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Запись голосового сообщения
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setAttachments(prev => [...prev, file]);
        
        // Останавливаем все треки
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Таймер записи
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка записи аудио:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Извлечение упоминаний из текста
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  // Загрузка файлов (заглушка)
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    // Здесь должна быть реальная загрузка в Appwrite Storage
    return files.map(file => URL.createObjectURL(file));
  };

  // Форматирование времени записи
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`border-t border-gray-200 bg-white ${className}`}>
      {/* Прикрепленные файлы */}
      {attachments.length > 0 && (
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                <span className="text-sm">
                  {file.type.startsWith('image/') ? '🖼️' : 
                   file.type.startsWith('video/') ? '🎥' : 
                   file.type.startsWith('audio/') ? '🎵' : '📎'}
                </span>
                <span className="text-sm text-gray-700 max-w-32 truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Основное поле ввода */}
      <div className="p-4">
        <div className="flex items-end gap-3">
          {/* Кнопки действий слева */}
          <div className="flex items-center gap-2">
            {/* Прикрепить файл */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
              title="Прикрепить файл"
            >
              📎
            </button>
            
            {/* Эмодзи */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-yellow-500 transition-colors disabled:opacity-50"
                title="Эмодзи"
              >
                😊
              </button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
                  <div className="grid grid-cols-8 gap-1">
                    {['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '👏', '🙏', '💪', '🤝', '✅'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        className="p-1 hover:bg-gray-100 rounded text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Поле ввода */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            {/* Индикатор загрузки */}
            {isUploading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-blue-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm">Загрузка...</span>
                </div>
              </div>
            )}
          </div>

          {/* Кнопки действий справа */}
          <div className="flex items-center gap-2">
            {/* Голосовое сообщение */}
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono">{formatRecordingTime(recordingTime)}</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Остановить запись"
                >
                  ⏹️
                </button>
              </div>
            ) : (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                title="Голосовое сообщение"
              >
                🎤
              </button>
            )}

            {/* Отправить */}
            <button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && attachments.length === 0) || isUploading}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Отправить"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const popularEmojis = [
  '😊', '😂', '🥰', '😎', '🤔', '👍', '👏', '🔥', '💯', '✨',
  '❤️', '🎉', '🚀', '💪', '🙌', '👌', '✅', '❓', '💡', '⭐',
  '😍', '🤗', '😋', '🤯', '🥳', '😇', '🤝', '👋', '💖', '🎯'
];

const categoryEmojis = {
  faces: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
  gestures: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏', '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '🤚', '👋', '🤝', '🙏'],
  objects: ['💯', '🔥', '💥', '✨', '🌟', '⭐', '💫', '💢', '💨', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚡', '🌈', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐']
};

export default function EmojiPicker({ onEmojiSelect, className = '' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof categoryEmojis>('faces');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
        title="Add emoji"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-3">Popular</h3>
            <div className="grid grid-cols-10 gap-1">
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex border-b border-gray-700">
            {Object.keys(categoryEmojis).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as keyof typeof categoryEmojis)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors capitalize ${
                  activeCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="p-3 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {categoryEmojis[activeCategory].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-700 rounded-lg transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
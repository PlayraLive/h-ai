'use client';

import React from 'react';
import VideoAvatar from '@/components/VideoAvatar';
import FullScreenVideoAvatar from '@/components/FullScreenVideoAvatar';

export default function VideoTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🎬 Тест видео аватарок
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              VideoAvatar (обычный)
            </h2>
            <div className="flex space-x-4">
              <VideoAvatar
                specialistId="viktor-reels"
                specialistName="Viktor Reels"
                specialistType="ai_specialist"
                size="lg"
                autoPlay={true}
                showControls={false}
                onVideoReady={() => console.log('Viktor video ready')}
                onError={(error) => console.error('Viktor error:', error)}
              />
              
              <VideoAvatar
                specialistId="luna-design"
                specialistName="Luna Design"
                specialistType="ai_specialist"
                size="lg"
                autoPlay={true}
                showControls={false}
                onVideoReady={() => console.log('Luna video ready')}
                onError={(error) => console.error('Luna error:', error)}
              />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              API Test
            </h2>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/generate-video-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      specialistId: 'viktor-reels',
                      specialistName: 'Viktor Reels',
                      specialistType: 'ai_specialist',
                      style: 'professional',
                      duration: 5
                    })
                  });
                  const data = await response.json();
                  console.log('API Response:', data);
                  alert(JSON.stringify(data, null, 2));
                } catch (error) {
                  console.error('API Error:', error);
                  alert('Error: ' + error);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Тест API
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-lg overflow-hidden h-96">
            <h3 className="text-lg font-bold text-white p-4 bg-gray-700">
              FullScreen - Viktor Reels
            </h3>
            <div className="h-80 relative">
              <FullScreenVideoAvatar
                specialistId="viktor-reels"
                specialistName="Viktor Reels"
                specialistType="ai_specialist"
                className="w-full h-full"
                autoPlay={true}
                isHovered={true}
                showControls={false}
                onVideoReady={() => console.log('Viktor fullscreen ready')}
                onError={(error) => console.error('Viktor fullscreen error:', error)}
              />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden h-96">
            <h3 className="text-lg font-bold text-white p-4 bg-gray-700">
              FullScreen - Luna Design
            </h3>
            <div className="h-80 relative">
              <FullScreenVideoAvatar
                specialistId="luna-design"
                specialistName="Luna Design"
                specialistType="ai_specialist"
                className="w-full h-full"
                autoPlay={true}
                isHovered={true}
                showControls={false}
                onVideoReady={() => console.log('Luna fullscreen ready')}
                onError={(error) => console.error('Luna fullscreen error:', error)}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            📁 Прямые ссылки на файлы
          </h2>
          <div className="space-y-2 text-gray-300">
            <div>Viktor HTML: <a href="/videos/specialists/viktor-reels-avatar.html" target="_blank" className="text-blue-400 hover:underline">/videos/specialists/viktor-reels-avatar.html</a></div>
            <div>Viktor SVG: <a href="/images/specialists/viktor-reels-thumb.svg" target="_blank" className="text-blue-400 hover:underline">/images/specialists/viktor-reels-thumb.svg</a></div>
            <div>Luna HTML: <a href="/videos/specialists/luna-design-avatar.html" target="_blank" className="text-blue-400 hover:underline">/videos/specialists/luna-design-avatar.html</a></div>
            <div>Luna SVG: <a href="/images/specialists/luna-design-thumb.svg" target="_blank" className="text-blue-400 hover:underline">/images/specialists/luna-design-thumb.svg</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Создаем директории
const videosDir = path.join(__dirname, '../public/videos/specialists');
const imagesDir = path.join(__dirname, '../public/images/specialists');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Создаем HTML файлы как демо видео (они будут отображаться как видео в браузере)
const specialists = [
  {
    id: 'viktor-reels',
    name: 'Viktor Reels', 
    title: 'AI Reels Creator',
    colors: ['#F59E0B', '#EF4444', '#10B981']
  },
  {
    id: 'luna-design',
    name: 'Luna Design',
    title: 'UI/UX Designer', 
    colors: ['#06b6d4', '#8b5cf6', '#f97316']
  },
  {
    id: 'alex-ai',
    name: 'Alex AI',
    title: 'AI Developer',
    colors: ['#8B5CF6', '#EC4899', '#06B6D4']
  },
  {
    id: 'max-bot',
    name: 'Max Bot',
    title: 'Bot Developer',
    colors: ['#10b981', '#3b82f6', '#6366f1']
  }
];

specialists.forEach(specialist => {
  // Создаем HTML видео-демо с анимацией
  const videoHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 400px;
            height: 400px;
            background: linear-gradient(45deg, ${specialist.colors.join(', ')});
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            color: white;
            animation: pulse 3s ease-in-out infinite;
            overflow: hidden;
        }
        .avatar {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
            animation: float 2s ease-in-out infinite alternate;
        }
        .name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
            text-align: center;
        }
        .title {
            font-size: 16px;
            opacity: 0.9;
            text-align: center;
        }
        .particles {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255,255,255,0.6);
            border-radius: 50%;
            animation: float-particles 6s linear infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-10px); }
        }
        @keyframes float-particles {
            0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-10vh) translateX(50px); opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="particles">
        <div class="particle" style="left: 20%; animation-delay: 0s;"></div>
        <div class="particle" style="left: 40%; animation-delay: 2s;"></div>
        <div class="particle" style="left: 60%; animation-delay: 4s;"></div>
        <div class="particle" style="left: 80%; animation-delay: 1s;"></div>
        <div class="particle" style="left: 10%; animation-delay: 3s;"></div>
        <div class="particle" style="left: 70%; animation-delay: 5s;"></div>
    </div>
    <div class="avatar">${specialist.name.split(' ').map(w => w[0]).join('')}</div>
    <div class="name">${specialist.name}</div>
    <div class="title">${specialist.title}</div>
</body>
</html>`;

  // Сохраняем HTML как "видео" файл
  fs.writeFileSync(
    path.join(videosDir, `${specialist.id}-avatar.html`), 
    videoHTML
  );

  // Создаем простую SVG как thumbnail
  const thumbnailSVG = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${specialist.colors[0]};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${specialist.colors[1]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${specialist.colors[2]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)" />
  <circle cx="200" cy="160" r="60" fill="rgba(255,255,255,0.2)" />
  <text x="200" y="175" font-family="Arial" font-size="32" font-weight="bold" 
        text-anchor="middle" fill="white">
    ${specialist.name.split(' ').map(w => w[0]).join('')}
  </text>
  <text x="200" y="260" font-family="Arial" font-size="18" font-weight="bold" 
        text-anchor="middle" fill="white">
    ${specialist.name}
  </text>
  <text x="200" y="285" font-family="Arial" font-size="14" 
        text-anchor="middle" fill="rgba(255,255,255,0.9)">
    ${specialist.title}
  </text>
</svg>`;

  fs.writeFileSync(
    path.join(imagesDir, `${specialist.id}-thumb.svg`), 
    thumbnailSVG
  );

  console.log(`✅ Создан демо контент для ${specialist.name}`);
});

// Создаем манифест
const manifest = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  specialists: specialists.map(specialist => ({
    id: specialist.id,
    name: specialist.name,
    title: specialist.title,
    videoUrl: `/videos/specialists/${specialist.id}-avatar.html`,
    thumbnailUrl: `/images/specialists/${specialist.id}-thumb.svg`,
    colors: specialist.colors,
    duration: 5,
    quality: "demo"
  }))
};

fs.writeFileSync(
  path.join(videosDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log('🎉 Все демо файлы созданы успешно!');
console.log(`📁 Видео: ${videosDir}`);
console.log(`📁 Превью: ${imagesDir}`);
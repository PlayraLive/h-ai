import React from 'react';

export default function UserAvatarSkeleton() {
  return (
    <div className="flex items-center space-x-3 animate-pulse">
      {/* Notification skeleton */}
      <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
      
      {/* Avatar skeleton */}
      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
    </div>
  );
}

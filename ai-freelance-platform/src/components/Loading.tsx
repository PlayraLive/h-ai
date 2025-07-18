'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-600 border-t-purple-500",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export function LoadingButton({ 
  loading = false, 
  children, 
  className, 
  disabled,
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative inline-flex items-center justify-center",
        loading && "cursor-not-allowed",
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={cn(loading && "opacity-0")}>
        {children}
      </span>
    </button>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-800/50",
        variantClasses[variant],
        className
      )}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
      
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-3/4 h-4 mb-4" />
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
        <Skeleton className="w-14 h-6 rounded-full" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-20 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function FreelancerCardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-40 h-4" />
          </div>
        </div>
        <Skeleton variant="circular" className="w-6 h-6" />
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center space-y-1">
          <Skeleton className="w-12 h-5 mx-auto" />
          <Skeleton className="w-20 h-4 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="w-16 h-5 mx-auto" />
          <Skeleton className="w-16 h-4 mx-auto" />
        </div>
      </div>
      
      <Skeleton className="w-full h-4 mb-2" />
      <Skeleton className="w-2/3 h-4 mb-4" />
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="w-20 h-6 rounded-full" />
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-18 h-6 rounded-full" />
      </div>
      
      <div className="flex items-center justify-between text-xs mb-4">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-32 h-4" />
      </div>
      
      <div className="flex space-x-2">
        <Skeleton className="flex-1 h-8 rounded-lg" />
        <Skeleton className="w-10 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-xs lg:max-w-md">
        <div className="flex items-center space-x-2 mb-1">
          <Skeleton variant="circular" className="w-6 h-6" />
          <Skeleton className="w-20 h-4" />
        </div>
        <div className="bg-gray-800 rounded-2xl p-3 space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
    </div>
  );
}

interface LoadingPageProps {
  title?: string;
  description?: string;
}

export function LoadingPage({ title = "Loading...", description }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        {description && (
          <p className="text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}

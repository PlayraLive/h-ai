'use client';

import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';

interface AuthButtonsProps {
  locale: string;
  onLogin?: () => void;
}

export default function AuthButtons({ locale, onLogin }: AuthButtonsProps) {
  const { login } = useAuthContext();

  const handleLogin = async () => {
    if (onLogin) {
      onLogin();
    } else {
      // Redirect to login page
      window.location.href = `/${locale}/login`;
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button 
        onClick={handleLogin}
        className="px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium"
      >
        Login
      </button>
      <Link 
        href={`/${locale}/signup`} 
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
      >
        Sign Up
      </Link>
    </div>
  );
}

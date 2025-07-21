'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HeroBottomBar() {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Link
        href="/en/solutions"
        className="group inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold text-sm shadow-xl hover:shadow-purple-500/25 hover:scale-105 border border-white/10"
      >
        <span className="mr-2">View All Solutions</span>
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />

        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/5 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 rounded-xl" />
      </Link>
    </div>
  );
}

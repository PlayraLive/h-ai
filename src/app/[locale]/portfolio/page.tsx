'use client';

import React from 'react';
import PortfolioGrid from '@/components/portfolio/PortfolioGrid';

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <PortfolioGrid
          showFilters={true}
          showSearch={true}
          title="AI-Powered Portfolio"
          subtitle="Discover amazing projects created with artificial intelligence"
          limit={24}
        />
      </div>
    </div>
  );
}

'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { polygon, polygonMumbai, base, arbitrum, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

// Project ID из Reown Dashboard
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'e05dd23e-3173-4912-b2a9-98c9f78289a7';

// Поддерживаемые сети
const chains = [
  polygonMumbai, // Тестнет для разработки (начинаем с этого)
  polygon,      // Основная сеть Polygon
  base,         // Base Network
  arbitrum,     // Arbitrum One
  mainnet,      // Ethereum Mainnet (на случай если нужно)
];

// Создаем Wagmi адаптер
const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  ssr: true
});

// Создаем AppKit instance
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: chains,
  projectId,
  metadata: {
    name: 'H-AI Freelance Platform',
    description: 'Decentralized freelance platform with crypto payments',
    url: 'https://h-ai.vercel.app',
    icons: ['https://h-ai.vercel.app/favicon.ico']
  },
  features: {
    analytics: true, // Включаем аналитику
    email: false,    // Отключаем email авторизацию
    socials: [],     // Отключаем соцсети
    emailShowWallets: true
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6', // Синий цвет платформы
    '--w3m-border-radius-master': '8px'
  }
});

// Создаем Query Client для кеширования
const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

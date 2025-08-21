import { Chain } from 'wagmi/chains';

// Поддерживаемые сети
export const SUPPORTED_CHAINS = {
  polygonMumbai: {
    id: 80001,
    name: 'Polygon Mumbai',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://rpc-mumbai.maticvigil.com'] },
    },
    blockExplorers: {
      default: { name: 'PolygonScan', url: 'https://mumbai.polygonscan.com' },
    },
    testnet: true,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://polygon-rpc.com'] },
    },
    blockExplorers: {
      default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
    },
  },
  base: {
    id: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://mainnet.base.org'] },
    },
    blockExplorers: {
      default: { name: 'BaseScan', url: 'https://basescan.org' },
    },
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://arb1.arbitrum.io/rpc'] },
    },
    blockExplorers: {
      default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
    },
  },
  tronMainnet: {
    id: 728126428, // Tron Mainnet custom ID for internal use
    name: 'Tron Mainnet',
    nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
    rpcUrls: {
      default: { http: ['https://api.trongrid.io'] },
    },
    blockExplorers: {
      default: { name: 'Tronscan', url: 'https://tronscan.org' },
    },
    testnet: false,
    isTron: true, // Special flag for Tron
  },
  tronShasta: {
    id: 2494104990, // Tron Shasta testnet custom ID
    name: 'Tron Shasta',
    nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
    rpcUrls: {
      default: { http: ['https://api.shasta.trongrid.io'] },
    },
    blockExplorers: {
      default: { name: 'Shasta Tronscan', url: 'https://shasta.tronscan.org' },
    },
    testnet: true,
    isTron: true,
  },
} as const;

// Адреса токенов по сетям
export const TOKEN_ADDRESSES = {
  polygonMumbai: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // Mumbai testnet
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Mumbai testnet
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',  // Mumbai testnet
  },
  polygon: {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  },
  arbitrum: {
    USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  },
  tronMainnet: {
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // TRC20 USDT on Tron Mainnet
  },
  tronShasta: {
    USDT: 'TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs', // TRC20 USDT on Tron Shasta testnet
  },
} as const;

// Адреса смарт-контрактов платформы
export const PLATFORM_CONTRACTS = {
  polygonMumbai: {
    escrow: '0x...', // Деплоим в тестнет
    disputeResolver: '0x...',
    tokenStaking: '0x...',
  },
  polygon: {
    escrow: '0x...', // Деплоим позже
    disputeResolver: '0x...',
    tokenStaking: '0x...',
  },
  base: {
    escrow: '0x...',
    disputeResolver: '0x...',
    tokenStaking: '0x...',
  },
  arbitrum: {
    escrow: '0x...',
    disputeResolver: '0x...',
    tokenStaking: '0x...',
  },
  tronMainnet: {
    escrow: 'TBD...', // Tron контракты используют другой формат адресов
    disputeResolver: 'TBD...',
    tokenStaking: 'TBD...',
  },
  tronShasta: {
    escrow: 'TBD...', // Tron Shasta testnet
    disputeResolver: 'TBD...',
    tokenStaking: 'TBD...',
  },
} as const;

// Treasury кошельки для получения комиссий платформы
export const TREASURY_WALLETS = {
  polygonMumbai: '0xfdCc732Be626Db71b096c36b8de7C8471B3708bE', // Testnet treasury
  polygonAmoy: '0xfdCc732Be626Db71b096c36b8de7C8471B3708bE', // Testnet treasury
  polygon: '0xfdCc732Be626Db71b096c36b8de7C8471B3708bE', // Production treasury
  baseSepolia: '0xfdCc732Be626Db71b096c36b8de7C8471B3708bE', // Testnet treasury
  base: '0xfdCc732Be626Db71b096c36b8de7C8471B3708bE', // Production treasury
  arbitrumSepolia: '0xfdCc732Be626Db71b096c36b8de7C8471B3708bE', // Testnet treasury
  arbitrum: '0xfdCc732Be626Db71b096c36b8de7C8471B3708bE', // Production treasury
  tronMainnet: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', // Tron treasury (нужно создать)
  tronShasta: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', // Tron testnet treasury (нужно создать)
} as const;

// Конфигурация для разных типов платежей
export const PAYMENT_CONFIG = {
  minAmount: {
    USDC: 5, // $5 минимум
    USDT: 5,
    DAI: 5,
    ETH: 0.001,
    MATIC: 1,
  },
  maxAmount: {
    USDC: 50000, // $50k максимум
    USDT: 50000,
    DAI: 50000,
    ETH: 20,
    MATIC: 100000,
  },
  fees: {
    platform: 0.10, // 10% комиссия платформы
    gas: 'dynamic', // Динамическая оплата газа
    withdraw: 0.001, // 0.1% за вывод
  },
  escrowTimeout: {
    default: 30 * 24 * 3600, // 30 дней в секундах
    extended: 90 * 24 * 3600, // 90 дней для крупных проектов
  },
} as const;

// Настройки для Cross-chain мостов
export const BRIDGE_CONFIG = {
  layerZero: {
    enabled: true,
    endpoints: {
      polygon: 109,
      arbitrum: 110,
      base: 184,
    },
  },
  hyperlane: {
    enabled: true,
    domains: {
      polygon: 137,
      arbitrum: 42161,
      base: 8453,
    },
  },
} as const;

// Арбитры для разрешения споров
export const ARBITRATOR_WALLETS = {
  polygonMumbai: ['0xfdCc732Be626Db71b096c36b8de7C8471B3708bE'],
  polygonAmoy: ['0xfdCc732Be626Db71b096c36b8de7C8471B3708bE'],
  polygon: ['0xfdCc732Be626Db71b096c36b8de7C8471B3708bE'],
  baseSepolia: ['0xfdCc732Be626Db71b096c36b8de7C8471B3708bE'],
  base: ['0xfdCc732Be626Db71b096c36b8de7C8471B3708bE'],
  arbitrumSepolia: ['0xfdCc732Be626Db71b096c36b8de7C8471B3708bE'],
  arbitrum: ['0xfdCc732Be626Db71b096c36b8de7C8471B3708bE'],
  tronMainnet: ['TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'], // Нужно создать Tron кошелек
  tronShasta: ['TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE'],  // Нужно создать Tron тестнет кошелек
} as const;

export type SupportedChain = keyof typeof SUPPORTED_CHAINS;
export type SupportedToken = 'USDC' | 'USDT' | 'DAI' | 'ETH' | 'MATIC';

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Начинаем деплой FreelanceEscrow контракта...");

  // Получаем сеть
  const network = await ethers.provider.getNetwork();
  console.log(`📍 Деплоим в сеть: ${network.name} (chainId: ${network.chainId})`);

  // Получаем deployer аккаунт
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Деплоер: ${deployer.address}`);

  // Проверяем баланс
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Баланс деплоера: ${ethers.formatEther(balance)} ETH`);

  // Адрес treasury wallet (можно изменить)
  const treasuryWallet = process.env.TREASURY_WALLET || deployer.address;
  console.log(`🏦 Treasury wallet: ${treasuryWallet}`);

  // Деплоим контракт
  console.log("\n📄 Деплоим FreelanceEscrow...");
  const FreelanceEscrow = await ethers.getContractFactory("FreelanceEscrow");
  const escrow = await FreelanceEscrow.deploy(treasuryWallet);

  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log(`✅ FreelanceEscrow задеплоен по адресу: ${escrowAddress}`);

  // Настраиваем поддерживаемые токены
  console.log("\n🔧 Настраиваем поддерживаемые токены...");
  
  const tokenAddresses = getTokenAddresses(network.chainId);
  
  for (const [tokenSymbol, tokenAddress] of Object.entries(tokenAddresses)) {
    try {
      console.log(`   Добавляем ${tokenSymbol}: ${tokenAddress}`);
      const tx = await escrow.addSupportedToken(tokenAddress);
      await tx.wait();
      console.log(`   ✅ ${tokenSymbol} добавлен`);
    } catch (error) {
      console.log(`   ❌ Ошибка добавления ${tokenSymbol}: ${error.message}`);
    }
  }

  // Выводим итоговую информацию
  console.log("\n🎉 Деплой завершен!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📍 Сеть: ${network.name}`);
  console.log(`📄 Контракт: ${escrowAddress}`);
  console.log(`🏦 Treasury: ${treasuryWallet}`);
  console.log(`🔗 Explorer: ${getExplorerUrl(network.chainId, escrowAddress)}`);
  
  // Инструкции по обновлению конфигурации
  console.log("\n📋 Следующие шаги:");
  console.log("1. Обновите src/lib/web3/config.ts:");
  console.log(`   PLATFORM_CONTRACTS.${getNetworkName(network.chainId)}.escrow = "${escrowAddress}"`);
  
  console.log("\n2. Добавьте в .env:");
  console.log(`   ESCROW_CONTRACT_${getNetworkName(network.chainId).toUpperCase()} = "${escrowAddress}"`);
  
  console.log("\n3. Верифицируйте контракт:");
  console.log(`   npx hardhat verify --network ${network.name} ${escrowAddress} "${treasuryWallet}"`);

  return {
    network: network.name,
    chainId: network.chainId,
    contractAddress: escrowAddress,
    treasuryWallet: treasuryWallet
  };
}

function getTokenAddresses(chainId) {
  const tokens = {
    // Polygon Mumbai (chainId: 80001)
    80001: {
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
    },
    // Polygon Amoy (chainId: 80002)
    80002: {
      USDC: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582",
      USDT: "0xf3d30f6d0ad6b9a1b40c93b8d5d6e7b8e16a4e3d",
      DAI: "0xa8d394fe7380b8ce6145d5f85e6ac22d4e91acde"
    },
    // Polygon Mainnet (chainId: 137)
    137: {
      USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
    },
    // Base Sepolia (chainId: 84532)
    84532: {
      USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    },
    // Base Mainnet (chainId: 8453)
    8453: {
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
    },
    // Arbitrum Sepolia (chainId: 421614)
    421614: {
      USDC: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    },
    // Arbitrum One (chainId: 42161)
    42161: {
      USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
    }
  };

  return tokens[chainId] || {};
}

function getNetworkName(chainId) {
  const networks = {
    80001: "polygonMumbai",
    80002: "polygonAmoy", 
    137: "polygon",
    84532: "baseSepolia",
    8453: "base",
    421614: "arbitrumSepolia",
    42161: "arbitrum"
  };
  return networks[chainId] || "unknown";
}

function getExplorerUrl(chainId, address) {
  const explorers = {
    80001: `https://mumbai.polygonscan.com/address/${address}`,
    80002: `https://amoy.polygonscan.com/address/${address}`,
    137: `https://polygonscan.com/address/${address}`,
    84532: `https://sepolia.basescan.org/address/${address}`,
    8453: `https://basescan.org/address/${address}`,
    421614: `https://sepolia.arbiscan.io/address/${address}`,
    42161: `https://arbiscan.io/address/${address}`
  };
  return explorers[chainId] || `Unknown explorer for chainId ${chainId}`;
}

// Запускаем деплой если скрипт вызван напрямую
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Ошибка деплоя:", error);
      process.exit(1);
    });
}

module.exports = { main };

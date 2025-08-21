// Скрипт для деплоя escrow контракта в тестнет
// Требует установки Hardhat или Foundry

const deployEscrow = async () => {
  console.log("🚀 Деплой escrow контракта...");
  
  const contractInfo = {
    name: "FreelanceEscrow",
    networks: {
      polygonMumbai: {
        chainId: 80001,
        rpcUrl: "https://rpc-mumbai.maticvigil.com/",
        explorerUrl: "https://mumbai.polygonscan.com/",
        treasuryWallet: "0x1234567890123456789012345678901234567890", // Заменить на реальный
      },
      polygonAmoy: {
        chainId: 80002,
        rpcUrl: "https://rpc-amoy.polygon.technology/",
        explorerUrl: "https://amoy.polygonscan.com/",
        treasuryWallet: "0x1234567890123456789012345678901234567890", // Заменить на реальный
      }
    },
    supportedTokens: {
      polygonMumbai: {
        USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Mumbai USDC
        USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Mumbai USDT
        DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",  // Mumbai DAI
      },
      polygonAmoy: {
        USDC: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582", // Amoy USDC
        USDT: "0xf3d30f6d0ad6b9a1b40c93b8d5d6e7b8e16a4e3d", // Amoy USDT mock
        DAI: "0xa8d394fe7380b8ce6145d5f85e6ac22d4e91acde",  // Amoy DAI mock
      }
    }
  };

  console.log("\n📋 Информация о деплое:");
  console.log(`📄 Контракт: ${contractInfo.name}`);
  console.log(`🌐 Сети: ${Object.keys(contractInfo.networks).join(", ")}`);
  console.log(`💰 Комиссия платформы: 10%`);
  console.log(`🔒 Поддерживаемые токены: USDC, USDT, DAI`);

  console.log("\n⚠️  Для деплоя необходимо:");
  console.log("1. Установить Hardhat: npm install --save-dev hardhat");
  console.log("2. Создать hardhat.config.js");
  console.log("3. Получить приватный ключ кошелька для деплоя");
  console.log("4. Получить MATIC токены для оплаты газа:");
  console.log("   - Mumbai: https://faucet.polygon.technology/");
  console.log("   - Amoy: https://faucet.polygon.technology/");

  console.log("\n🔗 Полезные ссылки:");
  console.log("- Polygon Mumbai Explorer: https://mumbai.polygonscan.com/");
  console.log("- Polygon Amoy Explorer: https://amoy.polygonscan.com/");
  console.log("- Hardhat доки: https://hardhat.org/docs");

  return contractInfo;
};

// Конфигурация для обновления адресов контрактов
const updateContractAddresses = (networkName, escrowAddress) => {
  console.log(`\n✅ Контракт задеплоен в ${networkName}:`);
  console.log(`📍 Адрес: ${escrowAddress}`);
  console.log(`\n🔧 Обновите файл src/lib/web3/config.ts:`);
  console.log(`PLATFORM_CONTRACTS.${networkName}.escrow = "${escrowAddress}";`);
  
  console.log(`\n📱 Добавьте в Appwrite environment variables:`);
  console.log(`ESCROW_CONTRACT_${networkName.toUpperCase()} = "${escrowAddress}"`);
  
  return {
    network: networkName,
    address: escrowAddress,
    explorerUrl: networkName.includes('mumbai') 
      ? `https://mumbai.polygonscan.com/address/${escrowAddress}`
      : `https://amoy.polygonscan.com/address/${escrowAddress}`
  };
};

// Пример использования после деплоя
const exampleAfterDeploy = () => {
  console.log("\n🎯 После успешного деплоя:");
  console.log("1. Обновить адреса контрактов в config.ts");
  console.log("2. Добавить адреса поддерживаемых токенов");
  console.log("3. Настроить treasury wallet");
  console.log("4. Протестировать создание escrow");
  console.log("5. Проверить transfer и approval токенов");
  
  console.log("\n🧪 Команды для тестирования:");
  console.log("- Получить тестовые токены на faucet");
  console.log("- Создать тестовый escrow через UI");
  console.log("- Проверить баланс контракта");
  console.log("- Протестировать dispute resolution");
};

if (require.main === module) {
  deployEscrow()
    .then(exampleAfterDeploy)
    .catch(console.error);
}

module.exports = {
  deployEscrow,
  updateContractAddresses,
  exampleAfterDeploy
};

#!/bin/bash

echo "🔍 Проверка настройки окружения..."

# Проверяем .env файл
if [ ! -f ".env" ]; then
    echo "❌ .env файл не найден"
    echo "📝 Создайте .env файл: cp env-example .env"
    exit 1
fi

# Проверяем PRIVATE_KEY
if ! grep -q "PRIVATE_KEY=" .env; then
    echo "❌ PRIVATE_KEY не найден в .env"
    echo "📝 Добавьте: PRIVATE_KEY=ваш_приватный_ключ"
    exit 1
fi

PRIVATE_KEY=$(grep "PRIVATE_KEY=" .env | cut -d '=' -f2)
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "ваш_приватный_ключ_без_0x" ]; then
    echo "❌ PRIVATE_KEY не настроен"
    echo "📝 Добавьте реальный приватный ключ в .env"
    exit 1
fi

echo "✅ .env файл настроен"

# Проверяем компиляцию
echo "🔨 Проверка компиляции контракта..."
if forge build > /dev/null 2>&1; then
    echo "✅ Контракт компилируется"
else
    echo "❌ Ошибка компиляции"
    forge build
    exit 1
fi

# Проверяем подключение к сети
echo "🌐 Проверка подключения к Amoy testnet..."
if curl -s https://rpc-amoy.polygon.technology/ -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null; then
    echo "✅ Подключение к Amoy testnet работает"
else
    echo "❌ Нет подключения к Amoy testnet"
    exit 1
fi

echo ""
echo "🎉 Все проверки пройдены!"
echo "🚀 Можно деплоить контракт:"
echo "   forge script script/DeployTestnet.s.sol --rpc-url https://rpc-amoy.polygon.technology/ --broadcast"

# 🪙 **Получение тестовых токенов для Polygon Amoy**

## **1. Получение MATIC (для газа)**

### Способ 1: Polygon Faucet
1. Откройте https://faucet.polygon.technology/
2. Выберите "Polygon Amoy" 
3. Введите ваш адрес кошелька
4. Нажмите "Submit"
5. Подождите 1-2 минуты

### Способ 2: Alchemy Faucet  
1. Откройте https://www.alchemy.com/faucets/polygon-amoy
2. Войдите через GitHub/Google
3. Введите адрес кошелька
4. Получите 0.5 MATIC

## **2. Получение тестового USDC**

### QuickNode Faucet
1. Откройте https://faucet.quicknode.com/polygon/amoy
2. Выберите "USDC" токен
3. Введите ваш адрес
4. Получите тестовые USDC

### Circle Faucet (если доступен)
1. https://faucet.circle.com/
2. Выберите "Polygon Amoy"
3. Введите адрес кошелька

## **3. Добавление токенов в MetaMask**

### Добавить Polygon Amoy сеть:
```
Network Name: Polygon Amoy
RPC URL: https://rpc-amoy.polygon.technology/
Chain ID: 80002
Currency Symbol: MATIC
Block Explorer: https://amoy.polygonscan.com/
```

### Добавить USDC токен:
```
Token Contract Address: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
Token Symbol: USDC
Token Decimals: 6
```

## **4. Проверка баланса**

После получения токенов проверьте:
1. В MetaMask должно быть > 0.1 MATIC
2. В MetaMask должно быть > 10 USDC
3. На https://amoy.polygonscan.com/ введите ваш адрес и проверьте балансы

## **5. Альтернативные способы**

### Если faucets не работают:
1. **Discord/Telegram** - поищите Polygon community faucets
2. **DEX Testnet** - обменяйте MATIC на тестовые токены
3. **Попросите в сообществе** - многие разработчики делятся тестовыми токенами

### Мультифокет:
1. https://testnet.help/ - агрегатор тестовых faucets
2. https://faucetlink.to/amoy - еще один агрегатор

## **6. Минимальные требования для тестирования**

Для полного тестирования нужно:
- **0.1+ MATIC** - для оплаты газа транзакций
- **10+ USDC** - для тестирования платежей
- **Несколько адресов** - для тестирования клиент/фрилансер ролей

## **7. Проблемы и решения**

**"Insufficient funds for gas":**
- Получите больше MATIC через faucet
- Уменьшите gas limit в транзакции

**"Token not showing in wallet":**
- Добавьте токен вручную через "Import tokens"
- Проверьте правильность адреса контракта

**"Faucet says already claimed":**
- Попробуйте другой faucet
- Используйте другой IP/браузер
- Подождите 24 часа

## **8. Полезные ссылки**

- **Amoy Explorer:** https://amoy.polygonscan.com/
- **Gas Tracker:** https://polygonscan.com/gastracker
- **Faucet List:** https://docs.polygon.technology/tools/faucets/
- **MetaMask Help:** https://support.metamask.io/

## **✅ Готово!**
После получения токенов можно тестировать криптоплатежи!

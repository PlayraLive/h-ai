import { Client, Databases, ID } from 'node-appwrite';

// Инициализация Appwrite клиента для серверной части
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

/**
 * Создает коллекцию crypto_escrows для хранения информации о escrow контрактах
 */
export async function createCryptoEscrowsCollection() {
  try {
    console.log('Creating crypto_escrows collection...');

    // Создаем коллекцию
    await databases.createCollection(
      DATABASE_ID,
      'crypto_escrows',
      'Crypto Escrows',
      [
        // Разрешения: создавать могут все пользователи, читать и обновлять только создатель
        'create("users")',
        'read("users")',
        'update("users")',
        'delete("users")'
      ]
    );

    // Добавляем атрибуты
    const attributes = [
      { name: 'jobId', type: 'string', size: 255, required: true },
      { name: 'contractId', type: 'string', size: 255, required: true },
      { name: 'txHash', type: 'string', size: 255, required: true },
      { name: 'network', type: 'string', size: 50, required: true },
      { name: 'token', type: 'string', size: 20, required: true },
      { name: 'amount', type: 'double', required: true },
      { name: 'platformFee', type: 'double', required: true },
      { name: 'milestones', type: 'integer', required: false },
      { name: 'completedMilestones', type: 'integer', required: false, default: 0 },
      { name: 'deadline', type: 'string', size: 255, required: false },
      { name: 'clientAddress', type: 'string', size: 255, required: true },
      { name: 'freelancerAddress', type: 'string', size: 255, required: true },
      { name: 'status', type: 'string', size: 50, required: true }, // funded, in_progress, completed, disputed, released
      { name: 'events', type: 'string', size: 10000, required: false }, // JSON array of events
      { name: 'releasedAt', type: 'string', size: 255, required: false },
      { name: 'releaseTxHash', type: 'string', size: 255, required: false },
      { name: 'releaseType', type: 'string', size: 50, required: false },
      { name: 'createdAt', type: 'string', size: 255, required: true },
      { name: 'updatedAt', type: 'string', size: 255, required: true }
    ];

    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          'crypto_escrows',
          attr.name,
          attr.size!,
          attr.required,
          attr.default || null
        );
      } else if (attr.type === 'double') {
        await databases.createFloatAttribute(
          DATABASE_ID,
          'crypto_escrows',
          attr.name,
          attr.required,
          null,
          null,
          attr.default || null
        );
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          'crypto_escrows',
          attr.name,
          attr.required,
          null,
          null,
          attr.default || null
        );
      }
      
      // Небольшая задержка между созданием атрибутов
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Создаем индексы для быстрого поиска
    await databases.createIndex(
      DATABASE_ID,
      'crypto_escrows',
      'jobId_index',
      'key',
      ['jobId']
    );

    await databases.createIndex(
      DATABASE_ID,
      'crypto_escrows',
      'contractId_index',
      'key',
      ['contractId']
    );

    await databases.createIndex(
      DATABASE_ID,
      'crypto_escrows',
      'status_index',
      'key',
      ['status']
    );

    await databases.createIndex(
      DATABASE_ID,
      'crypto_escrows',
      'network_index',
      'key',
      ['network']
    );

    console.log('✅ crypto_escrows collection created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating crypto_escrows collection:', error);
    return false;
  }
}

/**
 * Создает коллекцию disputes для системы споров
 */
export async function createDisputesCollection() {
  try {
    console.log('Creating disputes collection...');

    // Создаем коллекцию
    await databases.createCollection(
      DATABASE_ID,
      'disputes',
      'Disputes',
      [
        'create("users")',
        'read("users")', 
        'update("users")',
        'delete("users")'
      ]
    );

    // Добавляем атрибуты
    const attributes = [
      { name: 'jobId', type: 'string', size: 255, required: true },
      { name: 'contractId', type: 'string', size: 255, required: true },
      { name: 'escrowId', type: 'string', size: 255, required: true },
      { name: 'initiatorAddress', type: 'string', size: 255, required: true },
      { name: 'initiatorType', type: 'string', size: 20, required: true }, // client or freelancer
      { name: 'reason', type: 'string', size: 255, required: true },
      { name: 'description', type: 'string', size: 2000, required: false },
      { name: 'evidence', type: 'string', size: 5000, required: false }, // JSON array of evidence
      { name: 'status', type: 'string', size: 50, required: true }, // open, resolved, cancelled
      { name: 'resolution', type: 'string', size: 50, required: false }, // client_wins, freelancer_wins, split
      { name: 'clientPercentage', type: 'integer', required: false },
      { name: 'freelancerPercentage', type: 'integer', required: false },
      { name: 'arbitratorAddress', type: 'string', size: 255, required: false },
      { name: 'resolutionReason', type: 'string', size: 1000, required: false },
      { name: 'resolutionTxHash', type: 'string', size: 255, required: false },
      { name: 'txHash', type: 'string', size: 255, required: false },
      { name: 'createdAt', type: 'string', size: 255, required: true },
      { name: 'resolvedAt', type: 'string', size: 255, required: false },
      { name: 'updatedAt', type: 'string', size: 255, required: true }
    ];

    for (const attr of attributes) {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          'disputes',
          attr.name,
          attr.size!,
          attr.required,
          attr.default || null
        );
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(
          DATABASE_ID,
          'disputes',
          attr.name,
          attr.required,
          0,
          100,
          attr.default || null
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Создаем индексы
    await databases.createIndex(
      DATABASE_ID,
      'disputes',
      'jobId_index',
      'key',
      ['jobId']
    );

    await databases.createIndex(
      DATABASE_ID,
      'disputes',
      'contractId_index', 
      'key',
      ['contractId']
    );

    await databases.createIndex(
      DATABASE_ID,
      'disputes',
      'status_index',
      'key',
      ['status']
    );

    console.log('✅ disputes collection created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating disputes collection:', error);
    return false;
  }
}

/**
 * Создает все необходимые коллекции для криптоплатежей
 */
export async function setupCryptoCollections() {
  console.log('🚀 Setting up crypto payment collections...');
  
  const escrowResult = await createCryptoEscrowsCollection();
  const disputeResult = await createDisputesCollection();
  
  if (escrowResult && disputeResult) {
    console.log('🎉 All crypto collections created successfully!');
    console.log('📝 Next steps:');
    console.log('1. Deploy smart contracts to testnet');
    console.log('2. Update frontend configuration');
    console.log('3. Test crypto payments end-to-end');
    return true;
  } else {
    console.log('❌ Some collections failed to create. Check the logs above.');
    return false;
  }
}

// Если запускается напрямую
if (require.main === module) {
  setupCryptoCollections()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

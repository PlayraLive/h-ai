import { databases, Permission, Role, DATABASE_ID, COLLECTIONS } from './appwrite/database';

export class OrdersCollectionSetup {
  private readonly DATABASE_ID = DATABASE_ID;
  private readonly ORDERS_COLLECTION = COLLECTIONS.ORDERS;

  // Создать коллекцию заказов с атрибутами
  async createOrdersCollection() {
    try {
      console.log('📦 Creating orders collection...');

      // Создаем коллекцию
      const collection = await databases.createCollection(
        this.DATABASE_ID,
        this.ORDERS_COLLECTION,
        'Orders',
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users())
        ]
      );

      console.log('✅ Orders collection created, adding attributes...');

      // Ждем немного чтобы коллекция была готова
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Создаем атрибуты по одному с задержками
      const attributes = [
        { key: 'userId', type: 'string', size: 50, required: true },
        { key: 'client_id', type: 'string', size: 50, required: false },
        { key: 'specialist_id', type: 'string', size: 50, required: false },
        { key: 'specialistId', type: 'string', size: 50, required: true },
        { key: 'specialistName', type: 'string', size: 100, required: true },
        { key: 'specialistTitle', type: 'string', size: 150, required: true },
        { key: 'tariffId', type: 'string', size: 50, required: true },
        { key: 'tariffName', type: 'string', size: 100, required: true },
        { key: 'amount', type: 'float', required: true },
        { key: 'conversationId', type: 'string', size: 100, required: false },
        { key: 'requirements', type: 'string', size: 2000, required: false },
        { key: 'timeline', type: 'string', size: 100, required: false },
        { key: 'status', type: 'enum', elements: ['pending', 'active', 'completed', 'cancelled'], required: true, default: 'pending' },
        { key: 'createdAt', type: 'datetime', required: true },
        { key: 'updatedAt', type: 'datetime', required: true }
      ];

      for (const attr of attributes) {
        try {
          console.log(`  Adding attribute: ${attr.key}`);

          if (attr.type === 'string') {
            await databases.createStringAttribute(
              this.DATABASE_ID,
              this.ORDERS_COLLECTION,
              attr.key,
              attr.size!,
              attr.required,
              attr.default
            );
          } else if (attr.type === 'float') {
            await databases.createFloatAttribute(
              this.DATABASE_ID,
              this.ORDERS_COLLECTION,
              attr.key,
              attr.required,
              attr.min,
              attr.max,
              attr.default
            );
          } else if (attr.type === 'datetime') {
            await databases.createDatetimeAttribute(
              this.DATABASE_ID,
              this.ORDERS_COLLECTION,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(
              this.DATABASE_ID,
              this.ORDERS_COLLECTION,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === 'enum') {
            await databases.createEnumAttribute(
              this.DATABASE_ID,
              this.ORDERS_COLLECTION,
              attr.key,
              attr.elements!,
              attr.required,
              attr.default
            );
          }

          // Небольшая задержка между атрибутами
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (attrError: any) {
          console.warn(`⚠️ Could not create attribute ${attr.key}:`, attrError.message);
        }
      }

      console.log('✅ Orders collection setup completed');
      return collection;
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️ Orders collection already exists');
        return null;
      }

      throw error;
    }
  }

  // Добавить только атрибут status к существующей коллекции
  async addStatusAttribute() {
    try {
      console.log('📦 Adding status attribute to orders collection...');

      await databases.createEnumAttribute(
        this.DATABASE_ID,
        this.ORDERS_COLLECTION,
        'status',
        ['pending', 'active', 'completed', 'cancelled'],
        true, // required
        'pending' // default value
      );

      console.log('✅ Status attribute added successfully');
      return true;
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️ Status attribute already exists');
        return true;
      }
      
      console.error('❌ Failed to add status attribute:', error.message);
      throw error;
    }
  }

  // Проверить и добавить недостающие атрибуты
  async ensureAllAttributes() {
    try {
      console.log('🔍 Adding status attribute to orders collection...');

      // Просто пытаемся добавить атрибут status
      await databases.createEnumAttribute(
        this.DATABASE_ID,
        this.ORDERS_COLLECTION,
        'status',
        ['pending', 'active', 'completed', 'cancelled'],
        true, // required
        'pending' // default value
      );

      console.log('✅ Status attribute added successfully');
      return true;
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️ Status attribute already exists - это нормально!');
        return true;
      }
      
      console.error('❌ Failed to add status attribute:', error.message);
      return false; // Не бросаем ошибку, просто возвращаем false
    }
  }
}
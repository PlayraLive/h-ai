import { client, databases, account } from './appwrite';

export class AppwriteSetup {
  // Проверить подключение к Appwrite
  static async checkConnection() {
    try {
      console.log('🔍 Checking Appwrite connection...');
      console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
      console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
      
      // Попробуем получить информацию о проекте через account
      const result = await account.get();
      console.log('✅ Connected to Appwrite successfully!');
      console.log('User:', result);
      return { success: true, user: result };
    } catch (error: any) {
      console.error('❌ Appwrite connection failed:', error);
      
      if (error.code === 401) {
        console.log('🔐 User not authenticated - this is normal for setup');
        return { success: true, authenticated: false };
      }
      
      if (error.code === 404) {
        console.error('🚨 Project not found! Please check your Project ID.');
        return { 
          success: false, 
          error: 'Project not found',
          message: 'Please create a project in Appwrite Console or update NEXT_PUBLIC_APPWRITE_PROJECT_ID'
        };
      }
      
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      };
    }
  }

  // Проверить существование базы данных
  static async checkDatabase() {
    try {
      console.log('🗄️ Checking database...');
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
      
      const database = await databases.get(databaseId);
      console.log('✅ Database found:', database.name);
      return { success: true, database };
    } catch (error: any) {
      console.error('❌ Database check failed:', error);
      
      if (error.code === 404) {
        console.error('🚨 Database not found! Please create a database in Appwrite Console.');
        return { 
          success: false, 
          error: 'Database not found',
          message: 'Please create a database with ID: ' + process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
        };
      }
      
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      };
    }
  }

  // Получить список коллекций
  static async listCollections() {
    try {
      console.log('📋 Listing collections...');
      const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
      
      const collections = await databases.listCollections(databaseId);
      console.log('📊 Found collections:', collections.total);
      
      collections.documents.forEach(collection => {
        console.log(`  • ${collection.name} (${collection.$id})`);
      });
      
      return { success: true, collections: collections.documents };
    } catch (error: any) {
      console.error('❌ Failed to list collections:', error);
      return { 
        success: false, 
        error: error.message,
        code: error.code 
      };
    }
  }

  // Полная диагностика
  static async runDiagnostics() {
    console.log('🚀 Running Appwrite diagnostics...');
    
    const results = {
      connection: await this.checkConnection(),
      database: await this.checkDatabase(),
      collections: await this.listCollections()
    };
    
    console.log('📊 Diagnostics complete:', results);
    return results;
  }

  // Получить инструкции по настройке
  static getSetupInstructions() {
    return {
      title: 'Appwrite Setup Instructions',
      steps: [
        {
          step: 1,
          title: 'Create Appwrite Project',
          description: 'Go to https://cloud.appwrite.io and create a new project',
          details: [
            'Click "Create Project"',
            'Enter project name: "H-AI Freelance Platform"',
            'Copy the Project ID',
            'Update NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local'
          ]
        },
        {
          step: 2,
          title: 'Create Database',
          description: 'Create a database in your Appwrite project',
          details: [
            'Go to Database section',
            'Click "Create Database"',
            'Enter database ID: "main_database"',
            'Enter database name: "Main Database"'
          ]
        },
        {
          step: 3,
          title: 'Setup Authentication',
          description: 'Configure authentication methods',
          details: [
            'Go to Auth section',
            'Enable Email/Password authentication',
            'Optionally enable Google OAuth',
            'Set your domain in allowed origins'
          ]
        },
        {
          step: 4,
          title: 'Create Collections',
          description: 'Use our automated script to create collections',
          details: [
            'Run diagnostics to verify connection',
            'Click "Setup Collections & Attributes"',
            'Wait for completion',
            'Verify collections are created'
          ]
        }
      ]
    };
  }
}

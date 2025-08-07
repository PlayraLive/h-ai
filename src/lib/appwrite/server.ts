import { Client, Databases, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite server client with API key for elevated permissions
const serverClient = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// Note: API key will be used in API routes via direct HTTP requests
// The client is configured for basic operations
console.log('🔧 Server client configured for:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);

export const serverDatabases = new Databases(serverClient);
export const serverStorage = new Storage(serverClient);

// Database and Collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export { ID, Query }; 
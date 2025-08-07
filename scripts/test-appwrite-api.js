require('dotenv').config({ path: '.env.local' });
const { Client, Storage } = require('node-appwrite');

console.log('🔍 Testing Appwrite API configuration...');

// Test 1: Client without API key
console.log('\n📋 Test 1: Client without API key');
const clientWithoutKey = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const storageWithoutKey = new Storage(clientWithoutKey);

// Test 2: Client with API key (if supported)
console.log('\n📋 Test 2: Client with API key');
const clientWithKey = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Try to set API key if method exists
if (typeof clientWithKey.setKey === 'function') {
  clientWithKey.setKey(process.env.APPWRITE_API_KEY);
  console.log('✅ API key set using setKey() method');
} else {
  console.log('⚠️ setKey() method not available');
}

const storageWithKey = new Storage(clientWithKey);

// Test 3: Direct HTTP request with API key
console.log('\n📋 Test 3: Direct HTTP request with API key');
async function testDirectAPI() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct API request successful');
      console.log('📋 Buckets found:', data.buckets?.length || 0);
    } else {
      console.log('❌ Direct API request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Direct API request error:', error.message);
  }
}

// Test storage operations
async function testStorageOperations() {
  console.log('\n📋 Testing storage operations...');
  
  try {
    // Test with client without key
    console.log('Testing without API key...');
    const buckets1 = await storageWithoutKey.listBuckets();
    console.log('✅ List buckets without key:', buckets1.buckets.length);
  } catch (error) {
    console.log('❌ List buckets without key failed:', error.message);
  }
  
  try {
    // Test with client with key (if set)
    console.log('Testing with API key...');
    const buckets2 = await storageWithKey.listBuckets();
    console.log('✅ List buckets with key:', buckets2.buckets.length);
  } catch (error) {
    console.log('❌ List buckets with key failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testDirectAPI();
  await testStorageOperations();
}

runTests(); 
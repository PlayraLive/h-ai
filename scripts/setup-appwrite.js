const { Client, Databases, Storage, ID } = require('appwrite');

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('687759fb003c8bd76b93')
    .setKey('YOUR_API_KEY'); // Замените на ваш API ключ

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = 'y687796e3001241f7de17';

async function setupAppwrite() {
    console.log('🚀 Setting up Appwrite collections...');

    try {
        // 1. Users Collection
        await databases.createCollection(
            DATABASE_ID,
            'users',
            'Users',
            [
                { key: 'name', type: 'string', size: 255, required: true },
                { key: 'email', type: 'string', size: 255, required: true },
                { key: 'avatar', type: 'string', size: 500, required: false },
                { key: 'role', type: 'string', size: 50, required: true, default: 'freelancer' },
                { key: 'skills', type: 'string', size: 1000, required: false },
                { key: 'bio', type: 'string', size: 2000, required: false },
                { key: 'hourlyRate', type: 'integer', required: false },
                { key: 'rating', type: 'double', required: false, default: 0 },
                { key: 'totalEarnings', type: 'double', required: false, default: 0 },
                { key: 'completedProjects', type: 'integer', required: false, default: 0 },
                { key: 'isVerified', type: 'boolean', required: false, default: false },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Users collection created');

        // 2. Projects Collection
        await databases.createCollection(
            DATABASE_ID,
            'projects',
            'Projects',
            [
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 5000, required: true },
                { key: 'category', type: 'string', size: 100, required: true },
                { key: 'budget', type: 'double', required: true },
                { key: 'deadline', type: 'datetime', required: false },
                { key: 'status', type: 'string', size: 50, required: true, default: 'open' },
                { key: 'clientId', type: 'string', size: 255, required: true },
                { key: 'freelancerId', type: 'string', size: 255, required: false },
                { key: 'skills', type: 'string', size: 1000, required: false },
                { key: 'attachments', type: 'string', size: 2000, required: false },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'updatedAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Projects collection created');

        // 3. Proposals Collection
        await databases.createCollection(
            DATABASE_ID,
            'proposals',
            'Proposals',
            [
                { key: 'projectId', type: 'string', size: 255, required: true },
                { key: 'freelancerId', type: 'string', size: 255, required: true },
                { key: 'message', type: 'string', size: 3000, required: true },
                { key: 'budget', type: 'double', required: true },
                { key: 'timeline', type: 'string', size: 500, required: false },
                { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Proposals collection created');

        // 4. Messages Collection
        await databases.createCollection(
            DATABASE_ID,
            'messages',
            'Messages',
            [
                { key: 'conversationId', type: 'string', size: 255, required: true },
                { key: 'senderId', type: 'string', size: 255, required: true },
                { key: 'receiverId', type: 'string', size: 255, required: true },
                { key: 'content', type: 'string', size: 2000, required: true },
                { key: 'attachments', type: 'string', size: 1000, required: false },
                { key: 'isRead', type: 'boolean', required: false, default: false },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Messages collection created');

        // 5. Conversations Collection
        await databases.createCollection(
            DATABASE_ID,
            'conversations',
            'Conversations',
            [
                { key: 'participants', type: 'string', size: 500, required: true },
                { key: 'projectId', type: 'string', size: 255, required: false },
                { key: 'lastMessage', type: 'string', size: 500, required: false },
                { key: 'lastMessageAt', type: 'datetime', required: false },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Conversations collection created');

        // 6. Reviews Collection
        await databases.createCollection(
            DATABASE_ID,
            'reviews',
            'Reviews',
            [
                { key: 'projectId', type: 'string', size: 255, required: true },
                { key: 'reviewerId', type: 'string', size: 255, required: true },
                { key: 'revieweeId', type: 'string', size: 255, required: true },
                { key: 'rating', type: 'integer', required: true },
                { key: 'comment', type: 'string', size: 2000, required: false },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Reviews collection created');

        // 7. Payments Collection
        await databases.createCollection(
            DATABASE_ID,
            'payments',
            'Payments',
            [
                { key: 'projectId', type: 'string', size: 255, required: true },
                { key: 'payerId', type: 'string', size: 255, required: true },
                { key: 'payeeId', type: 'string', size: 255, required: true },
                { key: 'amount', type: 'double', required: true },
                { key: 'serviceFee', type: 'double', required: true },
                { key: 'totalAmount', type: 'double', required: true },
                { key: 'method', type: 'string', size: 50, required: true },
                { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
                { key: 'stripePaymentId', type: 'string', size: 255, required: false },
                { key: 'cryptoAddress', type: 'string', size: 255, required: false },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Payments collection created');

        // 8. Notifications Collection
        await databases.createCollection(
            DATABASE_ID,
            'notifications',
            'Notifications',
            [
                { key: 'userId', type: 'string', size: 255, required: true },
                { key: 'type', type: 'string', size: 50, required: true },
                { key: 'title', type: 'string', size: 255, required: true },
                { key: 'message', type: 'string', size: 1000, required: true },
                { key: 'isRead', type: 'boolean', required: false, default: false },
                { key: 'actionUrl', type: 'string', size: 500, required: false },
                { key: 'createdAt', type: 'datetime', required: true }
            ]
        );
        console.log('✅ Notifications collection created');

        console.log('🎉 All collections created successfully!');

    } catch (error) {
        console.error('❌ Error setting up Appwrite:', error);
    }
}

// Run setup
setupAppwrite();

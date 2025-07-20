const { Client, Databases, ID, Permission, Role } = require('node-appwrite');

// Инициализация клиента
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function setupProjectCollections() {
    try {
        console.log('🚀 Setting up project collections...');

        // 1. Active Projects Collection
        console.log('📁 Creating active_projects collection...');
        const activeProjectsCollection = await databases.createCollection(
            DATABASE_ID,
            'active_projects',
            'Active Projects',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        // Добавляем атрибуты для active_projects
        const projectAttributes = [
            { key: 'jobId', type: 'string', size: 255, required: true },
            { key: 'freelancerId', type: 'string', size: 255, required: true },
            { key: 'clientId', type: 'string', size: 255, required: true },
            { key: 'title', type: 'string', size: 500, required: true },
            { key: 'description', type: 'string', size: 5000, required: true },
            { key: 'budget', type: 'double', required: true },
            { key: 'deadline', type: 'datetime', required: true },
            { key: 'status', type: 'string', size: 50, required: true, default: 'active' },
            { key: 'progress', type: 'integer', required: true, default: 0 },
            { key: 'startedAt', type: 'datetime', required: true },
            { key: 'completedAt', type: 'datetime', required: false },
            { key: 'milestones', type: 'string', size: 10000, required: false },
            { key: 'requirements', type: 'string', size: 5000, required: false },
            { key: 'deliverables', type: 'string', size: 5000, required: false }
        ];

        for (const attr of projectAttributes) {
            await databases.createStringAttribute(
                DATABASE_ID,
                'active_projects',
                attr.key,
                attr.size,
                attr.required,
                attr.default
            );
            console.log(`✅ Added attribute: ${attr.key}`);
        }

        // 2. Project Messages Collection
        console.log('📁 Creating project_messages collection...');
        const messagesCollection = await databases.createCollection(
            DATABASE_ID,
            'project_messages',
            'Project Messages',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const messageAttributes = [
            { key: 'projectId', type: 'string', size: 255, required: true },
            { key: 'senderId', type: 'string', size: 255, required: true },
            { key: 'receiverId', type: 'string', size: 255, required: true },
            { key: 'message', type: 'string', size: 5000, required: true },
            { key: 'messageType', type: 'string', size: 50, required: true, default: 'text' },
            { key: 'attachments', type: 'string', size: 2000, required: false },
            { key: 'read', type: 'boolean', required: true, default: false },
            { key: 'timestamp', type: 'datetime', required: true }
        ];

        for (const attr of messageAttributes) {
            if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'project_messages',
                    attr.key,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    'project_messages',
                    attr.key,
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'project_messages',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added message attribute: ${attr.key}`);
        }

        // 3. Project Files Collection
        console.log('📁 Creating project_files collection...');
        const filesCollection = await databases.createCollection(
            DATABASE_ID,
            'project_files',
            'Project Files',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const fileAttributes = [
            { key: 'projectId', type: 'string', size: 255, required: true },
            { key: 'uploadedBy', type: 'string', size: 255, required: true },
            { key: 'fileName', type: 'string', size: 500, required: true },
            { key: 'fileUrl', type: 'string', size: 1000, required: true },
            { key: 'fileType', type: 'string', size: 100, required: true },
            { key: 'fileSize', type: 'integer', required: true },
            { key: 'description', type: 'string', size: 1000, required: false },
            { key: 'category', type: 'string', size: 100, required: true, default: 'general' },
            { key: 'approved', type: 'boolean', required: true, default: false },
            { key: 'feedback', type: 'string', size: 2000, required: false },
            { key: 'uploadedAt', type: 'datetime', required: true }
        ];

        for (const attr of fileAttributes) {
            if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    'project_files',
                    attr.key,
                    attr.required,
                    attr.default
                );
            } else if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    'project_files',
                    attr.key,
                    attr.required
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    'project_files',
                    attr.key,
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'project_files',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added file attribute: ${attr.key}`);
        }

        // 4. Project Milestones Collection
        console.log('📁 Creating project_milestones collection...');
        const milestonesCollection = await databases.createCollection(
            DATABASE_ID,
            'project_milestones',
            'Project Milestones',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );

        const milestoneAttributes = [
            { key: 'projectId', type: 'string', size: 255, required: true },
            { key: 'title', type: 'string', size: 500, required: true },
            { key: 'description', type: 'string', size: 2000, required: false },
            { key: 'dueDate', type: 'datetime', required: true },
            { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
            { key: 'completedAt', type: 'datetime', required: false },
            { key: 'order', type: 'integer', required: true, default: 0 },
            { key: 'payment', type: 'double', required: false },
            { key: 'deliverables', type: 'string', size: 2000, required: false }
        ];

        for (const attr of milestoneAttributes) {
            if (attr.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    'project_milestones',
                    attr.key,
                    attr.required
                );
            } else if (attr.type === 'integer') {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    'project_milestones',
                    attr.key,
                    attr.required,
                    undefined,
                    undefined,
                    attr.default
                );
            } else if (attr.type === 'double') {
                await databases.createFloatAttribute(
                    DATABASE_ID,
                    'project_milestones',
                    attr.key,
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'project_milestones',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default
                );
            }
            console.log(`✅ Added milestone attribute: ${attr.key}`);
        }

        console.log('🎉 All project collections created successfully!');

    } catch (error) {
        console.error('❌ Error setting up collections:', error);
    }
}

// Запуск скрипта
setupProjectCollections();

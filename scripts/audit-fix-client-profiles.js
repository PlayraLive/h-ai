#!/usr/bin/env node
/*
  Audit and fix: ensure every job.clientId has a corresponding users document.
  - Loads env from .env.local
  - Scans jobs
  - For each unique clientId, tries to fetch users/{clientId}
  - If missing, creates a minimal profile with sane defaults using job client data
*/

require('dotenv').config({ path: '.env.local' });

const { Client, Databases, Query, ID, Permission, Role } = require('appwrite');

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
  console.error('❌ Missing required env: ENDPOINT/PROJECT_ID/DATABASE_ID/API_KEY');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

// Some builds of SDK expose setKey; guard to avoid runtime crash
if (typeof client.setKey === 'function') {
  client.setKey(API_KEY);
}

const databases = new Databases(client);

async function listAllJobs(limit = 1000) {
  const pageSize = 100;
  let offset = 0;
  const all = [];
  while (all.length < limit) {
    const res = await databases.listDocuments(
      DATABASE_ID,
      'jobs',
      [Query.orderDesc('$createdAt'), Query.limit(pageSize), Query.offset(offset)]
    );
    all.push(...res.documents);
    if (res.documents.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

async function ensureUserProfile(clientId, sampleJob) {
  try {
    await databases.getDocument(DATABASE_ID, 'users', clientId);
    return { created: false };
  } catch (err) {
    const msg = (err && err.message) || '';
    const notFound = msg.includes('Document with the requested ID could not be found');
    if (!notFound) throw err;

    const now = new Date().toISOString();
    const payload = {
      email: `client_${clientId}@example.local`,
      name: sampleJob.clientName || 'Client',
      avatar: sampleJob.clientAvatar || null,
      userType: 'client',
      bio: '',
      location: sampleJob.location || 'Remote',
      website: '',
      phone: '',
      skills: [],
      hourlyRate: 0,
      totalEarned: 0, // used as Total Spent in UI
      jobsCompleted: 0,
      rating: 4.5,
      reviewsCount: 0,
      verified: true,
      topRated: false,
      availability: 'available',
      languages: [],
      portfolio: [],
      // keep createdAt implicitly by Appwrite
    };

    const permissions = [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any())
    ];
    await databases.createDocument(DATABASE_ID, 'users', clientId, payload, permissions);
    return { created: true };
  }
}

async function main() {
  console.log('🔎 Auditing jobs and client profiles...');
  const jobs = await listAllJobs(1000);
  console.log(`📋 Jobs found: ${jobs.length}`);

  const byClient = new Map();
  for (const j of jobs) {
    if (j.clientId) {
      if (!byClient.has(j.clientId)) byClient.set(j.clientId, j);
    }
  }

  console.log(`👥 Unique clients referenced by jobs: ${byClient.size}`);

  let created = 0;
  for (const [clientId, sampleJob] of byClient.entries()) {
    try {
      const res = await ensureUserProfile(clientId, sampleJob);
      if (res.created) {
        created += 1;
        console.log(`  ✅ Created missing user profile for clientId=${clientId} (name: ${sampleJob.clientName || 'N/A'})`);
      } else {
        console.log(`  ↪️  Profile exists for clientId=${clientId}`);
      }
    } catch (e) {
      console.warn(`  ⚠️  Failed processing clientId=${clientId}: ${e.message || e}`);
    }
  }

  console.log('\n✨ Done. Created profiles:', created);
}

main().catch((e) => {
  console.error('❌ Audit failed:', e.message || e);
  process.exit(1);
});



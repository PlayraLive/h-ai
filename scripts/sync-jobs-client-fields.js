#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const { Client, Databases, Query } = require('appwrite');

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
  console.error('❌ Missing required envs');
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
if (typeof client.setKey === 'function') client.setKey(API_KEY);
const databases = new Databases(client);

async function listAll(collectionId) {
  const page = 100; let off = 0; const out = [];
  while (true) {
    const res = await databases.listDocuments(DATABASE_ID, collectionId, [Query.limit(page), Query.offset(off)]);
    out.push(...res.documents);
    if (res.documents.length < page) break; off += page;
  }
  return out;
}

async function run() {
  console.log('🔁 Sync jobs.clientName/clientAvatar from users...');
  const jobs = await listAll('jobs');
  let updated = 0, skipped = 0;
  for (const j of jobs) {
    if (!j.clientId) { skipped++; continue; }
    try {
      const u = await databases.getDocument(DATABASE_ID, 'users', j.clientId);
      const newName = u.name || j.clientName;
      const newAvatar = u.avatar || j.clientAvatar || null;
      if (newName !== j.clientName || newAvatar !== j.clientAvatar) {
        await databases.updateDocument(DATABASE_ID, 'jobs', j.$id, {
          clientName: newName,
          clientAvatar: newAvatar,
        });
        updated++;
        console.log(`  ✅ ${j.$id} ← ${newName}`);
      } else {
        skipped++;
      }
    } catch (e) {
      console.warn(`  ⚠️  ${j.$id} no user ${j.clientId}: ${e.message || e}`);
    }
  }
  console.log(`✨ Done. Updated: ${updated}, skipped: ${skipped}`);
}

run().catch(e => { console.error('❌ Failed:', e.message || e); process.exit(1); });



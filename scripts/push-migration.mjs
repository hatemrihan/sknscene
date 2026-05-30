#!/usr/bin/env node
/**
 * Push the migration SQL to Supabase by executing it through the JS client.
 * Since the supabase-js client can't run raw DDL, we split into individual
 * statements and execute via the service role + pg-meta API.
 * 
 * Usage: node scripts/push-migration.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// ─── Read .env.local ───────────────────────────────────────────
const envPath = resolve(rootDir, '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx < 0) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];

// ─── Read migration SQL ────────────────────────────────────────
const sqlPath = resolve(rootDir, 'supabase/migrations/001_initial_schema.sql');
const sql = readFileSync(sqlPath, 'utf8');

console.log(`📦 Pushing migration to project: ${projectRef}`);
console.log(`📄 SQL: ${sqlPath} (${sql.length} bytes)\n`);

// ─── Try Management API approach ───────────────────────────────
// The Supabase Management API at api.supabase.com allows SQL execution
// but requires an access token. Let's try the database REST endpoint instead.

// Approach: Use the Supabase pg-meta endpoint (available on self-hosted and some plans)
const endpoints = [
  `${SUPABASE_URL}/pg/query`,
  `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
];

let success = false;

for (const endpoint of endpoints) {
  try {
    console.log(`🔄 Trying: ${endpoint}`);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (res.ok) {
      const result = await res.json();
      console.log('✅ Migration pushed successfully!');
      success = true;
      break;
    } else {
      const text = await res.text();
      console.log(`   ⚠️  Status ${res.status}: ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.log(`   ⚠️  ${err.message}`);
  }
}

if (!success) {
  console.log('\n' + '═'.repeat(60));
  console.log('The API push failed (this is normal for hosted Supabase).');
  console.log('═'.repeat(60));
  console.log('\n📋 MANUAL STEPS — paste the SQL in the Supabase SQL Editor:\n');
  console.log(`   1. Open: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log(`   2. Copy ALL contents of this file:`);
  console.log(`      ${sqlPath}`);
  console.log(`   3. Paste into the SQL editor`);
  console.log(`   4. Click "Run"\n`);
  console.log('📄 Or copy with this command:\n');
  console.log(`   cat "${sqlPath}" | pbcopy\n`);
  console.log('═'.repeat(60));
}

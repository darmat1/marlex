/**
 * Diagnostic script: tests Better Auth sign-in flow directly
 * without any HTTP server layer (Hono, getRequestListener, etc.)
 * 
 * Purpose: isolate whether the hang is in:
 *   A) Better Auth's handler itself
 *   B) The HTTP adapter (Hono/getRequestListener)
 *   C) Vercel's runtime
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';
dotenv.config();

// ─── Schema (same as api/index.ts) ──────────────────────
const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  issuer: text('issuer'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// ─── DB ─────────────────────────────────────────────────
console.log('[1/5] Connecting to database...');
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('FATAL: DATABASE_URL not set');
  process.exit(1);
}
console.log(`  URL: ${connectionString.substring(0, 30)}...`);

const client = postgres(connectionString, { prepare: false, connect_timeout: 10, max: 1 });
const db = drizzle(client, { schema: { user, session, account, verification } });

// ─── Test DB ────────────────────────────────────────────
console.log('[2/5] Testing DB query...');
const users = await client`SELECT id, email FROM "user" LIMIT 5`;
console.log(`  Found ${users.length} user(s):`, users.map(u => u.email));

// ─── Auth ───────────────────────────────────────────────
console.log('[3/5] Creating Better Auth instance...');
const auth = betterAuth({
  baseURL: 'http://localhost:3001',
  secret: process.env.BETTER_AUTH_SECRET || 'test-secret',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: ['http://localhost:5174', 'http://127.0.0.1:5174', 'null'],
});
console.log('  Auth instance created');

// ─── Test get-session ───────────────────────────────────
console.log('[4/5] Testing GET /api/auth/get-session...');
const getSessionStart = Date.now();
try {
  const getReq = new Request('http://localhost:3001/api/auth/get-session', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const getRes = await auth.handler(getReq);
  const getBody = await getRes.text();
  console.log(`  Status: ${getRes.status} (${Date.now() - getSessionStart}ms)`);
  console.log(`  Body: ${getBody.substring(0, 200)}`);
} catch (err: any) {
  console.error(`  ERROR: ${err.message}`);
}

// ─── Test sign-in ───────────────────────────────────────
console.log('[5/5] Testing POST /api/auth/sign-in/email...');
const signInStart = Date.now();

// Set a timeout to detect hanging
const timeout = setTimeout(() => {
  console.error(`  TIMEOUT: sign-in still pending after 15s — auth.handler is hanging!`);
  client.end().then(() => process.exit(1));
}, 15000);

try {
  const postReq = new Request('http://localhost:3001/api/auth/sign-in/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'andrew.darmat@gmail.com',
      password: 'test123456',
    }),
  });
  const postRes = await auth.handler(postReq);
  clearTimeout(timeout);
  const postBody = await postRes.text();
  console.log(`  Status: ${postRes.status} (${Date.now() - signInStart}ms)`);
  console.log(`  Body: ${postBody.substring(0, 300)}`);
} catch (err: any) {
  clearTimeout(timeout);
  console.error(`  ERROR: ${err.message}`);
  console.error(`  Stack: ${err.stack}`);
}

console.log('\n✅ Diagnostic complete');
await client.end();
process.exit(0);

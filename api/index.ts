import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getRequestListener } from '@hono/node-server';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// ─── Schema ──────────────────────────────────────────────
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
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

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  rawInput: text('raw_input'),
  slidesJson: text('slides_json').notNull(),
  telegramPost: text('telegram_post'),
  linkedInPost: text('linkedin_post'),
  threadsJson: text('threads_json'),
  status: text('status').default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Database ────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL || '';
const client = postgres(connectionString, {
  prepare: false,
  connect_timeout: 10,
  idle_timeout: 20,
  max: 1,
});
const db = drizzle(client, {
  schema: { user, session, account, verification, projects },
});

// ─── Auth ────────────────────────────────────────────────
const getBaseUrl = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3001';
};

const auth = betterAuth({
  baseURL: getBaseUrl(),
  secret: process.env.BETTER_AUTH_SECRET || 'marlex-content-engine-super-secret-key-2026',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://marlex.vercel.app',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'app://marlex',
    'null',
  ],
});

// ─── Hono App ────────────────────────────────────────────
const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin) => origin || '*',
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'],
    exposeHeaders: ['Set-Cookie'],
    credentials: true,
  })
);

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', engine: 'Marlex Content Engine', timestamp: new Date().toISOString() });
});

app.get('/api/debug', async (c) => {
  const info: any = {
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'NOT SET',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? 'SET' : 'NOT SET',
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'NOT SET',
      VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
    },
    db: 'untested',
  };
  try {
    const result = await client`SELECT COUNT(*) as count FROM "user"`;
    info.db = `connected, ${result[0].count} users`;
  } catch (err: any) {
    info.db = `error: ${err.message}`;
  }
  return c.json(info);
});

app.get('/api/projects', async (c) => {
  try {
    const allProjects = await db.select().from(projects);
    return c.json({ success: true, data: allProjects });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.post('/api/projects', async (c) => {
  try {
    const body = await c.req.json();
    const newProject = {
      id: body.id || `proj_${Date.now()}`,
      title: body.title,
      rawInput: body.rawInput,
      slidesJson: JSON.stringify(body.slides),
      telegramPost: body.telegramPost,
      linkedInPost: body.linkedInPost,
      threadsJson: JSON.stringify(body.threadsPosts || []),
      status: body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(projects).values(newProject);
    return c.json({ success: true, data: newProject });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default getRequestListener(app.fetch);

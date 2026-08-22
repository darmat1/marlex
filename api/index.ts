import type { IncomingMessage, ServerResponse } from 'node:http';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

// ─── Helper: read body from IncomingMessage ──────────────
function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// ─── Helper: set CORS headers ────────────────────────────
function setCors(req: IncomingMessage, res: ServerResponse): boolean {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

// ─── Helper: convert Node req to Web Request ─────────────
async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await readBody(req) : null;

  return new Request(url, {
    method: req.method || 'GET',
    headers,
    body,
  });
}

// ─── Helper: write Web Response to Node res ──────────────
async function writeWebResponse(webRes: Response, res: ServerResponse) {
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    // Handle multiple Set-Cookie headers
    if (key.toLowerCase() === 'set-cookie') {
      const existing = res.getHeader('set-cookie');
      if (existing) {
        const arr = Array.isArray(existing) ? existing : [String(existing)];
        arr.push(value);
        res.setHeader('set-cookie', arr);
      } else {
        res.setHeader('set-cookie', value);
      }
    } else {
      res.setHeader(key, value);
    }
  });
  const arrayBuffer = await webRes.arrayBuffer();
  res.end(Buffer.from(arrayBuffer));
}

// ─── Main Handler ────────────────────────────────────────
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // CORS preflight
    if (setCors(req, res)) return;

    const pathname = req.url || '/';

    // /api/health
    if (pathname === '/api/health') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok', engine: 'Marlex Content Engine', timestamp: new Date().toISOString() }));
      return;
    }

    // /api/debug
    if (pathname === '/api/debug') {
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
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(info));
      return;
    }

    // /api/auth/** — Better Auth
    if (pathname.startsWith('/api/auth/')) {
      const webReq = await toWebRequest(req);
      console.log(`[auth] ${req.method} ${pathname}`);
      const webRes = await auth.handler(webReq);
      console.log(`[auth] response status: ${webRes.status}`);
      await writeWebResponse(webRes, res);
      return;
    }

    // 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found', path: pathname }));
  } catch (err: any) {
    console.error('[handler] error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message, stack: err.stack }));
  }
}

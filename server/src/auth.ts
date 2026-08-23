import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import * as schema from './db/schema';

const getBaseUrl = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3001';
};

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret) {
  throw new Error(
    'BETTER_AUTH_SECRET is not set. Refusing to start with an insecure default — set it in .env (local) or the deployment environment.'
  );
}

export const trustedOrigins = [
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://marlex.vercel.app',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'app://marlex',
];

export const auth = betterAuth({
  baseURL: getBaseUrl(),
  secret: authSecret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins,
  // Cross-origin cookies (Electron app:// / Vercel-hosted PWA) need SameSite=None,
  // which requires Secure — only safe over the HTTPS production deployment, not local http dev.
  ...(process.env.VERCEL
    ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } }
    : {}),
});

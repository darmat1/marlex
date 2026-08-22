import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL is not defined in environment variables');
}

// Prepare connection for PostgreSQL pooler
export const client = postgres(connectionString || 'postgresql://postgres:postgres@localhost:5432/postgres', { 
  prepare: false 
});

export const db = drizzle(client, { schema });

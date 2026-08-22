import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function migrate() {
  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      "image" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ user');

  await sql`
    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    )
  `;
  console.log('✓ session');

  await sql`
    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "accountId" TEXT NOT NULL,
      "providerId" TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accessToken" TEXT,
      "refreshToken" TEXT,
      "idToken" TEXT,
      "accessTokenExpiresAt" TIMESTAMP,
      "refreshTokenExpiresAt" TIMESTAMP,
      "scope" TEXT,
      "password" TEXT,
      "issuer" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ account');

  await sql`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✓ verification');

  await sql`
    CREATE TABLE IF NOT EXISTS "client_profiles" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT REFERENCES "user"("id") ON DELETE CASCADE,
      "name" TEXT NOT NULL,
      "instagram_handle" TEXT,
      "telegram_channel" TEXT,
      "linkedin_url" TEXT,
      "threads_handle" TEXT,
      "default_bg_color" TEXT DEFAULT '#9B6140',
      "default_accent_color" TEXT DEFAULT '#D1B852',
      "default_font" TEXT DEFAULT 'Source Sans 3',
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ client_profiles');

  await sql`
    CREATE TABLE IF NOT EXISTS "projects" (
      "id" TEXT PRIMARY KEY,
      "user_id" TEXT REFERENCES "user"("id") ON DELETE CASCADE,
      "client_profile_id" TEXT REFERENCES "client_profiles"("id") ON DELETE SET NULL,
      "title" TEXT NOT NULL,
      "raw_input" TEXT,
      "slides_json" TEXT NOT NULL,
      "telegram_post" TEXT,
      "linkedin_post" TEXT,
      "threads_json" TEXT,
      "status" TEXT DEFAULT 'draft',
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✓ projects');

  console.log('\n✅ All tables created successfully!');
  await sql.end();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

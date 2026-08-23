import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { auth, trustedOrigins } from './auth';
import { db } from './db';
import { projects, clientProfiles } from './db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// CORS for Desktop App and Browser — explicit allowlist, no reflected/wildcard origin.
app.use(
  '*',
  cors({
    origin: (origin) => trustedOrigins.find((o) => o === origin),
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PUT'],
    exposeHeaders: ['Set-Cookie'],
    credentials: true,
  })
);

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

// Root landing page
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', engine: 'Marlex Content Engine', timestamp: new Date().toISOString() });
});

// Database API: List the signed-in user's own projects
app.get('/api/projects', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  try {
    const userProjects = await db.select().from(projects).where(eq(projects.userId, session.user.id));
    return c.json({ success: true, data: userProjects });
  } catch (err: any) {
    console.error('[projects] list error:', err);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Database API: Create a project owned by the signed-in user
app.post('/api/projects', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  try {
    const body = await c.req.json();
    const newProject = {
      id: body.id || `proj_${Date.now()}`,
      userId: session.user.id,
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

    // Upsert: creates a new project, or updates it in place if the id already
    // exists — but only when the existing row is owned by this same user.
    await db
      .insert(projects)
      .values(newProject)
      .onConflictDoUpdate({
        target: projects.id,
        set: {
          title: newProject.title,
          rawInput: newProject.rawInput,
          slidesJson: newProject.slidesJson,
          telegramPost: newProject.telegramPost,
          linkedInPost: newProject.linkedInPost,
          threadsJson: newProject.threadsJson,
          status: newProject.status,
          updatedAt: newProject.updatedAt,
        },
        setWhere: eq(projects.userId, session.user.id),
      });
    return c.json({ success: true, data: newProject });
  } catch (err: any) {
    console.error('[projects] create error:', err);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

export { app };
export default app;

// Only launch standalone node server when run directly (not in Vercel Serverless environment)
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3001;
  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (info) => {
      console.log(`🚀 Marlex Server running on http://localhost:${info.port}`);
    }
  );
}

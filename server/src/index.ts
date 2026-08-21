import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { auth } from './auth';
import { db } from './db';
import { projects, clientProfiles } from './db/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

// CORS for Desktop App and Browser
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

// Better Auth handler
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

// Root landing page
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', engine: 'Marlex Content Engine', timestamp: new Date().toISOString() });
});

// Database API: List user projects
app.get('/api/projects', async (c) => {
  try {
    const allProjects = await db.select().from(projects);
    return c.json({ success: true, data: allProjects });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Database API: Create or update project
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

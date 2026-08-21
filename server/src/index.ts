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
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>Marlex Content Engine Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #09090b;
            color: #f4f4f5;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .card {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            padding: 32px;
            max-width: 480px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            text-align: center;
          }
          .badge {
            display: inline-block;
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.2);
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          h1 { margin: 0 0 8px; font-size: 22px; font-weight: 800; }
          p { color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0 0 24px; }
          .endpoints {
            text-align: left;
            background: #09090b;
            border-radius: 8px;
            padding: 16px;
            font-size: 12px;
            font-family: monospace;
          }
          .endpoints div { margin-bottom: 6px; color: #d4d4d8; }
          .endpoints span { color: #f59e0b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● SERVER ONLINE & CONNECTED</div>
          <h1>Marlex Server API</h1>
          <p>Центральный сервер синхронизации контента и авторизации Better Auth подключен к Supabase PostgreSQL.</p>
          <div class="endpoints">
            <div><span>GET</span>  /api/health</div>
            <div><span>ALL</span>  /api/auth/*</div>
            <div><span>GET</span>  /api/projects</div>
            <div><span>POST</span> /api/projects</div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'Marlex Content Engine Server',
    database: 'Supabase PostgreSQL (Connected)',
    timestamp: new Date().toISOString(),
  });
});

// Projects sync endpoints
app.get('/api/projects', async (c) => {
  try {
    const list = await db.select().from(projects);
    return c.json({ success: true, data: list });
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

const PORT = 3001;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`🚀 Marlex Server is running on http://localhost:${info.port}`);
  }
);

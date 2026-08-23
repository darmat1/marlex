import type { IncomingMessage, ServerResponse } from 'node:http';
import { app } from '../server/src/index';
import { toWebRequest, writeWebResponse } from './http-bridge';

// ─── Main Handler ─────────────────────────────────────────
// Delegates to the shared Hono app (server/src/index.ts) so schema, auth,
// CORS and routes have exactly one implementation. See repodocs/decisions.md#ADR-002.
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const webReq = await toWebRequest(req);
    const webRes = await app.fetch(webReq);
    await writeWebResponse(webRes, res);
  } catch (err: any) {
    console.error('[handler] error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

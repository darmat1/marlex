import { describe, it, expect } from 'vitest';
import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { toWebRequest, writeWebResponse } from './http-bridge';

function makeReq(opts: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
}): IncomingMessage {
  const req = new EventEmitter() as unknown as IncomingMessage;
  req.method = opts.method || 'GET';
  req.url = opts.url || '/api/health';
  req.headers = opts.headers || {};
  queueMicrotask(() => {
    if (opts.body) req.emit('data', Buffer.from(opts.body));
    req.emit('end');
  });
  return req;
}

function makeRes() {
  const headers: Record<string, string | string[]> = {};
  let statusCode = 200;
  let ended: Buffer | null = null;
  const res = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(v: number) {
      statusCode = v;
    },
    setHeader: (k: string, v: string | string[]) => {
      headers[k.toLowerCase()] = v;
    },
    getHeader: (k: string) => headers[k.toLowerCase()],
    end: (buf?: Buffer) => {
      ended = buf ?? null;
    },
  } as unknown as ServerResponse;
  return {
    res,
    getStatus: () => statusCode,
    getHeaders: () => headers,
    getBody: () => (ended as unknown as Buffer | null)?.toString('utf-8') ?? '',
  };
}

describe('toWebRequest', () => {
  it('builds a Web Request with the right method, url, and headers', async () => {
    const req = makeReq({ method: 'GET', url: '/api/health', headers: { host: 'example.com', 'x-forwarded-proto': 'https' } });
    const webReq = await toWebRequest(req);
    expect(webReq.method).toBe('GET');
    expect(webReq.url).toBe('https://example.com/api/health');
  });

  it('omits a body for GET/HEAD requests', async () => {
    const req = makeReq({ method: 'GET' });
    const webReq = await toWebRequest(req);
    expect(webReq.body).toBeNull();
  });

  it('carries the request body through for POST requests', async () => {
    const req = makeReq({ method: 'POST', url: '/api/projects', headers: { host: 'example.com', 'content-type': 'application/json' }, body: '{"title":"x"}' });
    const webReq = await toWebRequest(req);
    const text = await webReq.text();
    expect(text).toBe('{"title":"x"}');
  });

  it('falls back to http/localhost when forwarding headers are absent', async () => {
    const req = makeReq({ method: 'GET', url: '/api/health', headers: {} });
    const webReq = await toWebRequest(req);
    expect(webReq.url).toBe('https://localhost/api/health');
  });
});

describe('writeWebResponse', () => {
  it('copies status, headers, and body onto the Node response', async () => {
    const webRes = new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
    const { res, getStatus, getHeaders, getBody } = makeRes();
    await writeWebResponse(webRes, res);
    expect(getStatus()).toBe(201);
    expect(getHeaders()['content-type']).toBe('application/json');
    expect(getBody()).toBe('{"ok":true}');
  });

  it('accumulates multiple Set-Cookie headers instead of overwriting', async () => {
    const headers = new Headers();
    headers.append('Set-Cookie', 'a=1');
    headers.append('Set-Cookie', 'b=2');
    const webRes = new Response(null, { status: 200, headers });
    const { res, getHeaders } = makeRes();
    await writeWebResponse(webRes, res);
    expect(getHeaders()['set-cookie']).toEqual(['a=1', 'b=2']);
  });
});

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cloudflareEnv } from 'cloudflare:workers';

interface D1PreparedStatement {
  first<T = unknown>(): Promise<T | null>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

export const GET: APIRoute = async () => {
  const startedAt = Date.now();
  const env = cloudflareEnv as Record<string, unknown>;
  const websiteDb = env.DB as D1Database | undefined;
  const cmsDb = env.EMDASH_DB as D1Database | undefined;

  if (!websiteDb || !cmsDb) {
    return new Response(JSON.stringify({ status: 'unavailable' }), {
      status: 503,
      headers,
    });
  }

  try {
    await Promise.all([
      websiteDb.prepare('SELECT 1 AS ok').first(),
      cmsDb.prepare('SELECT COUNT(*) AS count FROM _emdash_collections').first(),
    ]);

    return new Response(JSON.stringify({
      status: 'ok',
      services: { website: 'ok', database: 'ok', cms: 'ok' },
      responseTimeMs: Date.now() - startedAt,
    }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ status: 'unavailable' }), {
      status: 503,
      headers,
    });
  }
};

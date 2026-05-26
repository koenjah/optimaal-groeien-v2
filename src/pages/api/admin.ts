export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cloudflareEnv } from 'cloudflare:workers';

// D1 database type (Cloudflare runtime binding)
interface D1Result<T = Record<string, unknown>> { results: T[]; success: boolean; }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<{ success: boolean }>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

interface ScanRow {
  id: string;
  timestamp: string;
  naam: string;
  email: string;
  functie: string;
  website: string;
  sector: string;
  commercieel_team: string;
  lead_kanalen: string;
  classification: string;
  summary_line: string;
  score_commercieel: number;
  score_digitaal: number;
  score_ai: number;
  score_groei: number;
}

export const POST: APIRoute = async ({ request }) => {
  const cfEnv = cloudflareEnv as Record<string, unknown>;
  const adminPassword = cfEnv.ADMIN_PASSWORD as string | undefined;
  const db = cfEnv.DB as D1Database | undefined;

  // Auth check
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!adminPassword || token !== adminPassword) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database not configured' }),
      { status: 500, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json() as { action?: string; pageSize?: number; offset?: number };
    const action = body.action ?? 'list';

    if (action === 'list') {
      const pageSize = Math.min(body.pageSize ?? 50, 200);
      const offset = body.offset ?? 0;

      const result = await db.prepare(
        `SELECT id, timestamp, naam, email, functie, website, sector,
                commercieel_team, lead_kanalen, classification, summary_line,
                score_commercieel, score_digitaal, score_ai, score_groei
         FROM scan_entries
         ORDER BY timestamp DESC
         LIMIT ? OFFSET ?`
      ).bind(pageSize, offset).all<ScanRow>();

      const entries = (result.results ?? []).map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        naam: r.naam ?? '',
        email: r.email ?? '',
        functie: r.functie ?? '',
        website: r.website ?? '',
        sector: r.sector ?? '',
        commercieelTeam: r.commercieel_team ?? '',
        leadKanalen: r.lead_kanalen ?? '',
        classification: r.classification ?? '',
        summaryLine: r.summary_line ?? '',
        scores: {
          commercieel: r.score_commercieel ?? 0,
          digitaal: r.score_digitaal ?? 0,
          ai: r.score_ai ?? 0,
          groei: r.score_groei ?? 0,
        },
      }));

      // Cursor-style pagination: pass back offset for next page
      const nextOffset = entries.length === pageSize ? offset + pageSize : null;

      return new Response(
        JSON.stringify({ success: true, entries, nextPageToken: nextOffset !== null ? String(nextOffset) : undefined }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action' }),
      { status: 400, headers: corsHeaders }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: corsHeaders }
    );
  }
};

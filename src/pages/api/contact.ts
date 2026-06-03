export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cloudflareEnv } from 'cloudflare:workers';

const RECIPIENT_EMAIL = 'sales@optimaalgroeien.nl';
const SENDER_EMAIL = 'website@optimaalgroeien.nl';

interface ContactInput {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message: string;
  pageUrl?: string;
  source?: string;
  website?: string;
}

interface D1Result {
  success: boolean;
  meta?: unknown;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface EmailMessageBuilder {
  to: string;
  from: {
    email: string;
    name: string;
  };
  replyTo: {
    email: string;
    name: string;
  };
  subject: string;
  text: string;
}

interface SendEmailBinding {
  send(message: EmailMessageBuilder): Promise<void>;
}

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function clean(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function cleanMultiline(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().slice(0, maxLength);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').replace(/"/g, "'").trim();
}

function buildEmail(input: ContactInput, request: Request): EmailMessageBuilder {
  const subjectSuffix = input.company ? ` - ${input.company}` : '';
  const subject = headerSafe(`Nieuw contactformulier Optimaal Groeien${subjectSuffix}`);
  const submittedAt = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') ?? '';
  const referrer = request.headers.get('referer') ?? '';

  const body = [
    'Nieuwe contactaanvraag via optimaalgroeien.nl',
    '',
    `Naam: ${input.name}`,
    `E-mail: ${input.email}`,
    `Bedrijf: ${input.company}`,
    `Telefoon: ${input.phone || '-'}`,
    `Bron: ${input.source || 'contactpagina'}`,
    `Pagina: ${input.pageUrl || '-'}`,
    '',
    'Bericht:',
    input.message,
    '',
    'Technisch:',
    `Ingediend op: ${submittedAt}`,
    `Referrer: ${referrer || '-'}`,
    `User agent: ${userAgent || '-'}`,
  ].join('\n');

  return {
    to: RECIPIENT_EMAIL,
    from: {
      email: SENDER_EMAIL,
      name: 'Optimaal Groeien Website',
    },
    replyTo: {
      email: input.email,
      name: headerSafe(input.name),
    },
    subject,
    text: body,
  };
}

async function ensureContactTable(db: D1Database): Promise<void> {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      message TEXT NOT NULL,
      page_url TEXT,
      source TEXT,
      user_agent TEXT,
      referrer TEXT,
      email_sent INTEGER DEFAULT 0
    )`
  ).run();

  await db.prepare(
    'CREATE INDEX IF NOT EXISTS idx_contact_submissions_timestamp ON contact_submissions(timestamp DESC)'
  ).run();
}

async function saveSubmission(
  input: ContactInput,
  request: Request,
  db: D1Database,
  emailSent: boolean,
): Promise<void> {
  await ensureContactTable(db);

  await db.prepare(
    `INSERT INTO contact_submissions (
      id, timestamp, name, email, company, phone, message, page_url,
      source, user_agent, referrer, email_sent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    crypto.randomUUID(),
    new Date().toISOString(),
    input.name,
    input.email,
    input.company,
    input.phone ?? '',
    input.message,
    input.pageUrl ?? '',
    input.source ?? 'contactpagina',
    request.headers.get('user-agent') ?? '',
    request.headers.get('referer') ?? '',
    emailSent ? 1 : 0,
  ).run();
}

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
      { status: 400, headers: jsonHeaders },
    );
  }

  const p = payload as Record<string, unknown>;
  const input: ContactInput = {
    name: clean(p.name, 160),
    email: clean(p.email, 160).toLowerCase(),
    company: clean(p.company, 180),
    phone: clean(p.phone, 80),
    message: cleanMultiline(p.message, 4000),
    pageUrl: clean(p.pageUrl, 500),
    source: clean(p.source, 120) || 'contactpagina',
    website: clean(p.website, 200),
  };

  if (input.website) {
    return new Response(JSON.stringify({ success: true, spam: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  }

  if (!input.name || !input.company || !input.message || !isValidEmail(input.email)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing or invalid required fields' }),
      { status: 422, headers: jsonHeaders },
    );
  }

  const cfEnv = cloudflareEnv as Record<string, unknown>;
  const db = cfEnv.DB as D1Database | undefined;
  const emailBinding = cfEnv.CONTACT_EMAIL as SendEmailBinding | undefined;

  let emailSent = false;
  let emailError = '';

  if (emailBinding?.send) {
    try {
      await emailBinding.send(buildEmail(input, request));
      emailSent = true;
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Unknown email error';
      console.error('Contact email failed:', emailError);
    }
  }

  if (db) {
    await saveSubmission(input, request, db, emailSent).catch((error) => {
      console.error('Contact D1 save failed:', error);
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      emailSent,
      stored: Boolean(db),
      ...(emailError ? { emailError } : {}),
    }),
    { status: 200, headers: jsonHeaders },
  );
};

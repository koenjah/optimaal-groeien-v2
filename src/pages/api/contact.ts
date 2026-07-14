export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cloudflareEnv } from 'cloudflare:workers';

const DEFAULT_RECIPIENT_EMAIL = 'marketing@optimaalgroeien.nl';
const DEFAULT_SENDER_EMAIL = 'website@optimaalgroeien.nl';
const DEFAULT_RESEND_FROM = 'Optimaal Groeien <website@send.closersmatch.com>';

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

function buildEmail(
  input: ContactInput,
  request: Request,
  recipientEmail = DEFAULT_RECIPIENT_EMAIL,
  senderEmail = DEFAULT_SENDER_EMAIL,
): EmailMessageBuilder {
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
    to: recipientEmail,
    from: {
      email: senderEmail,
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

function envString(env: Record<string, unknown>, key: string): string {
  const value = env[key];
  return typeof value === 'string' ? value.trim() : '';
}

function formatReplyTo(replyTo: EmailMessageBuilder['replyTo']): string {
  return `${headerSafe(replyTo.name)} <${replyTo.email}>`;
}

async function sendWithResend(
  apiKey: string,
  from: string,
  message: EmailMessageBuilder,
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      reply_to: formatReplyTo(message.replyTo),
      subject: message.subject,
      text: message.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Resend ${response.status}: ${body.slice(0, 240)}`);
  }
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
  const recipientEmail =
    clean(envString(cfEnv, 'CONTACT_TO_EMAIL') || envString(cfEnv, 'CONTACT_RECIPIENT_EMAIL'), 160) ||
    DEFAULT_RECIPIENT_EMAIL;
  const senderEmail = clean(envString(cfEnv, 'CONTACT_FROM_EMAIL'), 160) || DEFAULT_SENDER_EMAIL;
  const resendFrom = envString(cfEnv, 'RESEND_FROM_EMAIL') || DEFAULT_RESEND_FROM;
  const resendApiKey = envString(cfEnv, 'RESEND_API_KEY');
  const emailMessage = buildEmail(input, request, recipientEmail, senderEmail);

  let emailSent = false;
  let emailError = '';
  let emailProvider = '';

  if (resendApiKey) {
    try {
      await sendWithResend(resendApiKey, resendFrom, emailMessage);
      emailSent = true;
      emailProvider = 'resend';
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Unknown Resend error';
      console.error('Contact Resend email failed:', emailError);
    }
  }

  if (!emailSent && emailBinding?.send) {
    try {
      await emailBinding.send(emailMessage);
      emailSent = true;
      emailProvider = 'cloudflare-send-email';
    } catch (error) {
      const fallbackError = error instanceof Error ? error.message : 'Unknown email error';
      emailError = emailError ? `${emailError}; fallback: ${fallbackError}` : fallbackError;
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
      ...(emailProvider ? { emailProvider } : {}),
      stored: Boolean(db),
      ...(emailError ? { emailError } : {}),
    }),
    { status: 200, headers: jsonHeaders },
  );
};

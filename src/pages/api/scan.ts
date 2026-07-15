export const prerender = false;

import type { APIRoute } from 'astro';
import { env as cloudflareEnv } from 'cloudflare:workers';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScanInput {
  sector?: string;
  bedrijfsbeschrijving: string;
  websiteUrl: string;
  linkedinUrl?: string;
  leadKanalen: string[];
  leadsPerMaand?: string;
  salesProces?: string;
  leadOpvolging?: string;
  crmGebruik?: string;
  crmSysteem?: string;
  salesFrustratie: string;
  tijdvretendeTaken: string;
  aiToolsGebruik?: string;
  aiTools?: string;
  commercieelTeam?: string;
  ambitie: string;
  belemmering: string;
  contactVoornaam: string;
  contactAchternaam: string;
  contactEmail: string;
  contactFunctie?: string;
}

interface CrawlData {
  title: string | null;
  metaDescription: string | null;
  h1s: string[];
  h2s: string[];
  hasBlog: boolean;
  ctaLinkCount: number;
  hasOverOns: boolean;
  hasContact: boolean;
  hasDiensten: boolean;
  hasSocialProof: boolean;
}

interface AnalysisReport {
  scores: {
    commercieleSlagkracht: number;
    digitaleAanwezigheid: number;
    aiReadiness: number;
    groeiPotentieel: number;
  };
  classification: 'groen' | 'geel' | 'rood';
  summaryLine: string;
  crawlObservaties: string[];
  quickWins: Array<{
    titel: string;
    beschrijving: string;
    tijdsinvestering: string;
    impact: string;
  }>;
  strategischeInzetten: Array<{
    titel: string;
    beschrijving: string;
    roi: string;
    investering: string;
  }>;
  roadmap: {
    q1: { thema: string; focus: string; acties: string[] };
    q2: { thema: string; focus: string; acties: string[] };
    q3: { thema: string; focus: string; acties: string[] };
    q4: { thema: string; focus: string; acties: string[] };
  };
  cta: {
    headline: string;
    body: string;
    button: string;
  };
}

// ─── Website Crawl ────────────────────────────────────────────────────────────

async function crawlWebsite(url: string): Promise<CrawlData | null> {
  try {
    // Normalise URL
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let html: string;
    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; OptimaalGroeienBot/1.0; +https://optimaalgroeien.nl)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeout);
      if (!response.ok) return null;
      html = await response.text();
    } catch {
      clearTimeout(timeout);
      return null;
    }

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Meta description
    const metaMatch = html.match(
      /<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=\s*["']([^"']+)["']/i
    ) || html.match(
      /<meta[^>]+content\s*=\s*["']([^"']+)["'][^>]+name\s*=\s*["']description["']/i
    );
    const metaDescription = metaMatch ? metaMatch[1].trim() : null;

    // H1 tags (first 5)
    const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
    const h1s: string[] = [];
    let h1Match: RegExpExecArray | null;
    while ((h1Match = h1Regex.exec(html)) !== null && h1s.length < 5) {
      const text = h1Match[1].replace(/<[^>]+>/g, '').trim();
      if (text) h1s.push(text);
    }

    // H2 tags (first 5)
    const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
    const h2s: string[] = [];
    let h2Match: RegExpExecArray | null;
    while ((h2Match = h2Regex.exec(html)) !== null && h2s.length < 5) {
      const text = h2Match[1].replace(/<[^>]+>/g, '').trim();
      if (text) h2s.push(text);
    }

    // Blog/nieuws presence
    const hasBlog = /href\s*=\s*["'][^"']*\/(blog|nieuws|artikelen|insights|kennisbank)[/"']/i.test(html);

    // CTA links (calendly, contact forms, formulier)
    const ctaRegex = /href\s*=\s*["'][^"']*(calendly\.com|\/contact|\/formulier|\/afspraak|\/demo|\/gratis)[^"']*["']/gi;
    const ctaMatches = html.match(ctaRegex);
    const ctaLinkCount = ctaMatches ? ctaMatches.length : 0;

    // Key page presence (look in <a href="..."> links)
    const hrefBlock = html.toLowerCase();
    const hasOverOns = /href\s*=\s*["'][^"']*\/(over-ons|over-ons|about|wie-zijn-wij)[/"']/i.test(html);
    const hasContact = /href\s*=\s*["'][^"']*\/contact[/"']/i.test(html);
    const hasDiensten = /href\s*=\s*["'][^"']*\/(diensten|services|oplossingen|wat-wij-doen)[/"']/i.test(html);

    // Social proof indicators in visible text
    const textContent = html.replace(/<[^>]+>/g, ' ');
    const hasSocialProof =
      /\b(klanten|ervaringen|reviews?|testimonials?|referenties|succesverhalen|cases?|resultaten)\b/i.test(
        textContent
      );

    return {
      title,
      metaDescription,
      h1s,
      h2s,
      hasBlog,
      ctaLinkCount,
      hasOverOns,
      hasContact,
      hasDiensten,
      hasSocialProof,
    };
  } catch {
    return null;
  }
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildCrawlBullets(crawl: CrawlData | null): string {
  if (!crawl) {
    return '- Website kon niet worden gecrawld (timeout of onbereikbaar)';
  }

  const lines: string[] = [];

  if (crawl.title) lines.push(`- Paginatitel: "${crawl.title}"`);
  if (crawl.metaDescription) lines.push(`- Meta description: "${crawl.metaDescription}"`);

  if (crawl.h1s.length > 0) {
    lines.push(`- H1 tags: ${crawl.h1s.map((h) => `"${h}"`).join(', ')}`);
  } else {
    lines.push('- H1 tags: geen gevonden');
  }

  if (crawl.h2s.length > 0) {
    lines.push(`- H2 tags: ${crawl.h2s.map((h) => `"${h}"`).join(', ')}`);
  }

  lines.push(`- Blog/kennisbank aanwezig: ${crawl.hasBlog ? 'Ja' : 'Nee'}`);
  lines.push(
    `- CTA links (contact/afspraak/demo): ${crawl.ctaLinkCount > 0 ? `${crawl.ctaLinkCount} gevonden` : 'geen gevonden'}`
  );
  lines.push(
    `- Kernpagina's: Over ons: ${crawl.hasOverOns ? '✓' : '✗'} | Contact: ${crawl.hasContact ? '✓' : '✗'} | Diensten: ${crawl.hasDiensten ? '✓' : '✗'}`
  );
  lines.push(`- Social proof / testimonials: ${crawl.hasSocialProof ? 'aanwezig' : 'niet gevonden'}`);

  return lines.join('\n');
}

function buildPrompt(body: ScanInput, crawl: CrawlData | null): string {
  const leadKanalen = Array.isArray(body.leadKanalen) ? body.leadKanalen.join(', ') : body.leadKanalen;
  const crmInfo = body.crmGebruik === 'ja' && body.crmSysteem
    ? `Ja (${body.crmSysteem})`
    : body.crmGebruik;
  const aiInfo = body.aiToolsGebruik === 'ja' && body.aiTools
    ? `Ja (${body.aiTools})`
    : body.aiToolsGebruik;

  const crawlBullets = buildCrawlBullets(crawl);

  return `Je bent een senior commercieel adviseur bij Optimaal Groeien, gespecialiseerd in B2B bedrijven in de technische sector (machinebouw, installatie, logistiek, bouw, engineering).

Je taak: analyseer het onderstaande bedrijf en genereer een gepersonaliseerd AI-analyse rapport. Wees specifiek, concreet en eerlijk. Gebruik de bedrijfsinformatie om écht gepersonaliseerde adviezen te geven — geen generiek advies.

BEDRIJFSINFORMATIE:
- Sector: ${body.sector || 'Niet opgegeven'}
- Beschrijving: ${body.bedrijfsbeschrijving}
- Website: ${body.websiteUrl}${body.linkedinUrl ? `\n- LinkedIn: ${body.linkedinUrl}` : ''}
- Commercieel team: ${body.commercieelTeam || 'Niet opgegeven'}
- Hoe komen klanten binnen: ${leadKanalen || 'Niet opgegeven'}
- Leads per maand: ${body.leadsPerMaand || 'Niet opgegeven'}
- Salesproces / opvolging: ${body.salesProces || 'Niet specifiek beschreven'}
- Lead opvolging snelheid: ${body.leadOpvolging || 'Niet opgegeven'}
- CRM gebruik: ${crmInfo || 'Niet opgegeven'}
- Grootste sales frustratie: ${body.salesFrustratie}
- Tijdvretende taken: ${body.tijdvretendeTaken}
- AI tools gebruik: ${aiInfo || 'Niet opgegeven'}
- 12-maanden ambitie: ${body.ambitie}
- Belemmering: ${body.belemmering}

WEBSITE ANALYSE (gecrawld):
${crawlBullets}

OPDRACHT:
Genereer een gepersonaliseerd rapport als JSON. Returneer ALLEEN het JSON object, geen andere tekst of markdown.

Scoringsgids:
- commercieleSlagkracht (1-10): gebaseerd op salesproces, leadvolume, CRM gebruik, en genoemde frustraties
- digitaleAanwezigheid (1-10): gebaseerd op website crawl resultaten en leadkanalen
- aiReadiness (1-10): gebaseerd op huidig AI gebruik, tijdvretende taken en openheid voor verandering
- groeiPotentieel (1-10): gebaseerd op alignment tussen ambitie en belemmering

Classificatiegids:
- "groen": gemiddelde score > 6.5 EN belemmering is overkomelijk
- "geel": gemiddelde score 4-6.5 OF significante belemmeringen
- "rood": gemiddelde score < 4 OF ernstige structurele belemmeringen

Format (geef ALLEEN dit JSON object terug, geen extra tekst):
{
  "scores": {
    "commercieleSlagkracht": 7,
    "digitaleAanwezigheid": 5,
    "aiReadiness": 4,
    "groeiPotentieel": 8
  },
  "classification": "geel",
  "summaryLine": "één zin die de huidige commerciële situatie van dit bedrijf scherp samenvat",
  "crawlObservaties": [
    "observatie 1 over de website — specifiek en concreet",
    "observatie 2",
    "observatie 3"
  ],
  "quickWins": [
    {
      "titel": "Korte actietitel",
      "beschrijving": "Concrete beschrijving van de quick win, specifiek voor dit bedrijf",
      "tijdsinvestering": "X uur per week",
      "impact": "Hoog"
    },
    {
      "titel": "Tweede quick win",
      "beschrijving": "...",
      "tijdsinvestering": "...",
      "impact": "Gemiddeld"
    },
    {
      "titel": "Derde quick win",
      "beschrijving": "...",
      "tijdsinvestering": "...",
      "impact": "Hoog"
    }
  ],
  "strategischeInzetten": [
    {
      "titel": "Strategische inzet naam",
      "beschrijving": "Wat dit concreet betekent voor dit bedrijf",
      "roi": "Geschatte ROI of resultaat",
      "investering": "Benodigde investering"
    },
    {
      "titel": "Tweede strategische inzet",
      "beschrijving": "...",
      "roi": "...",
      "investering": "..."
    }
  ],
  "roadmap": {
    "q1": {
      "thema": "Fundering",
      "focus": "Kernfocus voor Q1 2026 specifiek voor dit bedrijf",
      "acties": ["actie 1", "actie 2", "actie 3"]
    },
    "q2": {
      "thema": "Acceleratie",
      "focus": "Kernfocus voor Q2 2026",
      "acties": ["actie 1", "actie 2", "actie 3"]
    },
    "q3": {
      "thema": "Schaling",
      "focus": "Kernfocus voor Q3 2026",
      "acties": ["actie 1", "actie 2", "actie 3"]
    },
    "q4": {
      "thema": "Optimalisatie",
      "focus": "Kernfocus voor Q4 2026",
      "acties": ["actie 1", "actie 2", "actie 3"]
    }
  },
  "cta": {
    "headline": "Pakkende kop afgestemd op de classificatie en situatie van dit bedrijf",
    "body": "2-3 zinnen die direct aansluiten bij de geïdentificeerde kansen en belemmeringen van dit bedrijf",
    "button": "Knoptekst"
  }
}`;
}

// ─── OpenRouter (Claude) Call ─────────────────────────────────────────────────

async function callClaude(prompt: string, apiKey: string): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://optimaalgroeien.nl',
          'X-Title': 'Optimaal Groeien AI Scan',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-haiku-4.5',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'unknown error');
        throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const rawText = data?.choices?.[0]?.message?.content;
      if (!rawText) {
        throw new Error('Empty response from API');
      }

      return parseReportJson(rawText);
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 900));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unknown AI error');
}

function parseReportJson(rawText: string): unknown {
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('AI returned invalid JSON');
  }
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

function classify(scores: AnalysisReport['scores']): AnalysisReport['classification'] {
  const average =
    (scores.commercieleSlagkracht +
      scores.digitaleAanwezigheid +
      scores.aiReadiness +
      scores.groeiPotentieel) /
    4;
  if (average > 6.5) return 'groen';
  if (average >= 4) return 'geel';
  return 'rood';
}

function buildFallbackReport(body: ScanInput, crawl: CrawlData | null): AnalysisReport {
  const channelCount = Array.isArray(body.leadKanalen) ? body.leadKanalen.length : 0;
  const hasCrm = /^ja$/i.test(body.crmGebruik ?? '');
  const usesAi = /^ja$/i.test(body.aiToolsGebruik ?? '');
  const websiteScore = crawl
    ? 3 + (crawl.hasContact ? 1 : 0) + (crawl.hasDiensten ? 1 : 0) + (crawl.hasBlog ? 1 : 0) +
      (crawl.hasSocialProof ? 1 : 0) + Math.min(2, crawl.ctaLinkCount)
    : 3;

  const scores = {
    commercieleSlagkracht: clampScore(3 + channelCount + (hasCrm ? 2 : 0) + (body.leadOpvolging ? 1 : 0)),
    digitaleAanwezigheid: clampScore(websiteScore),
    aiReadiness: clampScore(3 + (usesAi ? 3 : 0) + (body.tijdvretendeTaken ? 2 : 0)),
    groeiPotentieel: clampScore(5 + (body.ambitie ? 2 : 0) - (body.belemmering ? 1 : 0)),
  };
  const classification = classify(scores);
  const websiteName = body.websiteUrl || 'de website';

  return {
    scores,
    classification,
    summaryLine:
      `${body.bedrijfsbeschrijving.slice(0, 120)}${body.bedrijfsbeschrijving.length > 120 ? '...' : ''} ` +
      `heeft groeipotentie, maar mist waarschijnlijk nog structuur in opvolging, data en automatisering.`,
    crawlObservaties: [
      crawl
        ? `${websiteName} is bereikbaar en bevat ${crawl.ctaLinkCount} duidelijke CTA-link(s).`
        : `${websiteName} kon niet betrouwbaar worden gecrawld; controleer bereikbaarheid, SSL en laadtijd.`,
      crawl?.hasSocialProof
        ? 'Er is social proof gevonden, wat kan helpen bij conversie.'
        : 'Social proof, cases of klantresultaten zijn niet direct sterk zichtbaar.',
      hasCrm
        ? 'Er is CRM-gebruik opgegeven; dat is een goede basis voor betere opvolging.'
        : 'Geen duidelijk CRM-gebruik opgegeven; daardoor raakt leadopvolging sneller versnipperd.',
    ],
    quickWins: [
      {
        titel: 'Maak leadopvolging meetbaar',
        beschrijving:
          'Leg per lead vast via welk kanaal deze binnenkomt, wie opvolgt en wat de volgende stap is. Zo zie je snel waar kansen blijven liggen.',
        tijdsinvestering: '2-3 uur setup',
        impact: 'Hoog',
      },
      {
        titel: 'Versterk de belangrijkste CTA',
        beschrijving:
          'Zet op de belangrijkste pagina een duidelijke actie naar scan, afspraak of contact. Maak de belofte concreet en meet elke klik.',
        tijdsinvestering: '1-2 uur',
        impact: 'Gemiddeld',
      },
      {
        titel: 'Automatiseer de eerste opvolging',
        beschrijving:
          'Gebruik een vaste e-mail of LinkedIn-opvolging direct na een aanvraag, zodat warme leads niet blijven liggen.',
        tijdsinvestering: '2 uur',
        impact: 'Hoog',
      },
    ],
    strategischeInzetten: [
      {
        titel: 'Commerciële funnel met vaste meetpunten',
        beschrijving:
          'Breng leadbron, opvolgsnelheid, conversie en dealwaarde samen in één dashboard. Dan wordt groei stuurbaar.',
        roi: 'Meer inzicht en minder gemiste kansen binnen 30 dagen',
        investering: 'Licht tot gemiddeld',
      },
      {
        titel: 'AI voor salesvoorbereiding en opvolging',
        beschrijving:
          'Laat AI conceptmails, belscripts en samenvattingen maken op basis van sector, website en leadbron.',
        roi: 'Minder handwerk en snellere opvolging',
        investering: 'Laag',
      },
    ],
    roadmap: {
      q1: {
        thema: 'Fundering',
        focus: 'Meetbaar maken van leads en opvolging.',
        acties: ['CRM velden aanscherpen', 'Leadbronnen meten', 'Contactmomenten standaardiseren'],
      },
      q2: {
        thema: 'Acceleratie',
        focus: 'Meer conversie uit bestaande traffic en leads halen.',
        acties: ['CTA verbeteren', 'Cases toevoegen', 'Opvolgflows automatiseren'],
      },
      q3: {
        thema: 'Schaling',
        focus: 'Leadgeneratie uitbreiden naar meerdere kanalen.',
        acties: ['LinkedIn-campagnes testen', 'SEO-content uitbreiden', 'Retargeting opzetten'],
      },
      q4: {
        thema: 'Optimalisatie',
        focus: 'Data gebruiken om campagnes en salesproces te verbeteren.',
        acties: ['Dashboard evalueren', 'Win/loss analyse doen', 'AI workflows aanscherpen'],
      },
    },
    cta: {
      headline: 'Er liggen duidelijke kansen om slimmer te groeien',
      body:
        'Deze analyse is automatisch veilig afgerond. In een gesprek kunnen we de grootste bottleneck en snelste groeikans concreet maken.',
      button: 'Plan direct een gesprek',
    },
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateInput(body: unknown): body is ScanInput {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;

  const requiredStrings: (keyof ScanInput)[] = [
    'bedrijfsbeschrijving',
    'websiteUrl',
    'salesFrustratie',
    'tijdvretendeTaken',
    'ambitie',
    'belemmering',
    'contactVoornaam',
    'contactAchternaam',
    'contactEmail',
  ];

  for (const field of requiredStrings) {
    if (typeof b[field] !== 'string' || (b[field] as string).trim() === '') {
      return false;
    }
  }

  if (!Array.isArray(b.leadKanalen)) return false;

  return true;
}

// ─── D1 Save (Cloudflare, no Firebase) ───────────────────────────────────────

// D1 database type (Cloudflare runtime binding)
interface D1Result { success: boolean; meta?: unknown; }
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

async function saveToD1(body: ScanInput, report: unknown, db: D1Database): Promise<void> {
  const r = report as Record<string, unknown>;
  const scores = (r.scores ?? {}) as Record<string, number>;
  const id = crypto.randomUUID();

  await db.prepare(
    `INSERT INTO scan_entries (
      id, timestamp, naam, email, functie, website, sector,
      commercieel_team, lead_kanalen, classification, summary_line,
      score_commercieel, score_digitaal, score_ai, score_groei, report_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    new Date().toISOString(),
    `${body.contactVoornaam} ${body.contactAchternaam}`,
    body.contactEmail,
    body.contactFunctie ?? '',
    body.websiteUrl,
    body.sector ?? '',
    body.commercieelTeam ?? '',
    (body.leadKanalen ?? []).join(', '),
    String(r.classification ?? ''),
    String(r.summaryLine ?? ''),
    scores.commercieleSlagkracht ?? 0,
    scores.digitaleAanwezigheid ?? 0,
    scores.aiReadiness ?? 0,
    scores.groeiPotentieel ?? 0,
    JSON.stringify(report),
  ).run();
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

// ─── Endpoint ─────────────────────────────────────────────────────────────────

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
  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Validate input
  if (!validateInput(body)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing or invalid required fields' }),
      { status: 422, headers: corsHeaders }
    );
  }

  // Cloudflare Workers runtime bindings
  const cfEnv = cloudflareEnv as Record<string, unknown>;
  const apiKey = cfEnv.OPENROUTER_API_KEY as string | undefined;
  const db = cfEnv.DB as D1Database | undefined;

  try {
    // 1. Crawl website
    const crawlData = await crawlWebsite(body.websiteUrl);

    // 2. Build prompt
    const prompt = buildPrompt(body, crawlData);

    // 3. Call Anthropic API
    let report: unknown = null;
    let fallbackReport = false;
    if (apiKey) {
      try {
        report = await callClaude(prompt, apiKey);
      } catch (claudeError) {
        fallbackReport = true;
        const msg = claudeError instanceof Error ? claudeError.message : 'Unknown Claude error';
        console.error('AI analysis failed, returning fallback report:', msg);
        report = buildFallbackReport(body, crawlData);
      }
    } else {
      fallbackReport = true;
      console.error('OPENROUTER_API_KEY missing, returning fallback report');
      report = buildFallbackReport(body, crawlData);
    }

    // 4. Save to D1 (Cloudflare-native storage, no Firebase)
    if (db) {
      await saveToD1(body, report, db).catch((err) => {
        console.error('D1 save failed:', err);
      });
    }

    // 5. Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        report,
        meta: {
          websiteCrawled: crawlData !== null,
          fallbackReport,
          contactEmail: body.contactEmail,
          contactNaam: `${body.contactVoornaam} ${body.contactAchternaam}`,
        },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: `Internal error: ${msg}` }),
      { status: 500, headers: corsHeaders }
    );
  }
};

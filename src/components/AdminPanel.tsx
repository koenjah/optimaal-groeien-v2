import { useState, useEffect } from 'react';

interface ScoreEntry {
  id: string;
  timestamp: string;
  naam: string;
  email: string;
  functie: string;
  website: string;
  sector: string;
  commercieelTeam: string;
  leadKanalen: string;
  classification: 'groen' | 'geel' | 'rood' | string;
  summaryLine: string;
  scores: { commercieel: number; digitaal: number; ai: number; groei: number };
}

const ADMIN_API = `${import.meta.env.PUBLIC_SCAN_API_URL ?? '/api/scan'}`.replace('/api/scan', '/api/admin');
const CLASSIFICATION_COLOR: Record<string, string> = {
  groen: 'bg-emerald-100 text-emerald-800',
  geel: 'bg-amber-100 text-amber-800',
  rood: 'bg-red-100 text-red-800',
};

function avg(s: ScoreEntry['scores']) {
  return ((s.commercieel + s.digitaal + s.ai + s.groei) / 4).toFixed(1);
}

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return ts;
  }
}

function toCSV(entries: ScoreEntry[]) {
  const headers = ['Datum', 'Naam', 'Email', 'Functie', 'Website', 'Sector', 'Team', 'Classificatie', 'Gem. score', 'Commercieel', 'Digitaal', 'AI', 'Groei', 'Samenvatting'];
  const rows = entries.map((e) => [
    formatDate(e.timestamp),
    e.naam,
    e.email,
    e.functie,
    e.website,
    e.sector,
    e.commercieelTeam,
    e.classification,
    avg(e.scores),
    e.scores.commercieel,
    e.scores.digitaal,
    e.scores.ai,
    e.scores.groei,
    `"${(e.summaryLine ?? '').replace(/"/g, '""')}"`,
  ]);
  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [sort, setSort] = useState<'date' | 'score' | 'naam'>('date');
  const [expanded, setExpanded] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ action: 'list', pageSize: 200 }),
      });
      const data = await res.json() as { success: boolean; entries?: ScoreEntry[]; error?: string };
      if (!data.success) throw new Error(data.error ?? 'Login mislukt');
      setEntries(data.entries ?? []);
      setAuthed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fout');
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `og-scan-entries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = entries
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.naam.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.website.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q);
      const matchClass = !filterClass || e.classification === filterClass;
      return matchSearch && matchClass;
    })
    .sort((a, b) => {
      if (sort === 'date') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sort === 'score') return parseFloat(avg(b.scores)) - parseFloat(avg(a.scores));
      return a.naam.localeCompare(b.naam);
    });

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#FFFCF8] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-brand-soft shadow-sm p-8">
          <div className="mb-6">
            <img src="/images/logo.webp" alt="Optimaal Groeien" className="h-6 w-auto mb-4" />
            <h1 className="text-xl font-bold text-brand-ink">Admin — AI Scan</h1>
            <p className="text-sm text-brand-ink/60 mt-1">Voer het wachtwoord in om door te gaan.</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && login()}
            placeholder="Wachtwoord"
            className="w-full border border-brand-soft rounded-xl px-4 py-3 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/20 mb-3"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button
            onClick={login}
            disabled={loading || !password}
            className="w-full bg-brand-primary text-white rounded-xl py-3 text-sm font-semibold hover:bg-brand-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Laden...' : 'Inloggen'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF8]">
      {/* Header */}
      <header className="bg-white border-b border-brand-soft/60 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/images/logo.webp" alt="Optimaal Groeien" className="h-6 w-auto" />
          <span className="text-sm font-semibold text-brand-ink">AI Scan Admin</span>
          <span className="text-xs text-brand-ink/50 bg-brand-soft/50 px-2 py-0.5 rounded-full">{entries.length} entries</span>
        </div>
        <button
          onClick={downloadCSV}
          className="bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-brand-primary/90 transition"
        >
          Exporteer CSV ({filtered.length})
        </button>
      </header>

      {/* Filters */}
      <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-brand-soft/40 bg-white/60">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam, email, website..."
          className="border border-brand-soft rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/20 flex-1 min-w-48"
        />
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="border border-brand-soft rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-none"
        >
          <option value="">Alle classificaties</option>
          <option value="groen">Groen</option>
          <option value="geel">Geel</option>
          <option value="rood">Rood</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="border border-brand-soft rounded-xl px-3 py-2 text-sm text-brand-ink focus:outline-none"
        >
          <option value="date">Sorteren: nieuwste eerst</option>
          <option value="score">Sorteren: hoogste score</option>
          <option value="naam">Sorteren: naam A-Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-brand-ink/40 text-sm">Geen entries gevonden.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-brand-soft/60 rounded-2xl overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id ?? null)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-brand-soft/20 transition"
                >
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${CLASSIFICATION_COLOR[entry.classification] ?? 'bg-gray-100 text-gray-700'}`}>
                    {entry.classification}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-brand-ink text-sm truncate">{entry.naam || '—'}</div>
                    <div className="text-xs text-brand-ink/50 truncate">{entry.email} · {entry.website}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-brand-ink">{avg(entry.scores)}<span className="text-brand-ink/40">/10</span></div>
                    <div className="text-xs text-brand-ink/40">{entry.sector || '—'}</div>
                  </div>
                  <div className="text-xs text-brand-ink/40 hidden md:block whitespace-nowrap">{formatDate(entry.timestamp)}</div>
                  <svg className={`w-4 h-4 text-brand-ink/30 transition-transform ${expanded === entry.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {expanded === entry.id && (
                  <div className="border-t border-brand-soft/40 px-5 py-4 bg-[#FFFCF8]">
                    <p className="text-sm text-brand-ink/70 italic mb-4">"{entry.summaryLine}"</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {(['commercieel', 'digitaal', 'ai', 'groei'] as const).map((key) => (
                        <div key={key} className="bg-white rounded-xl border border-brand-soft/60 p-3">
                          <div className="text-xs text-brand-ink/50 capitalize mb-1">{key === 'ai' ? 'AI readiness' : key}</div>
                          <div className="text-xl font-bold text-brand-ink">{entry.scores[key]}<span className="text-sm text-brand-ink/40">/10</span></div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-xs text-brand-ink/60">
                      <span><strong>Functie:</strong> {entry.functie || '—'}</span>
                      <span><strong>Team:</strong> {entry.commercieelTeam || '—'}</span>
                      <span><strong>Leads:</strong> {entry.leadKanalen || '—'}</span>
                      <span className="col-span-2 sm:col-span-3"><strong>Website:</strong> <a href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary underline">{entry.website}</a></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

const themes = [
  {
    id: 'positionering',
    title: 'Positionering & Boodschap',
    num: '01',
    questions: [
      'Weet jouw doelgroep precies wat jij voor hen doet?',
      'Hoe duidelijk is jouw onderscheid van concurrenten?',
    ],
  },
  {
    id: 'leadgeneratie',
    title: 'Leadgeneratie',
    num: '02',
    questions: [
      'Hoe voorspelbaar is jouw instroom van nieuwe prospects?',
      'Genereer je actief leads, of draait het op netwerk en toeval?',
    ],
  },
  {
    id: 'opvolging',
    title: 'Opvolging & Conversie',
    num: '03',
    questions: [
      'Wat doe je structureel na een eerste contactmoment?',
      'Hoe goed zijn jouw offerte- en salesgesprekken ingericht?',
    ],
  },
  {
    id: 'klantbehoud',
    title: 'Klantbehoud & Groei',
    num: '04',
    questions: [
      'Hoe actief bouw je bestaande klantrelaties uit?',
      'Benut je actief upsell- en referral-mogelijkheden?',
    ],
  },
];

const scaleOptions = [
  { val: 1, label: 'Nauwelijks', sub: 'volledig ad hoc' },
  { val: 2, label: 'Soms', sub: 'niet consequent' },
  { val: 3, label: 'Deels', sub: 'werk in uitvoering' },
  { val: 4, label: 'Grotendeels', sub: 'bijna structureel' },
  { val: 5, label: 'Volledig', sub: 'goed ingericht' },
];

const quickWins: Record<string, string[]> = {
  positionering: [
    'Schrijf een one-liner: voor wie je er bent en waarom, in max 10 woorden.',
    'Vraag 3 klanten hoe zij jou omschrijven — dat is jouw echte boodschap.',
  ],
  leadgeneratie: [
    'Kies één kanaal en maak daar een wekelijks ritme van.',
    'Maak een lijst van 20 ideale prospects en neem proactief contact op.',
  ],
  opvolging: [
    'Maak een opvolgingsscript voor de dag na elk eerste contactmoment.',
    'Stel een vaste reminder in om elke offerte na 3 dagen op te volgen.',
  ],
  klantbehoud: [
    'Plan deze maand een check-in bij je top-5 klanten.',
    'Vraag actief om referrals na een succesvolle samenwerking.',
  ],
};

type Scores = Record<string, number[]>;

const TOTAL_STEPS = themes.reduce((a, t) => a + t.questions.length, 0);

export const CommercialQuiz: React.FC = () => {
  const [step, setStep] = useState<'intro' | number | 'result'>('intro');
  const [scores, setScores] = useState<Scores>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);

  const themeIndex = typeof step === 'number' ? step : 0;
  const theme = themes[themeIndex];

  const answeredSteps =
    typeof step === 'number'
      ? themes.slice(0, themeIndex).reduce((a, t) => a + t.questions.length, 0) + currentQ
      : TOTAL_STEPS;

  const advance = useCallback(
    (val: number) => {
      setFlash(val);
      const updated: Scores = {
        ...scores,
        [theme.id]: [...(scores[theme.id] || []), val],
      };
      setScores(updated);

      setTimeout(() => {
        setFlash(null);
        if (currentQ < theme.questions.length - 1) {
          setCurrentQ((q) => q + 1);
        } else {
          setCurrentQ(0);
          if (themeIndex < themes.length - 1) {
            setStep(themeIndex + 1);
          } else {
            setStep('result');
          }
        }
      }, 320);
    },
    [theme, scores, currentQ, themeIndex]
  );

  const goBack = () => {
    if (currentQ > 0) {
      const prev = scores[theme.id] || [];
      setScores({ ...scores, [theme.id]: prev.slice(0, -1) });
      setCurrentQ((q) => q - 1);
    } else if (typeof step === 'number' && step > 0) {
      const prevTheme = themes[themeIndex - 1];
      const prevScores = scores[prevTheme.id] || [];
      setScores({ ...scores, [prevTheme.id]: prevScores.slice(0, -1) });
      setStep(themeIndex - 1);
      setCurrentQ(prevTheme.questions.length - 1);
    }
  };

  const getAvg = (id: string) => {
    const s = scores[id];
    if (!s?.length) return 0;
    return s.reduce((a, b) => a + b, 0) / s.length;
  };

  const weakest =
    Object.entries(scores).sort(([, a], [, b]) => {
      return a.reduce((x, y) => x + y, 0) / a.length - b.reduce((x, y) => x + y, 0) / b.length;
    })[0]?.[0] || 'leadgeneratie';

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (step === 'intro') {
    return (
      <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/6 border border-amber-100 p-7 flex flex-col gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 rounded-full text-[11px] font-bold text-brand-accent uppercase tracking-wider mb-5">
            <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
            Gratis &middot; 2 minuten
          </span>
          <h3 className="text-xl lg:text-2xl font-display font-bold text-brand-primary leading-tight mb-2">
            Hoe sterk is jouw commerciele motor?
          </h3>
          <p className="text-sm text-brand-ink/65 leading-relaxed">
            8 korte vragen. Ontdek direct waar jouw groei lekt en wat jouw quick wins zijn.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {themes.map((t) => (
            <div key={t.id} className="flex items-start gap-2.5 p-3 rounded-2xl bg-brand-bg border border-brand-soft">
              <span className="text-[10px] font-mono font-bold text-brand-accent/70 mt-0.5 shrink-0">{t.num}</span>
              <span className="text-[12px] text-brand-ink/75 leading-snug font-medium">{t.title}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep(0)}
          className="w-full bg-brand-primary text-white py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-accent transition-all duration-200 active:scale-[0.98]"
        >
          Start de scan <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (step === 'result') {
    const wins = quickWins[weakest] || [];
    return (
      <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/6 border border-amber-100 p-7 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <CheckCircle2 size={14} className="text-green-600" />
          </div>
          <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Scan compleet</span>
        </div>

        <div>
          <h3 className="text-lg font-display font-bold text-brand-primary mb-4">Jouw commercieel profiel</h3>
          <div className="space-y-3">
            {themes.map((t) => {
              const avg = getAvg(t.id);
              const pct = (avg / 5) * 100;
              const isWeak = t.id === weakest;
              return (
                <div key={t.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs ${isWeak ? 'font-bold text-brand-accent' : 'text-brand-ink/60'}`}>
                      {t.title}
                    </span>
                    {isWeak && (
                      <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                        Grootste lekkage
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-brand-soft rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isWeak ? 'bg-brand-accent' : 'bg-brand-primary/35'}`}
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#FFFAF4] border border-amber-100 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-2.5">Jouw quick wins</p>
          <ul className="space-y-2">
            {wins.map((w, i) => (
              <li key={i} className="flex gap-2 text-xs text-brand-ink/75 leading-snug">
                <span className="text-brand-accent/60 shrink-0">&#8212;</span>
                {w}
              </li>
            ))}
          </ul>
        </div>

        <a
          href="https://calendly.com/stefankelderman/15min"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-brand-accent text-white py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-primary transition-all duration-200 active:scale-[0.98]"
        >
          Bespreek jouw resultaat <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  // ── QUESTION ───────────────────────────────────────────────────────────────
  const isBlocked = flash !== null;

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/6 border border-amber-100 p-7 flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center gap-2.5">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < answeredSteps
                  ? 'bg-brand-accent'
                  : i === answeredSteps
                  ? 'bg-brand-accent/25'
                  : 'bg-brand-soft'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono text-brand-ink/35 shrink-0 tabular-nums">
          {answeredSteps + 1}/{TOTAL_STEPS}
        </span>
      </div>

      {/* Theme chip */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-brand-accent/60">{theme.num}</span>
        <span className="text-[11px] font-semibold text-brand-ink/45 uppercase tracking-wider">{theme.title}</span>
      </div>

      {/* Question */}
      <p className="text-base lg:text-[17px] font-display font-semibold text-brand-primary leading-snug">
        {theme.questions[currentQ]}
      </p>

      {/* Options — auto-advance on click */}
      <div className="flex flex-col gap-2">
        {scaleOptions.map(({ val, label, sub }) => {
          const isActive = flash === val;
          return (
            <button
              key={val}
              onClick={() => !isBlocked && advance(val)}
              disabled={isBlocked}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-brand-accent border-brand-accent shadow-md shadow-brand-accent/15 scale-[1.01]'
                  : 'bg-white border-brand-soft hover:border-brand-accent/35 hover:bg-[#FFFAF4] active:scale-[0.99]'
              } ${isBlocked && !isActive ? 'opacity-40' : ''}`}
            >
              <span
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 text-[11px] font-bold transition-all ${
                  isActive ? 'border-white/50 text-white' : 'border-brand-soft text-brand-ink/40'
                }`}
              >
                {val}
              </span>
              <span className="flex-1 min-w-0">
                <span className={`text-sm font-semibold block leading-tight ${isActive ? 'text-white' : 'text-brand-primary'}`}>
                  {label}
                </span>
                <span className={`text-[11px] leading-none ${isActive ? 'text-white/65' : 'text-brand-ink/40'}`}>
                  {sub}
                </span>
              </span>
              {isActive && <CheckCircle2 size={15} className="text-white/80 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Back — subtle, low visual priority */}
      {typeof step === 'number' && (step > 0 || currentQ > 0) && (
        <button
          onClick={goBack}
          disabled={isBlocked}
          className="flex items-center gap-1 text-[12px] text-brand-ink/30 hover:text-brand-ink/55 transition-colors self-start -mt-1"
        >
          <ChevronLeft size={13} /> Vorige vraag
        </button>
      )}
    </div>
  );
};

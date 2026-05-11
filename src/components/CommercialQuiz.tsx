import React, { useState, useCallback } from 'react';
import { ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

// Flat list of all 8 questions — each has its own tailored options
const QUESTIONS = [
  {
    themeNum: '01',
    theme: 'Positionering',
    question: 'Weet jouw doelgroep precies wat jij voor hen doet?',
    options: [
      'Niet echt — we zijn breed en pakken alles op',
      'Deels — het wisselt per gesprek',
      'Grotendeels — de kern klopt',
      'Ja, heel helder en altijd consistent',
    ],
  },
  {
    themeNum: '01',
    theme: 'Positionering',
    question: 'Hoe sterk is jouw verhaal ten opzichte van concurrenten?',
    options: [
      'We zeggen grotendeels hetzelfde als de rest',
      'We zijn anders, maar benoemen dat zelden',
      'We hebben een duidelijk onderscheid',
      'Ons verhaal trekt precies de juiste klanten',
    ],
  },
  {
    themeNum: '02',
    theme: 'Leadgeneratie',
    question: 'Hoe voorspelbaar is jouw instroom van nieuwe klanten?',
    options: [
      'Onvoorspelbaar — het overkomt ons',
      'Soms een piek, dan weer maanden niets',
      'Redelijk stabiel, maar niet gegarandeerd',
      'Stabiel en schaalbaar — we weten wat werkt',
    ],
  },
  {
    themeNum: '02',
    theme: 'Leadgeneratie',
    question: 'Hoe actief genereer je leads buiten je netwerk?',
    options: [
      'We wachten af — toeval en mond-tot-mond',
      'Af en toe iets, maar niet structureel',
      'We hebben een aanpak, maar niet consistent',
      'Actief en systematisch via meerdere kanalen',
    ],
  },
  {
    themeNum: '03',
    theme: 'Opvolging & Conversie',
    question: 'Wat gebeurt er na een eerste contactmoment?',
    options: [
      'Eigenlijk niets gestructureerds',
      'We sturen een offerte en wachten af',
      'We volgen op, maar niet altijd consequent',
      'We hebben een strak, herhaalbaar opvolgproces',
    ],
  },
  {
    themeNum: '03',
    theme: 'Opvolging & Conversie',
    question: 'Hoe presteren jullie in salesgesprekken en offertes?',
    options: [
      'We presenteren een prijs en hopen',
      'We verliezen meer offertes dan ons lief is',
      'Het gaat redelijk — meer wins dan verlies',
      'Onze conversie is sterk en voorspelbaar',
    ],
  },
  {
    themeNum: '04',
    theme: 'Klantbehoud & Groei',
    question: 'Hoe actief bouw je bestaande klantrelaties uit?',
    options: [
      'We reageren als ze bellen',
      'We houden contact, maar niet structureel',
      'We doen periodieke check-ins',
      'We hebben actief accountmanagement',
    ],
  },
  {
    themeNum: '04',
    theme: 'Klantbehoud & Groei',
    question: 'Benut je kansen voor upsell en referrals?',
    options: [
      'We laten het er vanzelf uitkomen',
      'Soms, als het vanzelf opkomt in gesprek',
      'We doen het, maar niet systematisch',
      'Actief — upsell en referral zitten in ons proces',
    ],
  },
];

const THEMES = [
  { num: '01', label: 'Positionering & Boodschap' },
  { num: '02', label: 'Leadgeneratie' },
  { num: '03', label: 'Opvolging & Conversie' },
  { num: '04', label: 'Klantbehoud & Groei' },
];

const QUICK_WINS: Record<string, string[]> = {
  '01': [
    'Schrijf een one-liner: voor wie je er bent en waarom — max 10 woorden.',
    'Vraag 3 klanten hoe zij jou omschrijven. Dat is jouw echte verhaal.',
  ],
  '02': [
    'Kies één kanaal en maak er een vast wekelijks ritme van.',
    'Schrijf 20 ideale prospects op en neem proactief contact op.',
  ],
  '03': [
    'Maak een opvolgscript voor de dag na elk eerste contactmoment.',
    'Stel een vaste reminder in: elke offerte na 3 dagen opvolgen.',
  ],
  '04': [
    'Plan deze maand een check-in bij je top-5 klanten — gewoon even bellen.',
    'Vraag na elke succesvolle samenwerking actief om een referral.',
  ],
};

const TOTAL = QUESTIONS.length;

// Returns the theme number (01-04) for a given question index
const themeNumAt = (qi: number) => QUESTIONS[qi].themeNum;

// Average score per theme (0..1 range)
const themeScore = (answers: (number | null)[], themeNum: string): number => {
  const relevant = QUESTIONS.map((q, i) => ({ q, i }))
    .filter(({ q }) => q.themeNum === themeNum)
    .map(({ i }) => answers[i]);
  const filled = relevant.filter((v): v is number => v !== null);
  if (!filled.length) return 0;
  // options are 0-indexed (0..3), normalize to 0..1
  return filled.reduce((a, b) => a + b, 0) / filled.length / 3;
};

export const CommercialQuiz: React.FC = () => {
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [current, setCurrent] = useState(0); // 0..7
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL).fill(null));
  const [flash, setFlash] = useState<number | null>(null); // option index being animated

  const q = QUESTIONS[current];
  const isLast = current === TOTAL - 1;

  const pick = useCallback(
    (optIdx: number) => {
      if (flash !== null) return;
      setFlash(optIdx);
      const next = [...answers];
      next[current] = optIdx;
      setAnswers(next);

      setTimeout(() => {
        setFlash(null);
        if (isLast) {
          setPhase('result');
        } else {
          setCurrent((c) => c + 1);
        }
      }, 300);
    },
    [flash, answers, current, isLast]
  );

  const back = () => {
    if (current > 0) {
      const next = [...answers];
      next[current - 1] = null;
      setAnswers(next);
      setCurrent((c) => c - 1);
    }
  };

  // Result helpers
  const weakestTheme = THEMES.slice().sort(
    (a, b) => themeScore(answers, a.num) - themeScore(answers, b.num)
  )[0];

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-brand-accent via-amber-400 to-brand-accent" />
        <div className="p-7 lg:p-8 flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 rounded-full text-[11px] font-bold text-brand-accent uppercase tracking-wider mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
              Gratis &middot; 2 minuten
            </span>
            <h3 className="text-[22px] lg:text-[24px] font-display font-bold text-brand-primary leading-snug mb-3">
              Hoe sterk is jouw commercieel proces?
            </h3>
            <p className="text-sm text-brand-ink/60 leading-relaxed">
              8 gerichte vragen. Ontdek direct waar jouw groei lekt en wat je morgen kunt verbeteren.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => (
              <div
                key={t.num}
                className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#FFFAF4] border border-amber-100/80"
              >
                <span className="text-[10px] font-mono font-bold text-brand-accent/60 mt-0.5 shrink-0 leading-none">
                  {t.num}
                </span>
                <span className="text-[12px] text-brand-ink/70 leading-snug font-medium">{t.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className="w-full bg-brand-primary text-white py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-accent transition-all duration-200 active:scale-[0.98]"
          >
            Start de scan <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const wins = QUICK_WINS[weakestTheme.num] || [];
    return (
      <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-accent via-amber-400 to-brand-accent" />
        <div className="p-7 lg:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} className="text-green-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider leading-none mb-0.5">Scan compleet</p>
              <p className="text-[11px] text-brand-ink/45 leading-none">Jouw commercieel profiel</p>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-4">
            {THEMES.map((t) => {
              const pct = themeScore(answers, t.num) * 100;
              const isWeak = t.num === weakestTheme.num;
              return (
                <div key={t.num}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[13px] font-medium ${isWeak ? 'text-brand-accent font-bold' : 'text-brand-ink/65'}`}>
                      {t.label}
                    </span>
                    {isWeak && (
                      <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">
                        Lekkage
                      </span>
                    )}
                  </div>
                  <div className="h-2 bg-brand-soft rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 delay-100 ${isWeak ? 'bg-brand-accent' : 'bg-brand-primary/30'}`}
                      style={{ width: `${Math.max(pct, 7)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick wins */}
          <div className="bg-[#FFFAF4] border border-amber-100 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-3">
              Jouw quick wins
            </p>
            <ul className="space-y-2.5">
              {wins.map((w, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-brand-ink/70 leading-snug">
                  <span className="w-4 h-4 rounded-full bg-brand-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="block w-1.5 h-1.5 rounded-full bg-brand-accent" />
                  </span>
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
      </div>
    );
  }

  // ── QUESTION ───────────────────────────────────────────────────────────────
  const pctDone = (current / TOTAL) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-amber-900/5 border border-amber-100 overflow-hidden">
      {/* Progress bar — top of card */}
      <div className="h-1 bg-brand-soft">
        <div
          className="h-full bg-brand-accent transition-all duration-300 ease-out"
          style={{ width: `${pctDone}%` }}
        />
      </div>

      <div className="p-7 lg:p-8 flex flex-col gap-5">
        {/* Theme + counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-brand-accent/55">{q.themeNum}</span>
            <span className="text-[11px] font-semibold text-brand-ink/40 uppercase tracking-wider">{q.theme}</span>
          </div>
          <span className="text-[10px] font-mono text-brand-ink/30 tabular-nums">
            {current + 1}&thinsp;/&thinsp;{TOTAL}
          </span>
        </div>

        {/* Question */}
        <p className="text-[16px] lg:text-[17px] font-display font-semibold text-brand-primary leading-snug">
          {q.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            const isFlashing = flash === i;
            const isDimmed = flash !== null && !isFlashing;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                disabled={flash !== null}
                className={[
                  'w-full text-left px-4 py-3.5 rounded-2xl border-2 text-[13px] lg:text-sm font-medium leading-snug transition-all duration-200',
                  isFlashing
                    ? 'bg-brand-accent border-brand-accent text-white shadow-md shadow-brand-accent/20 scale-[1.01]'
                    : isDimmed
                    ? 'bg-white border-brand-soft/60 text-brand-ink/30'
                    : 'bg-white border-brand-soft text-brand-ink/75 hover:border-brand-accent/40 hover:bg-[#FFFAF4] hover:text-brand-primary active:scale-[0.99]',
                ].join(' ')}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isFlashing ? 'border-white/50 bg-white/20' : 'border-brand-soft/80 bg-transparent'
                    }`}
                  >
                    {isFlashing && <CheckCircle2 size={12} className="text-white" />}
                  </span>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Back — only visible from question 2 onward, very subtle */}
        {current > 0 && (
          <button
            onClick={back}
            disabled={flash !== null}
            className="flex items-center gap-1 text-[12px] text-brand-ink/28 hover:text-brand-ink/55 transition-colors self-start -mt-1"
          >
            <ChevronLeft size={13} /> Vorige
          </button>
        )}
      </div>
    </div>
  );
};

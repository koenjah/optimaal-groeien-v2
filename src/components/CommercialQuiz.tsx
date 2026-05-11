import React, { useState } from 'react';
import { ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

const themes = [
  {
    id: 'positionering',
    title: 'Positionering & Boodschap',
    icon: '01',
    questions: [
      'Weet jouw doelgroep precies wat jij voor hen doet?',
      'Hoe duidelijk is jouw onderscheid van concurrenten?',
    ],
  },
  {
    id: 'leadgeneratie',
    title: 'Leadgeneratie',
    icon: '02',
    questions: [
      'Hoe voorspelbaar is jouw instroom van nieuwe prospects?',
      'Genereer je actief leads, of draait het op netwerk en toeval?',
    ],
  },
  {
    id: 'opvolging',
    title: 'Opvolging & Conversie',
    icon: '03',
    questions: [
      'Wat doe je structureel na een eerste contactmoment?',
      'Hoe goed zijn jouw offerte- en salesgesprekken ingericht?',
    ],
  },
  {
    id: 'klantbehoud',
    title: 'Klantbehoud & Groei',
    icon: '04',
    questions: [
      'Hoe actief bouw je bestaande klantrelaties uit?',
      'Benut je actief upsell- en referral-mogelijkheden?',
    ],
  },
];

const scaleLabels = ['Volledig ad hoc', 'Soms structureel', 'Deels ingericht', 'Grotendeels', 'Structureel'];

const quickWins: Record<string, string[]> = {
  positionering: [
    'Schrijf een one-liner: voor wie je er bent en waarom, in max 10 woorden.',
    'Test je boodschap bij 3 klanten — vraag hen hoe zij jou omschrijven.',
  ],
  leadgeneratie: [
    'Kies één kanaal en maak daar een wekelijks ritme van.',
    'Maak een lijst van 20 ideale prospects en neem contact op.',
  ],
  opvolging: [
    'Maak een eenvoudig opvolgingsscript voor de dag na elk contactmoment.',
    'Stel een reminder in om elke offerte na 3 dagen op te volgen.',
  ],
  klantbehoud: [
    'Plan deze maand een check-in bij je top-5 klanten.',
    'Vraag actief om referrals na een succesvolle samenwerking.',
  ],
};

const themeNames: Record<string, string> = {
  positionering: 'Positionering & Boodschap',
  leadgeneratie: 'Leadgeneratie',
  opvolging: 'Opvolging & Conversie',
  klantbehoud: 'Klantbehoud & Groei',
};

type Scores = Record<string, number[]>;

export const CommercialQuiz: React.FC = () => {
  const [step, setStep] = useState<'intro' | number | 'result'>('intro');
  const [scores, setScores] = useState<Scores>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const themeIndex = typeof step === 'number' ? step : 0;
  const theme = themes[themeIndex];

  const handleSelect = (val: number) => setSelected(val);

  const handleNext = () => {
    if (selected === null) return;
    const themeId = theme.id;
    const prev = scores[themeId] || [];
    const updated = { ...scores, [themeId]: [...prev, selected] };
    setScores(updated);

    if (currentQ < theme.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setSelected(null);
      setCurrentQ(0);
      if (themeIndex < themes.length - 1) {
        setStep(themeIndex + 1);
      } else {
        setStep('result');
      }
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setSelected(null);
    } else if (typeof step === 'number' && step > 0) {
      setStep(step - 1);
      setCurrentQ(themes[step - 1].questions.length - 1);
      setSelected(null);
    }
  };

  const getAvgScore = (id: string) => {
    const s = scores[id];
    if (!s || s.length === 0) return 0;
    return s.reduce((a, b) => a + b, 0) / s.length;
  };

  const getWeakestTheme = () => {
    return Object.entries(scores).sort(([, a], [, b]) => {
      const avgA = a.reduce((x, y) => x + y, 0) / a.length;
      const avgB = b.reduce((x, y) => x + y, 0) / b.length;
      return avgA - avgB;
    })[0]?.[0] || 'leadgeneratie';
  };

  const totalSteps = themes.reduce((acc, t) => acc + t.questions.length, 0);
  const answeredSteps =
    typeof step === 'number'
      ? themes.slice(0, themeIndex).reduce((acc, t) => acc + t.questions.length, 0) + currentQ
      : totalSteps;

  if (step === 'intro') {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/8 border border-amber-100 p-7 lg:p-8 h-full flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 rounded-full mb-5">
            <span className="w-2 h-2 bg-brand-accent rounded-full" />
            <span className="text-[11px] font-bold text-brand-accent uppercase tracking-wider">Gratis Scan</span>
          </div>
          <h3 className="text-2xl font-display font-bold text-brand-primary leading-tight mb-3">
            Hoe sterk is jouw commerciële motor?
          </h3>
          <p className="text-sm text-brand-ink/70 leading-relaxed mb-6">
            8 korte vragen. Ontdek direct waar jouw commercieel proces lekt en wat jouw quick wins zijn.
          </p>
          <div className="space-y-3 mb-8">
            {themes.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-soft flex items-center justify-center text-[10px] font-mono font-bold text-brand-primary/60 shrink-0">{t.icon}</span>
                <span className="text-sm text-brand-ink/80">{t.title}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setStep(0)}
          className="w-full bg-brand-primary text-white py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-accent transition-colors"
        >
          Start de scan <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  if (step === 'result') {
    const weakest = getWeakestTheme();
    const wins = quickWins[weakest] || [];
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/8 border border-amber-100 p-7 lg:p-8 h-full flex flex-col">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full mb-5 w-fit">
          <CheckCircle2 size={12} className="text-green-600" />
          <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider">Scan Compleet</span>
        </div>
        <h3 className="text-xl font-display font-bold text-brand-primary mb-5 leading-tight">Jouw commercieel profiel</h3>
        <div className="space-y-3 mb-6">
          {themes.map((t) => {
            const avg = getAvgScore(t.id);
            const pct = (avg / 5) * 100;
            const isWeakest = t.id === weakest;
            return (
              <div key={t.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${isWeakest ? 'text-brand-accent font-bold' : 'text-brand-ink/70'}`}>{t.title}</span>
                  {isWeakest && <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full font-bold">Lekkage</span>}
                </div>
                <div className="h-2 bg-brand-soft rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isWeakest ? 'bg-brand-accent' : 'bg-brand-primary/40'}`}
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
          <p className="text-[11px] font-bold text-brand-accent uppercase tracking-wider mb-2">Quick wins voor jou</p>
          <ul className="space-y-2">
            {wins.map((w, i) => (
              <li key={i} className="flex gap-2 text-xs text-brand-ink/80 leading-snug">
                <span className="text-brand-accent shrink-0 mt-0.5">—</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <a
          href="https://calendly.com/stefankelderman/15min"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-brand-accent text-white py-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-primary transition-colors mt-auto"
        >
          Bespreek jouw resultaat <ArrowRight size={16} />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-amber-900/8 border border-amber-100 p-7 lg:p-8 h-full flex flex-col">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < answeredSteps ? 'bg-brand-accent' : i === answeredSteps ? 'bg-brand-accent/30' : 'bg-brand-soft'}`} />
          ))}
        </div>
        <span className="text-[10px] font-mono text-brand-ink/40 shrink-0">{answeredSteps + 1}/{totalSteps}</span>
      </div>

      {/* Theme label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-6 h-6 rounded-full bg-brand-soft flex items-center justify-center text-[10px] font-mono font-bold text-brand-primary/60 shrink-0">{theme.icon}</span>
        <span className="text-[11px] font-bold text-brand-primary/50 uppercase tracking-wider">{theme.title}</span>
      </div>

      {/* Question */}
      <p className="text-base lg:text-lg font-display font-semibold text-brand-primary leading-snug mb-6 flex-1">
        {theme.questions[currentQ]}
      </p>

      {/* Scale */}
      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              onClick={() => handleSelect(val)}
              className={`flex-1 h-11 rounded-xl text-sm font-bold border-2 transition-all ${selected === val ? 'bg-brand-accent border-brand-accent text-white scale-105 shadow-md shadow-brand-accent/20' : 'bg-white border-brand-soft text-brand-ink/50 hover:border-brand-accent/40 hover:text-brand-primary'}`}
            >
              {val}
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-brand-ink/40">Ad hoc</span>
          <span className="text-[10px] text-brand-ink/40">Structureel</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex gap-2">
        {(typeof step === 'number' && (step > 0 || currentQ > 0)) && (
          <button onClick={handleBack} className="flex items-center gap-1 px-4 py-3 rounded-xl bg-brand-soft text-brand-ink/60 text-sm font-medium hover:bg-brand-soft/80 transition-colors">
            <ChevronLeft size={16} /> Terug
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={selected === null}
          className={`flex-1 py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${selected !== null ? 'bg-brand-primary text-white hover:bg-brand-accent' : 'bg-brand-soft text-brand-ink/30 cursor-not-allowed'}`}
        >
          {themeIndex === themes.length - 1 && currentQ === theme.questions.length - 1 ? 'Bekijk resultaat' : 'Volgende'} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

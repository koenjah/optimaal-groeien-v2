import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Globe,
  Brain,
  TrendingUp,
  Zap,
  AlertTriangle,
  Calendar,
  ArrowRight,
  BarChart3,
  Target,
  Clock,
  Lightbulb,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Report {
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

interface FormData {
  // Step 1 — Kennismaken (pure clicks)
  sector: string;
  commercieelTeam: string;
  // Step 2 — Leads (chips + radio)
  leadKanalen: string[];
  leadsPerMaand: string;
  // Step 3 — Sales & Tools (pure radios)
  leadOpvolging: string;
  crmGebruik: string;
  crmSysteem: string;
  aiGebruik: string;
  aiTools: string;
  // Step 4 — Uitdagingen (first typing, invested now)
  tijdVerslinders: string;
  salesFrustratie: string;
  // Step 5 — Ambitie
  doelen12Maanden: string;
  obstakels: string;
  // Step 6 — Contact + context (payoff)
  bedrijfsBeschrijving: string;
  website: string;
  linkedin: string;
  voornaam: string;
  achternaam: string;
  email: string;
  functietitel: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_LABELS = ['Kennismaken', 'Leads', 'Sales', 'Uitdagingen', 'Ambitie', 'Contact'];
const TOTAL_STEPS = 6;

const SECTOR_OPTIONS = [
  'Techniek & Engineering',
  'Productie & Maakindustrie',
  'Bouw & Infra',
  'Zakelijke dienstverlening',
  'Anders',
];

const LEAD_KANALEN_OPTIONS = [
  'Mond-tot-mond',
  'LinkedIn',
  'Organisch (Google)',
  'Advertentiecampagnes',
  'Events & beurzen',
  'Bestaande klanten',
  'Koude acquisitie',
];

const LOADING_STEPS = [
  { label: 'Website analyseren...', delay: 3000, icon: Globe },
  { label: 'Bedrijfsprofiel verwerken...', delay: 6000, icon: Brain },
  { label: 'Kansen identificeren...', delay: 12000, icon: Target },
  { label: 'Rapport samenstellen...', delay: 20000, icon: BarChart3 },
];

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

const Label: React.FC<{ children: React.ReactNode; required?: boolean; optional?: boolean }> = ({
  children,
  required,
  optional,
}) => (
  <label className="block text-[15px] font-semibold text-brand-primary mb-2">
    {children}
    {required && <span className="text-brand-accent ml-0.5"> *</span>}
    {optional && (
      <span className="ml-2 text-xs font-normal text-brand-ink/55 normal-case">(optioneel)</span>
    )}
  </label>
);

const inputBase =
  'w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-brand-ink placeholder:text-brand-ink/45 text-[15px] transition-all outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/10';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`${inputBase} ${props.className ?? ''}`} />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className={`${inputBase} resize-none leading-relaxed ${props.className ?? ''}`} />
);

const RadioGroup: React.FC<{
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  horizontal?: boolean;
  large?: boolean;
}> = ({ name, options, value, onChange, horizontal, large }) => (
  <div className={`flex ${horizontal ? 'flex-wrap gap-3' : 'flex-col gap-2.5'}`}>
    {options.map((opt) => {
      const selected = value === opt;
      return (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-2xl font-medium border transition-all text-left ${
            large ? 'px-4 py-3 text-[15px]' : 'px-4 py-2.5 text-[15px]'
          } ${
            selected
              ? 'bg-brand-accent/10 border-brand-accent text-brand-accent font-bold'
              : 'bg-white border-slate-200 text-brand-ink hover:border-brand-primary/40 hover:bg-slate-50'
          }`}
          aria-pressed={selected}
          aria-label={`${name}: ${opt}`}
        >
          <span className="flex items-center gap-2.5">
            {selected && <Check size={15} className="shrink-0" />}
            {opt}
          </span>
        </button>
      );
    })}
  </div>
);

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

const ProgressBar: React.FC<{ step: number }> = ({ step }) => {
  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-brand-ink/60 font-medium">Stap {step} van {TOTAL_STEPS}</span>
        <span className="text-xs font-bold text-brand-accent">{STEP_LABELS[step - 1]}</span>
      </div>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-brand-accent rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step card
// ---------------------------------------------------------------------------

const StepCard: React.FC<{
  stepLabel: string;
  heading: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ stepLabel, heading, subtitle, children }) => (
  <div className="bg-white rounded-[24px] p-5 sm:p-7 shadow-sm border border-slate-200">
    <div className="mb-4">
      <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">{stepLabel}</span>
      <h2 className="text-xl font-display font-bold text-brand-primary mt-1 leading-snug">{heading}</h2>
      {subtitle && <p className="text-sm text-brand-ink/65 mt-1 leading-relaxed">{subtitle}</p>}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

// ---------------------------------------------------------------------------
// Navigation buttons
// ---------------------------------------------------------------------------

const NavButtons: React.FC<{
  step: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}> = ({ step, onBack, onNext, onSubmit, isLastStep, isSubmitting }) => (
  <div className={`flex items-center mt-5 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
    {step > 1 && (
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-brand-primary/65 hover:text-brand-primary transition-colors text-sm font-medium"
      >
        <ChevronLeft size={16} />
        Terug
      </button>
    )}
    {isLastStep ? (
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analyseren...
          </>
        ) : (
          <>
            Analyseer mijn bedrijf
            <ArrowRight size={18} />
          </>
        )}
      </button>
    ) : (
      <button
        type="button"
        onClick={onNext}
        className="flex items-center gap-2 px-7 py-3.5 bg-brand-accent text-white rounded-2xl font-display font-bold text-sm transition-all hover:bg-brand-primary hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-brand-accent/15"
      >
        Volgende
        <ChevronRight size={16} />
      </button>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

const LoadingState: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    LOADING_STEPS.forEach((s, i) => {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
      }, s.delay);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-slate-200">
      <div className="flex justify-center mb-10">
        <div className="w-20 h-20 rounded-full bg-brand-accent/10 border-2 border-brand-accent/20 flex items-center justify-center">
          <Loader2 size={32} className="text-brand-accent animate-spin" />
        </div>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-2xl lg:text-3xl font-display font-bold text-brand-primary mb-2">
          AI analyseert je bedrijf
        </h2>
        <p className="text-brand-ink/70 text-sm">Dit duurt ongeveer 30 seconden</p>
      </div>

      <div className="max-w-sm mx-auto space-y-4 mb-10">
        {LOADING_STEPS.map((s, i) => {
          const done = completedSteps.includes(i);
          const active =
            !done &&
            (i === 0
              ? !completedSteps.includes(0)
              : completedSteps.includes(i - 1) && !completedSteps.includes(i));
          const IconComp = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-4">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  done
                    ? 'bg-green-100 text-green-600'
                    : active
                    ? 'bg-brand-accent/10 text-brand-accent'
                    : 'bg-slate-100 text-brand-ink/45'
                }`}
              >
                {done ? <Check size={16} /> : <IconComp size={16} />}
              </div>
              <span
                className={`text-sm font-medium ${
                  done
                    ? 'text-green-700 line-through decoration-green-400/50'
                    : active
                    ? 'text-brand-primary font-semibold'
                    : 'text-brand-ink/55'
                }`}
              >
                {done ? s.label.replace('...', '') : s.label}
              </span>
              {done && <span className="ml-auto text-xs text-green-600 font-semibold">Klaar</span>}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-brand-ink/60 max-w-xs mx-auto leading-relaxed">
        We analyseren jullie website, commercieel proces en identificeren waar AI direct waarde toevoegt.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Score card
// ---------------------------------------------------------------------------

const ScoreCard: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const color =
    score >= 7.5
      ? { bar: 'bg-emerald-500', ring: 'text-emerald-600', bg: 'bg-emerald-50' }
      : score >= 5
      ? { bar: 'bg-amber-400', ring: 'text-amber-600', bg: 'bg-amber-50' }
      : { bar: 'bg-red-400', ring: 'text-red-600', bg: 'bg-red-50' };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-4">
      <p className="text-xs uppercase tracking-widest font-bold text-brand-ink/65">{label}</p>
      <div className="flex items-end gap-1">
        <span className={`text-4xl font-display font-bold ${color.ring}`}>{score}</span>
        <span className="text-sm text-brand-ink/55 mb-1">/10</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color.bar}`} style={{ width: `${(score / 10) * 100}%` }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Results state
// ---------------------------------------------------------------------------

const ResultsState: React.FC<{ report: Report; bedrijfsnaam: string }> = ({ report, bedrijfsnaam }) => {
  const classificationConfig = {
    groen: { badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'Sterk profiel' },
    geel: { badge: 'bg-amber-100 text-amber-700 border border-amber-200', label: 'Groei mogelijk' },
    rood: { badge: 'bg-red-100 text-red-700 border border-red-200', label: 'Actie vereist' },
  };
  const cfg = classificationConfig[report.classification];

  const roadmapQuarters = [
    { key: 'q1', data: report.roadmap.q1, accent: 'bg-brand-primary text-white', border: 'border-brand-primary' },
    { key: 'q2', data: report.roadmap.q2, accent: 'bg-brand-primary/10 text-brand-primary', border: 'border-brand-primary/20' },
    { key: 'q3', data: report.roadmap.q3, accent: 'bg-brand-primary/10 text-brand-primary', border: 'border-brand-primary/20' },
    { key: 'q4', data: report.roadmap.q4, accent: 'bg-brand-primary/10 text-brand-primary', border: 'border-brand-primary/20' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-brand-primary rounded-[32px] p-8 lg:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
              {cfg.label}
            </span>
          </div>
          <h2 className="font-display text-2xl lg:text-4xl font-bold text-white mb-3">{bedrijfsnaam}</h2>
          <p className="text-white/90 text-base lg:text-lg leading-relaxed max-w-2xl">{report.summaryLine}</p>
        </div>
      </div>

      {/* Scores */}
      <div>
        <h3 className="text-lg font-display font-bold text-brand-primary mb-4 px-1">Jouw 4 scores</h3>
        <div className="grid grid-cols-2 gap-4">
          <ScoreCard label="Commerciele Slagkracht" score={report.scores.commercieleSlagkracht} />
          <ScoreCard label="Digitale Aanwezigheid" score={report.scores.digitaleAanwezigheid} />
          <ScoreCard label="AI Readiness" score={report.scores.aiReadiness} />
          <ScoreCard label="Groei Potentieel" score={report.scores.groeiPotentieel} />
        </div>
      </div>

      {/* Crawl observaties */}
      {report.crawlObservaties?.length > 0 && (
        <div className="bg-[#FFFAF4] rounded-[32px] p-8 lg:p-10 border border-amber-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
              <Globe size={18} className="text-brand-accent" />
            </div>
            <h3 className="text-lg font-display font-bold text-brand-primary">Wat we zagen op jullie website</h3>
          </div>
          <ul className="space-y-3">
            {report.crawlObservaties.map((obs, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-accent mt-2 shrink-0" />
                <span className="text-brand-ink text-sm leading-relaxed">{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick wins */}
      {report.quickWins?.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-9 h-9 rounded-2xl bg-brand-accent/10 flex items-center justify-center">
              <Zap size={18} className="text-brand-accent" />
            </div>
            <h3 className="text-lg font-display font-bold text-brand-primary">3 Quick Wins</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {report.quickWins.map((win, i) => (
              <div key={i} className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-2xl bg-brand-primary flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-primary text-sm mb-1.5">{win.titel}</h4>
                  <p className="text-brand-ink/80 text-sm leading-relaxed">{win.beschrijving}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-brand-ink/80">
                    <Clock size={11} />
                    {win.tijdsinvestering}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-accent/10 rounded-full text-xs font-semibold text-brand-accent">
                    <TrendingUp size={11} />
                    {win.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategische inzetten */}
      {report.strategischeInzetten?.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
              <Target size={18} className="text-brand-primary" />
            </div>
            <h3 className="text-lg font-display font-bold text-brand-primary">3 Strategische Inzetten</h3>
          </div>
          <div className="space-y-4">
            {report.strategischeInzetten.map((item, i) => (
              <div key={i} className="bg-white rounded-[24px] border border-slate-200 p-6 flex gap-5">
                <div className="w-1 self-stretch rounded-full bg-brand-primary/20 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-display font-bold text-brand-primary mb-1.5">{item.titel}</h4>
                  <p className="text-brand-ink/80 text-sm leading-relaxed mb-4">{item.beschrijving}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-brand-ink/80">
                      Investering: {item.investering}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full text-xs font-semibold text-emerald-700">
                      ROI: {item.roi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap */}
      <div>
        <div className="flex items-center gap-3 mb-6 px-1">
          <div className="w-9 h-9 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
            <Calendar size={18} className="text-brand-primary" />
          </div>
          <h3 className="text-lg font-display font-bold text-brand-primary">12-maanden roadmap 2026</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {roadmapQuarters.map(({ key, data, accent, border }, idx) => (
            <div key={key} className={`bg-white rounded-[24px] border-2 ${border} p-7 flex flex-col gap-5`}>
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${accent}`}>
                  {key.toUpperCase()} 2026
                </div>
                <span className="text-3xl font-display font-black text-brand-primary/8 select-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
                <p className="font-display font-bold text-brand-primary text-base mb-1">{data.thema}</p>
                <p className="text-brand-ink/70 text-sm leading-relaxed">{data.focus}</p>
              </div>
              {data.acties?.length > 0 && (
                <ul className="space-y-2.5 pt-1 border-t border-slate-100">
                  {data.acties.map((actie, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                      <span className="text-sm text-brand-ink/80 leading-relaxed">{actie}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-primary rounded-[32px] p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent/10 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
              <Lightbulb size={18} className="text-brand-accent" />
            </div>
          </div>
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-4">{report.cta.headline}</h2>
          <p className="text-white/90 leading-relaxed mb-8 max-w-xl">{report.cta.body}</p>
          <a
            href="https://meetings-eu1.hubspot.com/stefan-kelderman"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent text-white rounded-2xl font-display font-bold text-sm transition-all hover:bg-white hover:text-brand-primary shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {report.cta.button}
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-slate-200 text-center">
    <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
      <AlertTriangle size={28} className="text-red-500" />
    </div>
    <h2 className="font-display text-xl font-bold text-brand-primary mb-3">Er ging iets mis</h2>
    <p className="text-brand-ink/75 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
      Er ging iets mis bij het genereren van je rapport. We nemen zo snel mogelijk contact met je op.
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button type="button" onClick={onRetry} className="btn-primary">
        Probeer opnieuw
        <ArrowRight size={16} />
      </button>
      <a
        href="https://meetings-eu1.hubspot.com/stefan-kelderman"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost"
      >
        Plan direct een gesprek
      </a>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main AIScan component
// ---------------------------------------------------------------------------

const initialFormData: FormData = {
  sector: '',
  commercieelTeam: '',
  leadKanalen: [],
  leadsPerMaand: '',
  leadOpvolging: '',
  crmGebruik: '',
  crmSysteem: '',
  aiGebruik: '',
  aiTools: '',
  tijdVerslinders: '',
  salesFrustratie: '',
  doelen12Maanden: '',
  obstakels: '',
  bedrijfsBeschrijving: '',
  website: '',
  linkedin: '',
  voornaam: '',
  achternaam: '',
  email: '',
  functietitel: '',
};

type UIState = 'form' | 'loading' | 'results' | 'error';

export const AIScan: React.FC = () => {
  const [uiState, setUiState] = useState<UIState>('form');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [report, setReport] = useState<Report | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Auto-advance on steps 1-3 once all selections are made
  useEffect(() => {
    if (uiState !== 'form' || step > 3) return;

    const ready =
      step === 1 ? !!(formData.sector && formData.commercieelTeam) :
      step === 2 ? !!formData.leadsPerMaand :
      !!formData.aiGebruik;

    if (!ready) return;

    const timer = setTimeout(() => {
      setStep((s) => (s === step ? Math.min(s + 1, TOTAL_STEPS) : s));
      scrollToTop();
    }, 350);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sector, formData.commercieelTeam, formData.leadsPerMaand, formData.aiGebruik, step, uiState]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleLeadKanaal = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      leadKanalen: prev.leadKanalen.includes(option)
        ? prev.leadKanalen.filter((o) => o !== option)
        : [...prev.leadKanalen, option],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Steps 1-3: no blocking validation — let them roll

    if (step === 4) {
      if (!formData.tijdVerslinders.trim()) newErrors.tijdVerslinders = 'Dit veld is verplicht';
      if (!formData.salesFrustratie.trim()) newErrors.salesFrustratie = 'Dit veld is verplicht';
    }
    if (step === 5) {
      if (!formData.doelen12Maanden.trim()) newErrors.doelen12Maanden = 'Dit veld is verplicht';
      if (!formData.obstakels.trim()) newErrors.obstakels = 'Dit veld is verplicht';
    }
    if (step === 6) {
      if (!formData.bedrijfsBeschrijving.trim()) newErrors.bedrijfsBeschrijving = 'Geef een korte omschrijving';
      if (!formData.website.trim()) newErrors.website = 'Dit veld is verplicht';
      if (!formData.voornaam.trim()) newErrors.voornaam = 'Dit veld is verplicht';
      if (!formData.achternaam.trim()) newErrors.achternaam = 'Dit veld is verplicht';
      if (!formData.email.trim()) newErrors.email = 'Dit veld is verplicht';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Voer een geldig e-mailadres in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    scrollToTop();
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    scrollToTop();
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setUiState('loading');
    scrollToTop();

    // Map FormData to the API's ScanInput contract
    const salesProcesSummary = [
      formData.leadOpvolging ? `Opvolging: ${formData.leadOpvolging}` : null,
      formData.crmGebruik ? `CRM: ${formData.crmGebruik}${formData.crmSysteem ? ` (${formData.crmSysteem})` : ''}` : null,
    ].filter(Boolean).join(' | ') || 'Niet opgegeven';

    const SCAN_API_URL = (import.meta.env.PUBLIC_SCAN_API_URL as string | undefined) || '/api/scan';

    const payload = {
      sector: formData.sector || 'Niet opgegeven',
      bedrijfsbeschrijving: formData.bedrijfsBeschrijving,
      websiteUrl: formData.website,
      linkedinUrl: formData.linkedin || undefined,
      leadKanalen: formData.leadKanalen,
      leadsPerMaand: formData.leadsPerMaand || 'Niet opgegeven',
      salesProces: salesProcesSummary,
      leadOpvolging: formData.leadOpvolging || 'Niet opgegeven',
      crmGebruik: formData.crmGebruik || 'Nee',
      crmSysteem: formData.crmSysteem || undefined,
      salesFrustratie: formData.salesFrustratie,
      tijdvretendeTaken: formData.tijdVerslinders,
      aiToolsGebruik: formData.aiGebruik || 'Nog niet',
      aiTools: formData.aiTools || undefined,
      commercieelTeam: formData.commercieelTeam || 'Niet opgegeven',
      ambitie: formData.doelen12Maanden,
      belemmering: formData.obstakels,
      contactVoornaam: formData.voornaam,
      contactAchternaam: formData.achternaam,
      contactEmail: formData.email,
      contactFunctie: formData.functietitel || undefined,
    };

    try {
      const response = await fetch(SCAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        setReport(data.report);
        setUiState('results');
      } else {
        setUiState('error');
      }
    } catch {
      setUiState('error');
    }
    scrollToTop();
  };

  const handleRetry = () => {
    setUiState('form');
    setStep(1);
    scrollToTop();
  };

  const errorMsg = (key: keyof FormData) =>
    errors[key] ? <p className="mt-1.5 text-xs text-red-500 font-medium">{errors[key]}</p> : null;

  const inputClass = (key: keyof FormData) =>
    errors[key] ? `${inputBase} border-red-300 focus:border-red-400 focus:ring-red-100` : inputBase;

  const bedrijfsnaam = formData.website
    ? formData.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    : `${formData.voornaam} ${formData.achternaam}`.trim() || 'Jouw bedrijf';

  return (
    <div ref={topRef} className="w-full max-w-3xl mx-auto scroll-mt-24">
      {uiState === 'form' && (
        <div key="form">
          <ProgressBar step={step} />

          {/* ---- STEP 1 — Kennismaken (pure clicks) ---- */}
          {step === 1 && (
            <StepCard
              stepLabel="Stap 1 van 6 — Kennismaken"
              heading="Jullie sector en team"
            >
              <Field>
                <Label>In welke sector zijn jullie actief?</Label>
                <RadioGroup
                  name="sector"
                  options={SECTOR_OPTIONS}
                  value={formData.sector}
                  onChange={(v) => set('sector', v)}
                  large
                />
              </Field>
              <Field>
                <Label>Hoe groot is jullie commercieel team?</Label>
                <RadioGroup
                  name="commercieelTeam"
                  options={['1 persoon', '2 tot 3', '4 tot 8', '9 of meer']}
                  value={formData.commercieelTeam}
                  onChange={(v) => set('commercieelTeam', v)}
                  horizontal
                  large
                />
              </Field>
            </StepCard>
          )}

          {/* ---- STEP 2 — Leads ---- */}
          {step === 2 && (
            <StepCard
              stepLabel="Stap 2 van 6 — Leads"
              heading="Hoe komen klanten bij jullie?"
            >
              <Field>
                <Label>Via welke kanalen?</Label>
                <div className="flex flex-wrap gap-2.5 mt-1">
                  {LEAD_KANALEN_OPTIONS.map((opt) => {
                    const selected = formData.leadKanalen.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleLeadKanaal(opt)}
                        className={`border rounded-full px-4 py-2.5 text-sm font-medium cursor-pointer transition-all ${
                          selected
                            ? 'bg-brand-accent/10 border-brand-accent text-brand-accent font-bold'
                            : 'border-slate-200 text-brand-ink hover:border-brand-primary/40 hover:bg-slate-50'
                        }`}
                      >
                        {selected && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field>
                <Label>Gemiddeld hoeveel nieuwe leads per maand?</Label>
                <RadioGroup
                  name="leadsPerMaand"
                  options={['Minder dan 5', '5 tot 15', '16 tot 30', 'Meer dan 30']}
                  value={formData.leadsPerMaand}
                  onChange={(v) => set('leadsPerMaand', v)}
                  horizontal
                />
              </Field>
            </StepCard>
          )}

          {/* ---- STEP 3 — Sales & Tools ---- */}
          {step === 3 && (
            <StepCard
              stepLabel="Stap 3 van 6 — Sales"
              heading="Hoe pakt jullie team dit aan?"
            >
              <Field>
                <Label>Hoe snel worden nieuwe leads opgevolgd?</Label>
                <RadioGroup
                  name="leadOpvolging"
                  options={['Binnen 24 uur', 'Binnen een week', 'Wisselend', 'Geen vast proces']}
                  value={formData.leadOpvolging}
                  onChange={(v) => set('leadOpvolging', v)}
                />
              </Field>
              <Field>
                <Label>Gebruiken jullie een CRM of lead-trackingsysteem?</Label>
                <RadioGroup
                  name="crmGebruik"
                  options={['Ja', 'Nee', 'We zijn er mee bezig']}
                  value={formData.crmGebruik}
                  onChange={(v) => set('crmGebruik', v)}
                />
                {formData.crmGebruik === 'Ja' && (
                  <div className="mt-3">
                    <Input
                      type="text"
                      value={formData.crmSysteem}
                      onChange={(e) => set('crmSysteem', e.target.value)}
                      placeholder="Welk systeem? (bijv. HubSpot, Salesforce)"
                    />
                  </div>
                )}
              </Field>
              <Field>
                <Label>Werken jullie al met AI-tools?</Label>
                <RadioGroup
                  name="aiGebruik"
                  options={['Ja, regelmatig', 'Af en toe', 'Nog niet']}
                  value={formData.aiGebruik}
                  onChange={(v) => set('aiGebruik', v)}
                  horizontal
                />
                {(formData.aiGebruik === 'Ja, regelmatig' || formData.aiGebruik === 'Af en toe') && (
                  <div className="mt-3">
                    <Input
                      type="text"
                      value={formData.aiTools}
                      onChange={(e) => set('aiTools', e.target.value)}
                      placeholder="Welke tools? (bijv. ChatGPT, Copilot)"
                    />
                  </div>
                )}
              </Field>
            </StepCard>
          )}

          {/* ---- STEP 4 — Uitdagingen (first typing) ---- */}
          {step === 4 && (
            <StepCard
              stepLabel="Stap 4 van 6 — Uitdagingen"
              heading="Waar zit de meeste pijn?"
              subtitle="Hoe specifieker jullie antwoord, hoe scherper het rapport."
            >
              <Field>
                <Label required>Welke commerciele taken kosten de meeste tijd maar leveren weinig op?</Label>
                <Textarea
                  rows={3}
                  value={formData.tijdVerslinders}
                  onChange={(e) => set('tijdVerslinders', e.target.value)}
                  placeholder="Bijv: offertes opmaken, leads opvolgen, rapportages, LinkedIn bijhouden"
                  className={errors.tijdVerslinders ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
                />
                {errorMsg('tijdVerslinders')}
              </Field>
              <Field>
                <Label required>Wat is de grootste frustratie in jullie salesproces?</Label>
                <Textarea
                  rows={3}
                  value={formData.salesFrustratie}
                  onChange={(e) => set('salesFrustratie', e.target.value)}
                  placeholder="Bijv: leads die verdwijnen na offerte, geen zicht op pijplijn, te lang wachten op beslissers"
                  className={errors.salesFrustratie ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
                />
                {errorMsg('salesFrustratie')}
              </Field>
            </StepCard>
          )}

          {/* ---- STEP 5 — Ambitie ---- */}
          {step === 5 && (
            <StepCard
              stepLabel="Stap 5 van 6 — Ambitie"
              heading="Waar wil je naartoe?"
            >
              <Field>
                <Label required>Wat moet er over 12 maanden bereikt zijn dat nu nog niet lukt?</Label>
                <Textarea
                  rows={3}
                  value={formData.doelen12Maanden}
                  onChange={(e) => set('doelen12Maanden', e.target.value)}
                  placeholder="Bijv: meer gekwalificeerde leads, kortere salescyclus, minder afhankelijkheid van 1 persoon"
                  className={errors.doelen12Maanden ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
                />
                {errorMsg('doelen12Maanden')}
              </Field>
              <Field>
                <Label required>Wat houdt jullie daar nu van tegen?</Label>
                <Textarea
                  rows={3}
                  value={formData.obstakels}
                  onChange={(e) => set('obstakels', e.target.value)}
                  placeholder="Budget, tijd, kennis, onduidelijkheid over aanpak — wees eerlijk, dit maakt het rapport beter"
                  className={errors.obstakels ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
                />
                {errorMsg('obstakels')}
              </Field>
            </StepCard>
          )}

          {/* ---- STEP 6 — Contact + context ---- */}
          {step === 6 && (
            <StepCard
              stepLabel="Stap 6 van 6 — Jullie rapport"
              heading="Laatste stap — dan bouwen we het rapport"
              subtitle="Vul jullie gegevens in. Het rapport wordt direct op het scherm getoond."
            >
              <Field>
                <Label required>Wat doet jullie bedrijf en voor wie? (kort)</Label>
                <Textarea
                  rows={2}
                  value={formData.bedrijfsBeschrijving}
                  onChange={(e) => set('bedrijfsBeschrijving', e.target.value)}
                  placeholder="Bijv: we bouwen industriele installaties voor de voedingssector in de Benelux"
                  className={errors.bedrijfsBeschrijving ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}
                />
                {errorMsg('bedrijfsBeschrijving')}
              </Field>
              <Field>
                <Label required>Website</Label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => set('website', e.target.value)}
                  placeholder="https://jouwbedrijf.nl"
                  className={inputClass('website')}
                />
                {errorMsg('website')}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <Label required>Voornaam</Label>
                  <Input
                    type="text"
                    value={formData.voornaam}
                    onChange={(e) => set('voornaam', e.target.value)}
                    placeholder="Voornaam"
                    className={inputClass('voornaam')}
                  />
                  {errorMsg('voornaam')}
                </Field>
                <Field>
                  <Label required>Achternaam</Label>
                  <Input
                    type="text"
                    value={formData.achternaam}
                    onChange={(e) => set('achternaam', e.target.value)}
                    placeholder="Achternaam"
                    className={inputClass('achternaam')}
                  />
                  {errorMsg('achternaam')}
                </Field>
              </div>
              <Field>
                <Label required>E-mailadres</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="jij@bedrijf.nl"
                  className={inputClass('email')}
                />
                {errorMsg('email')}
              </Field>
              <Field>
                <Label optional>Functietitel</Label>
                <Input
                  type="text"
                  value={formData.functietitel}
                  onChange={(e) => set('functietitel', e.target.value)}
                  placeholder="Bijv: Directeur, Sales Manager, DGA"
                />
              </Field>
              <p className="text-xs text-brand-ink/60 leading-relaxed">
                Je gegevens worden vertrouwelijk behandeld en alleen gebruikt om je rapport toe te sturen.
              </p>
            </StepCard>
          )}

          <NavButtons
            step={step}
            onBack={handleBack}
            onNext={handleNext}
            onSubmit={handleSubmit}
            isLastStep={step === TOTAL_STEPS}
          />
        </div>
      )}

      {uiState === 'loading' && (
        <div key="loading">
          <LoadingState />
        </div>
      )}

      {uiState === 'results' && report && (
        <div key="results">
          <ResultsState report={report} bedrijfsnaam={bedrijfsnaam} />
        </div>
      )}

      {uiState === 'error' && (
        <div key="error">
          <ErrorState onRetry={handleRetry} />
        </div>
      )}
    </div>
  );
};

export default AIScan;

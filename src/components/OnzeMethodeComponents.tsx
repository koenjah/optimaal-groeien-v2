import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle, Layers, Zap, Sparkles, ArrowRight, CheckCircle2,
  Compass, Globe, Search, FileText, Linkedin, Mail, Megaphone, Star,
  Users, Target, Database, Cpu
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────
   HERO — H1 + animerende branches + subkop
   ──────────────────────────────────────────────────────────────────── */

const BRANCHES = ['maakindustrie', 'techniek', 'logistiek', 'bouw'];

export const OnzeMethodeHero = () => {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BRANCHES.length), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative pt-36 pb-24 px-6 overflow-hidden bg-gradient-to-br from-brand-primary via-[#0b4a7a] to-brand-primary text-white">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-brand-accent/15 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-brand-lime/8 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-[11px] uppercase tracking-widest font-bold text-brand-lime mb-8 backdrop-blur-sm">
          <Sparkles size={12} /> Onze methode
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.1] mb-8 text-white">
          Het <span className="text-brand-accent">Commercial Intelligence System</span>
        </h1>

        <h2 className="text-xl md:text-2xl lg:text-[1.7rem] font-display font-light text-white/85 leading-[1.4] mb-10 max-w-3xl mx-auto">
          De groeimethode voor B2B-bedrijven in de{' '}
          <span className="relative inline-block align-baseline whitespace-nowrap">
            {/* invisible sizer = longest word, keeps layout stable */}
            <span aria-hidden className="invisible font-display font-bold">maakindustrie</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={BRANCHES[idx]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="text-brand-lime font-display font-bold absolute left-0 top-0"
              >
                {BRANCHES[idx]}
              </motion.span>
            </AnimatePresence>
          </span>
          <br className="hidden sm:block" />
          gedreven door AI.
        </h2>

        <p className="text-lg lg:text-xl text-white/70 leading-relaxed font-light max-w-3xl mx-auto">
          Het Commercial Intelligence System™ brengt marketing, branding, sales, AI en commerciële structuur samen
          in één AI-gedreven systeem voor bedrijven in de maakindustrie, techniek, logistiek en bouw.
          Voor voorspelbare instroom, schaalbare groei en volledige controle over commercie.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <a
            href="/ai-scan"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-brand-accent text-white font-display font-bold text-sm uppercase tracking-wider shadow-xl shadow-brand-accent/30 hover:bg-white hover:text-brand-primary transition-all"
          >
            Doe de AI scan
            <ArrowRight size={16} />
          </a>
          <a
            href="#het-systeem"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/10 border border-white/20 text-white font-display font-bold text-sm uppercase tracking-wider backdrop-blur-sm hover:bg-white/15 transition-all"
          >
            Bekijk het systeem
          </a>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   PIJNPUNTEN — H2 + 5 pijnpunten
   ──────────────────────────────────────────────────────────────────── */

const PIJNPUNTEN = [
  {
    n: '01',
    t: 'Wij zijn moeilijk vindbaar voor de klanten die wij willen.',
    d: 'Nieuwe klanten komen vooral via mond-tot-mondreclame of bestaande relaties. Dat werkt, totdat het niet meer werkt. Ondertussen zoeken beslissers in jouw sector actief online naar leveranciers en vinden zij jouw concurrent.',
  },
  {
    n: '02',
    t: 'Onze marketing levert wel activiteit op, maar nauwelijks aanvragen.',
    d: 'Er gaat budget naar advertenties, een nieuwe website of social media posts. Maar de aanvragen blijven uit of zijn niet gekwalificeerd. De oorzaak ligt zelden bij het kanaal, maar bij het ontbreken van een samenhangende strategie erachter.',
  },
  {
    n: '03',
    t: 'We werken met meerdere bureaus, maar niemand heeft het totaalplaatje.',
    d: 'Het SEO-bureau levert traffic. Het brandingbureau zorgt voor uitstraling. Het marketingbureau verstuurt nieuwsbrieven. Maar niemand weet waarom de aanvragen uitblijven, omdat niemand verantwoordelijk is voor het geheel.',
  },
  {
    n: '04',
    t: 'Goede leads verdwijnen in de opvolging.',
    d: 'Er zijn wel contactmomenten, maar geen systeem dat leads warm houdt en begeleidt richting een gesprek. Potentiële klanten haken af, niet omdat zij niet geïnteresseerd zijn, maar omdat de opvolging te laat komt of ontbreekt.',
  },
  {
    n: '05',
    t: 'Wij weten dat AI iets voor ons kan betekenen, maar weten niet waar te beginnen.',
    d: 'Iedereen heeft het over AI. Je ziet de mogelijkheden, maar in de praktijk blijft het bij experimenten zonder resultaat. Welke processen automatiseer je? Waar levert het echt tijdwinst op? Zonder een heldere strategie blijft AI een belofte in plaats van een voordeel.',
  },
];

export const PijnpuntenSection = () => (
  <section className="py-24 px-6 bg-[#FFFAF4]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
        <div className="lg:w-1/2">
          <div className="label-pill">Het probleem</div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary leading-tight mt-4">
            Technisch sterk. <br />
            <span className="text-brand-accent">Commercieel nog niet optimaal.</span>
          </h2>
        </div>
        <div className="lg:w-1/2 lg:pt-10">
          <p className="text-lg text-brand-primary/75 leading-relaxed font-light">
            Bedrijven in de technische industrie leveren uitstekend werk. Maar groei realiseren vraagt meer dan
            kwaliteit. Het vraagt om een commerciële structuur die branding, marketing, sales en AI verbindt.
            De meeste bedrijven missen die structuur, niet door gebrek aan inzet, maar omdat elk onderdeel los
            van het andere opereert.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PIJNPUNTEN.map((p) => (
          <div key={p.n} className="warm-card p-8 relative">
            <div className="absolute top-6 right-6 text-5xl font-display font-black text-brand-accent/10 select-none">
              {p.n}
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-brand-accent mb-5">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-lg font-display font-bold text-brand-primary mb-3 leading-snug pr-8">
              {p.t}
            </h3>
            <p className="text-sm text-brand-primary/75 leading-relaxed font-light">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-3xl mx-auto text-center">
        <p className="text-lg text-brand-primary/85 font-light leading-relaxed">
          Dit zijn geen uitzonderlijke situaties. Dit is de realiteit voor de meeste technische B2B-bedrijven in
          Nederland. De oplossing is geen extra bureau, een nieuw kanaal of een los AI-experiment.{' '}
          <span className="font-bold text-brand-primary">
            De oplossing is één systeem dat alles verbindt en slim maakt.
          </span>
        </p>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────
   3 LAGEN — Overview van Fundament / Motor / Afsluiter + AI versneller
   ──────────────────────────────────────────────────────────────────── */

const LAGEN = [
  {
    n: '01',
    laag: 'Laag 1',
    titel: 'Het Fundament',
    subtitel: 'Eerst de boodschap, dan de kanalen.',
    intro:
      'Zonder een scherpe positionering en een sterke merkidentiteit is elk marketingkanaal verspild geld. Het fundament bepaalt wie je bent, voor wie je de beste keuze bent en hoe je overkomt op elk contactmoment. Dit is waar het CIS begint.',
    items: ['Branding & Positionering', 'Website & Conversie-optimalisatie'],
    icon: Compass,
    accent: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
  },
  {
    n: '02',
    laag: 'Laag 2',
    titel: 'De Motor',
    subtitel: 'Zichtbaarheid, bereik en gekwalificeerde aanvragen.',
    intro:
      'Op basis van het fundament bouwen wij de kanalen die dagelijks voor zichtbaarheid en leads zorgen. Elk kanaal is afgestemd op de andere en versterkt het geheel. SEO trekt de juiste bezoekers aan, content bouwt autoriteit op, social media vergroot bereik en e-mail houdt prospects warm totdat zij klaar zijn voor een gesprek.',
    items: [
      'Organische vindbaarheid op Google en AI',
      'Social Media & LinkedIn',
      'Bedrijfsvideo\'s, foto\'s en content shoots',
      'Betaald adverteren',
      'Reputatie & Reviews (klantcases)',
      'Recruitment marketing',
      'Content en autoriteit',
      'E-mail en nurturing',
    ],
    icon: Zap,
    accent: 'from-blue-50 to-sky-50',
    border: 'border-blue-200',
  },
  {
    n: '03',
    laag: 'Laag 3',
    titel: 'De Afsluiter',
    subtitel: 'Van lead naar klant.',
    intro:
      'De overgang van lead naar klant is waar de meeste technische B2B-bedrijven omzet verliezen. De afsluiter zorgt dat gekwalificeerde leads niet verdwijnen in een CRM of worden opgevolgd met een standaard e-mail. Wij bouwen de salesstructuur die leads begeleidt richting een gesprek en een deal.',
    items: ['Sales Enablement & Leadopvolging', 'CRM & Procesoptimalisatie'],
    icon: Target,
    accent: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
  },
];

export const DrieLagenSection = () => (
  <section id="het-systeem" className="py-24 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">Het Commercial Intelligence System (CIS)</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mt-4 mb-6 tracking-tight">
          Eén systeem.<br />
          <span className="text-brand-accent">Drie lagen die op elkaar voortbouwen.</span>
        </h2>
        <p className="text-lg text-brand-primary/75 font-light leading-relaxed max-w-3xl mx-auto">
          Het CIS is de AI-gedreven groeimethode die wij bouwen voor B2B-bedrijven in de maakindustrie, techniek,
          logistiek en bouw. Geen losse campagnes of versnipperde bureaus, maar één geïntegreerd systeem waarin
          branding, marketing en sales samenwerken. Aangedreven door AI, zodat het systeem elke maand slimmer
          en sterker wordt.
        </p>
      </div>

      <div className="space-y-6">
        {LAGEN.map((l) => (
          <div
            key={l.n}
            className={`warm-card p-8 lg:p-10 bg-gradient-to-br ${l.accent} border-2 ${l.border}`}
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="lg:w-1/3 shrink-0">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-brand-primary/10 flex items-center justify-center text-brand-accent shadow-sm">
                    <l.icon size={28} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold mb-1">
                      {l.laag}
                    </div>
                    <h3 className="text-2xl font-display font-black text-brand-primary leading-tight">
                      {l.titel}
                    </h3>
                  </div>
                </div>
                <p className="text-base font-display font-bold text-brand-primary/85 italic">
                  {l.subtitel}
                </p>
              </div>
              <div className="lg:w-2/3">
                <p className="text-base text-brand-primary/80 leading-relaxed font-light mb-6">{l.intro}</p>
                <div className="flex flex-wrap gap-2">
                  {l.items.map((it) => (
                    <span
                      key={it}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-brand-primary/15 rounded-full text-xs font-display font-bold text-brand-primary"
                    >
                      <CheckCircle2 size={12} className="text-brand-accent" /> {it}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* AI versneller — speciaal blok */}
        <div className="warm-card p-8 lg:p-10 bg-gradient-to-br from-brand-primary to-[#0b4a7a] border-2 border-brand-primary text-white">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:w-1/3 shrink-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-accent flex items-center justify-center text-white shadow-lg">
                  <Sparkles size={28} />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-brand-lime font-bold mb-1">
                    De Versneller
                  </div>
                  <h3 className="text-2xl font-display font-black text-white leading-tight">
                    AI door alle lagen
                  </h3>
                </div>
              </div>
              <p className="text-base font-display font-bold text-white/85 italic">
                Slimmer, sneller en schaalbaarder.
              </p>
            </div>
            <div className="lg:w-2/3">
              <p className="text-base text-white/80 leading-relaxed font-light">
                AI is geen losse tool die je ergens bovenop legt. Binnen het CIS is AI verweven door alle drie de lagen.
                Het analyseert data, optimaliseert campagnes, automatiseert leadopvolging en geeft real-time inzicht
                in wat werkt. Zo wordt het systeem elke maand effectiever zonder dat het meer tijd kost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────
   12 MODULES — verdeeld over 3 lagen
   ──────────────────────────────────────────────────────────────────── */

const MODULES_GROEPEN = [
  {
    laag: 'Laag 1: Het Fundament',
    intro: 'Voordat een kanaal werkt, moet de basis kloppen. Deze twee modules vormen de fundering van alles wat daarna komt.',
    modules: [
      {
        n: '01',
        t: 'Branding & Positionering',
        d: 'Wie ben je, voor wie en waarom jij? Een scherpe positionering zorgt dat de juiste klant jou onmiddellijk begrijpt en de verkeerde klant afvalt voordat hij belt.',
        link: '/oplossingen/branding',
        linkLabel: 'Meer over Branding',
        icon: Compass,
      },
      {
        n: '02',
        t: 'Website & Conversie-optimalisatie',
        d: 'Alle modules sturen verkeer naar jouw website. Als die niet converteert, verlies je het merendeel van je investering. Wij bouwen en optimaliseren de pagina\'s die bezoekers omzetten in aanvragen.',
        link: null,
        icon: Globe,
      },
    ],
  },
  {
    laag: 'Laag 2: De Motor',
    intro: 'Op basis van het fundament bouwen wij de modules die dagelijks voor zichtbaarheid, bereik en gekwalificeerde leads zorgen.',
    modules: [
      {
        n: '03',
        t: 'SEO & AI-vindbaarheid',
        d: 'Beslissers in jouw sector zoeken actief online naar leveranciers, via Google maar steeds vaker ook via AI-zoekmachines zoals ChatGPT en Perplexity. Wij zorgen dat jij gevonden wordt op alle kanalen die ertoe doen, nu en in de toekomst.',
        link: null,
        icon: Search,
      },
      {
        n: '04',
        t: 'Content, Video & Autoriteit',
        d: 'Content die antwoord geeft op de vragen van jouw doelgroep bouwt vertrouwen op voordat het eerste gesprek plaatsvindt. Wij produceren teksten, bedrijfsvideo\'s en professioneel fotomateriaal dat laat zien wie je bent en wat je maakt.',
        link: null,
        icon: FileText,
      },
      {
        n: '05',
        t: 'Social Media & LinkedIn',
        d: 'LinkedIn is het platform waar beslissers in de maakindustrie, techniek en logistiek actief zijn. Wij zorgen voor een consistente aanwezigheid die zichtbaarheid en autoriteit opbouwt.',
        link: null,
        icon: Linkedin,
      },
      {
        n: '06',
        t: 'E-mail & Nurturing',
        d: 'Niet elke lead is direct klaar voor een gesprek. E-mail houdt prospects warm en begeleidt hen stap voor stap richting een samenwerking.',
        link: null,
        icon: Mail,
      },
      {
        n: '07',
        t: 'Betaalde Advertising',
        d: 'Gerichte advertenties op de juiste kanalen versnellen het bereik en brengen gekwalificeerde beslissers sneller in jouw funnel.',
        link: null,
        icon: Megaphone,
      },
      {
        n: '08',
        t: 'Reputatie & Reviews',
        d: 'In B2B is vertrouwen de drempel voor elk gesprek. Actief reputatiemanagement en reviews versterken jouw geloofwaardigheid op het moment dat een prospect jou beoordeelt.',
        link: null,
        icon: Star,
      },
      {
        n: '09',
        t: 'Recruitment Marketing & Employer Branding',
        d: 'Groei vraagt niet alleen om meer klanten, maar ook om de juiste mensen. Wij bouwen een employer brand dat jouw bedrijf aantrekkelijk maakt voor vakspecialisten en zorgen voor gerichte campagnes die de juiste kandidaten bereiken.',
        link: '/oplossingen/marketing',
        linkLabel: 'Meer over Marketing',
        icon: Users,
      },
    ],
  },
  {
    laag: 'Laag 3: De Afsluiter',
    intro: 'Gekwalificeerde leads binnenhalen is één. Zorgen dat zij klant worden is twee. Deze modules sluiten de commerciële cirkel.',
    modules: [
      {
        n: '10',
        t: 'Sales Enablement & Leadopvolging',
        d: 'Wij bouwen de salesstructuur die leads opvolgt op het juiste moment, met de juiste boodschap. Zodat geen enkele gekwalificeerde aanvraag verloren gaat.',
        link: null,
        icon: Target,
      },
      {
        n: '11',
        t: 'CRM & Procesoptimalisatie',
        d: 'Een goed ingericht CRM geeft grip op je commerciële proces. Wij zorgen voor de structuur waarin elke lead wordt gevolgd, opgevolgd en omgezet in omzet.',
        link: null,
        icon: Database,
      },
    ],
  },
  {
    laag: 'De Versneller: AI',
    intro: 'AI is geen losse toevoeging aan het systeem. Het is verweven door alle drie de lagen van het CIS.',
    modules: [
      {
        n: '12',
        t: 'AI & Automatisering',
        d: 'Van geautomatiseerde leadopvolging tot real-time dashboards en slimme campagneoptimalisatie. AI zorgt dat elke module slimmer werkt en het systeem elke maand meer oplevert zonder dat het meer tijd kost.',
        link: null,
        icon: Cpu,
        highlight: true,
      },
    ],
  },
];

export const ModulesSection = () => (
  <section className="py-24 px-6 bg-[#FFFAF4]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">De 12 modules van CIS</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mt-4 mb-6 tracking-tight">
          Alles wat jouw commerciële<br />
          <span className="text-brand-accent">systeem nodig heeft.</span>
        </h2>
        <p className="text-lg text-brand-primary/75 font-light leading-relaxed max-w-3xl mx-auto">
          Het CIS bestaat uit twaalf modules, verdeeld over drie lagen. Elke module heeft een eigen rol binnen
          het systeem. Samen vormen zij de commerciële structuur die branding, marketing en sales verbindt,
          aangedreven door AI.
        </p>
      </div>

      <div className="space-y-16">
        {MODULES_GROEPEN.map((groep) => (
          <div key={groep.laag}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
              <h3 className="text-2xl lg:text-3xl font-display font-bold text-brand-primary tracking-tight">
                {groep.laag}
              </h3>
              <p className="text-sm text-brand-primary/65 font-light italic md:max-w-md md:text-right">
                {groep.intro}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groep.modules.map((m) => (
                <div
                  key={m.n}
                  className={`warm-card p-7 flex flex-col ${
                    (m as { highlight?: boolean }).highlight
                      ? 'bg-gradient-to-br from-brand-primary to-[#0b4a7a] text-white border-brand-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        (m as { highlight?: boolean }).highlight
                          ? 'bg-brand-accent text-white'
                          : 'bg-amber-50 text-brand-accent'
                      }`}
                    >
                      <m.icon size={22} />
                    </div>
                    <span
                      className={`text-xs font-display font-black ${
                        (m as { highlight?: boolean }).highlight ? 'text-white/30' : 'text-brand-primary/15'
                      }`}
                    >
                      Module {m.n}
                    </span>
                  </div>
                  <h4
                    className={`text-lg font-display font-bold mb-3 leading-snug ${
                      (m as { highlight?: boolean }).highlight ? 'text-white' : 'text-brand-primary'
                    }`}
                  >
                    {m.t}
                  </h4>
                  <p
                    className={`text-sm leading-relaxed font-light flex-1 ${
                      (m as { highlight?: boolean }).highlight ? 'text-white/80' : 'text-brand-primary/75'
                    }`}
                  >
                    {m.d}
                  </p>
                  {m.link && (
                    <a
                      href={m.link}
                      className={`mt-5 inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-widest transition-colors ${
                        (m as { highlight?: boolean }).highlight
                          ? 'text-brand-lime hover:text-white'
                          : 'text-brand-accent hover:text-brand-primary'
                      }`}
                    >
                      {(m as { linkLabel?: string }).linkLabel} <ArrowRight size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-lg text-brand-primary/85 font-light max-w-2xl mx-auto mb-6">
          Elke module versterkt de andere. Dat is wat het CIS onderscheidt van losse bureaus of campagnes.
        </p>
        <a
          href="#hoe-het-samenkomt"
          className="inline-flex items-center gap-2 text-sm font-display font-bold uppercase tracking-widest text-brand-accent hover:text-brand-primary transition-colors"
        >
          Bekijk hoe het systeem samenkomt ↓
        </a>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────
   FUNNEL VISUALISATIE — Hoe alles samenkomt + 3 lagen toegelicht
   ──────────────────────────────────────────────────────────────────── */

export const HoeHetSamenkomtSection = () => (
  <section id="hoe-het-samenkomt" className="py-24 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">Zo werkt het systeem</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mt-4 mb-6 tracking-tight">
          Zo werkt het<br />
          <span className="text-brand-accent">Commercial Intelligence System.</span>
        </h2>
        <p className="text-lg text-brand-primary/75 font-light leading-relaxed max-w-3xl mx-auto">
          Elke module in het CIS heeft een eigen rol, maar geen enkele module werkt zonder de andere. Het systeem
          is opgebouwd als een trechter: breed aan de voorkant waar de basis wordt gelegd, smaller wordend
          naarmate een prospect dichter bij een samenwerking komt. AI versnelt en optimaliseert het geheel op
          elk punt in de trechter.
        </p>
      </div>

      {/* Funnel SVG visualisatie */}
      <div className="bg-gradient-to-br from-[#FFFAF4] to-white rounded-[32px] border-2 border-amber-100 p-8 lg:p-12 shadow-sm mb-20">
        <div className="grid lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-stretch">
          {/* Fundament — breed */}
          <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold mb-2">Laag 1</div>
            <h4 className="text-xl font-display font-black text-brand-primary mb-4">Fundament</h4>
            <div className="space-y-2 flex-1">
              {['Branding & Positionering', 'Website & CRO'].map((x) => (
                <div key={x} className="text-xs px-3 py-2 bg-amber-50 rounded-lg text-brand-primary/80 font-medium">
                  {x}
                </div>
              ))}
            </div>
          </div>

          {/* Motor — middel */}
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold mb-2">Laag 2</div>
            <h4 className="text-xl font-display font-black text-brand-primary mb-4">Motor</h4>
            <div className="space-y-2 flex-1">
              {[
                'SEO & AI-vindbaarheid',
                'Content, Video & Autoriteit',
                'Social media & LinkedIn',
                'E-mail & Nurturing',
                'Betaalde Advertising',
                'Reputatie & Recruitment',
              ].map((x) => (
                <div key={x} className="text-xs px-3 py-2 bg-blue-50 rounded-lg text-brand-primary/80 font-medium">
                  {x}
                </div>
              ))}
            </div>
          </div>

          {/* Afsluiter — smaller */}
          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 flex flex-col">
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold mb-2">Laag 3</div>
            <h4 className="text-xl font-display font-black text-brand-primary mb-4">Afsluiter</h4>
            <div className="space-y-2 flex-1">
              {['Sales Enablement', 'Leadopvolging', 'CRM & Proces'].map((x) => (
                <div key={x} className="text-xs px-3 py-2 bg-emerald-50 rounded-lg text-brand-primary/80 font-medium">
                  {x}
                </div>
              ))}
            </div>
          </div>

          {/* Resultaat — pijl */}
          <div className="flex items-center justify-center lg:flex-col gap-3 lg:gap-2 px-4">
            <ArrowRight className="text-brand-accent lg:hidden" size={28} />
            <svg className="hidden lg:block text-brand-accent" width="28" height="56" viewBox="0 0 28 56" fill="none">
              <path d="M2 4 L26 28 L2 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-primary/50 font-bold mb-1">
                Resultaat
              </div>
              <div className="text-base font-display font-black text-brand-primary leading-tight">
                Aanvraag
              </div>
            </div>
          </div>
        </div>

        {/* AI band onderaan */}
        <div className="mt-6 px-6 py-4 bg-gradient-to-r from-brand-primary to-[#0b4a7a] rounded-2xl flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-lime font-bold">
              De Versneller
            </div>
            <div className="text-sm font-display font-bold">
              AI & Automatisering — versneller door alle lagen
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-brand-primary/40 font-medium uppercase tracking-widest">
          Commercial Intelligence System — Optimaal Groeien
        </div>
      </div>

      {/* 3 lagen toegelicht */}
      <div className="grid lg:grid-cols-3 gap-6">
        {[
          {
            laag: 'Het Fundament',
            sub: 'Breed en onmisbaar',
            d: 'Alles begint met de juiste basis. Positionering bepaalt wie je bent en voor wie. De website zorgt dat bezoekers omgezet worden in aanvragen. Zonder een sterk fundament verliezen alle andere modules kracht, want je bouwt op een wankele basis.',
            icon: Compass,
          },
          {
            laag: 'De Motor',
            sub: 'Zichtbaarheid en bereik',
            d: 'Op basis van het fundament zetten wij de kanalen in die dagelijks voor zichtbaarheid, bereik en gekwalificeerde leads zorgen. SEO en AI-vindbaarheid zorgen dat de juiste beslissers jou vinden. Content, video en social media bouwen vertrouwen op. Advertising versnelt het bereik. E-mail houdt prospects warm.',
            icon: Zap,
          },
          {
            laag: 'De Afsluiter',
            sub: 'Van lead naar klant',
            d: 'Leads binnenhalen is één. Zorgen dat zij klant worden is twee. De afsluiter verbindt marketing direct aan sales. Slimme leadopvolging, een goed ingericht CRM en een sterke salesstructuur zorgen dat geen enkele gekwalificeerde aanvraag verloren gaat.',
            icon: Target,
          },
        ].map((l) => (
          <div key={l.laag} className="warm-card p-7">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-brand-accent mb-5">
              <l.icon size={22} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold mb-2">{l.sub}</div>
            <h3 className="text-xl font-display font-bold text-brand-primary mb-3 leading-tight">{l.laag}</h3>
            <p className="text-sm text-brand-primary/75 leading-relaxed font-light">{l.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-gradient-to-br from-brand-primary to-[#0b4a7a] rounded-[28px] text-white text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="text-brand-lime" size={20} />
          <span className="text-[10px] uppercase tracking-[0.2em] text-brand-lime font-bold">
            AI — de versneller door alle lagen
          </span>
        </div>
        <p className="text-base text-white/85 leading-relaxed font-light max-w-3xl mx-auto">
          AI is geen losse module die je bovenop het systeem legt. Het is verweven door elke laag. Van
          geautomatiseerde leadopvolging tot real-time dashboards en slimme campagneoptimalisatie. AI zorgt
          dat het systeem elke maand meer oplevert, zonder dat het meer tijd kost.
        </p>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────────
   TRAJECT INTRO — Brug naar bestaande RoadmapSection
   ──────────────────────────────────────────────────────────────────── */

export const TrajectIntroSection = () => (
  <section className="pt-24 pb-0 px-6 bg-[#FFFAF4]">
    <div className="max-w-4xl mx-auto text-center">
      <div className="label-pill mx-auto">Het traject</div>
      <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mt-4 mb-6 tracking-tight">
        Van nulmeting naar een commercieel<br />
        <span className="text-brand-accent">systeem dat elke maand sterker wordt.</span>
      </h2>
      <p className="text-lg text-brand-primary/75 font-light leading-relaxed">
        Het CIS bouwen we niet in één dag. We bouwen het stap voor stap, zodat elk onderdeel op het juiste moment
        wordt gelegd en direct bijdraagt aan resultaat. Dit is hoe het traject eruitziet.
      </p>
    </div>
  </section>
);

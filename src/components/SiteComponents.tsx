import React from 'react';
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring } from 'motion/react';
import {
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Plus,
  Star,
  ShieldCheck,
  Clock,
  Target,
  BarChart3,
  Zap,
  MessageSquare,
  Users,
} from 'lucide-react';
import { CommercialQuiz } from './CommercialQuiz';

// --- Shared Components ---

export const Navbar = (_: { activePage?: string, setActivePage?: (p: string) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const rawScaleY = useTransform(velocity, [-2500, 0, 2500], [1.06, 1, 0.94]);
  const rawY      = useTransform(velocity, [-2500, 0, 2500], [-3, 0, 3]);
  const logoScaleY = useSpring(rawScaleY, { stiffness: 180, damping: 18, mass: 0.6 });
  const logoY      = useSpring(rawY,      { stiffness: 180, damping: 18, mass: 0.6 });

  const NAV_ITEMS = [
    { label: 'Over ons',      href: '/over-ons' },
    { label: 'Klantcases',    href: '/klantcases' },
    { label: 'Onze methode',  href: '/onze-methode' },
    { label: 'Blog',          href: '/blog' },
    { label: 'Contact',       href: '/contact' },
  ];

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass = 'text-[11px] uppercase tracking-[0.15em] font-bold transition-colors text-brand-primary/70 hover:text-brand-accent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        <a href="/" className="flex items-center shrink-0">
          <motion.img
            src="/images/logo.webp"
            alt="Optimaal Groeien"
            width="300" height="57"
            className={`transition-[height] duration-300 ${isScrolled ? 'h-9' : 'h-10'} w-auto`}
            style={{ scaleY: logoScaleY, y: logoY, transformOrigin: 'center' }}
          />
        </a>

        <div className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} className={linkClass}>{item.label}</a>
          ))}

          <a
            href="/ai-scan"
            className="ml-2 flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-display font-bold bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:bg-brand-primary hover:shadow-brand-primary/20 transition-all"
          >
            Gratis AI Scan
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        <button aria-label={isOpen ? 'Menu sluiten' : 'Menu openen'} className="lg:hidden text-brand-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white shadow-2xl flex flex-col rounded-b-[32px] overflow-hidden"
          >
            <div className="px-8 py-6 flex flex-col gap-1">
              {NAV_ITEMS.map(item => (
                <a key={item.href} href={item.href} className="text-brand-primary font-bold uppercase tracking-widest text-xs py-4 border-b border-slate-50" onClick={() => setIsOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
            <div className="px-8 pb-8">
              <a
                href="/ai-scan"
                className="flex items-center justify-center gap-2 w-full py-4 bg-brand-accent text-white rounded-2xl font-display font-bold text-sm hover:bg-brand-primary transition-all"
                onClick={() => setIsOpen(false)}
              >
                Gratis AI Scan
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => (
  <footer className="bg-brand-primary pt-24 pb-12 text-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <img src="/images/logo.webp" alt="Optimaal Groeien" width="300" height="57" className="h-8 w-auto" />
          </div>
          <p className="text-sm text-white/65 leading-relaxed max-w-xs">
            Wij bouwen en runnen de volledige commerciële structuur van B2B-bedrijven in industrie, machinebouw, logistiek, bouw en techniek.
          </p>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-lime mb-8">Navigatie</h3>
          <ul className="space-y-4 text-sm text-white/72">
            <li><a href="#" className="hover:text-white transition-colors">Hoe we helpen</a></li>
            <li><a href="#team" className="hover:text-white transition-colors">Het team</a></li>
            <li><a href="#cases" className="hover:text-white transition-colors">Verhalen van anderen</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Even kennismaken</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-lime mb-8">Contact</h3>
          <ul className="space-y-4 text-sm text-white/72">
            <li>info@optimaalgroeien.nl</li>
            <li>+31 (0) 57 270 0246</li>
            <li>Boeierstraat 9, Raalte</li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-lime mb-8">Legal</h3>
          <ul className="space-y-4 text-sm text-white/72">
            <li>Privacybeleid</li>
            <li>Algemene Voorwaarden</li>
            <li>KVK: 7182910</li>
          </ul>
        </div>
      </div>

      <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] text-white/55 uppercase tracking-widest font-bold">
          © 2026 Optimaal Groeien. Alle rechten voorbehouden.
        </p>
        <div className="flex gap-10 text-[10px] uppercase tracking-widest font-bold text-white/60">
          <span>Raalte, Nederland</span>
          <span className="text-brand-lime">+3157 270 0246</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- Page 1 Components ---

const SECTORS = ['technische sector', 'industrie', 'logistiek', 'bouw'];

export const PartnerHero = () => {
  const [sectorIdx, setSectorIdx] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setSectorIdx(i => (i + 1) % SECTORS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hero-warm relative overflow-hidden pt-28 lg:pt-36 pb-16 lg:pb-24 px-6">
      {/* Ambient glow — stays out of the way */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-amber-200/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-14">

          {/* Left — text */}
          <div className="lg:w-[52%] text-left flex flex-col gap-7">
            <div className="label-pill self-start">
              <span className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
              Gedreven door AI
            </div>

            <h1 className="text-[2.4rem] lg:text-[3.25rem] font-display font-bold text-brand-primary leading-[1.1] tracking-tight max-w-lg">
              Commercieel Partner voor B2B bedrijven in de{' '}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={sectorIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="text-brand-accent inline-block"
                  >
                    {SECTORS[sectorIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="text-base lg:text-lg text-brand-ink/70 max-w-md leading-relaxed">
              Veel technische bedrijven groeien op toeval en netwerk. Wij veranderen dat in een voorspelbare commerciële machine: AI, branding, marketing en sales als één geheel.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://meetings-eu1.hubspot.com/stefan-kelderman"
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full sm:w-auto !py-4 !px-9 text-sm !bg-[#ed7c2f] flex items-center justify-center"
              >
                Plan een gesprek
              </a>
              <a
                href="/ai-scan"
                className="w-full sm:w-auto px-7 py-4 bg-white text-brand-primary rounded-2xl font-display font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-amber-100 shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                Gratis AI Analyse
              </a>
            </div>

            {/* Garanties */}
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                'Geen verkoopgesprek',
                'Binnen 30 dagen live',
                'Groei of gratis door',
              ].map((g) => (
                <div key={g} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-100 rounded-xl shadow-sm">
                  <svg className="w-3.5 h-3.5 text-brand-lime shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  <span className="text-xs font-display font-bold text-brand-primary">{g}</span>
                </div>
              ))}
            </div>

            {/* Trust logos */}
            <div className="pt-6 border-t border-amber-100 flex flex-wrap items-center gap-6 opacity-50 hover:opacity-80 transition-opacity duration-500">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-ink shrink-0">Vertrouwd door</span>
              {[
                { name: "Veldkamp",  src: "/images/klanten/veldkamp.webp" },
                { name: "Equans",    src: "/images/klanten/equans.webp" },
                { name: "Carbify",   src: "/images/klanten/carbify.webp" },
                { name: "Plintenfabriek", src: "/images/klanten/plintenfabriek.webp" },
                { name: "Ztahl",     src: "/images/klanten/ztahl.webp" },
              ].map(l => (
                <img key={l.name} src={l.src} alt={l.name} className="h-6 w-auto max-w-[90px] object-contain grayscale" loading="lazy" />
              ))}
            </div>
          </div>

          {/* Right — quiz */}
          <div className="lg:w-[48%] w-full">
            <CommercialQuiz />
          </div>

        </div>
      </div>
    </section>
  );
};

export const ToolsSection = () => {
  const tools = [
    { name: "Meta", src: "/images/logos/meta.webp", w: 178, h: 36 },
    { name: "Google", src: "/images/logos/google.webp", w: 109, h: 36 },
    { name: "HubSpot", src: "/images/logos/hubspot.webp", w: 125, h: 36 },
    { name: "Salesforce", src: "/images/logos/salesforce.webp", w: 51, h: 36 },
    { name: "LinkedIn", src: "/images/logos/linkedin.webp", w: 135, h: 36 },
    { name: "Make", src: "/images/logos/make.webp", w: 174, h: 36 },
    { name: "Claude AI", src: "/images/logos/claude.webp", w: 321, h: 36 },
    { name: "OpenAI", src: "/images/logos/openai.webp", w: 130, h: 36 },
    { name: "Gemini", src: "/images/logos/gemini.webp", w: 145, h: 36 },
    { name: "Adobe", src: "/images/logos/adobe.webp", w: 136, h: 36 },
    { name: "Brevo", src: "/images/logos/brevo.webp", w: 122, h: 36 },
  ];
  return (
    <section className="py-20 bg-white border-y border-amber-100/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-14">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-primary/75 mb-3">Wij werken met de beste tools</p>
        <p className="text-brand-primary/75 text-sm max-w-2xl mx-auto leading-relaxed">
          Wij begrijpen de complexiteit van jullie bedrijf, doelgroep en de markt. Dat stelt ons in staat om proactief de volledige regie over jullie groei te nemen, terwijl jij je focust op de operatie.
        </p>
      </div>
      <div className="relative">
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div
          className="flex items-center"
          style={{ animation: 'marquee 32s linear infinite' }}
        >
          {[...tools, ...tools].map((tool, i) => (
            <div
              key={i}
              className="flex items-center justify-center shrink-0 px-8"
              title={tool.name}
            >
              <img
                src={tool.src}
                alt={tool.name}
                width={tool.w}
                height={tool.h}
                className="h-8 lg:h-9 w-auto object-contain opacity-50 hover:opacity-90 transition-opacity duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HerkenJeDitSection = () => (
  <section className="py-24 px-6 bg-[#FFFAF4]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-start mb-16">
        <div className="lg:w-1/2">
          <div className="label-pill">De kosten van stilstand</div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary leading-tight mb-4">
            Je hebt grip op de techniek. <br />
            <span className="text-brand-accent">Maar je groei voelt als toeval.</span>
          </h2>
        </div>
        <div className="lg:w-1/2 lg:pt-10">
          <p className="text-lg text-brand-primary/75 leading-relaxed font-light">
            We horen het vaak: "Onze producten zijn top, onze klanten zijn blij, maar nieuwe klanten vinden is volledig afhankelijk van ons netwerk". Je groeit groeit op basis van wie je kent, niet op basis van wat je waard bent. Wij bouwen een systeem dat jullie technische superioriteit vertaalt naar een constante stroom van de juiste opdrachten.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { title: "Je netwerk heeft een plafond", text: "Je bent gegroeid via mond-tot-mond reclame. Dat is prachtig, want het bewijst je kwaliteit. Maar het is niet meer genoeg om de volgende stap te zetten. Je bedrijf groeit, maar met name vanuit relatiebeheer. New business blijft te veel uit." },
          { title: "Je doet het er 'even bij'", text: "Commercie is iets wat je er tussendoor doet. Er is geen vast moment, geen vaste structuur, en daardoor geen rust. Je weet dat het anders moet, maar wanneer?" },
          { title: "Je wilt 'iets' met AI", text: "Je wilt wat met AI, maar wat? Iedereen wil innoveren met AI, maar de waan van de dag regeert. Omdat een structurele aanpak ontbreekt, mis je de aansluiting." },
          { title: "Je mist commerciële structuur", text: "Leads en aanvragen worden ad-hoc opgepakt. Zonder een duidelijke structuur voor opvolging blijft er te veel liggen en haal je niet het maximale uit je markt." },
          { title: "Nieuwe sectoren kennen je niet", text: "Je weet zeker dat je bedrijven in andere branches perfect kunt helpen, maar zij weten simpelweg niet dat je bestaat. Die deur blijft voorlopig dicht." },
          { title: "Cijfers? Die zitten in je hoofd", text: "Je voelt wel hoe het gaat, maar je hebt geen dashboard dat je vertelt waar de beste kansen liggen. Je stuurt op je onderbuik." }
        ].map((item, i) => (
          <div key={i} className="warm-card p-8">
            <div className="mb-5 flex items-center justify-between">
               <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-brand-accent">
                  <Plus size={20} />
               </div>
               <span className="guide-badge">Herkenbaar?</span>
            </div>
            <h3 className="text-lg font-display font-bold text-brand-primary mb-3 leading-tight">{item.title}</h3>
            <p className="text-sm text-brand-primary/75 leading-relaxed font-light">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const HoeWeHelpenSection = () => (
  <section id="diensten" className="py-24 px-6 bg-white overflow-hidden relative">
    <div className="absolute top-0 left-0 w-full h-px bg-amber-100" />
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
      <div className="lg:w-3/5">
        <div className="label-pill">Hoe we je helpen</div>
        <h2 className="text-3xl lg:text-5xl font-display font-bold text-brand-primary mb-6 tracking-tight">
          Wij begrijpen jullie techniek. <br/>
          <span className="text-brand-accent">En bouwen de machine die het verkoopt.</span>
        </h2>
        <p className="text-lg text-brand-primary/75 mb-12 leading-relaxed max-w-xl font-light">
          De meeste bureaus snappen de complexiteit van de industrie niet. Wij wel. We sturen geen dikke adviesrapporten vanaf de zijlijn, maar komen als team bij jullie langs om de kern van jullie bedrijf te doorgronden. Pas als we jullie vakmanschap écht begrijpen, bouwen we het systeem dat jullie groei dicteert.
        </p>

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {[
              { icon: Users, title: "Vakkennis op locatie", desc: "Geen oppervlakkig praatje; wij komen fysiek langs en draaien mee op de werkvloer om jullie complexe service echt te doorgronden." },
              { icon: Target, title: "Een plan op maat", desc: "Geen dik adviesrapport, maar een duidelijke routekaart voor je groei." },
              { icon: Zap, title: "Bedrijfsvideo's & foto's", desc: "Foto's en video's van je eigen machines en mensen. Geen neppe stock." },
              { icon: BarChart3, title: "AI als fundament", desc: "Wij automatiseren wat werkt, van automatische leadopvolging tot real-time dashboards die je grip geven op de cijfers." },
              { icon: Clock, title: "Wekelijks contact", desc: "Wekelijks contact en om de twee weken zitten we fysiek of digitaal samen om de voortgang te bespreken en de koers direct bij te sturen." },
              { icon: MessageSquare, title: "Sluitende salesflows", desc: "Wij verbinden marketing direct aan sales, inclusief ondersteuning bij leadopvolging en scriptwerk om deals daadwerkelijk te sluiten." },
              { icon: Star, title: "Gevonden worden", desc: "We zorgen dat beslissers in de industrie jou gaan zien als de expert." },
              { icon: CheckCircle2, title: "Transparante cijfers", desc: "In één oogopslag zien hoe het gaat. Gewoon op je telefoon." }
            ].map((s, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-11 h-11 bg-brand-accent/10 border border-amber-100 rounded-[16px] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-brand-accent/30 group-hover:bg-brand-accent/15 transition-all">
                   <s.icon size={18} className="text-brand-accent transition-colors" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-brand-primary mb-1 text-lg">{s.title}</h3>
                  <p className="text-sm text-brand-primary/75 font-light leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="lg:w-2/5 w-full lg:sticky lg:top-28 space-y-6">
        <div className="warm-card">
          <img src="/images/team-1-lg.webp" srcSet="/images/team-1-sm.webp 480w, /images/team-1-lg.webp 800w" sizes="(max-width: 768px) 100vw, 50vw" alt="Samenwerken bij Optimaal Groeien" className="w-full h-56 object-cover object-[center_20%]" loading="lazy" />
          <div className="p-5 bg-white">
            <p className="text-sm font-display font-bold text-brand-primary">Samen werken we aan jouw groei.</p>
            <p className="text-xs text-brand-primary/75 mt-1">Geen vage rapporten, maar echte samenwerking.</p>
          </div>
        </div>

        <div className="bg-brand-primary p-10 text-white rounded-[28px] relative overflow-hidden shadow-xl">
          <div className="soft-glow !bg-brand-lime/10" />
          <div className="text-2xl font-display font-bold leading-tight mb-6 relative z-10 text-white">
            "Wij ontzorgen je echt, <br />
            <span className="text-brand-lime">geen losse flodders.</span>"
          </div>
          <p className="text-white/70 mb-8 relative z-10 leading-relaxed font-light text-sm">
            We zijn geen bureau dat alleen maar rapporten stuurt. We zijn je partner die de mouwen opstroopt.
          </p>

          <div className="space-y-3 relative z-10">
            {[
              { t: "Eenvoudig voor jou", d: "Je hoeft geen IT-expert te zijn. Wij regelen de techniek." },
              { t: "Snel resultaat", d: "Geen maanden wachten, we gaan direct aan de slag." },
              { t: "Korte lijntjes", d: "Direct contact met Stefan. Geen keuzemenu's." }
            ].map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <CheckCircle2 size={20} className="text-brand-lime shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-display font-bold text-white mb-0.5">{g.t}</div>
                  <div className="text-xs text-white/60 font-medium">{g.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const TeamSection = () => (
  <section id="team" className="py-24 px-6 bg-[#FFFAF4]">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
        <div className="lg:w-1/2">
          <div className="label-pill">Het team</div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mb-6 tracking-tight">
            Dit zijn de mensen die <span className="text-brand-accent">voor je aan de slag gaan.</span>
          </h2>
          <p className="text-lg text-brand-primary/75 leading-relaxed font-light max-w-md">
            Geen anoniem bureau, maar een hecht team dat echt met je meedenkt. We werken vanuit Raalte, voor het hele land.
          </p>
        </div>
        <div className="lg:w-1/2 flex gap-4">
          <div className="rounded-[24px] overflow-hidden shadow-xl border border-brand-soft w-1/2">
            <img src="/images/team-phone-lg.webp" srcSet="/images/team-phone-sm.webp 480w, /images/team-phone-lg.webp 800w" sizes="(max-width: 768px) 100vw, 50vw" alt="Teamlid aan het werk" className="w-full h-64 object-cover object-top" loading="lazy" />
          </div>
          <div className="rounded-[24px] overflow-hidden shadow-xl border border-brand-soft w-1/2 mt-8">
            <img src="/images/team-4-lg.webp" srcSet="/images/team-4-sm.webp 480w, /images/team-4-lg.webp 700w" sizes="(max-width: 768px) 100vw, 50vw" alt="Teamleden" className="w-full h-64 object-cover object-top" loading="lazy" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-[28px] overflow-hidden shadow-xl border border-brand-soft">
          <img src="/images/team-full-lg.webp" srcSet="/images/team-full-sm.webp 600w, /images/team-full-lg.webp 1000w" sizes="(max-width: 768px) 100vw, 65vw" alt="Het complete team van Optimaal Groeien" className="w-full h-80 lg:h-96 object-cover object-center" loading="lazy" />
        </div>
        <div className="bg-white p-8 rounded-[28px] border border-brand-soft flex flex-col justify-center">
          <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-accent mb-6">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-display font-bold text-brand-primary mb-3">Jouw commerciële afdeling</h3>
          <p className="text-brand-primary/75 leading-relaxed font-light text-sm mb-6">
            Van strategie tot content, van advertenties tot automatisering. Samen bouwen we de machine die jouw groei aanstuurt.
          </p>
          <div className="flex -space-x-2">
            <img src="/images/team-1-avatar.webp" className="w-10 h-10 rounded-full border-2 border-white object-cover object-[center_25%]" alt="" loading="lazy" />
            <img src="/images/team-phone-avatar.webp" className="w-10 h-10 rounded-full border-2 border-white object-cover object-top" alt="" loading="lazy" />
            <img src="/images/team-stefan-relax-avatar.webp" className="w-10 h-10 rounded-full border-2 border-white object-cover object-top" alt="" loading="lazy" />
            <img src="/images/team-4-avatar.webp" className="w-10 h-10 rounded-full border-2 border-white object-cover object-top" alt="" loading="lazy" />
            <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-soft flex items-center justify-center text-[10px] font-bold text-brand-primary">+4</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const KlantverhalenSection = () => (
  <section id="cases" className="py-24 px-6 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-end mb-16">
      <div className="lg:w-1/2">
        <div className="label-pill">Kijk mee bij anderen</div>
        <h2 className="text-3xl lg:text-5xl font-display font-bold text-brand-primary mb-5 tracking-tight leading-tight">
          Succes is geen toeval, <br /><span className="text-brand-accent">het is een keuze.</span>
        </h2>
        <p className="text-lg text-brand-ink/75 max-w-xl font-light leading-relaxed">
          Geen saaie grafieken, maar echte verhalen van bedrijven die hun commercie voorgoed hebben veranderd.
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { name: "Veldkamp", sector: "Industrie", res: "+150% omzet", desc: "Zij dachten dat koude acquisitie de enige weg was. Nu komen de aanvragen gewoon via hun website binnen." },
          { name: "Equans", sector: "Techniek", res: "Beter bereik", desc: "Beslissers in de energiemarkt wisten hen niet te vinden. Nu staan ze overal bovenaan en weten klanten wie ze zijn." },
          { name: "Plintenfabriek", sector: "Machinebouw", res: "Marktleider", desc: "Alles werd handmatig gedaan. Nu lopen hun salesprocessen via een slim systeem dat nooit slaapt." },
        ].map((c, i) => (
          <div key={i} className="warm-card group p-8 relative">
            <div className="absolute top-0 right-0 p-6 opacity-5">
               <Star size={40} className="text-brand-accent" />
            </div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-display font-bold text-brand-primary mb-1 tracking-tight">{c.name}</h3>
                <div className="text-[11px] uppercase tracking-widest text-brand-ink/55 font-bold">{c.sector}</div>
              </div>
              <div className="px-3 py-1 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                {c.res}
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-brand-ink/75 leading-relaxed font-light mb-8 text-sm min-h-[4rem]">
                {c.desc}
              </p>
              <button className="text-brand-ink/55 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-brand-accent transition-colors">
                Hun verhaal lezen <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const KlantenLogosSection = () => {
  const logos = [
    { name: "Equans",                 src: "/images/klanten/equans.webp" },
    { name: "Veldkamp",               src: "/images/klanten/veldkamp.webp" },
    { name: "Plintenfabriek",         src: "/images/klanten/plintenfabriek.webp" },
    { name: "Carbify",                src: "/images/klanten/carbify.webp" },
    { name: "Avia Volt",              src: "/images/klanten/avia-volt.webp" },
    { name: "Laundry Total",          src: "/images/klanten/laundry-total.webp" },
    { name: "Farrow + Dutch",         src: "/images/klanten/farrow-dutch.webp" },
    { name: "Logistique",             src: "/images/klanten/logistique.webp" },
    { name: "Paradera Park",          src: "/images/klanten/paradera-park.webp" },
    { name: "AHR Recycling",          src: "/images/klanten/ahr-recycling.webp" },
    { name: "People Jobs",            src: "/images/klanten/people-jobs.webp" },
    { name: "Ztahl",                  src: "/images/klanten/ztahl.webp" },
    { name: "Koot Flowers",           src: "/images/klanten/koot-flowers.webp" },
    { name: "Accura Flexcut",         src: "/images/klanten/accura-flexcut.webp" },
    { name: "Thuiszorgbed Voordeel",  src: "/images/klanten/thuiszorgbed-voordeel.webp" },
    { name: "P. van Eijzeren",        src: "/images/klanten/van-eijzeren.webp" },
  ];
  return (
    <section className="py-16 px-6 bg-white border-t border-amber-100/60 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-brand-primary/40 mb-10">
          Zij gingen je al voor
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="flex items-center gap-10" style={{ animation: 'marquee 40s linear infinite' }}>
            {[...logos, ...logos].map((l, i) => (
              <div key={i} className="shrink-0 flex items-center justify-center h-12 px-2 opacity-50 hover:opacity-80 transition-opacity">
                <img src={l.src} alt={l.name} className="h-8 w-auto max-w-[120px] object-contain grayscale hover:grayscale-0 transition-all" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const OnzeBelofteSection = () => (
  <section className="py-24 px-6 bg-[#FFFAF4] relative overflow-hidden">
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">Geen kleine lettertjes</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mb-6 tracking-tight">Onze belofte aan jou.</h2>
        <p className="text-lg text-brand-ink/75 font-light max-w-xl mx-auto">Wij geloven zo sterk in wat we doen, dat we het risico graag bij onszelf leggen. Zo kun jij met een gerust hart beginnen.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {[
          { n: "01", t: "Groei gegarandeerd", d: "Zien we na 6 maanden niet de groei die we hadden afgesproken? Dan werken we gratis door. Zo simpel is het." },
          { n: "02", t: "Binnen 30 dagen live", d: "Binnen 30 dagen ben je live. Geen trajecten van een jaar, maar vlot en duidelijk aan de slag voor je onderneming." },
          { n: "03", t: "Jij bent en blijft de baas", d: "Alles wat we maken, van de foto's tot de data, is van jou. Je zit nooit aan ons vast. Vrijheid boven alles." }
        ].map((g, i) => (
          <div key={i} className="warm-card group relative p-10 overflow-hidden">
            <div className="absolute -top-4 -right-4 text-8xl font-display font-black text-amber-100/60 group-hover:text-brand-accent/10 transition-all duration-500 select-none">
              {g.n}
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-brand-accent/10 border border-amber-200 rounded-2xl flex items-center justify-center text-brand-accent mb-8 group-hover:scale-110 group-hover:bg-brand-accent/15 transition-all duration-300">
                <ShieldCheck size={32} />
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold mb-3">Belofte {g.n}</div>
              <h3 className="text-2xl font-display font-bold text-brand-primary mb-4 leading-tight">{g.t}</h3>
              <p className="text-brand-ink/75 leading-relaxed font-light text-sm">{g.d}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent/0 group-hover:bg-brand-accent/30 transition-all duration-500" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const RoadmapSection = () => (
  <section className="py-24 px-6 bg-[#FFFAF4] relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">30 dagen naar live</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary tracking-tight mt-4">
          Van eerste gesprek naar<br />
          <span className="text-brand-accent">volledig systeem in 30 dagen.</span>
        </h2>
      </div>

      <div className="relative">
        {/* Connecting line desktop */}
        <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-amber-200 z-0" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {[
            { n: '01', t: 'We komen langs bij jou op locatie', d: 'We lopen mee op de werkvloer, snappen wat jij maakt, en doorgronden wie jouw ideale klant is.' },
            { n: '02', t: 'We ontwikkelen een commercieel plan op maat', d: 'Geen dik adviesrapport. Een concrete routekaart met prioriteiten, doelen en eerste stappen.' },
            { n: '03', t: 'Professionele bedrijfsvideo en foto\'s', d: 'Wij komen langs voor beeldmateriaal van je machines, je mensen en je locatie. Echte content die converteert.' },
            { n: '04', t: 'AI als fundament van je groei', d: 'We gaan aan de slag met jouw commerciële proces, met AI als motor achter leadopvolging en zichtbaarheid.', highlight: true },
          ].map((s) => (
            <div key={s.n} className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-[28px] font-display font-black text-2xl flex items-center justify-center mb-6 shadow-lg transition-all ${s.highlight ? 'bg-brand-accent text-white shadow-brand-accent/25 scale-110' : 'bg-white border-2 border-amber-100 text-brand-primary'}`}>
                {s.n}
              </div>
              <h3 className="text-base font-display font-bold text-brand-primary mb-2 leading-tight px-2">{s.t}</h3>
              <p className="text-sm text-brand-ink/65 leading-relaxed font-light px-3">{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-display font-bold text-lg shadow-xl">
          <svg className="w-6 h-6 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
          30 dagen — LIVE!
        </div>
      </div>
    </div>
  </section>
);

export const SamenAanDeSlagSection = () => (
  <section className="py-24 px-6 bg-brand-primary relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-accent/10 blur-[150px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-brand-lime/5 blur-[120px] pointer-events-none" />
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-1/2 text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/20 border border-brand-accent/30 rounded-full text-[11px] uppercase tracking-widest font-bold text-brand-accent mb-8">
            Gratis, in 3 minuten
          </div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
            Ontdek jouw commercieel groeipotentieel met AI.
          </h2>
          <p className="text-lg text-white/80 mb-8 leading-relaxed font-light">
            We analyseren je website, je markt en je commerciële positie. Je krijgt direct een rapport met concrete verbeterpunten.
          </p>
          <div className="space-y-3 mb-10">
            {[
              { t: 'Commerciële scan', d: 'Hoe scoor je op leadgeneratie, branding, AI en groei?' },
              { t: 'Directe inzichten', d: 'Geen verkooppraatje. Gewoon eerlijk advies op maat.' },
              { t: 'Binnen 3 minuten', d: 'Vul de scan in, ontvang direct je persoonlijk rapport.' },
            ].map((item) => (
              <div key={item.t} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <svg className="w-5 h-5 text-brand-lime shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <div className="text-sm font-display font-bold text-white mb-0.5">{item.t}</div>
                  <div className="text-xs text-white/60 font-medium">{item.d}</div>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/ai-scan"
            className="inline-flex items-center gap-3 px-10 py-5 bg-brand-accent text-white rounded-2xl font-display font-bold transition-all hover:scale-[1.02] shadow-2xl shadow-brand-accent/20 text-base"
          >
            Start de gratis AI Analyse
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Gratis. Geen verplichtingen.</p>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
            <img
              src="/images/team-stefan-relax-lg.webp"
              srcSet="/images/team-stefan-relax-sm.webp 480w, /images/team-stefan-relax-lg.webp 700w"
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Stefan Kelderman"
              className="w-full h-[460px] object-cover object-[center_10%]"
              loading="lazy"
            />
          </div>
          <div className="mt-4 text-center">
            <div className="text-white/80 font-display font-bold text-sm">Stefan Kelderman</div>
            <div className="text-white/40 text-xs uppercase tracking-widest font-bold mt-0.5">Oprichter, Optimaal Groeien</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const WatAnderenZeggenSection = () => (
  <section className="py-24 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">Eerlijke meningen</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary tracking-tight">Wat ondernemers zeggen.</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { n: "Harm van Wijk", f: "Ondernemer", q: "Het team van Optimaal Groeien weet in no-time een 100% groei te realiseren in bezoekers, enkel al vanuit SEO. Sterker nog — dit binnen 1 maand. De samenwerking is daarbij zeer prettig in communicatie, overzicht en bovenal resultaat." },
          { n: "Bram Voermans", f: "Ondernemer", q: "Door samen te werken met Optimaal Groeien hebben we onze groeidoelstellingen niet alleen bereikt, maar zelfs overtroffen. Hun unieke aanpak, die branding, marketing en sales verbindt, heeft ons geholpen om onze doelgroep effectiever te bereiken." },
          { n: "Harry Derksen", f: "Ondernemer", q: "Met concrete doelen en eerlijke verwachtingen wordt er aan je website gesleuteld waarbij er na een maand al verbeteringen te zien zijn. Niet alleen het resultaat is prettig, ook de manier van samenwerken. Aanbevelenswaardig!" }
        ].map((r, i) => (
          <div key={i} className="warm-card p-10">
            <div className="flex gap-1 text-brand-accent mb-6">
              {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
            </div>
            <p className="text-base text-brand-primary font-light mb-8 leading-relaxed">"{r.q}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-brand-accent font-bold text-sm border border-amber-100">
                {r.n.charAt(0)}
              </div>
              <div>
                <div className="font-display font-bold text-brand-primary text-sm mb-0.5">{r.n}</div>
                <div className="text-[10px] uppercase tracking-widest text-brand-primary/75 font-bold">{r.f}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const LatenWePratenSection = () => (
  <section id="contact" className="py-24 px-6 bg-brand-accent relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-[120px] pointer-events-none" />
    <div className="max-w-5xl mx-auto relative z-10">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="lg:w-1/2 text-white">
          <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6 leading-tight tracking-tight text-white">
            Zullen we even <br />kennismaken?
          </h2>
          <p className="text-lg text-white/85 mb-10 leading-relaxed font-light">
            We kunnen uren praten over wat we doen, maar het is veel fijner om te zien wat het voor jouw bedrijf betekent. Plan een gratis gesprekje van 45 minuten.
          </p>
          <a
            href="https://meetings-eu1.hubspot.com/stefan-kelderman"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-brand-accent rounded-2xl font-display font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl text-lg"
          >
            Plan je analyse <ArrowRight size={20} />
          </a>
          <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/65">
            Stefan staat zelf voor je klaar — Max 4 per maand
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="rounded-[24px] overflow-hidden shadow-2xl border border-white/20">
            <img src="/images/team-stefan-relax-lg.webp" srcSet="/images/team-stefan-relax-sm.webp 480w, /images/team-stefan-relax-lg.webp 700w" sizes="(max-width: 768px) 100vw, 50vw" alt="Stefan Kelderman, Optimaal Groeien" className="w-full h-96 object-cover object-[center_10%]" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  </section>
);


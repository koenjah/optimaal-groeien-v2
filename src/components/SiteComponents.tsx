import React from 'react';
import { motion } from 'motion/react';
import {
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Plus,
  Star,
  ShieldCheck,
  UserCheck,
  Clock,
  ChevronRight,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  MessageSquare,
  Users,
  Phone
} from 'lucide-react';
import { OmzetCalculator } from './Calculator';

// --- Shared Components ---

export const Navbar = ({ activePage, setActivePage }: { activePage: string, setActivePage: (p: string) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setActivePage('partner')}
        >
          <img
            src="/images/logo.png"
            alt="Optimaal Groeien"
            className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'}`}
          />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Hoe we helpen', id: 'diensten' },
            { label: 'Het team', id: 'team' },
            { label: 'Klantverhalen', id: 'cases' },
            { label: 'Even praten?', id: 'contact' }
          ].map((item) => (
            <a
              key={item.label}
              href={`#${item.id}`}
              className={`text-[11px] uppercase tracking-[0.15em] font-bold transition-colors ${isScrolled ? 'text-brand-primary/70 hover:text-brand-accent' : 'text-white/70 hover:text-white'}`}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              setActivePage('partner');
              setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="px-6 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-display font-bold transition-all bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:bg-brand-primary hover:shadow-brand-primary/20"
          >
            Even kennismaken
          </button>
        </div>

        <button className={`${isScrolled ? 'text-brand-primary' : 'text-white'} md:hidden`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white shadow-2xl p-10 flex flex-col gap-6 rounded-b-[40px]"
        >
          {[
            { label: 'Hoe we helpen', id: 'diensten' },
            { label: 'Het team', id: 'team' },
            { label: 'Klantverhalen', id: 'cases' },
            { label: 'Even praten?', id: 'contact' }
          ].map((item) => (
            <a key={item.label} href={`#${item.id}`} className="text-slate-600 font-bold uppercase tracking-widest text-xs py-4 border-b border-slate-50" onClick={() => setIsOpen(false)}>{item.label}</a>
          ))}
          <button
             onClick={() => {
               setActivePage('partner');
               setIsOpen(false);
               setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
             }}
             className="btn-primary w-full mt-6 !py-6"
          >
            Even kennismaken
          </button>
        </motion.div>
      )}
    </nav>
  );
};

export const Footer = () => (
  <footer className="bg-brand-primary pt-24 pb-12 text-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <img src="/images/logo.png" alt="Optimaal Groeien" className="h-8" />
          </div>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs">
            Wij bouwen en runnen de volledige commerciële structuur van B2B-bedrijven in industrie, machinebouw, logistiek, bouw en techniek.
          </p>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-lime mb-8">Navigatie</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><a href="#" className="hover:text-white transition-colors">Hoe we helpen</a></li>
            <li><a href="#team" className="hover:text-white transition-colors">Het team</a></li>
            <li><a href="#cases" className="hover:text-white transition-colors">Verhalen van anderen</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Even kennismaken</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-lime mb-8">Contact</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li>info@optimaalgroeien.nl</li>
            <li>+31 (0) 57 270 0246</li>
            <li>Boeierstraat 9, Raalte</li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-lime mb-8">Legal</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li>Privacybeleid</li>
            <li>Algemene Voorwaarden</li>
            <li>KVK: 7182910</li>
          </ul>
        </div>
      </div>

      <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">
          © 2026 Optimaal Groeien. Alle rechten voorbehouden.
        </p>
        <div className="flex gap-10 text-[10px] uppercase tracking-widest font-bold text-white/30">
          <span>Raalte, Nederland</span>
          <span className="text-brand-lime">+3157 270 0246</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- Page 1 Components ---

export const PartnerHero = () => {
  const [extraYearly, setExtraYearly] = React.useState<number | null>(null);

  return (
    <section className="bg-brand-primary pt-32 lg:pt-40 pb-0 px-6 overflow-hidden relative">
      <div className="absolute inset-0 blueprint-grid opacity-[0.06] pointer-events-none" />
      <div className="absolute top-20 left-20"><div className="technical-dot" /><div className="corner-bracket corner-tl" /></div>
      <div className="absolute top-20 right-20"><div className="technical-dot" /><div className="corner-bracket corner-tr" /></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2 text-left pb-16">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-wider font-bold text-white/60 mb-8">
              <span className="w-2 h-2 bg-brand-lime rounded-full animate-pulse" />
              Dit is ons team — Wij helpen je groeien
            </div>

            <h1 className="text-4xl lg:text-[3.5rem] font-display font-bold text-white leading-[1.1] mb-8 tracking-tight max-w-xl">
               Commercieel Partner voor B2B bedrijven in de technische sector.
            </h1>

            <p className="text-lg text-white/50 mb-10 max-w-lg leading-relaxed font-light">
               Veel technische bedrijven groeien op toeval en netwerk. Wij veranderen dat in een voorspelbare commerciële machine door AI, Branding, Marketing & Sales met elkaar te verbinden.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={() => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary w-full sm:w-auto !py-5 !px-10 text-base !bg-[#ed7c2f]"
              >
                Bereken pot. omzet
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-5 bg-[#eeeeec] text-brand-primary rounded-2xl font-display font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-[#cfd62f] flex items-center justify-center gap-2 text-base"
              >
                Contact opnemen
              </button>
            </div>
            <div className="flex items-center gap-4 mt-6">
               <div className="flex -space-x-2">
                 <img src="/images/team-1.jpg" className="w-9 h-9 rounded-full border-2 border-brand-primary object-cover object-[center_25%]" alt="Team" />
                 <img src="/images/team-phone.jpg" className="w-9 h-9 rounded-full border-2 border-brand-primary object-cover object-top" alt="Team" />
                 <img src="/images/team-4.png" className="w-9 h-9 rounded-full border-2 border-brand-primary object-cover object-top" alt="Team" />
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-white font-bold opacity-70 leading-none mb-1">Stefan & team</span>
                  <span className="text-[10px] text-brand-lime font-bold uppercase tracking-widest leading-none">Altijd bereikbaar</span>
               </div>
            </div>

            <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="text-xs font-bold uppercase tracking-widest text-white">Vertrouwd door:</div>
               <span className="text-xs font-display font-bold text-white">Veldkamp</span>
               <span className="text-xs font-display font-bold text-white">Equans</span>
               <span className="text-xs font-display font-bold text-white">Carbify</span>
            </div>
          </div>

          <div className="lg:w-1/2 w-full relative">
            <div className="relative z-10 scale-95 lg:scale-100 lg:-rotate-1 lg:hover:rotate-0 transition-transform duration-700">
               <OmzetCalculator onCalculate={(val) => setExtraYearly(val)} />
            </div>
            <div className="absolute -top-6 -right-6 w-28 h-28 border border-brand-lime/20 rounded-full animate-pulse lg:block hidden" />
            <div className="absolute -bottom-6 -left-6 w-44 h-44 border border-white/5 rounded-full lg:block hidden" />
          </div>
        </div>

        {/* Removed team photo band per request */}
      </div>
    </section>
  );
};

export const ToolsSection = () => {
  const tools = [
    { name: "Meta", src: "/images/logos/meta.svg" },
    { name: "Google", src: "/images/logos/google.svg" },
    { name: "HubSpot", src: "/images/logos/hubspot.svg" },
    { name: "Salesforce", src: "/images/logos/salesforce.svg" },
    { name: "LinkedIn", src: "/images/logos/linkedin.svg" },
    { name: "Make", src: "/images/logos/make.svg" },
    { name: "Claude AI", src: "/images/logos/claude.svg" },
    { name: "OpenAI", src: "/images/logos/openai.svg" },
    { name: "Gemini", src: "/images/logos/gemini.svg" },
    { name: "Adobe", src: "/images/logos/adobe.svg" },
    { name: "Brevo", src: "/images/logos/brevo.svg" },
    { name: "Sales Navigator", src: "/images/logos/linkedin.svg" },
  ];
  return (
    <section className="py-20 px-6 bg-brand-bg border-y border-brand-soft">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-primary/40 mb-3">Wij werken met de beste tools</h3>
        <p className="text-brand-primary/50 text-sm max-w-2xl mx-auto leading-relaxed">
          Wij begrijpen de complexiteit van jullie bedrijf, doelgroep en de markt. Dat stelt ons in staat om proactief de volledige regie over jullie groei te nemen, terwijl jij je focust op de operatie.
        </p>
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-8">
          {tools.map((tool, i) => (
            <div
              key={i}
              className="group flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1"
              title={tool.name}
            >
              <div className="h-10 w-24 flex items-center justify-center grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                <img src={tool.src} alt={tool.name} className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const HerkenJeDitSection = () => (
  <section className="py-24 px-6 bg-brand-bg">
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
          <p className="text-lg text-brand-primary/50 leading-relaxed font-light">
            We horen het vaak: "Onze producten zijn top, onze klanten zijn blij, maar nieuwe klanten vinden is volledig afhankelijk van ons netwerk". Je groeit groeit op basis van wie je kent, niet op basis van wat je waard bent. Wij bouwen een systeem dat jullie technische superioriteit vertaalt naar een constante stroom van de juiste opdrachten.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { title: "Je netwerk heeft een plafond", text: "Je bent gegroeid via mond-tot-mond reclame. Dat is prachtig, want het bewijst je kwaliteit. Maar het is niet meer genoeg om de volgende stap te zetten." },
          { title: "Marketing voelt als 'moeten'", text: "Je plaatst wel eens iets op LinkedIn of hebt een nieuwe website, maar eigenlijk voelt het als schieten in het donker. Wat levert het nou echt op?" },
          { title: "Nieuwe sectoren kennen je niet", text: "Je weet zeker dat je bedrijven in andere branches perfect kunt helpen, maar zij weten simpelweg niet dat je bestaat. Die deur blijft voorlopig dicht." },
          { title: "Kansen glippen door je vingers", text: "Soms komt er een prachtige aanvraag binnen, maar door de waan van de dag blijft de opvolging liggen. Zonde van de tijd én de moeite." },
          { title: "Je doet het er 'even bij'", text: "Commercie is iets wat je doet tussen de bedrijven door. Er is geen vast moment, geen vast proces en daardoor geen rust." },
          { title: "Cijfers? Die zitten in je hoofd", text: "Je voelt wel hoe het gaat, maar je hebt geen dashboard dat je vertelt waar de beste kansen liggen. Je stuurt op je onderbuik." }
        ].map((item, i) => (
          <div key={i} className="group p-8 bg-white border border-brand-soft rounded-[24px] transition-all hover:shadow-lg hover:shadow-brand-primary/5 hover:-translate-y-1">
            <div className="mb-5 flex items-center justify-between">
               <div className="w-10 h-10 bg-brand-lime/10 rounded-xl flex items-center justify-center text-brand-accent">
                  <Plus size={20} />
               </div>
               <span className="guide-badge">Herkenbaar?</span>
            </div>
            <h3 className="text-lg font-display font-bold text-brand-primary mb-3 leading-tight">{item.title}</h3>
            <p className="text-sm text-brand-primary/50 leading-relaxed font-light">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const HoeWeHelpenSection = () => (
  <section id="diensten" className="py-24 px-6 bg-white overflow-hidden relative">
    <div className="absolute top-0 left-0 w-full h-px bg-brand-soft" />
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
      <div className="lg:w-3/5">
        <div className="label-pill">Hoe we je helpen</div>
        <h2 className="text-3xl lg:text-5xl font-display font-bold text-brand-primary mb-6 tracking-tight">
          Wij begrijpen jullie techniek. <br/>
          <span className="text-brand-accent">En bouwen de machine die het verkoopt.</span>
        </h2>
        <p className="text-lg text-brand-primary/50 mb-12 leading-relaxed max-w-xl font-light">
          De meeste bureaus snappen de complexiteit van de industrie niet. Wij wel. We sturen geen dikke adviesrapporten vanaf de zijlijn, maar komen als team bij jullie langs om de kern van jullie bedrijf te doorgronden. Pas als we jullie vakmanschap écht begrijpen, bouwen we het systeem dat jullie groei dicteert.
        </p>

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {[
              { icon: Users, title: "Vakkennis op locatie", desc: "Geen oppervlakkig praatje; wij komen fysiek langs en draaien mee op de werkvloer om jullie complexe service echt te doorgronden." },
              { icon: Target, title: "Een plan op maat", desc: "Geen dik adviesrapport, maar een duidelijke routekaart voor je groei." },
              { icon: Zap, title: "Echte content", desc: "Foto's en video's van je eigen machines en mensen. Geen neppe stock." },
              { icon: BarChart3, title: "AI als fundament", desc: "Wij automatiseren wat werkt, van automatische leadopvolging tot real-time dashboards die je grip geven op de cijfers." },
              { icon: Clock, title: "2-wekelijkse regie", desc: "Elke twee weken zitten we fysiek of digitaal samen om de voortgang te bespreken en de koers direct bij te sturen." },
              { icon: MessageSquare, title: "Sluitende salesflows", desc: "Wij verbinden marketing direct aan sales, inclusief ondersteuning bij leadopvolging en scriptwerk om deals daadwerkelijk te sluiten." },
              { icon: Star, title: "Gevonden worden", desc: "We zorgen dat beslissers in de industrie jou gaan zien als de expert." },
              { icon: CheckCircle2, title: "Transparante cijfers", desc: "In één oogopslag zien hoe het gaat. Gewoon op je telefoon." }
            ].map((s, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-11 h-11 bg-brand-soft border border-brand-soft rounded-[16px] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-brand-lime/40 group-hover:bg-brand-lime/10 transition-all">
                   <s.icon size={18} className="text-brand-primary/40 group-hover:text-brand-accent transition-colors" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-primary mb-1 text-lg">{s.title}</h4>
                  <p className="text-sm text-brand-primary/50 font-light leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="lg:w-2/5 w-full lg:sticky lg:top-28 space-y-6">
        <div className="rounded-[24px] overflow-hidden shadow-lg border border-brand-soft">
          <img src="/images/team-1.jpg" alt="Samenwerken bij Optimaal Groeien" className="w-full h-56 object-cover object-[center_20%]" />
          <div className="p-5 bg-white">
            <p className="text-sm font-display font-bold text-brand-primary">Samen werken we aan jouw groei.</p>
            <p className="text-xs text-brand-primary/40 mt-1">Geen vage rapporten, maar echte samenwerking.</p>
          </div>
        </div>

        <div className="bg-brand-primary p-10 text-white rounded-[28px] relative overflow-hidden shadow-xl">
          <div className="soft-glow !bg-brand-lime/10" />
          <div className="text-2xl font-display font-bold leading-tight mb-6 relative z-10">
            “Wij ontzorgen je echt, <br />
            <span className="text-brand-lime">geen losse flodders.</span>”
          </div>
          <p className="text-white/40 mb-8 relative z-10 leading-relaxed font-light text-sm">
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
                  <div className="text-xs text-white/30 font-medium">{g.d}</div>
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
  <section id="team" className="py-24 px-6 bg-brand-warm">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
        <div className="lg:w-1/2">
          <div className="label-pill">Het team</div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mb-6 tracking-tight">
            Dit zijn de mensen die <span className="text-brand-accent">voor je aan de slag gaan.</span>
          </h2>
          <p className="text-lg text-brand-primary/50 leading-relaxed font-light max-w-md">
            Geen anoniem bureau, maar een hecht team dat echt met je meedenkt. We werken vanuit Raalte, voor het hele land.
          </p>
        </div>
        <div className="lg:w-1/2 flex gap-4">
          <div className="rounded-[24px] overflow-hidden shadow-xl border border-brand-soft w-1/2">
            <img src="/images/team-phone.jpg" alt="Teamlid aan het werk" className="w-full h-64 object-cover object-top" />
          </div>
          <div className="rounded-[24px] overflow-hidden shadow-xl border border-brand-soft w-1/2 mt-8">
            <img src="/images/team-4.png" alt="Teamleden" className="w-full h-64 object-cover object-top" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-[28px] overflow-hidden shadow-xl border border-brand-soft">
          <img src="/images/team-full.jpg" alt="Het complete team van Optimaal Groeien" className="w-full h-80 lg:h-96 object-cover object-center" />
        </div>
        <div className="bg-white p-8 rounded-[28px] border border-brand-soft flex flex-col justify-center">
          <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center text-brand-accent mb-6">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-display font-bold text-brand-primary mb-3">8 specialisten</h3>
          <p className="text-brand-primary/50 leading-relaxed font-light text-sm mb-6">
            Van strategie tot content, van advertenties tot automatisering. Ieder zijn eigen expertise, samen jouw groeimachine.
          </p>
          <div className="flex -space-x-2">
            <img src="/images/team-1.jpg" className="w-10 h-10 rounded-full border-2 border-white object-cover object-[center_25%]" alt="" />
            <img src="/images/team-phone.jpg" className="w-10 h-10 rounded-full border-2 border-white object-cover object-top" alt="" />
            <img src="/images/team-stefan-relax.jpg" className="w-10 h-10 rounded-full border-2 border-white object-cover object-top" alt="" />
            <img src="/images/team-4.png" className="w-10 h-10 rounded-full border-2 border-white object-cover object-top" alt="" />
            <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-soft flex items-center justify-center text-[10px] font-bold text-brand-primary">+4</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const KlantverhalenSection = () => (
  <section id="cases" className="py-24 px-6 bg-brand-primary relative overflow-hidden">
    <div className="absolute inset-0 blueprint-grid opacity-[0.05] pointer-events-none" />
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-end mb-16">
      <div className="lg:w-1/2">
        <div className="label-pill !bg-white/10 !text-white !border-none">Kijk mee bij anderen</div>
        <h2 className="text-3xl lg:text-5xl font-display font-bold text-white mb-5 tracking-tight leading-tight">
          Succes is geen toeval, <br /><span className="text-brand-lime">het is een keuze.</span>
        </h2>
        <p className="text-lg text-white/40 max-w-xl font-light leading-relaxed">
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
          <div key={i} className="group bg-white/[0.03] border border-white/10 p-8 hover:bg-white/[0.06] transition-all rounded-[24px] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <Star size={40} className="text-white" />
            </div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-display font-bold text-white mb-1 tracking-tight">{c.name}</h3>
                <div className="text-[11px] uppercase tracking-widest text-white/20 font-bold">{c.sector}</div>
              </div>
              <div className="px-3 py-1 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                {c.res}
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-white/50 leading-relaxed font-light mb-8 text-sm min-h-[4rem]">
                {c.desc}
              </p>
              <button className="text-white/40 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-brand-lime transition-colors">
                Hun verhaal lezen <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const OnzeBelofteSection = () => (
  <section className="py-24 px-6 bg-brand-bg relative overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
        <div className="lg:w-1/2">
          <div className="label-pill">Geen kleine lettertjes</div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mb-6 tracking-tight">Onze belofte aan jou.</h2>
          <p className="text-lg text-brand-primary/50 font-light max-w-md">Wij geloven zo sterk in wat we doen, dat we het risico graag bij onszelf leggen. Zo kun jij met een gerust hart beginnen.</p>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <img src="/images/team-4.png" alt="Team Optimaal Groeien" className="rounded-[24px] shadow-xl w-full max-w-xs object-cover object-top" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {[
          { t: "Groei gegarandeerd", d: "Zien we na 6 maanden niet de groei die we hadden afgesproken? Dan werken we gratis door. Zo simpel is het." },
          { t: "Binnen 30 dagen live", d: "Binnen 30 dagen ben je live. Geen trajecten van een jaar, maar vlot en duidelijk aan de slag voor je onderneming." },
          { t: "Jij bent en blijft de baas", d: "Alles wat we maken, van de foto's tot de data, is van jou. Je zit nooit aan ons vast. Vrijheid boven alles." }
        ].map((g, i) => (
          <div key={i} className="bg-white p-10 rounded-[24px] border border-brand-soft flex flex-col items-center text-center hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
            <div className="w-14 h-14 bg-brand-lime/10 rounded-[18px] flex items-center justify-center text-brand-accent mb-8">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-display font-bold text-brand-primary mb-4 leading-tight">{g.t}</h3>
            <p className="text-brand-primary/50 leading-relaxed font-light text-sm">{g.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const SamenAanDeSlagSection = () => (
  <section className="py-24 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
       <div className="text-center mb-16">
        <div className="label-pill mx-auto">Hoe het werkt</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary tracking-tight">In 4 stappen naar rust.</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {[
          { t: "De Analyse", d: "We kijken in 45 minuten waar je nu kansen laat liggen. Helemaal gratis." },
          { t: "Het Fundament", d: "We bouwen de commerciële basis die precies bij jouw bedrijf past." },
          { t: "De Start", d: "Ons team gaat aan de slag. Binnen een maand draait alles op volle toeren." },
          { t: "Lekker Groeien", d: "We houden alles in de gaten en schaven bij waar nodig. Jij hebt de controle.", highlight: true }
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center relative">
            {i < 3 && <div className="hidden lg:block absolute top-10 left-1/2 w-full h-px bg-brand-soft -z-10" />}
            <div className={`w-16 h-16 rounded-[20px] font-display font-black text-xl flex items-center justify-center mb-8 transition-all ${s.highlight ? 'bg-brand-accent text-white shadow-xl shadow-brand-accent/20 scale-110' : 'bg-brand-soft text-brand-primary border border-brand-soft'}`}>
              {i+1}
            </div>
            <h4 className="text-lg font-display font-bold text-brand-primary mb-3 leading-tight">{s.t}</h4>
            <p className="text-brand-primary/50 leading-relaxed font-light text-sm px-2">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col lg:flex-row gap-8 items-center">
        <div className="lg:w-1/2">
          <img src="/images/team-stefan-relax.jpg" alt="Ontspannen maar gefocust" className="rounded-[24px] shadow-lg w-full object-cover object-[center_10%] h-96" />
        </div>
        <div className="lg:w-1/2">
          <h3 className="text-2xl font-display font-bold text-brand-primary mb-4">Ontspannen, maar gefocust op resultaat.</h3>
          <p className="text-brand-primary/50 leading-relaxed font-light mb-6">
            We nemen het werk serieus, maar onszelf niet. Dat is precies waarom onze klanten met ons doorwerken: het voelt niet als een zware last, maar als een versterking van je eigen team.
          </p>
          <div className="flex items-center gap-4">
            <img src="/images/team-1.jpg" className="w-12 h-12 rounded-full object-cover object-[center_25%] border border-brand-soft" alt="Stefan" />
            <div>
              <p className="font-display font-bold text-brand-primary text-sm">Stefan Kelderman</p>
              <p className="text-xs text-brand-primary/40">Oprichter Optimaal Groeien</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const WatAnderenZeggenSection = () => (
  <section className="py-24 px-6 bg-brand-soft">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">Eerlijke meningen</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary tracking-tight">Wat ondernemers zeggen.</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { n: "Erik Veldkamp", f: "Veldkamp", q: "Het heeft ons rust gegeven. We weten nu dat er continu nieuwe kansen binnenkomen." },
          { n: "Marc de Boer", f: "Equans", q: "Geen vaag marketingverhaal, maar een team dat snapt hoe de industrie werkt." },
          { n: "Sandra Peters", f: "Plintenfabriek", q: "Fijn om eindelijk een partner te hebben die echt meedenkt en het werk ook doet." }
        ].map((r, i) => (
          <div key={i} className="p-10 bg-white rounded-[24px] border border-brand-soft hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
            <div className="flex gap-1 text-brand-accent mb-6">
              {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
            </div>
            <p className="text-base text-brand-primary font-light mb-8 leading-relaxed">“{r.q}”</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-brand-primary font-bold text-sm border border-brand-soft">
                {r.n.charAt(0)}
              </div>
              <div>
                <div className="font-display font-bold text-brand-primary text-sm mb-0.5">{r.n}</div>
                <div className="text-[10px] uppercase tracking-widest text-brand-primary/30 font-bold">{r.f}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const LatenWePratenSection = () => (
  <section id="contact" className="py-24 px-6 bg-brand-primary relative overflow-hidden">
    <div className="soft-glow !bg-brand-lime/10" />
    <div className="max-w-5xl mx-auto relative z-10">
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="lg:w-1/2 text-white">
          <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6 leading-tight tracking-tight">
            Zullen we even <br />kennismaken?
          </h2>
          <p className="text-lg text-white/50 mb-10 leading-relaxed font-light">
            We kunnen uren praten over wat we doen, maar het is veel fijner om te zien wat het voor jouw bedrijf betekent. Plan een gratis gesprekje van 45 minuten.
          </p>
          <a
            href="https://calendly.com/stefankelderman/15min"
            target="_blank"
            rel="noreferrer"
            className="btn-primary !bg-white !text-brand-primary !px-10 !py-5 text-lg shadow-2xl hover:!scale-105 inline-flex"
          >
            Plan je analyse <ArrowRight size={20} />
          </a>
          <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
            Stefan staat zelf voor je klaar — Max 4 per maand
          </div>
        </div>
        <div className="lg:w-1/2 w-full">
          <div className="rounded-[24px] overflow-hidden shadow-2xl border border-white/10">
            <img src="/images/team-closeup.jpg" alt="Aan het werk voor jouw groei" className="w-full h-96 object-cover object-top" />
          </div>
        </div>
      </div>
    </div>
  </section>
);


// --- Page 2 Components ---

export const DeLeadmachineSection = () => (
  <section className="bg-brand-primary pt-44 pb-24 px-6 overflow-hidden relative text-center">
    <div className="soft-glow" />
    <div className="max-w-4xl mx-auto relative z-10">
      <div className="label-pill !bg-white/5 !text-white !border-white/10 !mb-8 mx-auto">
         Alles-in-één Leadmachine
      </div>
      <h1 className="text-4xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-8 tracking-tight">
        Een systeem dat klanten zoekt, <br />
        <span className="text-brand-lime">terwijl jij bouwt.</span>
      </h1>
      <p className="text-lg text-white/50 mb-14 max-w-2xl mx-auto leading-relaxed font-light">
        We bouwen een complete machine voor je: advertenties, een mooie pagina, slimme berichtjes en automatisering. Alles staat klaar om mensen enthousiast te maken over jouw werk.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16 bg-white/5 p-10 rounded-[32px] border border-white/10 backdrop-blur-md">
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-2">Instappen</div>
          <div className="text-3xl font-display font-bold text-white">Vanaf € 1.450</div>
        </div>
        <div className="w-px h-10 bg-white/10 hidden sm:block" />
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-2">Maandelijks beheer</div>
          <div className="text-3xl font-display font-bold text-brand-accent">Vanaf € 2.450</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <a href="#start" className="btn-primary text-lg !px-12 !py-5">
          Start jullie aanvraag <ArrowRight size={20} />
        </a>
      </div>
    </div>
  </section>
);

export const SpeciaalVoorJouSection = () => (
  <section className="py-24 px-6 bg-brand-bg">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <div className="label-pill mx-auto">Voor wie doen we dit?</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary mb-6 tracking-tight">Is dit iets voor jou?</h2>
        <p className="text-lg text-brand-primary/50 font-light leading-relaxed">Onze leadmachine werkt het allerbest voor ondernemers die klaar zijn om te groeien, maar simpelweg de tijd of kennis niet hebben om de marketing zelf te doen.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {[
          { t: "Bedrijven in de groei", d: "Je hebt prachtige projecten, maar nog geen constante stroom van nieuwe aanvragen. Wij vullen je agenda zodat jij en je team door kunnen." },
          { t: "Ondernemers in de techniek", d: "Je weet alles van je vak, maar marketing voelt als een jungle. Wij spreken je taal en regelen het voor je." },
          { t: "Geen tijd om te wachten", d: "Je wilt geen traject van een jaar. Je wilt binnen een maand live zijn en zien of het voor je werkt." },
          { t: "Eerlijke groeiers", d: "Je zoekt een partner die snapt dat je alleen wilt groeien met klanten die ook echt bij je passen." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[24px] border border-brand-soft flex flex-col group hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
             <div className="w-14 h-14 bg-brand-lime/10 rounded-[18px] flex items-center justify-center text-brand-accent mb-8 transition-transform group-hover:scale-110">
               <UserCheck size={26} />
             </div>
             <h3 className="text-xl font-display font-bold text-brand-primary mb-4 leading-tight">{item.t}</h3>
             <p className="text-brand-primary/50 leading-relaxed font-light text-sm">{item.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const HoeHetWerktLeadsSection = () => (
  <section id="start" className="py-24 px-6 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 relative items-start">
      <div className="lg:w-3/5">
        <div className="label-pill">Wat krijg je precies?</div>
        <h2 className="text-3xl lg:text-4xl font-display font-bold text-brand-primary mb-10 tracking-tight">
          Een compleet systeem, <br /><span className="text-brand-accent">zonder gedoe.</span>
        </h2>

        <div className="space-y-4">
          {[
            { n: "01", t: "Slimme Advertenties", d: "We laten je bedrijf zien aan de mensen die ook echt beslissen. Geen verspild budget." },
            { n: "02", t: "Een Eigen Pagina", d: "Een landingspagina die niet alleen mooi is, maar die mensen ook echt overtuigt om contact op te nemen." },
            { n: "03", t: "Echte Foto's & Video", d: "We komen bij je langs. Geen neppe plaatjes, maar jouw team en jouw machines in actie." },
            { n: "04", t: "Iets van Waarde", d: "We maken een handige gids of handleiding die je klant direct helpt. Zo bewijs je je kennis." },
            { n: "05", t: "Automatische Mailtjes", d: "Een systeem dat mensen warm houdt terwijl jij bezig bent met je werk. Niemand wordt vergeten." },
            { n: "06", t: "Duidelijk Dashboard", d: "In één oogopslag zien wat het oplevert. Geen ingewikkelde rapporten, maar heldere cijfers." }
          ].map((s, i) => (
            <div key={i} className="p-8 bg-brand-soft rounded-[24px] flex gap-6 group hover:bg-white hover:shadow-lg hover:shadow-brand-primary/5 transition-all border border-transparent hover:border-brand-soft">
              <div className="w-12 h-12 bg-brand-primary text-white flex items-center justify-center shrink-0 font-display font-black text-lg rounded-[16px] transition-all group-hover:bg-brand-accent group-hover:rotate-3">
                {s.n}
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-brand-primary mb-2">{s.t}</h3>
                <p className="text-brand-primary/50 font-light leading-relaxed text-sm">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-2/5 sticky top-28 w-full space-y-6">
        <div className="bg-brand-primary p-10 text-white rounded-[28px] shadow-xl relative overflow-hidden border border-white/5">
          <div className="soft-glow !bg-brand-lime/10" />
          <div className="label-pill !bg-white/10 !text-white !border-none !mb-8">Investering</div>
          <h3 className="text-2xl font-display font-bold mb-3 relative z-10">Je eigen Leadmachine</h3>
          <p className="text-white/30 mb-10 relative z-10 font-light italic text-sm">Duidelijke prijzen. Geen verrassingen achteraf.</p>

          <div className="space-y-8 relative z-10">
            <div className="pb-8 border-b border-white/10">
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-lime font-bold mb-3">Eenmalig opzetten</div>
              <div className="text-3xl font-display font-bold mb-1">€ 1.450 — € 2.250</div>
              <div className="text-xs text-white/20 font-medium italic">Binnen 30 dagen volledig live</div>
            </div>
            <div className="pb-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-lime font-bold mb-3">Beheer per maand</div>
              <div className="text-3xl font-display font-bold mb-1">€ 2.450 — € 4.200</div>
              <div className="text-xs text-white/20 font-medium italic">Wij houden alles in de gaten voor je</div>
            </div>
          </div>

          <div className="relative z-10 py-4 bg-white/5 border border-white/10 rounded-xl mb-10 flex items-center justify-center gap-3">
             <Clock size={16} className="text-brand-lime" />
             <span className="text-sm font-display font-bold text-white">We starten direct na akkoord</span>
          </div>

          <a
            href="https://calendly.com/stefankelderman/15min"
            className="btn-primary w-full !py-5 text-lg !bg-white !text-brand-primary shadow-xl relative z-10"
          >
            Start jullie aanvraag <ArrowRight size={20} />
          </a>
        </div>

        <div className="rounded-[24px] overflow-hidden shadow-lg border border-brand-soft">
          <img src="/images/team-1.jpg" alt="Samen aan de slag" className="w-full h-48 object-cover object-[center_20%]" />
        </div>
      </div>
    </div>
  </section>
);

export const SamenGroeiRealiserenSection = () => (
  <section id="cm" className="py-24 px-6 bg-brand-primary relative overflow-hidden">
    <div className="soft-glow !bg-brand-lime/10" />
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <div className="lg:w-3/5">
          <div className="label-pill !bg-white/10 !text-white !border-none">Samenwerking</div>
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6 tracking-tight leading-tight">
            Wij regelen de leads. <br />
            <span className="text-brand-lime">Samen sluiten we de deals.</span>
          </h2>
          <p className="text-lg text-white/40 mb-14 leading-relaxed font-light max-w-xl">
             We kunnen ook helpen met de verkoop zelf. Zo heb je een volledig team achter je staan, zonder dat je mensen op de loonlijst hoeft te zetten.
          </p>

          <div className="space-y-10">
            {[
              { n: "01", t: "Altijd nieuwe aanvragen", d: "De machine draait dag en nacht door om mensen naar je toe te trekken." },
              { n: "02", t: "Hulp bij het verkopen", d: "Onze partners van ClosersMatch kunnen helpen om de leads om te zetten in echte klanten." },
              { n: "03", t: "Geen risico voor jou", d: "Je betaalt alleen voor wat er echt gebeurt. Geen hoge vaste kosten, maar een eerlijk partnerschap." }
            ].map((s, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 text-brand-lime flex items-center justify-center shrink-0 font-display font-bold text-lg rounded-[16px] group-hover:bg-brand-accent group-hover:text-white transition-all">
                  {s.n}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white mb-1">{s.t}</h3>
                  <p className="text-sm text-white/30 leading-relaxed font-light">{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://www.closersmatch.com"
            target="_blank"
            className="btn-primary mt-14 !px-10 !py-5"
          >
            Bekijk onze partners <ChevronRight size={16} />
          </a>
        </div>

        <div className="lg:w-2/5 flex flex-col gap-6 w-full">
          <div className="glass-card !bg-white/5 !border-white/10 p-10 backdrop-blur-xl rounded-[28px]">
             <h3 className="text-xl font-display font-bold text-white mb-4">Waarom dit werkt</h3>
             <p className="text-white/40 leading-relaxed font-light text-sm">
               Veel bedrijven hebben wel leads, maar geen tijd voor de opvolging. Of ze hebben tijd, maar geen leads. Wij brengen die twee werelden samen voor een resultaat dat staat.
             </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[28px]">
             <div className="grid grid-cols-2 gap-y-6">
                <div className="text-[10px] uppercase tracking-widest text-brand-lime font-bold pb-3">Zonder systeem</div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold pb-3 text-right">Met ons systeem</div>

                <div className="text-xs text-white/30 font-medium">Hopen op een aanvraag</div>
                <div className="text-xs text-white font-bold text-right">Zekerheid van instroom</div>

                <div className="text-xs text-white/30 font-medium">Marketing kost alleen geld</div>
                <div className="text-xs text-white font-bold text-right">Het levert echt geld op</div>

                <div className="text-xs text-white/30 font-medium">Geen idee hoe het gaat</div>
                <div className="text-xs text-white font-bold text-right">Duidelijk inzicht</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const DuidelijkheidVoorafSection = () => (
  <section className="py-24 px-6 bg-brand-bg">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="label-pill mx-auto">Vragen</div>
        <h2 className="text-4xl lg:text-5xl font-display font-bold text-brand-primary tracking-tight">Geen geheimen.</h2>
      </div>

      <div className="space-y-4">
        {[
          { q: "Ben ik echt binnen een maand live?", a: "Ja zeker. We houden niet van treuzelen. Als we alle info hebben, gaan we als een speer voor je aan de slag." },
          { q: "Past dit wel bij mijn bedrijf?", a: "Dat bekijken we altijd eerst samen. Als we denken dat het niet werkt voor je, zeggen we het ook gewoon eerlijk." },
          { q: "Blijft de content van mij?", a: "Altijd. Alles wat we maken — van de foto's tot de advertenties — zijn helemaal jouw eigendom." },
          { q: "Kan ik altijd opzeggen?", a: "Natuurlijk. We geloven in samenwerkingen op basis van resultaat, niet op basis van wurgcontracten." }
        ].map((item, i) => (
          <details key={i} className="group bg-white border border-brand-soft rounded-[24px] overflow-hidden shadow-sm transition-all hover:shadow-lg hover:shadow-brand-primary/5">
            <summary className="p-8 cursor-pointer list-none flex justify-between items-center bg-white hover:bg-brand-soft transition-colors">
              <span className="font-display font-bold text-brand-primary text-lg">{item.q}</span>
              <span className="text-brand-accent transition-transform group-open:rotate-45 block">
                <Plus size={24} />
              </span>
            </summary>
            <div className="p-8 pt-0 text-brand-primary/50 leading-relaxed font-light">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export const DirectBesprekenSection = () => (
  <section className="py-24 px-6 bg-brand-primary relative overflow-hidden text-center">
    <div className="soft-glow !bg-brand-lime/10" />
    <div className="max-w-4xl mx-auto relative z-10 text-white">
      <h2 className="text-4xl lg:text-5xl font-display font-bold mb-8 leading-tight tracking-tight">
        Zullen we <br />gewoon beginnen?
      </h2>
      <p className="text-lg text-white/50 mb-14 max-w-xl mx-auto font-light leading-relaxed">
        Gun jezelf de rust en de groei die je verdient. We helpen je graag om de eerste stap te zetten.
      </p>
      <a
        href="https://calendly.com/stefankelderman/15min"
        target="_blank"
        className="btn-primary !bg-white !text-brand-primary !px-12 !py-5 text-lg hover:!scale-105"
      >
        Laten we praten <ArrowRight size={20} />
      </a>
    </div>
  </section>
);

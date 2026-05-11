import React from 'react';
import { ArrowRight, UserCheck, Clock, ChevronRight, Plus } from 'lucide-react';

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
      <p className="text-lg text-white/72 mb-14 max-w-2xl mx-auto leading-relaxed font-light">
        We bouwen een complete machine voor je: advertenties, een mooie pagina, slimme berichtjes en automatisering. Alles staat klaar om mensen enthousiast te maken over jouw werk.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16 bg-white/5 p-10 rounded-[32px] border border-white/10 backdrop-blur-md">
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 font-bold mb-2">Instappen</div>
          <div className="text-3xl font-display font-bold text-white">Vanaf € 1.450</div>
        </div>
        <div className="w-px h-10 bg-white/10 hidden sm:block" />
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 font-bold mb-2">Maandelijks beheer</div>
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
        <p className="text-lg text-brand-primary/75 font-light leading-relaxed">Onze leadmachine werkt het allerbest voor ondernemers die klaar zijn om te groeien, maar simpelweg de tijd of kennis niet hebben om de marketing zelf te doen.</p>
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
             <p className="text-brand-primary/75 leading-relaxed font-light text-sm">{item.d}</p>
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
                <p className="text-brand-primary/75 font-light leading-relaxed text-sm">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-2/5 sticky top-28 w-full space-y-6">
        <div className="bg-brand-primary p-10 text-white rounded-[28px] shadow-xl relative overflow-hidden border border-white/5">
          <div className="soft-glow !bg-brand-lime/10" />
          <div className="label-pill !bg-white/10 !text-white !border-none !mb-8">Investering</div>
          <h3 className="text-2xl font-display font-bold mb-3 relative z-10 text-white">Je eigen Leadmachine</h3>
          <p className="text-white/60 mb-10 relative z-10 font-light italic text-sm">Duidelijke prijzen. Geen verrassingen achteraf.</p>

          <div className="space-y-8 relative z-10">
            <div className="pb-8 border-b border-white/10">
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-lime font-bold mb-3">Eenmalig opzetten</div>
              <div className="text-3xl font-display font-bold text-white mb-1">€ 1.450 — € 2.250</div>
              <div className="text-xs text-white/60 font-medium italic">Binnen 30 dagen volledig live</div>
            </div>
            <div className="pb-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-lime font-bold mb-3">Beheer per maand</div>
              <div className="text-3xl font-display font-bold text-white mb-1">€ 2.450 — € 4.200</div>
              <div className="text-xs text-white/60 font-medium italic">Wij houden alles in de gaten voor je</div>
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
          <img src="/images/team-1-lg.webp" srcSet="/images/team-1-sm.webp 480w, /images/team-1-lg.webp 800w" sizes="(max-width: 768px) 100vw, 40vw" alt="Samen aan de slag" className="w-full h-48 object-cover object-[center_20%]" loading="lazy" />
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
          <p className="text-lg text-white/65 mb-14 leading-relaxed font-light max-w-xl">
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
                  <p className="text-sm text-white/60 leading-relaxed font-light">{s.d}</p>
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
             <p className="text-white/65 leading-relaxed font-light text-sm">
               Veel bedrijven hebben wel leads, maar geen tijd voor de opvolging. Of ze hebben tijd, maar geen leads. Wij brengen die twee werelden samen voor een resultaat dat staat.
             </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[28px]">
             <div className="grid grid-cols-2 gap-y-6">
                <div className="text-[10px] uppercase tracking-widest text-brand-lime font-bold pb-3">Zonder systeem</div>
                <div className="text-[10px] uppercase tracking-widest text-white/65 font-bold pb-3 text-right">Met ons systeem</div>

                <div className="text-xs text-white/60 font-medium">Hopen op een aanvraag</div>
                <div className="text-xs text-white font-bold text-right">Zekerheid van instroom</div>

                <div className="text-xs text-white/60 font-medium">Marketing kost alleen geld</div>
                <div className="text-xs text-white font-bold text-right">Het levert echt geld op</div>

                <div className="text-xs text-white/60 font-medium">Geen idee hoe het gaat</div>
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
            <div className="p-8 pt-0 text-brand-primary/75 leading-relaxed font-light">
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
      <p className="text-lg text-white/72 mb-14 max-w-xl mx-auto font-light leading-relaxed">
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

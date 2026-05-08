import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navbar, 
  Footer, 
  PartnerHero, 
  HerkenJeDitSection, 
  HoeWeHelpenSection, 
  TeamSection,
  KlantverhalenSection, 
  OnzeBelofteSection, 
  SamenAanDeSlagSection, 
  WatAnderenZeggenSection, 
  LatenWePratenSection,
  DeLeadmachineSection,
  SpeciaalVoorJouSection,
  HoeHetWerktLeadsSection,
  SamenGroeiRealiserenSection,
  DuidelijkheidVoorafSection,
  DirectBesprekenSection
} from './components/SiteComponents';
import { OmzetCalculator } from './components/Calculator';

function App() {
  const [activePage, setActivePage] = React.useState<'partner' | 'funnel'>('partner');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar activePage={activePage} setActivePage={(p) => setActivePage(p as 'partner' | 'funnel')} />
      
      {/* Floating Mode Switcher */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-brand-primary/95 backdrop-blur-md border border-white/10 p-2 rounded-[24px] flex gap-1 shadow-2xl">
        <button 
          onClick={() => setActivePage('partner')}
          className={`px-8 py-3 rounded-full text-[11px] font-display font-bold uppercase tracking-widest transition-all ${activePage === 'partner' ? 'bg-brand-accent text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Voor Bedrijven
        </button>
        <button 
          onClick={() => setActivePage('funnel')}
          className={`px-8 py-3 rounded-full text-[11px] font-display font-bold uppercase tracking-widest transition-all ${activePage === 'funnel' ? 'bg-brand-accent text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
        >
          Leadmachine
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activePage === 'partner' ? (
          <motion.main
            key="partner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PartnerHero />
            <HerkenJeDitSection />
            <HoeWeHelpenSection />
            <TeamSection />
            <KlantverhalenSection />
            <OnzeBelofteSection />
            <SamenAanDeSlagSection />
            <WatAnderenZeggenSection />
            <LatenWePratenSection />
          </motion.main>
        ) : (
          <motion.main
            key="funnel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DeLeadmachineSection />
            <SpeciaalVoorJouSection />
            <HoeHetWerktLeadsSection />
            <SamenGroeiRealiserenSection />
            <DuidelijkheidVoorafSection />
            <DirectBesprekenSection />
          </motion.main>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default App;

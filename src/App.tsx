import {
  Navbar,
  Footer,
  PartnerHero,
  ToolsSection,
  HerkenJeDitSection,
  HoeWeHelpenSection,
  TeamSection,
  KlantverhalenSection,
  KlantenLogosSection,
  OnzeBelofteSection,
  RoadmapSection,
  SamenAanDeSlagSection,
  WatAnderenZeggenSection,
  LatenWePratenSection,
} from './components/SiteComponents';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar activePage="partner" setActivePage={() => {}} />
      <main>
        <PartnerHero />
        <ToolsSection />
        <HerkenJeDitSection />
        <HoeWeHelpenSection />
        <TeamSection />
        <KlantverhalenSection />
        <KlantenLogosSection />
        <OnzeBelofteSection />
        <RoadmapSection />
        <SamenAanDeSlagSection />
        <WatAnderenZeggenSection />
        <LatenWePratenSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;

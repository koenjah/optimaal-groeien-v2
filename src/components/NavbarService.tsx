import React from 'react';
import { motion, AnimatePresence, useScroll, useVelocity, useTransform, useSpring } from 'motion/react';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Over ons',      href: '/over-ons' },
  { label: 'Klantcases',    href: '/klantcases' },
  { label: 'Onze methode',  href: '/onze-methode' },
  { label: 'Blog',          href: '/blog' },
  { label: 'Contact',       href: '/contact' },
];

export const NavbarService = ({ darkHero = false }: { darkHero?: boolean }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const rawScaleY = useTransform(velocity, [-2500, 0, 2500], [1.06, 1, 0.94]);
  const rawY     = useTransform(velocity, [-2500, 0, 2500], [-3, 0, 3]);
  const logoScaleY = useSpring(rawScaleY, { stiffness: 180, damping: 18, mass: 0.6 });
  const logoY      = useSpring(rawY,      { stiffness: 180, damping: 18, mass: 0.6 });

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const useDark = darkHero && !isScrolled;
  const linkClass = `text-[11px] uppercase tracking-[0.15em] font-bold transition-colors ${
    useDark
      ? 'text-white/80 hover:text-white'
      : 'text-brand-primary/70 hover:text-brand-accent'
  }`;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center shrink-0">
          <motion.img
            src="/images/logo.webp"
            alt="Optimaal Groeien"
            width="300" height="57"
            className={`transition-[height] duration-300 ${isScrolled ? 'h-9' : 'h-10'} w-auto`}
            style={{ scaleY: logoScaleY, y: logoY, transformOrigin: 'center' }}
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_ITEMS.map(item => (
            <a key={item.href} href={item.href} className={linkClass}>{item.label}</a>
          ))}

          {/* CTA */}
          <a
            href="/ai-scan"
            className="ml-2 flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-display font-bold bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:bg-brand-primary hover:shadow-brand-primary/20 transition-all"
          >
            Gratis AI Scan
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        {/* Hamburger */}
        <button
          aria-label={isOpen ? 'Menu sluiten' : 'Menu openen'}
          className={`lg:hidden transition-colors ${useDark ? 'text-white' : 'text-brand-primary'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
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
                <a
                  key={item.href}
                  href={item.href}
                  className="text-brand-primary font-bold uppercase tracking-widest text-xs py-4 border-b border-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="px-8 pb-8">
              <a
                href="/ai-scan"
                className="flex items-center justify-center gap-2 w-full py-4 bg-brand-accent text-white rounded-2xl font-display font-bold text-sm transition-all hover:bg-brand-primary"
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

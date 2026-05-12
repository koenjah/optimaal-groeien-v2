import React from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

export const NavbarBlog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NAV_ITEMS = [
    { label: 'Hoe we helpen', href: '/#diensten' },
    { label: 'Het team', href: '/#team' },
    { label: 'Klantverhalen', href: '/#cases' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <img
            src="/images/logo.webp"
            alt="Optimaal Groeien"
            width="300" height="57"
            className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12'} w-auto`}
          />
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-[11px] uppercase tracking-[0.15em] font-bold transition-colors ${
                item.href === '/blog'
                  ? 'text-brand-accent'
                  : isScrolled
                  ? 'text-brand-primary/70 hover:text-brand-accent'
                  : 'text-white/80 hover:text-brand-accent'
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/#contact"
            className={`px-6 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-display font-bold transition-all ${
              isScrolled
                ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20 hover:bg-brand-primary hover:shadow-brand-primary/20'
                : 'bg-white/15 border border-white/25 text-white hover:bg-brand-accent hover:border-brand-accent'
            }`}
          >
            Even kennismaken
          </a>
        </div>

        <button
          aria-label={isOpen ? 'Menu sluiten' : 'Menu openen'}
          className={`md:hidden transition-colors ${isScrolled ? 'text-brand-primary' : 'text-white'}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white shadow-2xl p-10 flex flex-col gap-6 rounded-b-[40px]"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`font-bold uppercase tracking-widest text-xs py-4 border-b border-slate-50 ${
                item.href === '/blog' ? 'text-brand-accent' : 'text-slate-600'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a href="/#contact" className="btn-primary w-full mt-6 !py-6 text-center">
            Even kennismaken
          </a>
        </motion.div>
      )}
    </nav>
  );
};

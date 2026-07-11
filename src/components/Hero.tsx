import React from 'react';
import { ChevronRight } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
}

export default function Hero({ onExploreClick }: HeroProps) {
  return (
    <section className="relative bg-[#0A0A0A] border-b border-white/5 overflow-hidden py-16 lg:py-24" id="hero-section">
      {/* Background graphic elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(227,6,19,0.08),transparent_50%)]" />
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none hidden md:block">
        <img
          src="/images/hero_porsche_sketch_1783457469507.jpg"
          alt="AEM Design Porsche Artwork"
          className="w-full h-full object-cover object-right grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          {/* Subtle branding line */}
          <div className="flex items-center gap-3 mb-6" id="hero-badge">
            <span className="w-8 h-px bg-[#E30613]"></span>
            <span className="font-display text-[10px] tracking-[0.4em] text-[#E30613] uppercase font-bold">
              EST. 2026 / PRESTIGE AUTOMOTIVE ART
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.1] mb-6" id="hero-headline">
            Pasiune auto <br />
            <span className="font-normal text-white">transpusă în artă.</span>
          </h1>

          {/* Description */}
          <p className="text-white/60 text-sm sm:text-base font-sans font-light leading-relaxed mb-8 max-w-lg" id="hero-description">
            Schițe tehnice realizate manual, agende premium din piele ecologică și stickere auto durabile. Fiecare piesă este concepută pentru a reflecta excelența și precizia de tip Porsche, aducând energia circuitului direct în spațiul tău.
          </p>

          {/* Action Button */}
          <div className="flex flex-wrap gap-4" id="hero-actions">
            <button
              onClick={onExploreClick}
              className="group flex items-center gap-3 bg-[#E30613] text-white text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 hover:bg-[#C20510] active:scale-95 transition-all duration-300"
              id="cta-explore"
            >
              <span>Explorează Colecția</span>
              <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="#contact"
              className="flex items-center justify-center border border-white/20 text-white hover:border-[#E30613] hover:text-[#E30613] text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300"
              id="cta-custom-order"
              onClick={(e) => {
                e.preventDefault();
                const contactSec = document.getElementById('contact-section');
                if (contactSec) {
                  contactSec.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Comandă Personalizată
            </a>
          </div>
        </div>
      </div>

      {/* Decorative side badge for desktop */}
      <div className="absolute right-10 bottom-10 hidden xl:flex items-center gap-4 text-white/20 text-[9px] tracking-[0.3em] uppercase rotate-90 origin-right" id="vertical-branding-badge">
        <span>AEM DESIGN LAB</span>
        <span className="w-6 h-px bg-white/20"></span>
        <span>911 SPEC</span>
      </div>
    </section>
  );
}

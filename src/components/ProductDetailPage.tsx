import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ArrowLeft, ShoppingBag, Check, ShieldCheck, PenTool, Layers, Clock, Ruler } from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onOrderNow: (product: Product, customOptions?: string) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetailPage({
  product,
  relatedProducts,
  onBack,
  onOrderNow,
  onSelectProduct
}: ProductDetailPageProps) {
  // Custom interactive option states
  const [selectedFrame, setSelectedFrame] = useState<'none' | 'black-metal' | 'raw-aluminum' | 'red-racing'>('black-metal');
  const [personalization, setPersonalization] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Dynamic price calculation based on option selected
  const getFrameSurcharge = () => {
    switch (selectedFrame) {
      case 'black-metal': return 35;
      case 'raw-aluminum': return 45;
      case 'red-racing': return 50;
      default: return 0;
    }
  };

  const getFrameLabel = () => {
    switch (selectedFrame) {
      case 'black-metal': return 'Ramă Metalică Neagră Satinată (+35 EUR)';
      case 'raw-aluminum': return 'Ramă Aluminiu Anodizat Brut (+45 EUR)';
      case 'red-racing': return 'Ramă Roșie Racing Edition (+50 EUR)';
      default: return 'Fără Ramă (Doar Printul)';
    }
  };

  const unitPrice = product.price + getFrameSurcharge();
  const totalPrice = unitPrice * quantity;

  // Technical blueprint details matching category
  const getTechnicalSpecs = () => {
    switch (product.category) {
      case 'tablou':
        return [
          { icon: <PenTool size={16} />, label: 'Tehnică de Lucru', value: 'Schiță în tuș & cărbune pe hârtie grafică' },
          { icon: <Clock size={16} />, label: 'Timp Execuție', value: 'Aproximativ 24 - 36 ore de desen manual' },
          { icon: <Layers size={16} />, label: 'Suport / Hârtie', value: 'Hahnemühle FineArt Premium 310g/m²' },
          { icon: <Ruler size={16} />, label: 'Dimensiune Standard', value: 'A3 (29.7 x 42 cm) sau A2 la cerere' },
        ];
      case 'agenda':
        return [
          { icon: <PenTool size={16} />, label: 'Material Copertă', value: 'Piele ecologică fină, textură mată ultra-rezistentă' },
          { icon: <Clock size={16} />, label: 'Personalizare Copertă', value: 'Gravement laser discret / Siluetă Porsche' },
          { icon: <Layers size={16} />, label: 'File Agendă', value: '200 pagini crem punctate, grosime 90g' },
          { icon: <Ruler size={16} />, label: 'Format fizic', value: 'A5 (14.8 x 21 cm) - Ideal pentru călătorii' },
        ];
      case 'sticker':
      default:
        return [
          { icon: <PenTool size={16} />, label: 'Material Vinil', value: 'Folie Oracal Premium Cast (Ultra-durabilă)' },
          { icon: <Clock size={16} />, label: 'Rezistență', value: 'Garantată 5-7 ani la intemperii extreme, UV și spălare' },
          { icon: <Layers size={16} />, label: 'Finisaj Strat', value: 'Laminat mat antireflex, rezistent la zgârieturi' },
          { icon: <Ruler size={16} />, label: 'Mod Aplicare', value: 'Adeziv acrilic pe bază de solvent, repoziționabil' },
        ];
    }
  };

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const handleOrderSubmit = () => {
    const customConfig = `[Opțiuni Selectate: ${getFrameLabel()} | Cantitate: ${quantity}${personalization.trim() ? ` | Text Personalizat: "${personalization}"` : ''}]`;
    onOrderNow(product, customConfig);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 fade-in" id={`product-detail-page-${product.id}`}>
      
      {/* Back button with subtle hover animation */}
      <button
        onClick={onBack}
        className="group flex items-center gap-3 text-neutral-400 hover:text-white text-xs uppercase tracking-widest mb-10 transition-colors"
        id="detail-back-button"
      >
        <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
        <span>Înapoi la Catalog</span>
      </button>

      {/* Main product presentation grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start" id="detail-main-grid">
        
        {/* Left Column: Premium Interactive Art Stage (7 Columns) */}
        <div className="lg:col-span-7 space-y-6" id="detail-visuals-col">
          <div className="relative bg-[#0E0E0E] border border-white/5 overflow-hidden flex items-center justify-center p-4 sm:p-8 aspect-square sm:aspect-[4/3] lg:aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            
            {/* Ambient geometric gridlines matching a drawing board blueprint */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border-b border-r border-white"></div>
              ))}
            </div>

            {/* Glowing corner brackets simulating camera target */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/30"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/30"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/30"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/30"></div>

            {/* Main Premium Artwork */}
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover rounded-sm border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800';
              }}
            />

            {/* Aesthetic Spec tag overlay */}
            <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-white/10 font-mono text-[9px] text-white/50 uppercase tracking-widest hidden sm:block">
              AEM DESIGN LAB // REF-{product.id}
            </div>
          </div>

          {/* Small zoom/details caption */}
          <p className="text-center text-[10px] text-white/30 font-mono uppercase tracking-widest">
            * IMAGINE DE PREZENTARE LA REZOLUȚIE MAXIMĂ // PUTEȚI SOLICITA DETALII SUPLIMENTARE PRIN FORMULAR
          </p>
        </div>

        {/* Right Column: Premium Specifications and Customizer (5 Columns) */}
        <div className="lg:col-span-5 space-y-8" id="detail-meta-col">
          
          {/* Header Metadata */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#E30613] text-white text-[9px] font-bold uppercase tracking-[0.25em] px-2.5 py-1">
                {product.category === 'tablou' ? 'TABLOU DESENAT manual' : product.category === 'agenda' ? 'AGENDĂ PERSONALIZATĂ' : 'STICKER AUTO'}
              </span>
              <span className="text-[10px] text-white/40 font-mono tracking-widest">AEM DESIGN STUDIO</span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl font-light text-white tracking-wide leading-tight mb-3">
              {product.title}
            </h1>

            <p className="text-white/60 font-sans font-light text-sm leading-relaxed mb-6">
              {product.description || 'Piesă exclusivă creată special pentru entuziaștii auto. Designul minimalist pune în valoare perfect silueta și detaliile iconice.'}
            </p>

            <div className="flex items-baseline gap-4 py-4 border-y border-white/5">
              <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Preț Catalog:</span>
              <span className="text-2xl font-light text-white tracking-tight">
                {product.price} <span className="text-sm text-[#E30613] font-bold font-mono">EUR</span>
              </span>
            </div>
          </div>

          {/* Technical Blueprint Specifications */}
          <div className="space-y-3.5 bg-[#0E0E0E] p-5 border border-white/5">
            <h3 className="text-[10px] text-[#E30613] font-mono font-bold tracking-widest uppercase flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-[#E30613] rounded-full"></span>
              FIȘĂ TEHNICĂ DE CONFECȚIONARE
            </h3>
            
            <div className="space-y-3">
              {getTechnicalSpecs().map((spec, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <div className="text-[#E30613] mt-0.5">{spec.icon}</div>
                  <div>
                    <span className="block text-[9px] text-white/30 font-mono uppercase tracking-wider">{spec.label}</span>
                    <span className="text-white/80 font-light">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Customizer (If artwork, offer framing options. If anything else, offer branding/customizer) */}
          <div className="space-y-6">
            
            {/* Custom Option: Frame Selection */}
            {product.category === 'tablou' && (
              <div className="space-y-3">
                <label className="text-[10px] text-white/40 font-mono tracking-widest uppercase block">
                  Alege Opțiunea de Înrămare:
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'none', label: 'Fără Ramă', desc: 'Doar printul de artă' },
                    { id: 'black-metal', label: 'Ramă Metalică Neagră', desc: 'Satinată, stil modern' },
                    { id: 'raw-aluminum', label: 'Aluminiu Anodizat', desc: 'Stil industrial' },
                    { id: 'red-racing', label: 'Racing Red Line', desc: 'Contur discret roșu' },
                  ].map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame.id as any)}
                      type="button"
                      className={`text-left p-3.5 border transition-all duration-300 ${
                        selectedFrame === frame.id 
                          ? 'bg-white text-black border-white' 
                          : 'bg-[#0E0E0E] border-white/10 text-white hover:border-white/30'
                      }`}
                    >
                      <span className="block text-[11px] font-bold tracking-wide uppercase">{frame.label}</span>
                      <span className="block text-[9px] opacity-60 font-light mt-1">{frame.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Option: Personalization details */}
            <div className="space-y-3">
              <label className="text-[10px] text-white/40 font-mono tracking-widest uppercase block">
                Personalizare Suplimentară (Opțional):
              </label>
              <input
                type="text"
                value={personalization}
                onChange={(e) => setPersonalization(e.target.value)}
                placeholder="Ex: Adaugă numărul de înmatriculare sau un nume în colț"
                className="w-full bg-[#111] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#E30613] placeholder-white/20 transition-colors"
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Cantitate:</span>
              <div className="flex items-center gap-1 border border-white/10 bg-[#0E0E0E]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-white hover:text-[#E30613] text-sm font-mono transition-colors"
                >
                  -
                </button>
                <span className="px-4 text-xs font-mono font-medium text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-white hover:text-[#E30613] text-sm font-mono transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Final checkout pricing block */}
            <div className="bg-[#0A0A0A] border border-white/10 p-5 space-y-4 shadow-[0_10px_30px_rgba(227,6,19,0.05)]">
              <div className="flex items-center justify-between text-xs text-white/40 font-mono uppercase">
                <span>Calcul Total estimat:</span>
                <span>{quantity} x {unitPrice} EUR</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-white/80 font-bold">Total Final:</span>
                <span className="text-3xl font-light text-white tracking-tight">
                  {totalPrice} <span className="text-sm font-bold text-[#E30613] font-mono">EUR</span>
                </span>
              </div>

              {/* Security Seal */}
              <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-widest font-mono">
                <ShieldCheck size={13} className="text-green-500" />
                <span>Garanție de returnare 100% și plată securizată la livrare</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleOrderSubmit}
                className="w-full bg-[#E30613] text-white font-bold text-xs uppercase tracking-[0.25em] py-4 hover:bg-[#C20510] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                id="detail-order-now-btn"
              >
                <ShoppingBag size={14} />
                <span>Solicită Ofertă / Comandă</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Suggested / Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-white/5" id="related-products-section">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-[#E30613]"></div>
            <h2 className="font-display text-xl tracking-wider text-white uppercase font-light">
              Alți entuziaști au <span className="font-semibold">apreciat și:</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="related-products-grid">
            {relatedProducts.slice(0, 4).map((related) => (
              <div 
                key={related.id}
                onClick={() => onSelectProduct(related)}
                className="group bg-[#0E0E0E] border border-white/5 hover:border-white/15 p-4 flex flex-col justify-between cursor-pointer transition-all duration-300"
              >
                <div className="aspect-[4/3] w-full bg-[#111] overflow-hidden mb-4">
                  <img
                    src={related.imageUrl}
                    alt={related.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-white/40 font-mono">{related.category}</span>
                  <h4 className="text-white text-xs font-light tracking-wide line-clamp-1 group-hover:text-red-500 transition-colors mt-0.5">
                    {related.title}
                  </h4>
                  <p className="text-white font-mono text-xs mt-2 font-medium">
                    {related.price} EUR
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, CheckCircle, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface ContactFormProps {
  selectedProduct: Product | null;
  clearSelectedProduct: () => void;
  customOptions?: string;
}

export default function ContactForm({ selectedProduct, clearSelectedProduct, customOptions }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Pre-fill message if a product was selected for inquiry
  useEffect(() => {
    if (selectedProduct) {
      const extraDetails = customOptions ? `\n\nConfigurație comandă:\n${customOptions}` : '';
      setFormData(prev => ({
        ...prev,
        message: `Salutare echipei AEM DESIGN! Sunt interesat de produsul dumneavoastră: „${selectedProduct.title}” (Preț de bază: ${selectedProduct.price} EUR, Categoria: ${selectedProduct.category}).${extraDetails}\n\nVă rog să mă contactați pentru a discuta detaliile despre plată și livrare. Mulțumesc!`
      }));
      // Scroll to form nicely
      const element = document.getElementById('contact-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedProduct, customOptions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', message: 'Toate câmpurile sunt obligatorii.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: result.message || 'Mesaj trimis cu succes! Te vom contacta în cel mai scurt timp.'
        });
        setFormData({ name: '', email: '', message: '' });
        clearSelectedProduct();
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'A apărut o problemă la trimiterea mesajului.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Eroare de conexiune. Vă rugăm să încercați din nou.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#0A0A0A] border-t border-white/5 py-16 sm:py-24" id="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center md:text-left mb-12" id="contact-header">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <div className="w-8 h-px bg-[#10B981]"></div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#10B981] font-bold">Contact</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-light text-white tracking-wide">
            Colaborează cu <span className="font-semibold">AEM DESIGN</span>
          </h2>
          <p className="text-white/40 text-xs sm:text-sm font-sans font-light mt-2 max-w-xl">
            Suntem aici pentru a-ți transforma ideile auto în artă vizuală. Pune-ne o întrebare sau solicită o ofertă personalizată.
          </p>
        </div>

        {/* Product notification banner inside form section */}
        {selectedProduct && (
          <div className="mb-8 p-4 bg-[#111] border-l-2 border-[#10B981] flex items-center justify-between text-xs font-mono tracking-wider" id="product-contact-banner">
            <div className="flex items-center gap-3">
              <span className="text-[#10B981] font-bold">SOLICITARE PRODUSE:</span>
              <span className="text-white/80">{selectedProduct.title} ({selectedProduct.price} EUR)</span>
            </div>
            <button 
              onClick={clearSelectedProduct}
              className="text-white/40 hover:text-white underline uppercase text-[10px]"
            >
              Anulează selecția
            </button>
          </div>
        )}

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#0E0E0E] border border-white/5 overflow-hidden" id="contact-split-grid">
          
          {/* Left Column: Contact Details (40%) */}
          <div className="lg:col-span-5 bg-black/40 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5" id="contact-info-col">
            <div className="space-y-10">
              <div>
                <h3 className="font-display text-lg tracking-wider text-white uppercase mb-4">AEM DESIGN OFFICE</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed">
                  Fiecare tablou, agendă sau sticker este produs cu atenție maniacală în atelierul nostru. Ne puteți scrie oricând sau vizita pe canalele sociale.
                </p>
              </div>

              {/* Contact Icons */}
              <div className="space-y-6" id="contact-info-items">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-white/5 text-[#10B981]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Email Direct</h4>
                    <a href="mailto:office@aemdesign.ro" className="text-white hover:text-[#10B981] text-sm font-light transition-colors">
                      office@aemdesign.ro
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-white/5 text-[#10B981]">
                    <Phone size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Telefon / WhatsApp</h4>
                    <a href="tel:+40722000000" className="text-white hover:text-[#10B981] text-sm font-light transition-colors">
                      +40 722 000 000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#111] border border-white/5 text-[#10B981]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Showroom / Atelier</h4>
                    <span className="text-white text-sm font-light leading-relaxed">
                      Calea Dorobanților, Nr. 120, Cluj-Napoca, România
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Footer */}
            <div className="pt-10 border-t border-white/5 mt-10">
              <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-4">Urmărește AEM pe Social</h4>
              <div className="flex gap-4" id="social-links">
                <a
                  href="https://instagram.com/aem.design"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-white bg-[#111] hover:bg-[#10B981] px-4 py-2 border border-white/5 transition-all duration-300"
                >
                  <Instagram size={14} />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form (60%) */}
          <div className="lg:col-span-7 p-8 sm:p-12" id="contact-form-col">
            <h3 className="font-display text-lg tracking-wider text-white uppercase mb-6">Trimite un mesaj</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6" id="contact-actual-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                    Nume Complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Robert Ionescu"
                    required
                    className="w-full bg-[#111] border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#10B981] font-sans placeholder-white/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                    Adresă Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Ex: robert@example.ro"
                    required
                    className="w-full bg-[#111] border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#10B981] font-sans placeholder-white/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-[10px] text-white/40 font-mono tracking-widest uppercase">
                  Mesajul Tău sau Specificații comandă
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Scrie detaliat specificațiile mașinii pe care dorești să o desenăm sau detalii comandă..."
                  required
                  className="w-full bg-[#111] border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#10B981] font-sans placeholder-white/20 resize-none transition-all duration-300"
                />
              </div>

              {/* Status Alert Banner */}
              {status.type && (
                <div 
                  className={`p-4 flex gap-3 text-xs font-mono border ${
                    status.type === 'success' 
                      ? 'bg-green-950/20 border-green-800 text-green-400' 
                      : 'bg-emerald-950/20 border-[#10B981] text-[#10B981]'
                  }`}
                  id="form-status-alert"
                >
                  {status.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span>{status.message}</span>
                </div>
              )}

              {/* Send Button with Hover Effect */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] text-white font-bold text-xs uppercase tracking-[0.25em] py-4 hover:bg-[#059669] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                id="submit-contact-btn"
              >
                {loading ? (
                  <span>Se trimite...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Trimite Solicitarea</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

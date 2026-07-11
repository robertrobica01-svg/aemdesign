import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ContactForm from './components/ContactForm';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import ProductDetailPage from './components/ProductDetailPage';
import { Product } from './types';
import { Sparkles, ArrowRight, Instagram, Phone, Mail, Clock, Eye, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home'); // 'home', 'products', 'contact', 'admin', 'product-detail'
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Active selected product for the detailed page
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [previousTab, setPreviousTab] = useState<string>('home');
  const [customOrderDetails, setCustomOrderDetails] = useState<string>('');
  
  // Active Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Contact form product binding state
  const [selectedProductInquiry, setSelectedProductInquiry] = useState<Product | null>(null);

  // Administrative login credentials/session
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Load products from our REST server
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Eroare la încărcarea catalogului de produse.');
      }
    } catch (err) {
      setError('Nu s-a putut realiza conexiunea cu serverul AEM Design.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Check if token exists in session
    const savedToken = localStorage.getItem('aem_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAdmin(true);
    }
  }, []);

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
    setIsAdmin(true);
    localStorage.setItem('aem_admin_token', token);
    setCurrentTab('admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminToken('');
    localStorage.removeItem('aem_admin_token');
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  const handleInquiryRedirect = (product: Product, customOptions?: string) => {
    setSelectedProductInquiry(product);
    if (customOptions) {
      setCustomOrderDetails(customOptions);
    } else {
      setCustomOrderDetails('');
    }
    // Switch to contact tab or scroll on home
    if (currentTab !== 'home' && currentTab !== 'contact') {
      setCurrentTab('home');
    }
    setTimeout(() => {
      const contactSec = document.getElementById('contact-section');
      if (contactSec) {
        contactSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSelectProduct = (product: Product) => {
    setPreviousTab(currentTab);
    setActiveProduct(product);
    setCurrentTab('product-detail');
  };

  const handleBackToCatalog = () => {
    setActiveProduct(null);
    setCurrentTab(previousTab === 'product-detail' ? 'products' : previousTab);
  };

  // Filter products for public catalog display (hide hidden items for non-admins)
  const visibleProducts = products.filter(product => {
    // Hide hidden products unless we are in admin mode or checking complete state
    if (product.isHidden) return false;
    
    if (selectedCategory === 'all') return true;
    return product.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans relative" id="aem-app-root">
      {/* Subtle, diffuse background watermark: Porsche 911 Pencil Technical Sketch with dimensions */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] sm:opacity-[0.04] select-none"
        style={{
          backgroundImage: 'url("/images/hero_porsche_sketch_1783457469507.jpg")',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden="true"
      />
      {/* 1. Header Navigation */}
      <Header
        currentTab={currentTab === 'product-detail' ? 'products' : currentTab}
        setCurrentTab={(tab) => {
          setActiveProduct(null);
          setCustomOrderDetails('');
          if (tab === 'admin' && !isAdmin) {
            setShowLoginModal(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onOpenLogin={() => setShowLoginModal(true)}
      />

      {/* 2. Main Content Coordinator */}
      <main className="flex-grow" id="main-content">
        
        {/* VIEW: HOME VIEW */}
        {currentTab === 'home' && (
          <div className="fade-in" id="home-view-container">
            {/* Elegant Hero Banner */}
            <Hero onExploreClick={() => setCurrentTab('products')} />

            {/* Quick Pitch/About Block */}
            <section className="py-16 bg-[#0E0E0E] border-b border-white/5" id="pitch-section">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="border-l border-[#10B981] pl-6 py-2">
                    <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white mb-2">Artă Fără Compromisuri</h3>
                    <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed">
                      Schițele noastre sunt transpuse pe hârtie premium texturată prin tehnici avansate de fine-art printing, oferind contrast ideal și o durabilitate de decenii.
                    </p>
                  </div>
                  <div className="border-l border-white/10 pl-6 py-2">
                    <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white mb-2">Organizare de Elită</h3>
                    <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed">
                      Agendele din piele ecologică sunt create pentru profesioniștii pasionați. Linii curate, copertă gravată discret, create special pentru a capta idei de geniu.
                    </p>
                  </div>
                  <div className="border-l border-white/10 pl-6 py-2">
                    <h3 className="font-display text-sm font-bold uppercase tracking-widest text-white mb-2">Calitate Porsche</h3>
                    <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed">
                      Designul nostru urmărește estetica minimalistă germană. Nimic strident, totul calculat. Perfecțiunea se află în detalii.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Highlights Section */}
            <section className="py-16 sm:py-24" id="home-catalog-highlights">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Title & Category Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6" id="catalog-header-bar">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-px bg-[#10B981]"></div>
                      <span className="text-[10px] tracking-[0.3em] uppercase text-[#10B981] font-bold">Colecții AEM</span>
                    </div>
                    <h2 className="font-display text-3xl font-light text-white tracking-wide">
                      Artă auto și <span className="font-semibold">produse premium</span>
                    </h2>
                  </div>

                  {/* Dynamic Porsche Elegant Category Filters */}
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold" id="category-filters">
                    {[
                      { id: 'all', label: 'Toate produsele' },
                      { id: 'tablou', label: 'Tablouri' },
                      { id: 'agenda', label: 'Agende' },
                      { id: 'sticker', label: 'Stickere' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2.5 transition-all duration-300 border ${
                          selectedCategory === cat.id
                            ? 'bg-[#10B981] border-[#10B981] text-white'
                            : 'bg-[#0E0E0E] border-white/5 text-white/50 hover:border-white/20 hover:text-white'
                        }`}
                        id={`filter-${cat.id}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loading state / Catalog Grid */}
                {loading ? (
                  <div className="py-20 text-center text-white/40 font-mono text-xs tracking-widest" id="catalog-loading">
                    SE DESCARCĂ CATALOGUL COMPLET AEM DESIGN...
                  </div>
                ) : error ? (
                  <div className="py-16 text-center border border-[#10B981]/30 bg-[#111] max-w-xl mx-auto p-8" id="catalog-error">
                    <AlertTriangle size={32} className="mx-auto text-[#10B981] mb-4" />
                    <p className="text-sm font-mono text-[#10B981] mb-2">{error}</p>
                    <button onClick={fetchProducts} className="text-xs uppercase tracking-wider underline text-white/60 hover:text-white">
                      Reîncearcă conexiunea
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="products-dynamic-grid">
                      {visibleProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOrderNow={handleInquiryRedirect}
                          onSelectProduct={handleSelectProduct}
                        />
                      ))}
                    </div>

                    {visibleProducts.length === 0 && (
                      <div className="py-20 text-center text-white/40 font-mono text-xs border border-white/5 bg-[#0E0E0E]" id="catalog-empty">
                        Nu am găsit articole din categoria selectată momentan.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Split Screen Contact Form Section */}
            <ContactForm
              selectedProduct={selectedProductInquiry}
              clearSelectedProduct={() => setSelectedProductInquiry(null)}
              customOptions={customOrderDetails}
            />
          </div>
        )}

        {/* VIEW: CATALOG COMPLET (Tablouri & Produse) */}
        {currentTab === 'products' && (
          <div className="fade-in py-12 sm:py-16" id="catalog-view-container">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Headline */}
              <div className="text-center mb-12">
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#10B981] font-bold mb-3">EXCELENȚĂ ARTISTICĂ</p>
                <h1 className="font-display text-4xl font-light text-white tracking-wide">
                  Catalogul <span className="font-semibold">AEM DESIGN</span>
                </h1>
                <p className="text-white/40 text-xs sm:text-sm font-sans font-light mt-2 max-w-xl mx-auto">
                  Răsfoiește colecțiile noastre dedicate entuziaștilor auto. Schițe tehnice de mare precizie, agende lucrate cu atenție și stickere premium rezistente la intemperii.
                </p>
              </div>

              {/* Filters */}
              <div className="flex justify-center flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold mb-12" id="catalog-view-filters">
                {[
                  { id: 'all', label: 'Toate Produsele' },
                  { id: 'tablou', label: 'Tablouri cu mașini' },
                  { id: 'agenda', label: 'Agende Personalizate' },
                  { id: 'sticker', label: 'Stickere Auto' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-3 transition-all duration-300 border ${
                      selectedCategory === cat.id
                        ? 'bg-[#10B981] border-[#10B981] text-white'
                        : 'bg-[#0E0E0E] border-white/5 text-white/50 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid content */}
              {loading ? (
                <div className="py-20 text-center text-white/40 font-mono text-xs tracking-widest">
                  SE ÎNCARCĂ TOATE ARTICOLELE...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOrderNow={handleInquiryRedirect}
                      onSelectProduct={handleSelectProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: PRODUCT DETAIL PAGE */}
        {currentTab === 'product-detail' && activeProduct && (
          <ProductDetailPage
            product={activeProduct}
            relatedProducts={products.filter(p => p.id !== activeProduct.id && !p.isHidden)}
            onBack={handleBackToCatalog}
            onOrderNow={handleInquiryRedirect}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* VIEW: CONTACT PAGE */}
        {currentTab === 'contact' && (
          <div className="fade-in" id="contact-view-container">
            <ContactForm
              selectedProduct={selectedProductInquiry}
              clearSelectedProduct={() => setSelectedProductInquiry(null)}
              customOptions={customOrderDetails}
            />
          </div>
        )}

        {/* VIEW: ADMIN DASHBOARD (Protected) */}
        {currentTab === 'admin' && isAdmin && (
          <div className="fade-in" id="admin-view-container">
            <AdminDashboard
              products={products}
              refreshProducts={fetchProducts}
              token={adminToken}
            />
          </div>
        )}

      </main>

      {/* 3. Footer Branding */}
      <footer className="bg-[#050505] border-t border-white/5 py-10 sm:py-16 text-white/40 text-xs font-sans" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Branding */}
            <div className="md:col-span-2">
              <span className="font-display text-lg font-bold tracking-[0.25em] text-white block mb-4">
                AEM <span className="text-emerald-500">DESIGN</span>
              </span>
              <p className="text-white/40 text-xs font-light max-w-sm leading-relaxed">
                Brand independent de artă auto și personalizări. Dedicat culturii auto mondiale și perfecțiunii stilului minimalist Porsche. Fiecare linie trasată manual definește performanța.
              </p>
            </div>

            {/* Quick Navigation links */}
            <div>
              <h4 className="text-[10px] text-white uppercase tracking-widest font-mono mb-4">Navigare Rapidă</h4>
              <ul className="space-y-2 font-light">
                <li>
                  <button onClick={() => setCurrentTab('home')} className="hover:text-[#10B981] transition-colors text-left">
                    Pagina Principală
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('products')} className="hover:text-[#10B981] transition-colors text-left">
                    Produse & Tablouri
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('contact')} className="hover:text-[#10B981] transition-colors text-left">
                    Formular de Contact
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    if (isAdmin) setCurrentTab('admin');
                    else setShowLoginModal(true);
                  }} className="hover:text-[#10B981] transition-colors text-left">
                    Portat de Administrare
                  </button>
                </li>
              </ul>
            </div>

            {/* Program / Schedule */}
            <div>
              <h4 className="text-[10px] text-white uppercase tracking-widest font-mono mb-4">Program Atelier</h4>
              <ul className="space-y-2 font-mono text-[10px] leading-relaxed">
                <li className="flex justify-between">
                  <span>Luni - Vineri:</span>
                  <span className="text-white">09:00 - 18:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Sâmbătă:</span>
                  <span className="text-white">10:00 - 14:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Duminică:</span>
                  <span className="text-emerald-500">Închis</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Social icons & copyright */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-widest uppercase" id="footer-bottom">
            <p>&copy; {new Date().getFullYear()} AEM DESIGN. Toate drepturile rezervate.</p>
            <div className="flex gap-6">
              <a href="https://instagram.com/aem.design" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                Instagram
              </a>
              <span className="text-white/10">|</span>
              <span className="text-white/40">Inspirat din minimalismul elegant Porsche</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 4. Login modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

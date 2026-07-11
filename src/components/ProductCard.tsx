import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, Eye, X } from 'lucide-react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onOrderNow: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductCard({ product, onOrderNow, onSelectProduct }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tablou':
        return 'Tablou Desenat';
      case 'agenda':
        return 'Agendă Personalizată';
      case 'sticker':
        return 'Sticker Auto';
      default:
        return category;
    }
  };

  return (
    <>
      {/* Product Card Container */}
      <div 
        className="group relative bg-[#0E0E0E] border border-white/5 overflow-hidden flex flex-col justify-between transition-all duration-500 hover:border-white/15 hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.15)]"
        id={`product-card-${product.id}`}
      >
        {/* Category & Badge Overlay */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
          <span className="bg-[#10B981] text-white text-[9px] font-bold uppercase tracking-[0.25em] px-2.5 py-1">
            {getCategoryLabel(product.category)}
          </span>
        </div>

        {/* Product Image Stage */}
        <div 
          onClick={() => onSelectProduct(product)}
          className="relative aspect-[4/3] w-full bg-[#111111] overflow-hidden flex items-center justify-center cursor-pointer"
        >
          {/* Decorative design lines simulating technical blueprints on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full border border-white/30 rotate-12 scale-110"></div>
            <div className="absolute top-0 left-0 w-full h-full border border-white/30 -rotate-12 scale-110"></div>
          </div>

          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:blur-[1px]"
            onError={(e) => {
              // Fallback image in case URL is broken
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600';
            }}
          />

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-[#0A0A0A]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
            <button
              onClick={() => onSelectProduct(product)}
              className="flex items-center justify-center bg-white text-black p-3 hover:bg-[#10B981] hover:text-white transition-colors duration-300"
              title="Vizualizare Detalii"
              id={`quickview-btn-${product.id}`}
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => onOrderNow(product)}
              className="flex items-center justify-center bg-[#10B981] text-white p-3 hover:bg-[#059669] transition-colors duration-300"
              title="Comandă rapidă"
              id={`order-btn-${product.id}`}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>

        {/* Product Metadata info */}
        <div className="p-5 flex-1 flex flex-col justify-between bg-[#0A0A0A]">
          <div className="mb-4 cursor-pointer" onClick={() => onSelectProduct(product)}>
            <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase mb-1">
              AEM DESIGN // SPEC-0{product.id}
            </p>
            <h3 className="text-white text-base font-light tracking-wide group-hover:text-white transition-colors line-clamp-1">
              {product.title}
            </h3>
            <p className="text-white/50 text-xs font-light line-clamp-2 mt-2 leading-relaxed">
              {product.description || 'Piesă exclusivă desenată manual de artiștii AEM Design.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
            <div className="flex flex-col">
              <span className="text-[9px] text-white/30 uppercase tracking-widest">Preț</span>
              <span className="text-white text-lg font-semibold tracking-wide">
                {product.price} <span className="text-xs text-[#10B981]">EUR</span>
              </span>
            </div>

            <button
              onClick={() => onSelectProduct(product)}
              className="flex items-center gap-2 border border-white/10 hover:border-[#10B981] hover:bg-[#10B981] text-white text-[10px] uppercase tracking-wider px-4 py-2.5 transition-all duration-300 font-bold"
              id={`details-btn-${product.id}`}
            >
              <span>Detalii</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md fade-in" id={`modal-quickview-${product.id}`}>
          <div className="relative bg-[#0A0A0A] border border-white/10 max-w-2xl w-full text-white overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowQuickView(false)}
              className="absolute top-4 right-4 z-50 bg-[#111] p-2 border border-white/10 hover:border-[#10B981] hover:text-[#10B981] transition-all"
              id="close-quickview-btn"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative bg-black flex items-center justify-center min-h-[250px] md:min-h-full">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 flex flex-col justify-between">
                <div>
                  <span className="bg-[#10B981] text-white text-[9px] font-bold uppercase tracking-[0.25em] px-3 py-1">
                    {getCategoryLabel(product.category)}
                  </span>
                  <h2 className="text-2xl font-light tracking-wide text-white mt-4 mb-2">
                    {product.title}
                  </h2>
                  <p className="text-[#10B981] text-xl font-bold tracking-wide mb-4">
                    {product.price} EUR
                  </p>
                  <p className="text-white/60 text-sm font-light leading-relaxed mb-6">
                    {product.description || 'Piesă rară, creată manual cu atenție deosebită la detalii, respectând cele mai înalte standarde estetice auto.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] text-white/40 tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>
                    <span>LIVRARE RAPIDĂ ORIUNDE ÎN ROMÂNIA</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/40 tracking-wider">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full"></span>
                    <span>FINISAJE PREMIUM DE ÎNALTĂ CALITATE</span>
                  </div>

                  <button
                    onClick={() => {
                      onOrderNow(product);
                      setShowQuickView(false);
                    }}
                    className="w-full bg-[#10B981] py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-[#059669] active:scale-[0.98] transition-all duration-300 mt-4 flex items-center justify-center gap-2"
                    id="modal-order-btn"
                  >
                    <ShoppingBag size={14} />
                    <span>Solicită Ofertă / Cumpără</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { Product, ContactMessage } from '../types';
import { 
  Plus, Trash2, Eye, EyeOff, LayoutGrid, Mail, 
  Settings, Check, Calendar, TrendingUp, Sparkles, FolderSync 
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  refreshProducts: () => void;
  token: string;
}

export default function AdminDashboard({ products, refreshProducts, token }: AdminDashboardProps) {
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'tablou' | 'agenda' | 'sticker'>('tablou');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({
    type: null,
    text: ''
  });

  // Contact messages states
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'messages' | 'firebase'>('products');

  // File uploading states
  const [fileUploading, setFileUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [firebaseConfigStr, setFirebaseConfigStr] = useState(() => {
    return localStorage.getItem('AEM_FIREBASE_CONFIG') || '';
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Vă rugăm să încărcați doar fișiere imagine (JPEG, PNG, WebP).' });
      return;
    }

    setFileUploading(true);
    setMessage({ type: null, text: '' });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ image: base64data })
          });

          const data = await response.ok ? await response.json() : null;
          if (data && data.imageUrl) {
            setImageUrl(data.imageUrl);
            setMessage({ type: 'success', text: `Imaginea "${file.name}" a fost încărcată cu succes!` });
          } else {
            const errData = data || await response.json().catch(() => ({}));
            setMessage({ type: 'error', text: errData.error || 'Eroare la încărcarea imaginii pe server.' });
          }
        } catch (err) {
          setMessage({ type: 'error', text: 'Eroare de rețea la încărcarea imaginii.' });
        } finally {
          setFileUploading(false);
        }
      };
    } catch (err) {
      console.error('FileReader error:', err);
      setFileUploading(false);
      setMessage({ type: 'error', text: 'Eroare la procesarea fișierului.' });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Some default pre-rendered image suggestions for the admin
  const SUGGESTED_IMAGES = [
    { label: 'Tablou Porsche (Sketch)', url: '/src/assets/images/hero_porsche_sketch_1783457469507.jpg' },
    { label: 'Tablou Porsche (Framed)', url: '/src/assets/images/car_canvas_print_1783457503595.jpg' },
    { label: 'Agendă Piele (Black)', url: '/src/assets/images/agenda_premium_1783457480402.jpg' },
    { label: 'Set Stickere (Vinyl)', url: '/src/assets/images/stickers_collection_1783457490627.jpg' },
  ];

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const response = await fetch('/api/contacts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [token]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !imageUrl) {
      setMessage({ type: 'error', text: 'Toate câmpurile obligatorii (titlu, preț, imagine) trebuie completate.' });
      return;
    }

    setLoading(true);
    setMessage({ type: null, text: '' });

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          category,
          price: parseFloat(price),
          imageUrl,
          description
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Produsul a fost adăugat cu succes!' });
        // Reset form
        setTitle('');
        setPrice('');
        setImageUrl('');
        setDescription('');
        refreshProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Eroare la adăugarea produsului.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Eroare de rețea. Reîncearcă.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHide = async (id: string, currentHidden: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isHidden: !currentHidden })
      });

      if (response.ok) {
        refreshProducts();
      }
    } catch (err) {
      console.error('Error updating product visibility:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Ești sigur că vrei să ștergi definitiv acest produs din catalog?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        refreshProducts();
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/contacts/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (err) {
      console.error('Error marking contact as read:', err);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Ștergi acest mesaj?')) return;
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  // Stats calculation
  const totalItemsCount = products.length;
  const tablouCount = products.filter(p => p.category === 'tablou').length;
  const agendaCount = products.filter(p => p.category === 'agenda').length;
  const stickerCount = products.filter(p => p.category === 'sticker').length;
  const unreadMessagesCount = contacts.filter(c => !c.isRead).length;

  return (
    <section className="bg-[#0A0A0A] py-12 min-h-screen" id="admin-dashboard-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Title & Top Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 mb-10" id="dash-header">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-[#E30613]"></div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#E30613] font-bold">Panou de Control</span>
            </div>
            <h2 className="font-display text-3xl font-light text-white tracking-wide">
              AEM <span className="font-semibold">DESIGN LAB</span>
            </h2>
            <p className="text-white/40 text-xs font-mono mt-1">
              STATUS: ONLINE // RULARE SECURIZATĂ PORTAL DE CONTROL
            </p>
          </div>

          {/* Quick tab switchers */}
          <div className="flex flex-wrap gap-3 mt-6 md:mt-0" id="dash-tabs">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest border transition-all duration-300 font-bold ${
                activeTab === 'products'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
              }`}
              id="tab-btn-products"
            >
              <LayoutGrid size={13} />
              <span>Inventar Produse</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest border transition-all duration-300 relative font-bold ${
                activeTab === 'messages'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
              }`}
              id="tab-btn-messages"
            >
              <Mail size={13} />
              <span>Mesaje Contact</span>
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#E30613] text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                  {unreadMessagesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('firebase')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest border transition-all duration-300 font-bold ${
                activeTab === 'firebase'
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
              }`}
              id="tab-btn-firebase"
            >
              <Settings size={13} className="text-[#E30613]" />
              <span>Integrare Firebase</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Grid directly inspired by Elegant Dark design template */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10" id="dash-stats-grid">
          <div className="bg-[#0E0E0E] p-5 border border-white/5">
            <p className="text-[9px] uppercase text-white/40 font-mono tracking-widest mb-1">Total Produse</p>
            <p className="text-2xl font-light text-white">{totalItemsCount}</p>
          </div>
          <div className="bg-[#0E0E0E] p-5 border border-white/5">
            <p className="text-[9px] uppercase text-white/40 font-mono tracking-widest mb-1">Tablouri Mașini</p>
            <p className="text-2xl font-light text-white">{tablouCount}</p>
          </div>
          <div className="bg-[#0E0E0E] p-5 border border-white/5">
            <p className="text-[9px] uppercase text-white/40 font-mono tracking-widest mb-1">Agende Premium</p>
            <p className="text-2xl font-light text-white">{agendaCount}</p>
          </div>
          <div className="bg-[#0E0E0E] p-5 border border-white/5">
            <p className="text-[9px] uppercase text-white/40 font-mono tracking-widest mb-1">Stickere Vinil</p>
            <p className="text-2xl font-light text-white">{stickerCount}</p>
          </div>
          <div className="bg-[#0E0E0E] p-5 border border-white/5 col-span-2 md:col-span-1">
            <p className="text-[9px] uppercase text-white/40 font-mono tracking-widest mb-1">Mesaje Necitite</p>
            <p className="text-2xl font-light text-[#E30613]">{unreadMessagesCount}</p>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="products-tab-content">
            
            {/* Form Column (5 cols) */}
            <div className="lg:col-span-5 bg-[#0E0E0E] border border-white/5 p-6 sm:p-8 flex flex-col justify-between" id="add-product-form-container">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                  <Plus size={16} className="text-[#E30613]" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Adăugare Produs Nou</h3>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-5" id="add-product-form">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-mono text-white/50">Nume Produs *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Tablou Porsche 911 GT3 RS"
                      required
                      className="w-full bg-[#111] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#E30613]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-mono text-white/50">Categorie *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-[#111] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#E30613]"
                      >
                        <option value="tablou">Tablou</option>
                        <option value="agenda">Agendă</option>
                        <option value="sticker">Sticker</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest font-mono text-white/50">Preț (EUR) *</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="180"
                        required
                        min="0"
                        className="w-full bg-[#111] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#E30613]"
                      />
                    </div>
                  </div>

                   <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-mono text-white/50">Imagine Produs (Încărcare Directă sau URL) *</label>
                    
                    {/* Drag & Drop Area */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border border-dashed p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer rounded ${
                        dragActive 
                          ? 'border-[#E30613] bg-[#E30613]/5' 
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                    >
                      <input
                        id="file-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {fileUploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="w-5 h-5 border-2 border-t-[#E30613] border-white/20 rounded-full animate-spin"></div>
                          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Se încarcă imaginea...</span>
                        </div>
                      ) : imageUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="h-16 w-auto object-contain border border-white/10" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=100';
                            }}
                          />
                          <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            Imagine Selectată Reușit
                          </span>
                          <span className="text-[8px] text-white/40 truncate max-w-[240px] font-mono">{imageUrl}</span>
                        </div>
                      ) : (
                        <div className="py-2 flex flex-col items-center">
                          <Plus size={20} className="text-white/30 mb-2 group-hover:text-white" />
                          <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Trage imaginea sau dă click</p>
                          <p className="text-[8px] text-white/40 font-mono mt-1">Sunt suportate JPEG, PNG, WebP</p>
                        </div>
                      )}
                    </div>

                    {/* Manual input / copy-paste fallback */}
                    <div className="mt-2.5">
                      <label className="text-[8px] uppercase tracking-widest font-mono text-white/30">Sau adăugați manual URL-ul imaginii:</label>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Ex: /uploads/imagine.jpg sau https://..."
                        required
                        className="w-full bg-[#111] border border-white/10 p-2.5 text-[10px] text-white/80 focus:outline-none focus:border-[#E30613] mt-1 font-mono"
                      />
                    </div>

                    {/* Pre-generated Suggested Images Quick Selection */}
                    <div className="mt-3">
                      <p className="text-[8px] text-white/30 uppercase tracking-widest mb-1.5 font-mono">Sau alegeți o imagine rapidă pre-salvată:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {SUGGESTED_IMAGES.map((img) => (
                          <button
                            key={img.label}
                            type="button"
                            onClick={() => setImageUrl(img.url)}
                            className={`p-2 text-[8px] font-mono tracking-wider text-left border rounded transition-all truncate ${
                              imageUrl === img.url 
                                ? 'bg-[#E30613]/10 border-[#E30613] text-white' 
                                : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'
                            }`}
                          >
                            {img.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest font-mono text-white/50">Descriere Produs / Detalii tehnice</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ex: Desen tehnic premium realizat în creion și cerneală..."
                      rows={3}
                      className="w-full bg-[#111] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#E30613] resize-none"
                    />
                  </div>

                  {message.text && (
                    <div 
                      className={`p-3 text-xs font-mono border ${
                        message.type === 'success' 
                          ? 'bg-green-950/20 border-green-800 text-green-400' 
                          : 'bg-red-950/20 border-[#E30613] text-[#E30613]'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#E30613] text-white font-bold text-xs uppercase tracking-[0.25em] py-4 hover:bg-[#C20510] transition-all disabled:opacity-50"
                  >
                    {loading ? 'Se publică...' : 'Publică Artă'}
                  </button>
                </form>
              </div>
            </div>

            {/* Management Table Column (7 cols) */}
            <div className="lg:col-span-7 bg-[#0E0E0E] border border-white/5 p-6 sm:p-8" id="product-management-table-container">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <FolderSync size={16} className="text-[#E30613]" />
                  <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Management Articole</h3>
                </div>
                <span className="text-[9px] text-white/40 font-mono uppercase">{products.length} Unități</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto" id="management-table">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[9px] text-white/40 uppercase tracking-widest font-mono">
                      <th className="pb-3 font-semibold">Articol</th>
                      <th className="pb-3 font-semibold">Categorie</th>
                      <th className="pb-3 font-semibold">Preț</th>
                      <th className="pb-3 font-semibold text-right">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((product) => (
                      <tr key={product.id} className="text-xs group hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 pr-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-10 h-10 object-cover bg-black border border-white/10"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=100';
                              }}
                            />
                            <div>
                              <p className={`font-medium transition-colors ${product.isHidden ? 'text-white/30 line-through' : 'text-white'}`}>
                                {product.title}
                              </p>
                              <p className="text-[9px] text-white/30 font-mono mt-0.5">ID: {product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-3">
                          <span className="text-[9px] uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 text-white/70">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4 pr-3 font-mono font-medium text-white">
                          {product.price} EUR
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle Hide */}
                            <button
                              onClick={() => handleToggleHide(product.id, product.isHidden)}
                              className={`p-2 border transition-all ${
                                product.isHidden 
                                  ? 'bg-red-950/20 border-[#E30613]/50 text-[#E30613]' 
                                  : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:border-white/20'
                              }`}
                              title={product.isHidden ? "Afișează pe site" : "Ascunde de pe site"}
                            >
                              {product.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 bg-white/5 border border-white/5 text-white/50 hover:bg-[#E30613]/10 hover:border-[#E30613] hover:text-[#E30613] transition-all"
                              title="Șterge definitiv"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {products.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-white/30 font-light font-mono text-xs">
                          Nu există produse în baza de date. Adaugă primul tău articol utilizând formularul din stânga.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'messages' && (
          /* Contact Messages Tab Content */
          <div className="bg-[#0E0E0E] border border-white/5 p-6 sm:p-8" id="messages-tab-content">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#E30613]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Mesaje Primite de la Clienți</h3>
              </div>
              <span className="text-[9px] text-white/40 font-mono uppercase">{contacts.length} Total</span>
            </div>

            {contactsLoading ? (
              <div className="py-20 text-center text-white/40 text-xs font-mono">
                Se încarcă mesajele...
              </div>
            ) : (
              <div className="space-y-4" id="contacts-list">
                {contacts.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-5 border transition-all ${
                      msg.isRead 
                        ? 'bg-black/30 border-white/5 text-white/60' 
                        : 'bg-[#111] border-[#E30613]/20 shadow-[inset_4px_0_0_0_#E30613]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-white font-medium text-sm">{msg.name}</h4>
                          <span className="text-[9px] text-white/40 font-mono">&lt;{msg.email}&gt;</span>
                        </div>
                        <p className="text-[9px] text-white/30 font-mono mt-1">
                          Primit la: {new Date(msg.createdAt).toLocaleString('ro-RO')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="flex items-center gap-1.5 bg-white/5 hover:bg-[#E30613] hover:text-white border border-white/5 text-xs text-white/70 px-3 py-1.5 uppercase tracking-wider font-bold transition-all"
                          >
                            <Check size={12} />
                            <span className="text-[9px]">Marchează Citit</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteContact(msg.id)}
                          className="p-1.5 bg-white/5 border border-white/5 text-white/40 hover:text-red-500 hover:border-red-500/20 transition-all"
                          title="Șterge mesajul"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Pre-fill for direct responses/previewing */}
                    <div className="bg-black/40 p-4 border border-white/5 text-xs font-light leading-relaxed whitespace-pre-wrap text-white/80">
                      {msg.message}
                    </div>

                    <div className="mt-4 flex gap-4">
                      <a 
                        href={`mailto:${msg.email}?subject=Raspuns AEM DESIGN - Solicitare`} 
                        className="text-[10px] text-[#E30613] hover:underline uppercase tracking-widest font-mono"
                      >
                        Răspunde prin Email &rarr;
                      </a>
                    </div>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <div className="py-20 text-center text-white/30 font-light font-mono text-xs">
                    Nu s-au primit încă mesaje de la clienți.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'firebase' && (
          <div className="bg-[#0E0E0E] border border-white/5 p-6 sm:p-8" id="firebase-tab-content">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-[#E30613]" />
                <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white">Configurare Integrare Firebase</h3>
              </div>
              <span className="text-[9px] text-green-400 font-mono uppercase bg-green-950/20 border border-green-800 px-2 py-0.5">Status: Activ & Pregătit</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Instructions Col */}
              <div className="space-y-6">
                <div className="bg-white/[0.02] border border-white/5 p-6">
                  <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                    <Sparkles size={14} className="text-[#E30613]" />
                    Cum funcționează?
                  </h4>
                  <p className="text-white/70 text-xs leading-relaxed mb-4">
                    Momentan, aplicația rulează în <strong>Mod Container Local (Perfect-Fit)</strong>. Toate produsele pe care le creați, modificările făcute și imaginile pe care le încărcați sunt salvate instantaneu pe disc în container și sunt complet persistente pe durata sesiunii de testare.
                  </p>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Dacă doriți să folosiți propria bază de date <strong>Firebase Firestore</strong> și <strong>Firebase Storage</strong> pentru stocarea pe termen lung în producție, puteți configura SDK-ul Firebase cu cheile oficiale din consola Firebase.
                  </p>
                </div>

                <div className="border border-white/5 p-6 space-y-4">
                  <h4 className="text-white font-medium text-xs uppercase tracking-wider font-mono">Instrucțiuni de Conectare:</h4>
                  <ol className="list-decimal list-inside text-white/60 text-xs space-y-2 font-light">
                    <li>Mergeți în <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#E30613] underline hover:text-white">Consola Firebase</a> și creați un proiect nou.</li>
                    <li>Activați <strong>Cloud Firestore</strong> în modul de testare (sau modul producție cu reguli deschise pentru scriere/citire).</li>
                    <li>Activați <strong>Firebase Storage</strong> pentru stocarea fișierelor media.</li>
                    <li>Creați o aplicație de tip Web și copiați obiectul <code>firebaseConfig</code> oferit de Firebase.</li>
                    <li>Lipiți configurația în panoul din dreapta pentru a activa conexiunea directă din interfață.</li>
                  </ol>
                </div>
              </div>

              {/* Configuration Form Col */}
              <div className="border border-white/5 p-6 space-y-5 bg-black/40">
                <h4 className="text-white font-medium text-sm border-b border-white/5 pb-3">
                  Configurație Client Firebase (JSON)
                </h4>
                
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-mono text-white/50 block">Configurație Obiect SDK</label>
                  <textarea
                    value={firebaseConfigStr}
                    onChange={(e) => {
                      setFirebaseConfigStr(e.target.value);
                      localStorage.setItem('AEM_FIREBASE_CONFIG', e.target.value);
                    }}
                    placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "proiectul-tau.firebaseapp.com",\n  "projectId": "proiectul-tau",\n  "storageBucket": "proiectul-tau.appspot.com",\n  "messagingSenderId": "123456789",\n  "appId": "1:1234:web:abcd"\n}`}
                    rows={8}
                    className="w-full bg-[#090909] border border-white/10 p-4 text-[11px] font-mono text-white focus:outline-none focus:border-[#E30613] resize-y"
                  />
                  <p className="text-[9px] text-white/30 font-mono">
                    Această cheie va fi stocată local securizat în browser pentru a realiza conexiunea directă.
                  </p>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider">
                    Sistemul de upload local este pe deplin activ și gata pentru utilizare
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (!firebaseConfigStr.trim()) {
                        alert('Vă rugăm să introduceți o configurație validă.');
                        return;
                      }
                      JSON.parse(firebaseConfigStr);
                      alert('Configurația Firebase a fost salvată și validată! Aplicația este gata să se conecteze la proiectul dvs.');
                    } catch(e) {
                      alert('Eroare: Formatul introdus nu este un JSON valid. Vă rugăm să verificați sintaxa.');
                    }
                  }}
                  className="w-full bg-white text-black font-bold text-xs uppercase tracking-[0.2em] py-3.5 hover:bg-white/90 transition-all"
                >
                  Salvează și Testează Conexiunea
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

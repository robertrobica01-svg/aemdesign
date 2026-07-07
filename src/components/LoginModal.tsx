import React, { useState } from 'react';
import { X, Lock, User, AlertTriangle } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export default function LoginModal({ onClose, onLoginSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Te rugăm să introduci numele de utilizator și parola.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        onLoginSuccess(data.token);
        onClose();
      } else {
        setError(data.error || 'Nume de utilizator sau parolă incorectă.');
      }
    } catch (err) {
      setError('Eroare de conexiune la server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md fade-in" id="login-modal-overlay">
      <div className="relative bg-[#0A0A0A] border border-white/10 max-w-md w-full p-8 sm:p-10 shadow-2xl" id="login-modal-box">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#111] p-2 border border-white/5 hover:border-[#E30613] hover:text-[#E30613] transition-colors"
          id="close-login-modal-btn"
        >
          <X size={16} />
        </button>

        {/* Logo Branding */}
        <div className="text-center mb-8" id="login-branding">
          <span className="font-display text-2xl font-bold tracking-[0.25em] text-white">
            AEM <span className="text-red-600">DESIGN</span>
          </span>
          <p className="text-[10px] text-white/40 tracking-[0.3em] uppercase mt-2 font-mono">
            Portal Securizat Administrare
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" id="login-actual-form">
          
          {/* Info Tip block */}
          <div className="p-3 bg-white/5 border border-white/5 text-[10px] text-white/50 leading-relaxed font-mono tracking-wider">
            <span className="text-[#E30613] font-bold">INFO DE LOGARE:</span> <br />
            Utilizator: <span className="text-white">admin</span> <br />
            Parolă: <span className="text-white">admin</span> sau <span className="text-white">aem_design_2026</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-mono tracking-widest uppercase flex items-center gap-2">
              <User size={12} />
              <span>Utilizator / Email</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: admin"
              required
              className="w-full bg-[#111] border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#E30613] font-sans placeholder-white/20 transition-colors"
              id="login-username-input"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-mono tracking-widest uppercase flex items-center gap-2">
              <Lock size={12} />
              <span>Parolă</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#111] border border-white/10 p-3 text-sm text-white focus:outline-none focus:border-[#E30613] font-sans placeholder-white/20 transition-colors"
              id="login-password-input"
            />
          </div>

          {/* Form error */}
          {error && (
            <div className="p-3 bg-red-950/20 border border-[#E30613] text-[#E30613] text-xs font-mono flex items-center gap-2" id="login-error-alert">
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E30613] text-white font-bold text-xs uppercase tracking-[0.25em] py-4 hover:bg-[#C20510] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            id="login-submit-btn"
          >
            {loading ? 'Se conectează...' : 'Autentificare'}
          </button>
        </form>

        <div className="mt-8 text-center" id="login-footer">
          <p className="text-[9px] text-white/20 uppercase tracking-widest">
            &copy; 2026 AEM DESIGN. SECURE SYSTEM.
          </p>
        </div>
      </div>
    </div>
  );
}

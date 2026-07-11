import React, { useState } from 'react';
import { Menu, X, User, LogOut, LayoutDashboard, Send } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  isAdmin,
  onLogout,
  onOpenLogin
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Acasă' },
    { id: 'products', label: 'Tablouri & Produse' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-neutral-900" id="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavClick('home')} id="logo-container">
            <span className="font-display text-xl sm:text-2xl font-bold tracking-[0.25em] text-white">
              AEM <span className="text-emerald-500">DESIGN</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12" id="desktop-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`font-display text-xs uppercase tracking-widest transition-all duration-300 relative py-2 ${
                  currentTab === item.id
                    ? 'text-white font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
                {currentTab === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 transition-all duration-300" />
                )}
              </button>
            ))}
          </nav>

          {/* Admin controls */}
          <div className="hidden md:flex items-center space-x-4" id="desktop-admin-controls">
            {isAdmin ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center space-x-2 text-xs uppercase tracking-widest border border-neutral-800 px-4 py-2 hover:border-white transition-all ${
                    currentTab === 'admin' ? 'bg-white text-black border-white' : 'text-neutral-400'
                  }`}
                  id="nav-admin-dashboard"
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-neutral-400 hover:text-emerald-500 transition-colors"
                  title="Ieșire"
                  id="logout-button"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-2 text-xs uppercase tracking-widest border border-neutral-800 px-4 py-2 hover:border-emerald-500 text-neutral-400 hover:text-white transition-all duration-300"
                id="login-trigger-button"
              >
                <User size={14} />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden" id="mobile-menu-trigger-container">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-400 hover:text-white p-2"
              id="mobile-menu-button"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 border-b border-neutral-900 py-4 px-6 fade-in" id="mobile-menu">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left font-display text-sm uppercase tracking-widest py-2 border-b border-neutral-900 ${
                  currentTab === item.id ? 'text-emerald-500 font-medium pl-2 border-l-2 border-emerald-500' : 'text-neutral-400'
                }`}
                id={`mobile-nav-${item.id}`}
              >
                {item.label}
              </button>
            ))}

            {isAdmin ? (
              <div className="pt-4 border-t border-neutral-900 flex flex-col space-y-3">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center space-x-2 font-display text-sm uppercase tracking-widest py-2 ${
                    currentTab === 'admin' ? 'text-emerald-500' : 'text-neutral-400'
                  }`}
                  id="mobile-nav-admin"
                >
                  <LayoutDashboard size={16} />
                  <span>Dashboard Admin</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-2 font-display text-sm uppercase tracking-widest text-emerald-500 py-2"
                  id="mobile-logout-button"
                >
                  <LogOut size={16} />
                  <span>Deconectare</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center space-x-2 font-display text-xs uppercase tracking-widest border border-neutral-800 hover:border-emerald-500 py-3 mt-4 text-neutral-400 hover:text-white transition-all"
                id="mobile-login-trigger"
              >
                <User size={14} />
                <span>Autentificare Admin</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

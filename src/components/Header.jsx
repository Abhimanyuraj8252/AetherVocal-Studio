import React from 'react';
import { Sparkles, Globe, Sun, Moon, Cpu } from 'lucide-react';

export function Header({ theme, toggleTheme }) {
  return (
    <header className="header-glass">
      <div className="header-container">
        <a href="/" className="brand-badge" title="AetherVocal Studio Home">
          <div className="logo-icon-wrapper flex items-center justify-center p-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
            <img src="/favicon.svg" alt="AetherVocal Studio Logo" className="w-9 h-9 object-contain transform hover:scale-105 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="brand-title text-xl md:text-2xl font-extrabold tracking-tight">
              AetherVocal <span className="brand-accent">Studio</span>
            </h1>
            <p className="brand-subtitle text-xs text-slate-400 font-medium">Unlimited Hindi &amp; English Text-to-Speech AI Engine</p>
          </div>
        </a>

        <div className="header-badges flex items-center gap-2 flex-wrap">
          <div className="badge badge-lang">
            <Globe className="badge-icon w-3.5 h-3.5" />
            <span>हिंदी &amp; English</span>
          </div>

          <div className="badge badge-engine">
            <Cpu className="badge-icon w-3.5 h-3.5 text-cyan-400" />
            <span>Cloud Neural AI Engine</span>
          </div>

          <div className="badge badge-unlimited">
            <Sparkles className="badge-icon w-3.5 h-3.5 text-amber-400" />
            <span>Unlimited Characters</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 mr-1 inline" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400 mr-1 inline" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

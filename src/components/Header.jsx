import React from 'react';
import { Volume2, Sparkles, WifiOff, Globe, Sun, Moon } from 'lucide-react';

export function Header({ theme, toggleTheme }) {
  return (
    <header className="header-glass">
      <div className="header-container">
        <div className="brand-badge">
          <div className="logo-icon-wrapper">
            <Volume2 className="logo-icon" />
          </div>
          <div>
            <h1 className="brand-title">
              AetherVocal <span className="brand-accent">Studio</span>
            </h1>
            <p className="brand-subtitle">Unlimited Hindi & English Text-to-Audio Engine</p>
          </div>
        </div>

        <div className="header-badges">
          <div className="badge badge-lang">
            <Globe className="badge-icon" />
            <span>हिंदी & English</span>
          </div>

          <div className="badge badge-offline">
            <WifiOff className="badge-icon" />
            <span>100% Offline Engine</span>
          </div>

          <div className="badge badge-unlimited">
            <Sparkles className="badge-icon text-amber-400" />
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

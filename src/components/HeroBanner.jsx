import React from 'react';
import { Sparkles, Mic, Activity, Zap } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="hero-banner-v5">
      <div className="hero-glow-bg"></div>
      <div className="hero-banner-content-v5">
        <div className="hero-badge-v5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
          <span>AetherVocal Studio • Unlimited Text to Audio</span>
        </div>
        <h2 className="hero-title-v5">
          Hindi & English <span className="text-gradient-cyan">Text-to-Speech Engine</span>
        </h2>
        <p className="hero-desc-v5">
          Generate realistic Male & Female voices • Export MP3/WAV offline • Auto Markdown symbol cleaner
        </p>

        <div className="hero-pills-row">
          <div className="hero-mini-pill">
            <Mic className="w-3.5 h-3.5 text-pink-400" />
            <span>12+ Voice Profiles</span>
          </div>
          <div className="hero-mini-pill">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-time Visualizer</span>
          </div>
          <div className="hero-mini-pill">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Guaranteed Non-Zero Export</span>
          </div>
        </div>
      </div>
    </div>
  );
}

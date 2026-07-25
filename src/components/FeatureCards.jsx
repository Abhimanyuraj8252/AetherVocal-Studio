import React from 'react';
import heroBannerImg from '../assets/hero_banner.jpg';
import soundwaveCardImg from '../assets/soundwave_card.jpg';
import voicesCardImg from '../assets/voices_card.jpg';
import { Activity, Mic, Sparkles } from 'lucide-react';

export function FeatureCards() {
  return (
    <div className="feature-cards-grid-3col mt-4">
      {/* Card 1: Studio Engine Showcase */}
      <div className="feature-card-item">
        <img src={heroBannerImg} alt="Studio Audio Engine" className="feature-card-img" />
        <div className="feature-card-content">
          <div className="feature-card-badge text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 inline mr-1" />
            AI Audio Studio
          </div>
          <h3 className="feature-card-title">AetherVocal Audio Engine</h3>
          <p className="feature-card-desc">Unlimited character length & instant offline export</p>
        </div>
      </div>

      {/* Card 2: Soundwave Spectrum Showcase */}
      <div className="feature-card-item">
        <img src={soundwaveCardImg} alt="Real-time Audio Spectrum" className="feature-card-img" />
        <div className="feature-card-content">
          <div className="feature-card-badge text-cyan-400">
            <Activity className="w-3.5 h-3.5 inline mr-1" />
            Live Spectrum Engine
          </div>
          <h3 className="feature-card-title">Soundwave Equalizer</h3>
          <p className="feature-card-desc">Dynamic canvas motion reacting to speech synthesis</p>
        </div>
      </div>

      {/* Card 3: AI Voice Profiles Showcase */}
      <div className="feature-card-item">
        <img src={voicesCardImg} alt="AI Voice Profiles" className="feature-card-img" />
        <div className="feature-card-content">
          <div className="feature-card-badge text-pink-400">
            <Mic className="w-3.5 h-3.5 inline mr-1" />
            Dual Voice Studio
          </div>
          <h3 className="feature-card-title">12+ Voice Profiles</h3>
          <p className="feature-card-desc">Male & Female voices with pitch & sample preview</p>
        </div>
      </div>
    </div>
  );
}

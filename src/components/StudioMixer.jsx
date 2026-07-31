import React from 'react';
import { Music, Sliders, Volume2, Sparkles, Radio } from 'lucide-react';
import { BGM_PRESETS } from '../utils/ambientSoundscapes';

export function StudioMixer({
  selectedBgm,
  setSelectedBgm,
  bgmVolume,
  setBgmVolume,
  reverbPreset,
  setReverbPreset
}) {
  return (
    <div className="card studio-mixer-card">
      <div className="card-header">
        <div className="card-title-group">
          <Music className="card-icon text-indigo-400" />
          <div>
            <h3 className="card-title">Studio BGM & Ambient Audio Mixer</h3>
            <p className="card-description">Blend cyber Lo-Fi, nature rain, or corporate ambient soundscapes into your voice</p>
          </div>
        </div>

        <span className="badge-glow-indigo">Web Audio API</span>
      </div>

      {/* Preset Chips Selection */}
      <div className="mixer-preset-grid">
        {BGM_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`mixer-chip ${selectedBgm === preset.id ? 'active' : ''}`}
            onClick={() => setSelectedBgm(preset.id)}
          >
            <span className="text-base mr-1.5">{preset.icon}</span>
            <span className="text-xs font-medium">{preset.label}</span>
          </button>
        ))}
      </div>

      {/* Volume & Reverb Sliders */}
      {selectedBgm !== 'none' && (
        <div className="mixer-controls-wrapper">
          <div className="mixer-control-group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> BGM Mix Ratio
              </span>
              <strong className="text-cyan-400">{Math.round(bgmVolume * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={bgmVolume}
              onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
              className="slider-range-cyan"
            />
          </div>

          <div className="mixer-control-group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-pink-400" /> Acoustic Reverb Depth
              </span>
              <strong className="text-pink-400">{reverbPreset.toUpperCase()}</strong>
            </div>
            <div className="segmented-control flex-1">
              {['dry', 'subtle', 'hall'].map((rev) => (
                <button
                  key={rev}
                  type="button"
                  className={`segmented-btn ${reverbPreset === rev ? 'active' : ''}`}
                  onClick={() => setReverbPreset(rev)}
                >
                  {rev === 'dry' ? 'Studio Dry' : rev === 'subtle' ? 'Subtle Warm' : 'Concert Hall'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

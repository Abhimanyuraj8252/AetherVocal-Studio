import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Sparkles, Filter, Sliders, CheckCircle2, Play, Cpu, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { PREMIUM_VOICE_PROFILES } from '../utils/voiceProfiles';

export function VoiceSelector({
  systemVoices,
  selectedProfile,
  setSelectedProfile,
  targetLang,
  setTargetLang,
  targetGender,
  setTargetGender,
  rate,
  setRate,
  pitch,
  setPitch,
  onPlaySample,
  isPlayingSample,
  onStopSample
}) {
  const [selectedEngine, setSelectedEngine] = useState('sherpa-onnx');

  // Filter voice profiles dynamically by Engine, Language, and Gender
  const engineProfiles = PREMIUM_VOICE_PROFILES.filter(profile => {
    return selectedEngine === 'all' || profile.engine === selectedEngine || profile.engine === 'all';
  });

  const filteredProfiles = engineProfiles.filter(profile => {
    const matchesLang = targetLang === 'all' || profile.lang.toLowerCase().includes(targetLang);
    const matchesGender = targetGender === 'all' || profile.gender.toLowerCase() === targetGender;
    return matchesLang && matchesGender;
  });

  // Auto-select first profile if current selection doesn't match
  useEffect(() => {
    if (filteredProfiles.length > 0 && (!selectedProfile || !filteredProfiles.some(p => p.id === selectedProfile.id))) {
      setSelectedProfile(filteredProfiles[0]);
    }
  }, [selectedEngine, targetLang, targetGender]);

  const handleResetSliders = () => {
    setRate(1.0);
    setPitch(selectedProfile ? (selectedProfile.defaultPitch || 1.0) : 1.0);
  };

  return (
    <div className="card voice-selector-card">
      <div className="card-header">
        <div className="card-title-group">
          <Mic className="card-icon text-pink-400" />
          <div>
            <h3 className="card-title">AI Voice Models & Neural Engines</h3>
            <p className="card-description">Select high-definition Sherpa-ONNX, Piper & Studio voice models</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetSliders}
            className="btn-icon-sm"
            title="Reset Sliders (1.0x Rate / Default Pitch)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {isPlayingSample && (
            <button
              type="button"
              onClick={onStopSample}
              className="btn-sm btn-outline-emerald text-xs"
            >
              Stop Sample
            </button>
          )}
        </div>
      </div>

      {/* NEURAL AI ENGINE SELECTOR BAR */}
      <div className="neural-engine-selector-card mb-3">
        <div className="engine-selector-label">
          <Cpu className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
          <span>Active Speech Engine Filter:</span>
        </div>
        <div className="neural-engine-grid mt-1">
          <button
            type="button"
            onClick={() => setSelectedEngine('sherpa-onnx')}
            className={`neural-engine-btn ${selectedEngine === 'sherpa-onnx' ? 'engine-active' : ''}`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
            <span>Sherpa-ONNX</span>
            <span className="engine-badge-tag">VITS ONNX</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEngine('piper-ai')}
            className={`neural-engine-btn ${selectedEngine === 'piper-ai' ? 'engine-active' : ''}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400 inline mr-1" />
            <span>Piper Acoustic</span>
            <span className="engine-badge-tag">Piper AI</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEngine('aethervocal-pro')}
            className={`neural-engine-btn ${selectedEngine === 'aethervocal-pro' ? 'engine-active' : ''}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
            <span>AetherVocal Pro</span>
            <span className="engine-badge-tag">Studio</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: Language & Gender */}
      <div className="filters-container grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {/* Language Segment */}
        <div className="filter-section">
          <span className="filter-label">Language / भाषा</span>
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'all' ? 'active' : ''}`}
              onClick={() => setTargetLang('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'hi' ? 'active' : ''}`}
              onClick={() => setTargetLang('hi')}
            >
              Hindi (हिंदी)
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'en' ? 'active' : ''}`}
              onClick={() => setTargetLang('en')}
            >
              English
            </button>
          </div>
        </div>

        {/* Gender Segment */}
        <div className="filter-section">
          <span className="filter-label">Voice Gender</span>
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${targetGender === 'all' ? 'active' : ''}`}
              onClick={() => setTargetGender('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetGender === 'female' ? 'active' : ''}`}
              onClick={() => setTargetGender('female')}
            >
              Female (महिला)
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetGender === 'male' ? 'active' : ''}`}
              onClick={() => setTargetGender('male')}
            >
              Male (पुरुष)
            </button>
          </div>
        </div>
      </div>

      {/* Master Voice Models Grid */}
      <div className="voice-profiles-grid scrollable-profiles mb-3">
        {(filteredProfiles.length > 0 ? filteredProfiles : PREMIUM_VOICE_PROFILES).map(profile => {
          const isSelected = selectedProfile && selectedProfile.id === profile.id;
          return (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className={`voice-profile-card ${isSelected ? 'selected-profile' : ''}`}
            >
              <div className="profile-header">
                <span className="profile-avatar">{profile.avatar}</span>
                <div className="profile-info">
                  <div className="flex items-center gap-1">
                    <h4 className="profile-name">{profile.name}</h4>
                  </div>
                  <span className="profile-style">{profile.description}</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
              </div>

              <div className="profile-actions">
                <div className="flex items-center gap-1">
                  <span className="badge badge-sm badge-lang">
                    {profile.lang} • {profile.gender}
                  </span>
                  <span className="model-architecture-badge">
                    {profile.modelTag}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySample(profile);
                  }}
                  className="btn-sample-preview"
                >
                  <Play className="w-3 h-3 inline mr-1 fill-current" />
                  Try Sample
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speed (Rate) & Pitch Sliders */}
      <div className="sliders-grid">
        {/* Speaking Speed Slider (Default 1.0x) */}
        <div className="slider-card">
          <div className="slider-header">
            <span className="slider-label">Speaking Speed (गति)</span>
            <span className="slider-value">{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="custom-range range-cyan"
          />
          <div className="range-marks">
            <span>0.5x (Slow)</span>
            <span className="font-bold text-cyan-400">1.0x (Normal)</span>
            <span>1.8x (Fast)</span>
          </div>
        </div>

        {/* Voice Pitch Slider */}
        <div className="slider-card">
          <div className="slider-header">
            <span className="slider-label">Voice Pitch (पिच / Gender Tone)</span>
            <span className="slider-value">{pitch.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="custom-range range-purple"
          />
          <div className="range-marks">
            <span>0.70 (Deep Male)</span>
            <span>1.0 (Neutral)</span>
            <span>1.30 (High Female)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

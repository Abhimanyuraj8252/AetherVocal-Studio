import React, { useState } from 'react';
import { 
  Mic, 
  Volume2, 
  Play, 
  Square, 
  Sliders, 
  Gauge, 
  Sparkles, 
  Globe, 
  UserCheck,
  CheckCircle
} from 'lucide-react';
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
  const filteredProfiles = React.useMemo(() => {
    return PREMIUM_VOICE_PROFILES.filter(profile => {
      if (targetLang !== 'all') {
        if (targetLang === 'hi' && profile.langGroup !== 'hi') return false;
        if (targetLang === 'en' && profile.langGroup !== 'en') return false;
      }

      if (targetGender !== 'all') {
        if (targetGender.toLowerCase() !== profile.gender.toLowerCase()) return false;
      }

      return true;
    });
  }, [targetLang, targetGender]);

  return (
    <div className="card voice-card">
      <div className="card-header">
        <div className="card-title-group">
          <Mic className="card-icon text-pink-400" />
          <div>
            <h2 className="card-title">12+ Premium Voice Profiles</h2>
            <p className="card-description">Curated Hindi & English Male/Female voices with sample preview</p>
          </div>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="filter-section">
        <div className="filter-group">
          <label className="filter-label">
            <Globe className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
            Language Filter:
          </label>
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'all' ? 'active' : ''}`}
              onClick={() => setTargetLang('all')}
            >
              All Languages
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'hi' ? 'active' : ''}`}
              onClick={() => setTargetLang('hi')}
            >
              🇮🇳 Hindi (हिंदी)
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'en' ? 'active' : ''}`}
              onClick={() => setTargetLang('en')}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* Gender Filter Tabs */}
        <div className="filter-group mt-3">
          <label className="filter-label">
            <UserCheck className="w-3.5 h-3.5 inline mr-1 text-pink-400" />
            Gender Filter:
          </label>
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
              👩 Female (महिला)
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetGender === 'male' ? 'active' : ''}`}
              onClick={() => setTargetGender('male')}
            >
              👨 Male (पुरुष)
            </button>
          </div>
        </div>
      </div>

      {/* Voice Profiles Grid */}
      <div className="voice-profiles-grid mt-4 scrollable-profiles">
        {filteredProfiles.map((profile) => {
          const isSelected = selectedProfile.id === profile.id;

          return (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className={`voice-profile-card ${isSelected ? 'selected-profile' : ''}`}
            >
              <div className="profile-header">
                <span className="profile-avatar">{profile.avatar}</span>
                <div className="profile-info">
                  <h4 className="profile-name">
                    {profile.name}
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline ml-1" />}
                  </h4>
                  <span className="profile-style">{profile.style}</span>
                </div>
              </div>

              <div className="profile-actions">
                <span className="badge badge-sm">
                  {profile.gender === 'Female' ? '👩 Female' : '👨 Male'}
                </span>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                    if (isPlayingSample && isSelected) {
                      onStopSample();
                    } else {
                      onPlaySample(profile);
                    }
                  }}
                  className="btn-xs btn-sample-preview"
                >
                  {isPlayingSample && isSelected ? (
                    <>
                      <Square className="w-3 h-3 text-rose-400 mr-1 inline" /> Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-emerald-400 mr-1 inline fill-current" /> Sample
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speed & Pitch Sliders */}
      <div className="sliders-grid mt-4">
        <div className="slider-card">
          <div className="slider-header">
            <span className="slider-label">
              <Gauge className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
              Speaking Speed (Rate):
            </span>
            <span className="slider-value">{rate}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="custom-range range-cyan"
          />
          <div className="range-marks">
            <span>0.5x (Slow)</span>
            <span>1.0x (Normal)</span>
            <span>2.0x (Fast)</span>
          </div>
        </div>

        <div className="slider-card">
          <div className="slider-header">
            <span className="slider-label">
              <Sliders className="w-3.5 h-3.5 inline mr-1 text-purple-400" />
              Voice Tone (Pitch):
            </span>
            <span className="slider-value">{pitch}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="custom-range range-purple"
          />
          <div className="range-marks">
            <span>Deep Pitch</span>
            <span>Default</span>
            <span>High Pitch</span>
          </div>
        </div>
      </div>
    </div>
  );
}

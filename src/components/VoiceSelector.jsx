import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Sparkles, Filter, Sliders, CheckCircle2, Play, Cpu, ShieldCheck, Zap, RotateCcw, Globe } from 'lucide-react';
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
  charCount,
  onPlaySample,
  isPlayingSample,
  onStopSample,
  manualLang = 'auto',
  setManualLang
}) {
  const [selectedEngine, setSelectedEngine] = useState('edge-tts');

  // Filter voice profiles dynamically by Engine, Language, and Gender
  const engineProfiles = PREMIUM_VOICE_PROFILES.filter(profile => {
    return selectedEngine === 'all' || profile.engine === selectedEngine || profile.engine === 'all';
  });

  // Extract unique languages for the current engine
  const uniqueLangs = [...new Set(engineProfiles.map(p => p.lang.split('-')[0].toLowerCase()))].filter(l => l !== 'multilingual').sort();

  const filteredProfiles = engineProfiles.filter(profile => {
    const matchesLang = targetLang === 'all'
      || (targetLang === 'multilingual' ? (profile.isMultilingual || profile.lang === 'multilingual') : false)
      || profile.lang.toLowerCase().includes(targetLang)
      || (profile.isMultilingual && (targetLang === 'hi' || targetLang === 'en'));
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
            <div className="engine-btn-left">
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="engine-btn-title">Sherpa-ONNX</span>
            </div>
            <span className="engine-badge-tag">VITS ONNX</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEngine('piper-ai')}
            className={`neural-engine-btn ${selectedEngine === 'piper-ai' ? 'engine-active' : ''}`}
          >
            <div className="engine-btn-left">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
              <span className="engine-btn-title">Piper Acoustic</span>
            </div>
            <span className="engine-badge-tag">Piper AI</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEngine('aethervocal-pro')}
            className={`neural-engine-btn ${selectedEngine === 'aethervocal-pro' ? 'engine-active' : ''}`}
          >
            <div className="engine-btn-left">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="engine-btn-title">AetherVocal Pro</span>
            </div>
            <span className="engine-badge-tag">Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEngine('google-tts')}
            className={`neural-engine-btn ${selectedEngine === 'google-tts' ? 'engine-active' : ''}`}
            style={selectedEngine === 'google-tts' ? { borderColor: '#4285F4', background: 'rgba(66, 133, 244, 0.1)' } : {}}
          >
            <div className="engine-btn-left">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="engine-btn-title">Google Neural</span>
            </div>
            <span className="engine-badge-tag" style={{ color: '#4285F4', background: 'rgba(66, 133, 244, 0.15)' }}>Cloud API</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEngine('edge-tts')}
            className={`neural-engine-btn ${selectedEngine === 'edge-tts' ? 'engine-active' : ''}`}
            style={{ 
              gridColumn: '1 / -1',
              ...(selectedEngine === 'edge-tts' ? { borderColor: '#0078D7', background: 'rgba(0, 120, 215, 0.1)' } : {})
            }}
          >
            <div className="engine-btn-left">
              <Globe className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="engine-btn-title">Microsoft Edge TTS (45+ Voices & Multilingual)</span>
            </div>
            <span className="engine-badge-tag" style={{ color: '#0078D7', background: 'rgba(0, 120, 215, 0.15)' }}>Web API</span>
          </button>
        </div>
      </div>

      {/* MANUAL SYNTHESIS LANGUAGE SELECTOR */}
      <div className="manual-lang-bar">
        <div className="manual-lang-title">
          <Globe className="w-3.5 h-3.5" />
          <span>Manual TTS Language (मैनुअल भाषा):</span>
        </div>
        <div className="custom-select-wrapper">
          <select
            value={manualLang || 'auto'}
            onChange={(e) => setManualLang && setManualLang(e.target.value)}
            className="premium-select-input"
          >
            <option value="auto">✨ Auto Detect (स्मार्ट ऑटो)</option>
            <option value="hi-IN">🇮🇳 Hindi (हिंदी - hi-IN)</option>
            <option value="en-US">🇺🇸 English US (en-US)</option>
            <option value="en-IN">🇮🇳 Indian English (en-IN)</option>
            <option value="en-GB">🇬🇧 English UK (en-GB)</option>
            <option value="bn-IN">🇮🇳 Bengali (বাংলা - bn-IN)</option>
            <option value="ta-IN">🇮🇳 Tamil (தமிழ் - ta-IN)</option>
            <option value="te-IN">🇮🇳 Telugu (తెలుగు - te-IN)</option>
            <option value="mr-IN">🇮🇳 Marathi (मराठी - mr-IN)</option>
            <option value="gu-IN">🇮🇳 Gujarati (ગુજરાતી - gu-IN)</option>
            <option value="es-ES">🇪🇸 Spanish (Español - es-ES)</option>
            <option value="fr-FR">🇫🇷 French (Français - fr-FR)</option>
            <option value="de-DE">🇩🇪 German (Deutsch - de-DE)</option>
            <option value="ja-JP">🇯🇵 Japanese (日本語 - ja-JP)</option>
            <option value="zh-CN">🇨🇳 Chinese Mandarin (中文 - zh-CN)</option>
            <option value="ar-SA">🇸🇦 Arabic (العربية - ar-SA)</option>
            <option value="ur-PK">🇵🇰 Urdu (اردو - ur-PK)</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs: Language & Gender */}
      <div className="filters-container grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {/* Language Segment */}
        <div className="filter-section">
          <span className="filter-label">Language / भाषा</span>
          <div className="segmented-control" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
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
              Hindi
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'en' ? 'active' : ''}`}
              onClick={() => setTargetLang('en')}
            >
              English
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetLang === 'multilingual' ? 'active' : ''}`}
              onClick={() => setTargetLang('multilingual')}
            >
              Multilingual ✨
            </button>
            {uniqueLangs.length > 2 && (
              <div className="segmented-select-wrapper">
                <select
                  className={`segmented-select ${!['all', 'hi', 'en', 'multilingual'].includes(targetLang) ? 'active' : ''}`}
                  value={['all', 'hi', 'en', 'multilingual'].includes(targetLang) ? '' : targetLang}
                  onChange={(e) => {
                    if (e.target.value) setTargetLang(e.target.value);
                  }}
                >
                  <option value="" disabled>More...</option>
                  {uniqueLangs.filter(l => l !== 'hi' && l !== 'en' && l !== 'multilingual').map(lang => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              Female
            </button>
            <button
              type="button"
              className={`segmented-btn ${targetGender === 'male' ? 'active' : ''}`}
              onClick={() => setTargetGender('male')}
            >
              Male
            </button>
          </div>
        </div>
      </div>

      {/* Master Voice Models List View */}
      <div className="scrollable-profiles mb-3">
        {(filteredProfiles.length > 0 ? filteredProfiles : PREMIUM_VOICE_PROFILES).map(profile => {
          const isSelected = selectedProfile && selectedProfile.id === profile.id;
          return (
            <div
              key={profile.id}
              onClick={() => setSelectedProfile(profile)}
              className={`voice-list-item ${isSelected ? 'selected-voice-item' : ''}`}
            >
              <div className="voice-item-left">
                <div className="voice-avatar-box">
                  <span>{profile.avatar}</span>
                </div>

                <div className="voice-item-details">
                  <div className="voice-title-row">
                    <h4 className="voice-item-name">{profile.name}</h4>
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 ml-1" />
                    )}
                  </div>

                  <p className="voice-item-desc">{profile.description}</p>

                  <div className="voice-badges-row">
                    <span className="badge-pill badge-lang">
                      {profile.lang} • {profile.gender}
                    </span>
                    <span className="badge-pill badge-model">
                      {profile.modelTag}
                    </span>
                    {profile.isMultilingual && (
                      <span className="badge-pill" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                        Multilingual ✨
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="voice-item-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySample(profile);
                  }}
                  className="btn-try-sample"
                  title="Listen to voice sample"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Sample</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Speed, Pitch, & Duration Controls Area */}
      <div className="flex flex-col gap-3">

        {/* Speed & Pitch Grid */}
        <div className="sliders-grid">
          {/* Speaking Speed Control */}
          <div className="slider-card">
            <div className="slider-header flex-wrap gap-2">
              <span className="slider-label">Speaking Speed (गति)</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border-highlight)', borderRadius: '6px', padding: '0.1rem 0.4rem', gap: '0.1rem' }}>
                <input 
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="50"
                  value={rate}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    setRate(e.target.value);
                    if (!isNaN(val) && val >= 0.1 && val <= 50) setRate(val);
                  }}
                  onBlur={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val) || val < 0.1) setRate(0.1);
                    else if (val > 50) setRate(50);
                    else setRate(parseFloat(val.toFixed(2)));
                  }}
                  style={{ width: '38px', background: 'transparent', border: 'none', outline: 'none', color: 'var(--cyan-accent)', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'right', padding: 0 }}
                />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--cyan-accent)', userSelect: 'none' }}>x</span>
              </div>
            </div>
            <input
              type="range"
              min="0.1"
              max="50"
              step="0.01"
              value={rate || 1.0}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="custom-range range-cyan mt-3"
            />
            <div className="range-marks mt-1.5">
              <span>0.1x</span>
              <span className="font-bold text-cyan-400">1.0x</span>
              <span>50x</span>
            </div>
          </div>

          {/* Voice Pitch Control */}
          <div className="slider-card">
            <div className="slider-header flex-wrap gap-2">
              <span className="slider-label">Voice Pitch (पिच)</span>
              <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--input-bg)', border: '1px solid var(--border-highlight)', borderRadius: '6px', padding: '0.1rem 0.4rem', gap: '0.15rem' }}>
                <input 
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="2.0"
                  value={pitch}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    setPitch(e.target.value);
                    if (!isNaN(val) && val >= 0.5 && val <= 2.0) setPitch(val);
                  }}
                  onBlur={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val) || val < 0.5) setPitch(0.5);
                    else if (val > 2.0) setPitch(2.0);
                    else setPitch(parseFloat(val.toFixed(2)));
                  }}
                  style={{ width: '38px', background: 'transparent', border: 'none', outline: 'none', color: '#c084fc', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'center', padding: 0 }}
                />
              </div>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={pitch || 1.0}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="custom-range range-purple mt-3"
            />
            <div className="range-marks mt-1.5">
              <span>0.5 (Low)</span>
              <span>1.0 (Def)</span>
              <span>2.0 (High)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Sparkles, Check, Copy, Trash2, Zap, BookOpen, Briefcase, Video, UploadCloud, Languages, Clock, RefreshCw, ArrowRight, PauseCircle, Gauge, SpellCheck, Search } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { stripTimestamps, countTimestamps, sanitizeScript } from '../utils/textSanitizer';
import { translateScript, SUPPORTED_LANGUAGES } from '../utils/translator';
import { detectJargonAcronyms, expandJargonAcronyms, analyzeScriptMetrics } from '../utils/scriptAnalyzer';

const SAMPLE_SCRIPTS = [
  {
    id: 'tech_review',
    label: '📱 Tech Review',
    icon: Zap,
    text: 'What is up everyone! Aaj hum is super cool smartphone ka full depth review karne wale hain. Battery life aur camera output bohot amazing hain!'
  },
  {
    id: 'story_narration',
    label: '📖 Story Narration',
    icon: BookOpen,
    text: 'एक समय की बात है, जब विंध्याचल की पहाड़ियों में एक प्राचीन राजा राज करता था। वहाँ का वातावरण बड़ा ही मनमोहक और शांत था।'
  },
  {
    id: 'corporate_presentation',
    label: '💼 Corporate',
    icon: Briefcase,
    text: 'Welcome everyone to our Q3 product launch. Today, we are excited to unveil our next generation AI Voice Studio platform.'
  },
  {
    id: 'casual_vlog',
    label: '🎧 Casual Vlog',
    icon: Video,
    text: 'हे दोस्तों! आज का दिन बहुत ही खूबसूरत है। चलिए आज हम एक नई जगह एक्सप्लोर करते हैं और कुछ मजेदार बातें करते हैं।'
  }
];

export function TextEditor({
  text,
  setText,
  autoSanitize,
  setAutoSanitize,
  stats,
  chunkCount,
  onSanitize,
  onGenerateAudio
}) {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'upload' | 'translate' | 'preview'
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  // Translation State
  const [targetLangCode, setTargetLangCode] = useState('hi');
  const [langSearchQuery, setLangSearchQuery] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(null);
  const [translateSuccessMsg, setTranslateSuccessMsg] = useState('');

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(langSearchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(langSearchQuery.toLowerCase())
  );

  // Timestamp & Jargon State
  const timestampCount = countTimestamps(text);
  const detectedJargon = detectJargonAcronyms(text);
  const scriptMetrics = analyzeScriptMetrics(text);

  // Handle Text Changes & Live Auto-Clean
  const handleTextChange = (newVal) => {
    if (autoSanitize) {
      const cleaned = sanitizeScript(newVal);
      setText(cleaned);
    } else {
      setText(newVal);
    }
  };

  // Live sanitize if autoSanitize is toggled ON
  useEffect(() => {
    if (autoSanitize && text) {
      const cleaned = sanitizeScript(text);
      if (cleaned !== text) {
        setText(cleaned);
      }
    }
  }, [autoSanitize]);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setText('');
    setTranslateSuccessMsg('');
  };

  const handleTextLoadedFromFile = (fileContent, mode = 'replace') => {
    let finalContent = fileContent;
    if (autoSanitize) {
      finalContent = sanitizeScript(finalContent);
    }
    if (mode === 'append' && text.trim()) {
      setText(prev => prev.trim() + '\n\n' + finalContent.trim());
    } else {
      setText(finalContent);
    }
  };

  // Insert Natural Speech Pause Tag at Cursor Position
  const handleInsertPause = (seconds) => {
    const pauseTag = ` [pause=${seconds}s] `;
    const textarea = textareaRef.current;
    if (textarea && typeof textarea.selectionStart === 'number') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = text.substring(0, start) + pauseTag + text.substring(end);
      setText(updated);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + pauseTag.length, start + pauseTag.length);
      }, 50);
    } else {
      setText(prev => prev + pauseTag);
    }
  };

  // Dedicated Timestamp Stripper Handler
  const handleStripTimestamps = () => {
    if (!text) return;
    let stripped = stripTimestamps(text);
    if (autoSanitize) {
      stripped = sanitizeScript(stripped);
    }
    setText(stripped);
  };

  // Expand Jargon & Acronyms Handler (e.g. AI -> ए आई)
  const handleExpandJargon = () => {
    if (!text) return;
    const expanded = expandJargonAcronyms(text);
    setText(expanded);
  };

  // Free Script Translation Handler
  const handleTranslate = async () => {
    if (!text.trim() || isTranslating) return;
    setIsTranslating(true);
    setTranslateSuccessMsg('');
    setTranslationProgress({ current: 0, total: 100, percent: 0 });

    try {
      const translated = await translateScript(text, targetLangCode, (progress) => {
        setTranslationProgress(progress);
      });

      let finalTranslated = translated;
      if (autoSanitize) {
        finalTranslated = sanitizeScript(finalTranslated);
      }

      setText(finalTranslated);
      const selectedLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLangCode);
      setTranslateSuccessMsg(`Script translated successfully to ${selectedLangObj?.name || targetLangCode}!`);
      setTimeout(() => setTranslateSuccessMsg(''), 4000);
    } catch (err) {
      console.error("Translation error:", err);
      alert("Translation failed. Please check your internet connection.");
    } finally {
      setIsTranslating(false);
      setTranslationProgress(null);
    }
  };

  return (
    <div className="card text-editor-card">
      <div className="card-header">
        <div className="card-title-group">
          <FileText className="card-icon text-cyan-400" />
          <div>
            <h3 className="card-title">Text Script & AI Studio Enhancer</h3>
            <p className="card-description">Type/paste script, insert speech pauses, strip timestamps & translate</p>
          </div>
        </div>

        {/* Header Navigation Segmented Tabs */}
        <div className="card-header-actions">
          <div className="segmented-control flex-1">
            <button
              type="button"
              className={`segmented-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              Editor
            </button>
            <button
              type="button"
              className={`segmented-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <UploadCloud className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
              File Upload
            </button>
            <button
              type="button"
              className={`segmented-btn ${activeTab === 'translate' ? 'active' : ''}`}
              onClick={() => setActiveTab('translate')}
            >
              <Languages className="w-3.5 h-3.5 inline mr-1 text-pink-400" />
              Translate
            </button>
            <button
              type="button"
              className={`segmented-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Clean Preview
            </button>
          </div>

          <div className="header-icon-buttons">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-icon-sm"
              title="Copy Script"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn-icon-sm text-rose-400 hover:bg-rose-500/20"
              title="Clear Text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Curated Script Samples Bar */}
      <div className="presets-bar">
        <span className="presets-label">Quick Sample Scripts:</span>
        <div className="preset-chips-scroll">
          {SAMPLE_SCRIPTS.map(sample => (
            <button
              key={sample.id}
              type="button"
              className="preset-chip"
              onClick={() => {
                handleTextChange(sample.text);
                setActiveTab('editor');
              }}
            >
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Studio Pause & Jargon Toolbar Bar */}
      <div className="studio-toolbar-row flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-900/60 border-y border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <PauseCircle className="w-3.5 h-3.5 text-cyan-400" /> Insert Pause:
          </span>
          <button
            type="button"
            onClick={() => handleInsertPause(0.5)}
            className="btn-chip-xs btn-chip-cyan"
            title="Insert 0.5s Speech Pause"
          >
            +0.5s
          </button>
          <button
            type="button"
            onClick={() => handleInsertPause(1.0)}
            className="btn-chip-xs btn-chip-cyan"
            title="Insert 1.0s Speech Pause"
          >
            +1.0s
          </button>
          <button
            type="button"
            onClick={() => handleInsertPause(2.0)}
            className="btn-chip-xs btn-chip-cyan"
            title="Insert 2.0s Speech Pause"
          >
            +2.0s
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {detectedJargon.length > 0 && (
            <button
              type="button"
              onClick={handleExpandJargon}
              className="btn-xs btn-outline-pink flex items-center gap-1 animate-pulse"
              title="Expand acronyms phonetically for clearer AI voice pronunciation (e.g. AI -> ए आई)"
            >
              <SpellCheck className="w-3 h-3 text-pink-400" />
              Expand Jargon ({detectedJargon.length})
            </button>
          )}

          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            Pacing: <strong className="text-amber-400">{scriptMetrics.pacingTag}</strong> (~{scriptMetrics.estimatedWpm} WPM)
          </span>
        </div>
      </div>

      {/* Translation Toolbar Drawer */}
      {activeTab === 'translate' && (
        <div className="translation-drawer-card p-3 my-2 bg-slate-900/80 border border-pink-500/30 rounded-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-pink-400" />
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Free Instant Translator (50+ Languages)</h4>
                <p className="text-xs text-slate-400">Search and translate script instantly without any API key</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search language..."
                  value={langSearchQuery}
                  onChange={(e) => setLangSearchQuery(e.target.value)}
                  className="search-input-sm pl-8 pr-2 py-1 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 w-full"
                />
              </div>

              <select
                value={targetLangCode}
                onChange={(e) => setTargetLangCode(e.target.value)}
                disabled={isTranslating}
                className="select-input-sm max-w-[200px]"
              >
                {filteredLanguages.length > 0 ? (
                  filteredLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No language found</option>
                )}
              </select>

              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating || !text.trim()}
                className="btn-sm btn-pink glow-pink flex items-center gap-1.5"
              >
                {isTranslating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    Translate Script <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Translation Progress Bar */}
          {isTranslating && translationProgress && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-pink-300 mb-1">
                <span>Translating chunk {translationProgress.current} of {translationProgress.total}...</span>
                <span>{translationProgress.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${translationProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {translateSuccessMsg && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {translateSuccessMsg}
            </div>
          )}
        </div>
      )}

      {/* File Uploader Tab */}
      {activeTab === 'upload' && (
        <div className="my-2">
          <FileUploader
            onTextLoaded={handleTextLoadedFromFile}
            onGenerateAudio={() => {
              setActiveTab('editor');
              if (onGenerateAudio) onGenerateAudio();
            }}
            currentTextLength={text.length}
          />
        </div>
      )}

      {/* Editor / Preview Body */}
      {activeTab === 'editor' || activeTab === 'translate' ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="यहाँ अपना हिन्दी या English टेक्स्ट टाइप करें, पेस्ट करें या फ़ाइल अपलोड करें..."
          className="main-textarea"
          rows={6}
        />
      ) : activeTab === 'preview' ? (
        <div className="clean-preview-container">
          <div className="clean-preview-header">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold text-slate-300">Sanitized AI Voice Script Preview</span>
            </div>
            {text && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(text);
                  alert("Clean preview text copied to clipboard!");
                }}
                className="btn-xs btn-outline-cyan flex items-center gap-1"
                title="Copy clean preview text"
              >
                <Copy className="w-3 h-3" />
                Copy Clean Text
              </button>
            )}
          </div>
          <div className="clean-preview-box">
            {text ? (
              text.split('\n\n').filter(p => p.trim()).map((paragraph, pIdx) => (
                <div key={pIdx} className="clean-preview-paragraph-card">
                  <span className="paragraph-num-badge">§ {(pIdx + 1).toString().padStart(2, '0')}</span>
                  <div className="paragraph-content-text">
                    {paragraph.split(/("[^"]*"|“[^”]*”|'[^']*'|\d+|\.\.\.|\u2026)/g).map((part, i) => {
                      if (!part) return null;
                      if (/^("[^"]*"|“[^”]*”|'[^']*')$/.test(part)) {
                        return (
                          <span key={i} className="highlight-dialogue">
                            {part}
                          </span>
                        );
                      }
                      if (/^\d+$/.test(part)) {
                        return (
                          <span key={i} className="highlight-number">
                            {part}
                          </span>
                        );
                      }
                      if (part === '...' || part === '…') {
                        return (
                          <span key={i} className="highlight-ellipsis">
                            {part}
                          </span>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="clean-preview-empty">
                <span>✨ No clean preview text available. Type or upload a story script in the editor above...</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Editor Footer & Stat Pills Row */}
      <div className="editor-footer">
        <div className="stats-pills-row">
          <span className="stat-pill-badge">
            Chars: <strong className="text-cyan-400 ml-1">{stats.charCount}</strong>
          </span>
          <span className="stat-pill-badge">
            Words: <strong className="text-pink-400 ml-1">{stats.wordCount}</strong>
          </span>
          <span className="stat-pill-badge">
            Duration: <strong className="text-amber-400 ml-1">~{stats.formattedDuration}</strong>
          </span>
          <span className="stat-pill-badge highlight-pill">
            Chunks: <strong className="text-emerald-400 ml-1">{chunkCount}</strong>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 w-full sm:w-auto flex-wrap">
          {/* Timestamp Stripper Action Button */}
          {timestampCount > 0 && (
            <button
              type="button"
              onClick={handleStripTimestamps}
              className="btn-xs btn-outline-amber flex items-center gap-1 animate-pulse"
              title="Remove all YouTube/Podcast timestamps from text"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              Strip Timestamps <span className="badge-amber">{timestampCount}</span>
            </button>
          )}

          <label className="flex items-center gap-1.5 text-xs text-slate-300 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSanitize}
              onChange={(e) => setAutoSanitize(e.target.checked)}
              className="rounded accent-indigo-500 w-3.5 h-3.5 cursor-pointer"
            />
            Auto Clean Live
          </label>

          <button
            type="button"
            onClick={onSanitize}
            className="btn-sm btn-outline-emerald text-xs"
            title="Clean symbols manually"
          >
            <Sparkles className="w-3 h-3 inline mr-1 text-emerald-400" />
            Clean Symbols
          </button>
        </div>
      </div>
    </div>
  );
}




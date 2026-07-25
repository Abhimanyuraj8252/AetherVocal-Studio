import React, { useState } from 'react';
import { FileText, Sparkles, Check, Copy, Trash2, Zap, BookOpen, Briefcase, Video } from 'lucide-react';

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
  onSanitize
}) {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="card text-editor-card">
      <div className="card-header">
        <div className="card-title-group">
          <FileText className="card-icon text-cyan-400" />
          <div>
            <h3 className="card-title">Text Script & Auto Markdown Stripper</h3>
            <p className="card-description">Paste script in Hindi or English (Markdown # & * auto-removed)</p>
          </div>
        </div>

        {/* Mobile-Optimized Header Actions Row */}
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
              onClick={() => setText(sample.text)}
            >
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor / Preview Body */}
      {activeTab === 'editor' ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="यहाँ अपना हिन्दी या English टेक्स्ट टाइप करें या पेस्ट करें..."
          className="main-textarea"
          rows={6}
        />
      ) : (
        <div className="main-textarea overflow-y-auto bg-slate-900/60 p-3 rounded-xl min-h-[140px] text-xs text-slate-200">
          {text ? text : <span className="text-slate-500 italic">No clean preview text available. Type something in editor...</span>}
        </div>
      )}

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

        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSanitize}
              onChange={(e) => setAutoSanitize(e.target.checked)}
              className="rounded accent-indigo-500 w-3.5 h-3.5"
            />
            Auto Clean
          </label>

          <button
            type="button"
            onClick={onSanitize}
            className="btn-sm btn-outline-emerald text-xs"
          >
            <Sparkles className="w-3 h-3 inline mr-1 text-emerald-400" />
            Clean Symbols
          </button>
        </div>
      </div>
    </div>
  );
}

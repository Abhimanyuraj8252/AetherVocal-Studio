import React, { useState } from 'react';
import { 
  FileText, 
  Wand2, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  Clock, 
  Type,
  Eye,
  Code
} from 'lucide-react';
import { SAMPLE_TEXTS } from '../utils/voiceHelper';
import { detectMarkdownSymbols, sanitizeMarkdown } from '../utils/markdownSanitizer';

export function TextEditor({
  text,
  setText,
  autoSanitize,
  setAutoSanitize,
  stats,
  chunkCount,
  onSanitize
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'
  const hasMarkdown = detectMarkdownSymbols(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
  };

  const loadPreset = (category, key) => {
    const sample = SAMPLE_TEXTS[category][key];
    if (sample) {
      setText(sample);
    }
  };

  // Convert raw text into styled HTML elements for Markdown preview
  const renderStyledMarkdown = (rawText) => {
    if (!rawText) return <p className="text-slate-400 italic">No text to preview...</p>;

    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="md-h1">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="md-h2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="md-h3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('> ')) {
        return <blockquote key={idx} className="md-blockquote">{line.replace('> ', '')}</blockquote>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="md-li">{line.replace(/^[* -]+/, '')}</li>;
      }
      if (!line.trim()) {
        return <div key={idx} className="h-2"></div>;
      }
      
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p 
          key={idx} 
          className="md-p" 
          dangerouslySetInnerHTML={{ __html: formattedLine }} 
        />
      );
    });
  };

  return (
    <div className="card text-editor-card">
      <div className="card-header">
        <div className="card-title-group">
          <FileText className="card-icon text-indigo-400" />
          <div>
            <h2 className="card-title">Text & Markdown Studio</h2>
            <p className="card-description">Paste or type your script in Hindi or English (Unlimited length)</p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="card-header-actions">
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <Code className="w-3.5 h-3.5 inline mr-1" /> Editor
            </button>
            <button
              type="button"
              className={`segmented-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
            </button>
          </div>

          <div className="header-icon-buttons">
            <button 
              type="button" 
              onClick={handleCopy} 
              className="btn-icon" 
              title="Copy text"
              disabled={!text}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button 
              type="button" 
              onClick={handleClear} 
              className="btn-icon text-rose-400 hover:bg-rose-500/10" 
              title="Clear text"
              disabled={!text}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="presets-bar">
        <span className="presets-label">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
          Sample Scripts:
        </span>
        <div className="preset-chips-scroll">
          <button 
            type="button"
            className="preset-chip" 
            onClick={() => loadPreset('hi', 'story')}
          >
            🇮🇳 हिंदी कहानी
          </button>
          <button 
            type="button"
            className="preset-chip" 
            onClick={() => loadPreset('hi', 'tech')}
          >
            🇮🇳 हिंदी टेक
          </button>
          <button 
            type="button"
            className="preset-chip" 
            onClick={() => loadPreset('en', 'story')}
          >
            🇬🇧 English Story
          </button>
          <button 
            type="button"
            className="preset-chip" 
            onClick={() => loadPreset('en', 'tech')}
          >
            🇬🇧 English Tech
          </button>
        </div>
      </div>

      {/* Markdown Cleaner Banner */}
      {hasMarkdown && (
        <div className="markdown-alert">
          <div className="markdown-alert-info">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="markdown-alert-title">Markdown Formatting Detected (#, *, _)</p>
              <p className="markdown-alert-text">
                Clean symbols automatically to ensure natural audio reading without pronouncing hashes or asterisks!
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onSanitize}
            className="btn-sm btn-primary-gradient"
          >
            <Wand2 className="w-3.5 h-3.5 mr-1" /> Clean Markdown Now
          </button>
        </div>
      )}

      {/* Editor vs Markdown Preview View */}
      {activeTab === 'editor' ? (
        <div className="textarea-container">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="yahan apna Hindi ya English text type ya paste karein... (# ya * wale markdown text ko automatic clean kar diya jayega)..."
            className="main-textarea"
            rows={10}
          />
        </div>
      ) : (
        <div className="markdown-styled-preview">
          <div className="preview-header">
            <span>✨ Styled Markdown View</span>
            <span className="text-xs text-slate-400">Formatted UI view of your input text</span>
          </div>
          <div className="markdown-body">
            {renderStyledMarkdown(text)}
          </div>
        </div>
      )}

      {/* Footer Metrics - Fixed Stat Pills Row */}
      <div className="editor-footer">
        <div className="auto-clean-toggle">
          <label className="switch-label">
            <input 
              type="checkbox"
              checked={autoSanitize}
              onChange={(e) => setAutoSanitize(e.target.checked)}
              className="switch-input"
            />
            <span className="switch-slider"></span>
            <span className="switch-text">Auto-clean `#` & `*` Markdown on paste</span>
          </label>
        </div>

        {/* Stat Pills horizontal flex container */}
        <div className="stats-pills-row">
          <div className="stat-pill-badge" title="Character count">
            <Type className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>{stats.charCount.toLocaleString()} Chars</span>
          </div>

          <div className="stat-pill-badge" title="Word count">
            <FileText className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span>{stats.wordCount.toLocaleString()} Words</span>
          </div>

          <div className="stat-pill-badge" title="Audio Chunks">
            <Layers className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
            <span>{chunkCount} Speech Chunks</span>
          </div>

          <div className="stat-pill-badge highlight-pill" title="Estimated Audio Duration">
            <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Est. ~{stats.formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

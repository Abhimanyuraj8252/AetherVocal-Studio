import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, Play, Sparkles, FileCode, FileType } from 'lucide-react';

export function FileUploader({ onTextLoaded, onGenerateAudio, currentTextLength }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null); // { name, size, type, charCount, lineCount, isSubtitle }
  const [errorMsg, setErrorMsg] = useState('');
  const [cleanSubtitlesOpt, setCleanSubtitlesOpt] = useState(true);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const stripSubtitleTimestamps = (text) => {
    return text
      .replace(/^WEBVTT.*$/gm, '')
      .replace(/^\d+\s*\r?\n\d\d:\d\d:\d\d[.,]\d{3}\s*-->\s*\d\d:\d\d:\d\d[.,]\d{3}.*$/gm, '')
      .replace(/^\d\d:\d\d:\d\d[.,]\d{3}\s*-->\s*\d\d:\d\d:\d\d[.,]\d{3}.*$/gm, '')
      .replace(/^\d\d:\d\d[.,]\d{3}\s*-->\s*\d\d:\d\d[.,]\d{3}.*$/gm, '')
      .replace(/<[^>]*>/g, '') // Remove subtitle tags like <i>, <b>, <c>
      .replace(/^\d+\s*$/gm, '') // Remove line numbers
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const processFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['txt', 'md', 'srt', 'vtt', 'json', 'csv', 'log', 'text', 'doc', 'docx'];
    
    if (!allowedExtensions.includes(extension) && !file.type.startsWith('text/')) {
      setErrorMsg(`Unsupported file type (.${extension}). Please upload a text, markdown, or subtitle file.`);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let content = e.target.result || '';
        const isSub = extension === 'srt' || extension === 'vtt' || content.includes('-->');

        if (isSub && cleanSubtitlesOpt) {
          content = stripSubtitleTimestamps(content);
        }

        if (!content.trim()) {
          setErrorMsg('Uploaded file appears to be empty or could not be parsed as text.');
          return;
        }

        const lines = content.split('\n').length;
        const charCount = content.length;

        const info = {
          name: file.name,
          size: formatFileSize(file.size),
          type: extension.toUpperCase(),
          charCount,
          lineCount: lines,
          isSubtitle: isSub,
          rawText: content
        };

        setUploadedFileInfo(info);
        onTextLoaded(content, 'replace');
      } catch (err) {
        console.error('File parsing error:', err);
        setErrorMsg('Failed to read file content. Please try another file.');
      }
    };

    reader.onerror = () => {
      setErrorMsg('Error reading file from disk.');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setUploadedFileInfo(null);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAppendFileText = () => {
    if (uploadedFileInfo && uploadedFileInfo.rawText) {
      onTextLoaded(uploadedFileInfo.rawText, 'append');
    }
  };

  return (
    <div className="file-uploader-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".txt,.md,.srt,.vtt,.json,.csv,.log,.text"
        className="hidden"
        id="aethervocal-file-input"
        style={{ display: 'none' }}
      />

      {/* Drag & Drop Card Container */}
      <div
        className={`dropzone-card ${isDragging ? 'dropzone-active' : ''} ${uploadedFileInfo ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadedFileInfo && fileInputRef.current?.click()}
      >
        {!uploadedFileInfo ? (
          <div className="dropzone-content">
            <div className="dropzone-icon-pulse">
              <UploadCloud className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="dropzone-text-group">
              <h4 className="dropzone-title">
                Drag & Drop Text File or <span className="text-cyan-400 underline cursor-pointer">Browse File</span>
              </h4>
              <p className="dropzone-subtitle">
                Supports <strong className="text-slate-300">.TXT, .MD, .SRT, .VTT, .JSON, .CSV</strong> (Auto Subtitle Timestamp Cleaner included)
              </p>
            </div>
            <button
              type="button"
              className="btn-sm btn-cyan hover:scale-[1.02] transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Select File
            </button>
          </div>
        ) : (
          <div className="file-active-container">
            <div className="file-info-header">
              <div className="flex items-center gap-3">
                <div className="file-icon-badge">
                  {uploadedFileInfo.isSubtitle ? (
                    <FileCode className="w-5 h-5 text-amber-400" />
                  ) : (
                    <FileType className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm truncate max-w-[200px] sm:max-w-[300px]">{uploadedFileInfo.name}</span>
                    <span className="file-type-chip">{uploadedFileInfo.type}</span>
                    {uploadedFileInfo.isSubtitle && (
                      <span className="file-tag-sub">Subtitles Cleaned</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                    <span>Size: <strong className="text-slate-200">{uploadedFileInfo.size}</strong></span>
                    <span>Chars: <strong className="text-cyan-400">{uploadedFileInfo.charCount}</strong></span>
                    <span>Lines: <strong className="text-pink-400">{uploadedFileInfo.lineCount}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-icon-sm hover:text-cyan-400"
                  title="Change / Upload another file"
                >
                  <UploadCloud className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="btn-icon-sm text-rose-400 hover:bg-rose-500/20"
                  title="Remove uploaded file info"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="file-actions-bar">
              <button
                type="button"
                onClick={handleAppendFileText}
                className="btn-xs btn-outline-cyan"
                title="Append file text to existing text in editor"
              >
                + Append to Editor
              </button>
              
              <button
                type="button"
                onClick={() => onGenerateAudio && onGenerateAudio()}
                className="btn-xs btn-emerald glow-emerald flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Generate Audio From File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Cleaner toggle checkbox */}
      <div className="uploader-options-row flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={cleanSubtitlesOpt}
            onChange={(e) => setCleanSubtitlesOpt(e.target.checked)}
            className="rounded accent-cyan-500 w-3.5 h-3.5"
          />
          <span>Auto-strip subtitle timestamps (<code className="text-cyan-300">.SRT / .VTT</code>)</span>
        </label>
        
        {uploadedFileInfo && (
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> File Loaded into Editor
          </span>
        )}
      </div>

      {/* Error Message alert */}
      {errorMsg && (
        <div className="uploader-error-alert mt-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="text-xs text-rose-300">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

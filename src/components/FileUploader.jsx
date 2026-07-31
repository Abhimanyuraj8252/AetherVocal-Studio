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
          <div className="file-active-container min-w-0 w-full overflow-hidden">
            <div className="file-info-header flex items-center gap-2.5 min-w-0 w-full overflow-hidden">
              <div className="file-icon-badge flex-shrink-0">
                {uploadedFileInfo.isSubtitle ? (
                  <FileCode className="w-5 h-5 text-amber-400" />
                ) : (
                  <FileType className="w-5 h-5 text-cyan-400" />
                )}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0 w-full overflow-hidden">
                  <span 
                    className="font-semibold text-slate-100 text-sm truncate min-w-0 flex-1 block max-w-full"
                    style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}
                    title={uploadedFileInfo.name}
                  >
                    {uploadedFileInfo.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="file-type-chip">{uploadedFileInfo.type}</span>
                    {uploadedFileInfo.isSubtitle && (
                      <span className="file-tag-sub">Subtitles Cleaned</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1 flex-wrap min-w-0 overflow-hidden">
                  <span className="whitespace-nowrap">Size: <strong className="text-slate-200">{uploadedFileInfo.size}</strong></span>
                  <span className="whitespace-nowrap">Chars: <strong className="text-cyan-400">{uploadedFileInfo.charCount}</strong></span>
                  <span className="whitespace-nowrap">Lines: <strong className="text-pink-400">{uploadedFileInfo.lineCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Premium Bottom Actions Bar */}
            <div className="file-actions-bar flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-800/80">
              {/* Left/Mobile-accessible File Control Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-file-control btn-file-change flex-1 sm:flex-initial"
                  title="Change or upload another file"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Change File</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="btn-file-control btn-file-remove flex-1 sm:flex-initial"
                  title="Remove uploaded file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Right/Primary Text & Audio Processing Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleAppendFileText}
                  className="btn-file-control btn-file-append flex-1 sm:flex-initial"
                  title="Append file text to existing text in editor"
                >
                  <span>+ Append to Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => onGenerateAudio && onGenerateAudio()}
                  className="btn-file-control btn-file-generate flex-1 sm:flex-initial"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Generate Audio</span>
                </button>
              </div>
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

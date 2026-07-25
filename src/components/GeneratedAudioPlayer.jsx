import React from 'react';
import { Download, Volume2, AlertTriangle, Trash2, FileAudio } from 'lucide-react';

export function GeneratedAudioPlayer({
  audioUrl,
  audioBlob,
  filename,
  mimeType,
  warning,
  error,
  onDownload,
  onClear
}) {
  if (!audioUrl && !error) {
    return null;
  }

  return (
    <div className="card mt-4">
      <div className="card-header">
        <div className="card-title-group">
          <FileAudio className="card-icon text-cyan-400" />
          <div>
            <h3 className="card-title">Generated Audio Preview</h3>
            <p className="card-description">Plays the exact blob that was captured or exported</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onDownload && audioBlob ? (
            <button type="button" className="btn-sm btn-primary-gradient" onClick={onDownload}>
              <Download className="w-3.5 h-3.5 mr-1" /> Download
            </button>
          ) : null}
          {onClear ? (
            <button type="button" className="btn-sm btn-outline-emerald" onClick={onClear}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="markdown-alert mt-3">
          <div className="markdown-alert-info">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="markdown-alert-title">Audio generation failed</p>
              <p className="markdown-alert-text">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      {warning ? (
        <div className="markdown-alert mt-3">
          <div className="markdown-alert-info">
            <Volume2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="markdown-alert-title">Format note</p>
              <p className="markdown-alert-text">{warning}</p>
            </div>
          </div>
        </div>
      ) : null}

      {audioUrl ? (
        <div className="mt-4 space-y-3">
          <audio
            key={audioUrl}
            controls
            preload="metadata"
            src={audioUrl}
            className="w-full"
            onCanPlay={() => {
              console.log('[AetherVocal] preview audio ready', {
                filename,
                mimeType,
                size: audioBlob?.size,
                type: audioBlob?.type
              });
            }}
            onError={(event) => {
              console.error('[AetherVocal] preview audio error', event);
            }}
          />
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span>File: {filename || 'generated-audio'}</span>
            <span>MIME: {mimeType || audioBlob?.type || 'unknown'}</span>
            <span>Size: {audioBlob ? `${Math.round(audioBlob.size / 1024)} KB` : '0 KB'}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
import React from 'react';
import { Play, Pause, Square, Download, Loader2, X, AlertTriangle } from 'lucide-react';

export function FooterPlayer({
  isSpeaking,
  isPaused,
  isGenerating,
  generationProgress,
  downloadError,
  onPlay,
  onPause,
  onStop,
  onDownload,
  onDismissError,
  selectedFormat,
  setSelectedFormat,
  stats
}) {
  return (
    <footer className="sticky-player-bar">
      <div className="player-bar-container">
        {/* Download Error Banner */}
        {downloadError && (
          <div className="download-error-banner">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="download-error-text">{downloadError}</span>
            <button
              type="button"
              className="download-error-dismiss"
              onClick={onDismissError}
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Format Selector */}
        <div className="player-format-picker">
          <span className="format-label">Format:</span>
          <div className="segmented-control flex-1">
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'wav' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('wav')}
            >
              WAV
            </button>
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'webm' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('webm')}
            >
              MP3
            </button>
          </div>
        </div>

        {/* Player Controls */}
        <div className="player-primary-actions">
          {!isSpeaking || isPaused ? (
            <button
              type="button"
              onClick={onPlay}
              className="btn-player btn-play"
              disabled={isGenerating}
            >
              <Play className="w-4 h-4 fill-current flex-shrink-0" />
              <span>{isPaused ? 'Resume' : 'Play Speech'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="btn-player btn-pause"
            >
              <Pause className="w-4 h-4 fill-current flex-shrink-0" />
              <span>Pause</span>
            </button>
          )}

          {isSpeaking && (
            <button
              type="button"
              onClick={onStop}
              className="btn-player btn-stop"
            >
              <Square className="w-4 h-4 fill-current flex-shrink-0" />
              <span>Stop</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDownload}
            className="btn-player btn-download-gradient"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                <span>
                  {generationProgress?.statusText 
                    ? (generationProgress.total > 1 
                        ? `Chunk ${generationProgress.current}/${generationProgress.total} (${generationProgress.percent}%)` 
                        : 'Generating...')
                    : 'Generating Audio...'}
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 flex-shrink-0" />
                <span>Save Audio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}

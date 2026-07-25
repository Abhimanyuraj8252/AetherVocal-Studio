import React from 'react';
import { Play, Pause, Square, Download, Volume2, Sparkles, ShieldCheck } from 'lucide-react';

export function FooterPlayer({
  isSpeaking,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onDownload,
  selectedFormat,
  setSelectedFormat,
  stats
}) {
  return (
    <footer className="sticky-player-bar">
      <div className="player-bar-container">
        {/* Format Selector */}
        <div className="player-format-picker">
          <span className="format-label">Audio Format:</span>
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'mp3' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('mp3')}
            >
              MP3 (320kbps)
            </button>
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'wav' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('wav')}
            >
              WAV (Lossless)
            </button>
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'ogg' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('ogg')}
            >
              OGG (Vorbis)
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
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isPaused ? 'Resume Speech' : 'Play Full Speech'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="btn-player btn-pause"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Speech</span>
            </button>
          )}

          {isSpeaking && (
            <button
              type="button"
              onClick={onStop}
              className="btn-player btn-stop"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>
          )}

          <button
            type="button"
            onClick={onDownload}
            className="btn-player btn-download-gradient"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Save Audio (.{selectedFormat.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

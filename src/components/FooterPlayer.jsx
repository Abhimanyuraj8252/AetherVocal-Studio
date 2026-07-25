import React from 'react';
import { Play, Pause, Square, Download, Volume2 } from 'lucide-react';

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
          <span className="format-label">Format:</span>
          <div className="segmented-control flex-1">
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'mp3' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('mp3')}
            >
              MP3
            </button>
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'wav' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('wav')}
            >
              WAV
            </button>
            <button
              type="button"
              className={`segmented-btn ${selectedFormat === 'ogg' ? 'active' : ''}`}
              onClick={() => setSelectedFormat('ogg')}
            >
              OGG
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
          >
            <Download className="w-4 h-4 flex-shrink-0" />
            <span>Save (.{selectedFormat.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

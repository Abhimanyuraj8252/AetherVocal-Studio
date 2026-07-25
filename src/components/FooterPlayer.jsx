import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Wand2, 
  Sparkles, 
  RefreshCw, 
  FileAudio,
  Check
} from 'lucide-react';

export function FooterPlayer({
  isPlaying,
  isPaused,
  isRecording,
  onPlay,
  onPause,
  onResume,
  onStop,
  onGenerateAndDownload,
  outputFormat,
  setOutputFormat,
  hasAudioFile,
  onDownloadAudio,
  text
}) {
  const isTextEmpty = !text || !text.trim();

  return (
    <div className="sticky-player-bar">
      <div className="player-bar-container">
        
        {/* Left: Format Picker */}
        <div className="player-format-picker">
          <label className="format-label">
            <FileAudio className="w-4 h-4 text-cyan-400 inline mr-1" /> Export Format:
          </label>
          <div className="segmented-control format-control">
            <button
              type="button"
              className={`segmented-btn ${outputFormat === 'mp3' ? 'active' : ''}`}
              onClick={() => setOutputFormat('mp3')}
            >
              🎵 MP3
            </button>
            <button
              type="button"
              className={`segmented-btn ${outputFormat === 'wav' ? 'active' : ''}`}
              onClick={() => setOutputFormat('wav')}
            >
              🎼 WAV
            </button>
            <button
              type="button"
              className={`segmented-btn ${outputFormat === 'ogg' ? 'active' : ''}`}
              onClick={() => setOutputFormat('ogg')}
            >
              🔊 OGG
            </button>
          </div>
        </div>

        {/* Middle: Playback Actions */}
        <div className="player-primary-actions">
          {isPlaying ? (
            <>
              {isPaused ? (
                <button
                  type="button"
                  onClick={onResume}
                  className="btn-player btn-play-active"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Resume</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="btn-player btn-pause"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={onStop}
                className="btn-player btn-stop"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Stop</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              disabled={isTextEmpty}
              className="btn-player btn-play"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Speech</span>
            </button>
          )}

          {/* Primary High-Value Action: Generate & Export Audio */}
          <button
            type="button"
            onClick={onGenerateAndDownload}
            disabled={isTextEmpty || isRecording}
            className="btn-player btn-download-gradient"
          >
            {isRecording ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating {outputFormat.toUpperCase()} Audio...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Generate & Save Audio ({outputFormat.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Download Last File Button */}
        <div className="player-status-info">
          {hasAudioFile && !isRecording && (
            <button
              type="button"
              onClick={onDownloadAudio}
              className="btn-sm btn-outline-emerald"
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Re-Download .{outputFormat} File
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

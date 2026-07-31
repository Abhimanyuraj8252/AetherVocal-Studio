import React from 'react';
import { Play, Pause, Square, Download, Loader2, X, AlertTriangle, Zap, XCircle, Layers, Sparkles } from 'lucide-react';

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
  enableCompression = true,
  setEnableCompression,
  stats,
  isComplete,
  nextChunkIndex,
  totalChunks,
  autoGenerateAll,
  onToggleAutoGenerate,
  autoQueueActive,
  onCancelAutoQueue,
  totalParts,
  currentPartNumber,
  compressionReport,
  onDismissCompressionReport
}) {
  return (
    <footer className="sticky-player-bar">
      <div className="player-bar-container">
        {/* Compression Result Toast / Banner */}
        {compressionReport && (
          <div className="compression-result-card">
            <div className="compression-result-header">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse flex-shrink-0" />
                <span className="font-semibold text-xs text-emerald-300">
                  ⚡ Smart Compression Complete
                </span>
              </div>
              <button
                type="button"
                onClick={onDismissCompressionReport}
                className="text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="compression-result-body">
              <span className="compression-filename">{compressionReport.filename}</span>
              <div className="compression-stats-row">
                <span className="compression-size-old">{compressionReport.originalFormatted}</span>
                <span className="compression-arrow">➔</span>
                <span className="compression-size-new">{compressionReport.compressedFormatted}</span>
                <span className="compression-saved-pill">
                  🎉 {compressionReport.reductionPercent}% Saved ({compressionReport.format})
                </span>
              </div>
            </div>
          </div>
        )}

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

        {/* Compression Selector */}
        <div className="player-format-picker">
          <span className="format-label">Compress:</span>
          <div className="segmented-control flex-1">
            <button
              type="button"
              className={`segmented-btn ${enableCompression ? 'active' : ''}`}
              onClick={() => setEnableCompression && setEnableCompression(true)}
              title="Compress audio to reduce file size"
            >
              ON
            </button>
            <button
              type="button"
              className={`segmented-btn ${!enableCompression ? 'active' : ''}`}
              onClick={() => setEnableCompression && setEnableCompression(false)}
              title="Disable compression for original high quality"
            >
              OFF
            </button>
          </div>
        </div>

        {/* Auto-Queue Toggle */}
        <div className="auto-queue-section">
          <div
            className={`auto-queue-toggle ${autoGenerateAll ? 'active' : ''}`}
            onClick={onToggleAutoGenerate}
            role="switch"
            aria-checked={autoGenerateAll}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleAutoGenerate(); } }}
          >
            <div className="auto-queue-toggle-track">
              <div className="auto-queue-toggle-thumb">
                {autoGenerateAll && <Zap className="w-2.5 h-2.5" style={{ color: '#070a12' }} />}
              </div>
            </div>
            <span className="auto-queue-label">
              {autoQueueActive ? 'Auto-Queue Active' : 'Auto-Queue All Parts'}
            </span>
            {autoQueueActive && (
              <span className="auto-queue-badge-active">
                <span className="auto-queue-pulse-dot" />
                Part {currentPartNumber}/{totalParts}
              </span>
            )}
          </div>
        </div>

        {/* Batch Progress Bar */}
        {autoQueueActive && isGenerating && (
          <div className="batch-progress-container">
            <div className="batch-progress-outer">
              <div
                className="batch-progress-parts-fill"
                style={{ width: `${totalParts > 0 ? ((currentPartNumber - 1) / totalParts) * 100 : 0}%` }}
              />
              <div
                className="batch-progress-chunk-fill"
                style={{
                  left: `${totalParts > 0 ? ((currentPartNumber - 1) / totalParts) * 100 : 0}%`,
                  width: `${totalParts > 0 ? ((generationProgress?.percent || 0) / 100) * (100 / totalParts) : 0}%`
                }}
              />
            </div>
            <span className="batch-progress-text">
              Part {currentPartNumber} of {totalParts}
              {generationProgress?.total > 1 && (
                <> • Chunk {generationProgress.current}/{generationProgress.total}</>  
              )}
            </span>
          </div>
        )}

        {/* Compression Progress Banner */}
        {isGenerating && generationProgress?.statusText && generationProgress.statusText.includes('Compressing') && (
          <div className="compression-progress-banner">
            <Zap className="w-4 h-4 text-emerald-400 animate-bounce flex-shrink-0" />
            <span className="compression-progress-text">{generationProgress.statusText}</span>
            <span className="compression-badge">Smart Compressor Active</span>
          </div>
        )}

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

          {autoQueueActive && isGenerating ? (
            <button
              type="button"
              onClick={onCancelAutoQueue}
              className="btn-player btn-cancel-queue"
            >
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>Cancel Auto-Queue</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onDownload}
              className={`btn-player ${isComplete ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'btn-download-gradient'}`}
              disabled={isGenerating || (isComplete && totalChunks > 0)}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                  <span>
                    {generationProgress?.statusText
                      ? generationProgress.statusText
                      : (generationProgress?.total > 1
                          ? `Chunk ${generationProgress.current}/${generationProgress.total} (${generationProgress.percent}%)`
                          : 'Generating...')}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {isComplete
                      ? 'All Parts Ready (Combine in History)'
                      : nextChunkIndex > 0
                        ? `Generate Part ${Math.floor(nextChunkIndex / 20) + 1}`
                        : 'Generate Audio (Part 1)'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { Layers, Play, CheckCircle2, Activity, Sparkles, Volume2 } from 'lucide-react';

export function ChunkQueue({
  chunks,
  activeChunkIndex,
  isPlaying,
  onPlaySingleChunk
}) {
  if (!chunks || chunks.length === 0) return null;

  const totalChunks = chunks.length;
  const completedCount = activeChunkIndex >= 0 ? activeChunkIndex + 1 : 0;
  const progressPercent = Math.min(100, Math.round((completedCount / totalChunks) * 100));

  return (
    <div className="card chunk-queue-card mt-4">
      <div className="card-header">
        <div className="card-title-group">
          <div className="queue-title-icon-wrapper">
            <Layers className="card-icon text-cyan-400" />
          </div>
          <div>
            <h3 className="card-title text-gradient-cyan">
              Speech Chunk Queue ({totalChunks} Total Chunks)
            </h3>
            <p className="card-description">Real-time non-blocking text-to-speech engine queue</p>
          </div>
        </div>
        <div className="queue-progress-badge">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
          <span>{activeChunkIndex >= 0 ? `${progressPercent}% Processed` : 'Queue Ready'}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="chunk-progress-track">
        <div 
          className="chunk-progress-fill" 
          style={{ width: `${activeChunkIndex >= 0 ? progressPercent : 0}%` }}
        />
      </div>

      {/* Chunks List */}
      <div className="chunks-list scrollable-chunks">
        {chunks.map((chunkText, idx) => {
          const isActive = idx === activeChunkIndex && isPlaying;
          const isDone = idx < activeChunkIndex;
          const formattedIndex = `#${(idx + 1).toString().padStart(2, '0')}`;

          return (
            <div 
              key={idx} 
              className={`chunk-item ${isActive ? 'chunk-active' : isDone ? 'chunk-done' : ''}`}
            >
              <div className="chunk-meta">
                <span className="chunk-index-pill">{formattedIndex}</span>
                {isActive && (
                  <div className="active-equalizer-bars">
                    <span className="eq-bar bar-1"></span>
                    <span className="eq-bar bar-2"></span>
                    <span className="eq-bar bar-3"></span>
                  </div>
                )}
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" />}
              </div>

              <p className="chunk-text-preview">{chunkText}</p>

              <button
                type="button"
                onClick={() => onPlaySingleChunk(chunkText, idx)}
                className="btn-play-chunk-sm"
                title="Play this sentence chunk"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

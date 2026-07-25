import React from 'react';
import { Layers, Play, CheckCircle2, Volume2, Activity, Sparkles } from 'lucide-react';

export function ChunkQueue({
  chunks,
  activeChunkIndex,
  isPlaying,
  onPlaySingleChunk
}) {
  if (!chunks || chunks.length === 0) return null;

  const progressPercent = Math.round(((activeChunkIndex + 1) / chunks.length) * 100);

  return (
    <div className="card chunk-queue-card mt-4">
      <div className="card-header">
        <div className="card-title-group">
          <Layers className="card-icon text-cyan-400" />
          <div>
            <h3 className="card-title">Speech Chunk Queue ({chunks.length} Speech Chunks)</h3>
            <p className="card-description">Sequential non-blocking audio engine progress</p>
          </div>
        </div>
        <div className="queue-progress-badge">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
          {activeChunkIndex >= 0 ? `${progressPercent}% Completed` : 'Queue Ready'}
        </div>
      </div>

      {/* Progress Bar */}
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

          return (
            <div 
              key={idx} 
              className={`chunk-item ${isActive ? 'chunk-active' : isDone ? 'chunk-done' : ''}`}
            >
              <div className="chunk-meta">
                <span className="chunk-index">#{idx + 1}</span>
                {isActive && <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse inline" />}
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
              </div>
              <p className="chunk-text-preview">{chunkText}</p>
              <button
                type="button"
                onClick={() => onPlaySingleChunk(chunkText, idx)}
                className="btn-icon-sm"
                title="Play this sentence chunk"
              >
                <Play className="w-3 h-3 text-cyan-400 fill-current" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

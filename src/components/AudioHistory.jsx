import React, { useState } from 'react';
import { History, Play, Trash2, Music, CheckSquare, Square, Layers } from 'lucide-react';

export function AudioHistory({ history = [], onClearHistory, onPlayHistoryItem, onCombineAndDownload, isGenerating }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === history.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(history.map(item => item.id)));
    }
  };

  if (!history || history.length === 0) return null;

  return (
    <div className="card audio-history-card">
      <div className="history-header">
        <div className="history-header-left">
          <div className="history-icon-badge">
            <History className="card-icon" style={{ color: 'var(--primary-accent)' }} />
          </div>
          <div>
            <h3 className="history-header-title">Generated Audio Parts</h3>
            <p className="history-header-sub">Select multiple parts to stitch gaplessly into a full audio file.</p>
          </div>
        </div>

        <div className="history-header-actions">
          {selectedIds.size > 1 && (
            <button
              type="button"
              onClick={() => onCombineAndDownload(Array.from(selectedIds))}
              disabled={isGenerating}
              className="btn-combine-download"
              title="Stitch selected parts gaplessly and download"
            >
              <Layers style={{ width: 14, height: 14 }} />
              Combine & Download ({selectedIds.size})
            </button>
          )}

          <button
            type="button"
            onClick={selectAll}
            className="btn-icon-action"
            title="Select All Parts"
          >
            {selectedIds.size === history.length ? (
              <CheckSquare style={{ width: 16, height: 16, color: 'var(--primary-accent)' }} />
            ) : (
              <Square style={{ width: 16, height: 16 }} />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedIds(new Set());
              onClearHistory();
            }}
            className="btn-icon-action btn-icon-danger"
            title="Clear History"
          >
            <Trash2 style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      <div className="history-list scrollable-chunks" style={{ padding: '0.6rem' }}>
        {history.map((item, idx) => {
          const isSelected = selectedIds.has(item.id);
          return (
            <div 
              key={item.id || idx} 
              className={`history-item ${isSelected ? 'history-item-selected' : ''}`}
              onClick={() => toggleSelect(item.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="history-item-left">
                <button
                  type="button"
                  className={`history-checkbox-btn ${isSelected ? 'selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                >
                  {isSelected ? (
                    <CheckSquare style={{ width: 18, height: 18 }} />
                  ) : (
                    <Square style={{ width: 18, height: 18 }} />
                  )}
                </button>
                
                <div className="history-icon-badge">
                  <Music style={{ width: 14, height: 14, color: 'var(--cyan-accent)' }} />
                </div>

                <div className="history-details">
                  <span className="history-title">{item.title || 'Speech Export'}</span>
                  <div className="history-meta-row">
                    {item.chunksRange && (
                      <span className="badge-sm" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-accent)', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                        Chunks {item.chunksRange}
                      </span>
                    )}
                    <span className="history-voice">{item.voiceName}</span>
                    <span className="history-dot">•</span>
                    <span className="history-time">{item.timestamp}</span>
                    {item.format && (
                      <span className="history-format-badge">{item.format.toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="history-actions">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onPlayHistoryItem(item); }}
                  disabled={isGenerating}
                  className="btn-play-chunk-sm"
                  title="Play this part"
                >
                  <Play style={{ width: 12, height: 12, color: 'var(--cyan-accent)', fill: 'currentColor' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

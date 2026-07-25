import React from 'react';
import { History, Play, Download, Trash2, Music, Clock, Sparkles } from 'lucide-react';
import { downloadAudioBlob } from '../utils/audioBufferEncoder';

export function AudioHistory({ history = [], onClearHistory, onPlayHistoryItem }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="card audio-history-card mt-4">
      <div className="card-header">
        <div className="card-title-group">
          <History className="card-icon text-indigo-400" />
          <div>
            <h3 className="card-title">Recent Generated Audio History</h3>
            <p className="card-description">Replay and redownload your recent speech audio files</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="btn-icon-sm text-rose-400 hover:bg-rose-500/20"
          title="Clear History"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="history-list scrollable-chunks">
        {history.map((item, idx) => (
          <div key={item.id || idx} className="history-item">
            <div className="history-item-left">
              <div className="history-icon-badge">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="history-details">
                <span className="history-title">{item.title || 'Speech Export'}</span>
                <div className="history-meta-row">
                  <span className="history-voice">{item.voiceName}</span>
                  <span className="history-dot">•</span>
                  <span className="history-time">{item.timestamp}</span>
                  <span className="history-format-badge">{item.format.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="history-actions">
              <button
                type="button"
                onClick={() => onPlayHistoryItem(item)}
                className="btn-icon-sm"
                title="Play Audio"
              >
                <Play className="w-3 h-3 text-cyan-400 fill-current" />
              </button>

              <button
                type="button"
                onClick={() => downloadAudioBlob(item.blob, item.filename)}
                className="btn-icon-sm"
                title="Download Audio File"
              >
                <Download className="w-3 h-3 text-emerald-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

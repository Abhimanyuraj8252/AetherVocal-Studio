import React, { useMemo } from 'react';
import { Layers, CheckCircle2, CheckSquare, Square, AlertCircle, Loader2 } from 'lucide-react';

export function SpeechPartQueue({
  chunks,
  selectedQueueParts,
  setSelectedQueueParts,
  generatingPartNum,
  isGenerating
}) {
  if (!chunks || chunks.length === 0) return null;

  const totalChunks = chunks.length;
  
  const parts = useMemo(() => {
    const p = [];
    for (let i = 0; i < chunks.length; i += 20) {
      const partChunks = chunks.slice(i, i + 20);
      p.push({
        partNum: Math.floor(i / 20) + 1,
        startIndex: i,
        endIndex: Math.min(i + 20, chunks.length),
        previewText: partChunks.join(' ').substring(0, 80) + '...',
      });
    }
    return p;
  }, [chunks]);

  const totalParts = parts.length;
  const selectedCount = selectedQueueParts?.length || 0;

  const handleTogglePart = (partNum) => {
    setSelectedQueueParts(prev => {
      if (!prev) return [partNum];
      if (prev.includes(partNum)) return prev.filter(p => p !== partNum);
      return [...prev, partNum].sort((a, b) => a - b);
    });
  };

  const handleSelectAll = () => {
    setSelectedQueueParts(parts.map(p => p.partNum));
  };

  const handleDeselectAll = () => {
    setSelectedQueueParts([]);
  };

  return (
    <div className="card speech-part-queue-card">
      <div className="part-queue-header">
        <div className="part-queue-title-group">
          <div className="queue-title-icon-wrapper">
            <Layers className="card-icon" style={{ color: 'var(--cyan-accent)', width: 16, height: 16 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="card-title text-gradient-cyan" style={{ fontSize: '0.9rem' }}>
                Speech Generation Queue ({totalParts} {totalParts === 1 ? 'Part' : 'Parts'})
              </h3>
              <span className="selected-count-badge">
                Selected: {selectedCount}/{totalParts}
              </span>
            </div>
            <p className="card-description" style={{ fontSize: '0.7rem' }}>Select parts to generate (Total {totalChunks} chunks)</p>
          </div>
        </div>
        
        <div className="part-queue-header-actions">
          <button 
            type="button" 
            onClick={handleSelectAll} 
            className="btn-select-action"
            title="Select All Parts"
          >
            <CheckSquare style={{ width: 14, height: 14 }} />
            <span>Select All</span>
          </button>
          <button 
            type="button" 
            onClick={handleDeselectAll} 
            className="btn-select-action btn-select-none"
            title="Deselect All"
          >
            <Square style={{ width: 14, height: 14 }} />
            <span>None</span>
          </button>
        </div>
      </div>

      {selectedCount === 0 && (
        <div className="part-empty-warning">
          <AlertCircle style={{ width: 15, height: 15 }} />
          <span>Please select at least one part to generate.</span>
        </div>
      )}

      <div className="part-grid scrollable-chunks">
        {parts.map((part) => {
          const isSelected = selectedQueueParts?.includes(part.partNum);
          const isGeneratingThisPart = isGenerating && generatingPartNum === part.partNum;
          
          return (
            <div 
              key={part.partNum} 
              className={`part-item ${isSelected ? 'part-item-selected' : ''} ${isGeneratingThisPart ? 'part-item-generating' : ''}`}
              onClick={() => handleTogglePart(part.partNum)}
            >
              <div className={`part-checkbox ${isSelected ? 'part-checkbox-checked' : ''}`}>
                {isSelected && <CheckCircle2 style={{ width: 14, height: 14, strokeWidth: 3 }} />}
              </div>

              <div className="part-item-details">
                <span className="part-title">PART {part.partNum}</span>
                <span className="part-range-badge">Chunks {part.startIndex + 1} - {part.endIndex}</span>
                <span className="part-preview-text">{part.previewText}</span>
              </div>

              {isGeneratingThisPart && (
                <div className="part-generating-badge">
                  <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" />
                  <span>Generating...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

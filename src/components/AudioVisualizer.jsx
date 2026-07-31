import React, { useState, useRef, useEffect } from 'react';
import { Activity, Radio, Disc } from 'lucide-react';

export function AudioVisualizer({ isSpeaking, isRecording, isPlaying }) {
  const active = isSpeaking || isRecording || isPlaying;
  const canvasRef = useRef(null);
  const [vizMode, setVizMode] = useState('bars'); // 'bars' | 'spectrum' | 'ring'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let bars = Array.from({ length: 42 }, () => Math.random() * 0.2 + 0.1);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      if (vizMode === 'spectrum') {
        // Neon Spectrum Wave
        ctx.beginPath();
        ctx.lineWidth = 3;
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#8b5cf6');
        ctx.strokeStyle = active ? grad : 'rgba(148, 163, 184, 0.3)';

        for (let x = 0; x < width; x += 4) {
          const t = Date.now() * 0.006 + x * 0.02;
          const amp = active ? Math.sin(t) * 18 + Math.cos(t * 1.5) * 8 : Math.sin(t) * 3;
          const y = centerY + amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (vizMode === 'ring') {
        // Holographic Pulsing Ring
        const t = Date.now() * 0.005;
        const radius = active ? 22 + Math.sin(t * 2) * 5 : 20;
        ctx.save();
        ctx.translate(centerX, centerY);

        const ringGrad = ctx.createRadialGradient(0, 0, radius * 0.5, 0, 0, radius * 1.5);
        if (active) {
          ringGrad.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
          ringGrad.addColorStop(1, 'rgba(6, 182, 212, 0.1)');
        } else {
          ringGrad.addColorStop(0, 'rgba(148, 163, 184, 0.3)');
          ringGrad.addColorStop(1, 'transparent');
        }

        ctx.strokeStyle = active ? '#06b6d4' : 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 2;

        const numDots = 16;
        for (let i = 0; i < numDots; i++) {
          const angle = (i / numDots) * Math.PI * 2 + (active ? t : 0);
          const r = radius + (active ? Math.sin(t * 3 + i) * 6 : 0);
          const dx = Math.cos(angle) * r;
          const dy = Math.sin(angle) * r;

          ctx.fillStyle = active ? (i % 2 === 0 ? '#06b6d4' : '#ec4899') : '#64748b';
          ctx.beginPath();
          ctx.arc(dx, dy, active ? 3 : 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

      } else {
        // Quantum Frequency Bars
        const barWidth = width / bars.length - 3;

        for (let i = 0; i < bars.length; i++) {
          if (active) {
            const target = Math.sin(Date.now() * 0.005 + i * 0.3) * 0.4 + 0.5 + Math.random() * 0.2;
            bars[i] += (target - bars[i]) * 0.2;
          } else {
            bars[i] += (0.1 - bars[i]) * 0.1;
          }

          const barHeight = bars[i] * (height * 0.75);

          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          if (isRecording) {
            gradient.addColorStop(0, '#f43f5e');
            gradient.addColorStop(0.5, '#ec4899');
            gradient.addColorStop(1, '#8b5cf6');
          } else if (active) {
            gradient.addColorStop(0, '#06b6d4');
            gradient.addColorStop(0.5, '#3b82f6');
            gradient.addColorStop(1, '#8b5cf6');
          } else {
            gradient.addColorStop(0, 'rgba(148, 163, 184, 0.2)');
            gradient.addColorStop(1, 'rgba(71, 85, 105, 0.1)');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(i * (barWidth + 3), centerY - barHeight / 2, barWidth, barHeight, 4);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, isRecording, vizMode]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-status flex items-center justify-between gap-2 w-full">
        {isRecording ? (
          <span className="status-badge status-recording animate-pulse">
            ● Recording Audio to WAV...
          </span>
        ) : active ? (
          <span className="status-badge status-playing">
            🔊 Synthesizing & Playing Audio...
          </span>
        ) : (
          <span className="status-badge status-idle">
            READY
          </span>
        )}

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 border border-slate-800 rounded-lg">
          <button
            type="button"
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              vizMode === 'bars' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setVizMode('bars')}
            title="Quantum Bars Visualizer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bars</span>
          </button>
          <button
            type="button"
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              vizMode === 'spectrum' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setVizMode('spectrum')}
            title="Neon Spectrum Wave"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wave</span>
          </button>
          <button
            type="button"
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
              vizMode === 'ring' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setVizMode('ring')}
            title="Holographic Ring"
          >
            <Disc className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ring</span>
          </button>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={320} 
        height={60} 
        className="visualizer-canvas"
      />
    </div>
  );
}


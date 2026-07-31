import React, { useState, useRef, useEffect } from 'react';
import { Activity, Radio, Disc, Loader2 } from 'lucide-react';

export function AudioVisualizer({ isSpeaking, isRecording, isPlaying, isGenerating }) {
  const active = isSpeaking || isRecording || isPlaying || isGenerating;
  const isPlaybackActive = isSpeaking || isRecording || isPlaying;
  const isDualMode = isGenerating && isPlaybackActive;
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

        if (isDualMode) {
          ctx.beginPath();
          ctx.lineWidth = 1.5;
          const genGrad = ctx.createLinearGradient(0, 0, width, 0);
          genGrad.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
          genGrad.addColorStop(1, 'rgba(139, 92, 246, 0.6)');
          ctx.strokeStyle = genGrad;
          for (let x = 0; x < width; x += 4) {
            const t = Date.now() * 0.003 + x * 0.04;
            const amp = Math.sin(t) * 6 + Math.cos(t * 2.5) * 3;
            const y = centerY + 22 + amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

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

        // Dual-mode: overlay generation pulse effect
        if (isDualMode) {
          const pulseAlpha = 0.15 + Math.sin(Date.now() * 0.004) * 0.1;
          const pulseGrad = ctx.createLinearGradient(0, 0, width, 0);
          pulseGrad.addColorStop(0, `rgba(99, 102, 241, ${pulseAlpha})`);
          pulseGrad.addColorStop(0.5, `rgba(139, 92, 246, ${pulseAlpha})`);
          pulseGrad.addColorStop(1, `rgba(99, 102, 241, ${pulseAlpha})`);
          ctx.fillStyle = pulseGrad;
          ctx.fillRect(0, 0, width, height);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [active, isRecording, isGenerating, vizMode]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-status flex items-center justify-between gap-2 w-full">
        <div className="dual-status-row">
          {isGenerating && (
            <span className="status-badge status-generating">
              <Loader2 className="w-3 h-3 animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
              Generating Audio...
            </span>
          )}
          {isRecording && (
            <span className="status-badge status-recording">
              ● Recording Audio to WAV...
            </span>
          )}
          {isPlaybackActive && !isRecording && (
            <span className="status-badge status-playing">
              🔊 Playing Audio
            </span>
          )}
          {!active && (
            <span className="status-badge status-idle">READY</span>
          )}
        </div>

        {/* Mode Selector Buttons */}
        <div className="viz-mode-dock">
          <button
            type="button"
            className={`viz-mode-btn ${vizMode === 'bars' ? 'active-bars' : ''}`}
            onClick={() => setVizMode('bars')}
            title="Quantum Bars Visualizer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
          <button
            type="button"
            className={`viz-mode-btn ${vizMode === 'spectrum' ? 'active-wave' : ''}`}
            onClick={() => setVizMode('spectrum')}
            title="Neon Spectrum Wave"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Wave</span>
          </button>
          <button
            type="button"
            className={`viz-mode-btn ${vizMode === 'ring' ? 'active-ring' : ''}`}
            onClick={() => setVizMode('ring')}
            title="Holographic Ring"
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Ring</span>
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


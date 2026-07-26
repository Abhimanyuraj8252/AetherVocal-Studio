import React from 'react';

export function AudioVisualizer({ isPlaying, isRecording }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let bars = Array.from({ length: 42 }, () => Math.random() * 0.2 + 0.1);

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const barWidth = width / bars.length - 3;
      const centerY = height / 2;

      for (let i = 0; i < bars.length; i++) {
        // Dynamic animation if playing or recording
        if (isPlaying || isRecording) {
          const target = Math.sin(Date.now() * 0.005 + i * 0.3) * 0.4 + 0.5 + Math.random() * 0.2;
          bars[i] += (target - bars[i]) * 0.2;
        } else {
          bars[i] += (0.1 - bars[i]) * 0.1;
        }

        const barHeight = bars[i] * (height * 0.7);

        // Vibrant linear gradient
        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        if (isRecording) {
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(0.5, '#ec4899');
          gradient.addColorStop(1, '#8b5cf6');
        } else if (isPlaying) {
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

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isRecording]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-status">
        {isRecording ? (
          <span className="status-badge status-recording animate-pulse">
            ● Recording Audio to WAV...
          </span>
        ) : isPlaying ? (
          <span className="status-badge status-playing">
            🔊 Synthesizing & Playing Audio...
          </span>
        ) : (
          <span className="status-badge status-idle">
            READY
          </span>
        )}
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

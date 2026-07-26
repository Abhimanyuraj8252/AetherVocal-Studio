import React from 'react';

export function Logo({ className = "w-10 h-10" }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
      >
        <defs>
          {/* Cyber Neon Gradients */}
          <linearGradient id="aetherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>

          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
            <stop offset="100%" stopColor="rgba(7, 10, 18, 0)" />
          </radialGradient>

          {/* Glowing Filters */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Core Glow */}
        <circle cx="50" cy="50" r="45" fill="url(#coreGlow)" />

        {/* Outer Hexagonal Cyber Ring */}
        <path
          d="M50 8 L85 28 L85 72 L50 92 L15 72 L15 28 Z"
          stroke="url(#aetherGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="rgba(15, 23, 42, 0.6)"
          className="transition-all duration-300"
        />

        {/* Inner Futuristic 'A' Frame */}
        <path
          d="M50 18 L72 74 M50 18 L28 74"
          stroke="url(#aetherGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />

        {/* Equalizer Soundwave Dynamic Crossbar */}
        <g stroke="url(#waveGrad)" strokeWidth="3.5" strokeLinecap="round" filter="url(#neonGlow)">
          <line x1="26" y1="52" x2="26" y2="58" />
          <line x1="33" y1="46" x2="33" y2="64" />
          <line x1="40" y1="38" x2="40" y2="72" />
          <line x1="47" y1="42" x2="47" y2="68" />
          <line x1="53" y1="44" x2="53" y2="66" />
          <line x1="60" y1="36" x2="60" y2="74" />
          <line x1="67" y1="48" x2="67" y2="62" />
          <line x1="74" y1="52" x2="74" y2="58" />
        </g>

        {/* Glowing Neural Apex Node */}
        <circle cx="50" cy="18" r="4" fill="#67e8f9" filter="url(#neonGlow)" />
        <circle cx="50" cy="18" r="2" fill="#ffffff" />
      </svg>
    </div>
  );
}

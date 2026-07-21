import React from 'react';
import { useTheme } from '../context/ThemeContext';
import bckVideo from '../assets/bck1.mp4';

export default function MasterCanvasBackground() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: theme === 'dark' ? 'brightness(0.7) contrast(1.02)' : 'brightness(0.95) opacity(0.9)',
          transition: 'filter 0.4s ease'
        }}
      >
        <source src={bckVideo} type="video/mp4" />
      </video>

      {/* Ultra-thin tint overlay for text legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: theme === 'dark' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(245, 245, 247, 0.12)',
          transition: 'background 0.4s ease'
        }}
      />
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import bckVideo from '../assets/bck1.mp4';

export default function MasterCanvasBackground() {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;

    // Detect mobile for performance optimization
    const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Reduce particles on mobile for better performance
    const numParticles = isMobile ? 30 : 70;
    const connectionDistance = isMobile ? 80 : 100;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.5 + 0.6,
      isRed: Math.random() > 0.88
    }));

    let scanlineY = 0;
    let frameCount = 0;

    const render = () => {
      frameCount++;

      // On mobile, skip every other frame for performance
      if (isMobile && frameCount % 2 !== 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const isDark = themeRef.current === 'dark';
      ctx.clearRect(0, 0, width, height);

      const mouseGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, isMobile ? 250 : 400);
      mouseGlow.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(220, 0, 50, 0.03)');
      mouseGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, width, height);

      const gridSize = isMobile ? 90 : 65;
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.025)';

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      scanlineY = (scanlineY + 1) % height;
      const scanGrad = ctx.createLinearGradient(0, scanlineY - 30, 0, scanlineY + 30);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)');
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanlineY - 30, width, 60);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isRed
          ? (isDark ? '#FF003C' : '#DC0032')
          : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.15)');
        ctx.fill();

        // Reduce connection calculations on mobile
        const checkLimit = isMobile ? Math.min(i + 8, particles.length) : particles.length;
        for (let j = i + 1; j < checkLimit; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark
              ? `rgba(255, 255, 255, ${0.06 * (1 - dist / connectionDistance)})`
              : `rgba(0, 0, 0, ${0.04 * (1 - dist / connectionDistance)})`;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
          filter: theme === 'dark' ? 'brightness(0.6) contrast(1.02)' : 'brightness(1) opacity(0.85)',
          transition: 'filter 0.4s ease'
        }}
      >
        <source src={bckVideo} type="video/mp4" />
      </video>

      {/* Light overlay tint to preserve clarity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: theme === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(245, 245, 247, 0.15)',
          transition: 'background 0.4s ease'
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

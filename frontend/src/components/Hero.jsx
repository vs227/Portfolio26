import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiDownload, FiTerminal, FiMapPin } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import CyberneticAiCore from './CyberneticAiCore';
import resumePdf from '../assets/Vaishnav_Shinde_Resume12.pdf';

const ROTATING_TITLES = [
  'Building Intelligent Systems',
  'Engineering Scalable Backends',
  'Designing AI-Powered Applications',
  'Transforming Ideas into Products',
  'Solving Real-World Problems'
];

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const currentFullTitle = ROTATING_TITLES[titleIndex];
    let typingSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && displayedText === currentFullTitle) {
      const pauseTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2200);
      return () => clearTimeout(pauseTimeout);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setTitleIndex((prev) => (prev + 1) % ROTATING_TITLES.length);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(
        isDeleting
          ? currentFullTitle.substring(0, displayedText.length - 1)
          : currentFullTitle.substring(0, displayedText.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, titleIndex]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section">

      {/* 3D Core — desktop: right side, mobile: behind text as backdrop */}
      <div className="hero-3d-container">
        <CyberneticAiCore />
      </div>

      <div className="container hero-content-container">

        <div className="hero-content-inner">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--t-overlay-bg)',
              backdropFilter: 'blur(12px)',
              border: 'none',
              fontSize: '0.78rem',
              fontFamily: 'Space Grotesk, sans-serif',
              color: 'var(--t-text-primary)'
            }}>
              <FiMapPin size={13} color="var(--red-accent)" />
              <span>PUNE</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-main-title"
          >
            VAISHNAV<br />
            <span className="gradient-title-white">SHINDE</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="hero-typing-container"
          >
            <span style={{ color: 'var(--t-text-muted)', marginRight: '0.5rem', fontFamily: 'Space Grotesk, sans-serif' }}>&gt;</span>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {displayedText}
            </span>
            <span className="blinking-cursor" style={{
              display: 'inline-block',
              width: '3px',
              height: '1.2em',
              backgroundColor: 'var(--red-accent)',
              marginLeft: '4px',
              boxShadow: `0 0 8px var(--red-accent)`,
              verticalAlign: 'middle'
            }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="hero-description"
          >
            Building scalable web applications, AI-driven RAG systems, and blockchain solutions.
            Skilled in end-to-end backend engineering using <strong style={{ color: 'var(--t-text-primary)' }}>React, FastAPI, Node.js</strong>, and modern databases.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="hero-telemetry-grid"
          >
            <div>
              <div className="hero-stat-label">EXPERTISE</div>
              <div className="hero-stat-value">Software Development</div>
            </div>

            <div>
              <div className="hero-stat-label">SPECIALTY</div>
              <div className="hero-stat-value">AI & Backend</div>
            </div>

            <div>
              <div className="hero-stat-label">ARCHITECTURE</div>
              <div className="hero-stat-value">Scalable Systems</div>
            </div>

            <div>
              <div className="hero-stat-label">GOAL</div>
              <div className="hero-stat-value">Production-Ready Apps</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="hero-buttons-row"
          >
            <motion.button
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection('projects')}
              style={{
                padding: '0.9rem 1.8rem',
                borderRadius: '10px',
                backgroundColor: 'var(--t-btn-primary-bg)',
                border: 'none',
                color: 'var(--t-btn-primary-text)',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.95rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: theme === 'dark' ? '0 4px 20px rgba(255, 255, 255, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.12)'
              }}
            >
              <span>View Projects</span>
              <FiArrowRight size={16} color="var(--red-accent)" />
            </motion.button>

            <motion.a
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={resumePdf}
              download="Vaishnav_Shinde_Resume.pdf"
              style={{
                padding: '0.9rem 1.8rem',
                borderRadius: '10px',
                backgroundColor: 'var(--t-btn-secondary-bg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--t-btn-secondary-border)',
                color: 'var(--t-text-primary)',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.95rem',
                fontWeight: '700',
                textDecoration: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiDownload size={16} color="var(--red-accent)" />
              <span>Download Resume</span>
            </motion.a>

            <motion.button
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToSection('contact')}
              style={{
                padding: '0.9rem 1.4rem',
                borderRadius: '10px',
                backgroundColor: 'var(--t-btn-ghost-bg)',
                border: '1px solid var(--t-btn-ghost-border)',
                color: 'var(--t-text-primary)',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <FiTerminal size={14} color="var(--red-accent)" />
              <span>Contact</span>
            </motion.button>
          </motion.div>

        </div>

      </div>

      <style>{`
        @keyframes pulseCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .blinking-cursor {
          animation: pulseCursor 0.8s infinite;
        }

        /* ── Hero Section ── */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 100px;
          padding-bottom: 40px;
          overflow: hidden;
        }

        .hero-3d-container {
          position: absolute;
          top: 0;
          right: -6vw;
          width: 65vw;
          height: 100%;
          z-index: 1;
          pointer-events: auto;
        }

        .hero-content-container {
          position: relative;
          z-index: 2;
          pointer-events: none;
          margin-left: 0;
          padding-left: clamp(1.5rem, 5vw, 4rem);
        }

        .hero-content-inner {
          max-width: 640px;
          pointer-events: auto;
        }

        .hero-main-title {
          font-size: clamp(3.6rem, 6.5vw, 6.5rem);
          font-weight: 800;
          line-height: 0.98;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
          color: var(--t-text-primary);
        }

        .hero-typing-container {
          font-size: clamp(1.2rem, 2.2vw, 1.75rem);
          font-weight: 700;
          color: var(--t-text-primary);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          min-height: 42px;
        }

        .hero-description {
          font-size: 1.08rem;
          line-height: 1.65;
          color: var(--t-text-secondary);
          margin-bottom: 2rem;
        }

        .hero-telemetry-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2.5rem;
          background-color: var(--t-hero-stat-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--t-hero-stat-border);
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }

        .hero-stat-label {
          font-size: 0.65rem;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--t-text-muted);
          margin-bottom: 4px;
          letter-spacing: 0.05em;
        }

        .hero-stat-value {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--t-text-primary);
          white-space: nowrap;
        }

        .hero-buttons-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 960px) {
          .hero-section {
            padding-top: 140px;
          }
        }

        /* ── MOBILE: <= 768px ── */
        @media (max-width: 768px) {
          .hero-section {
            min-height: auto;
            padding-top: 130px;
            padding-bottom: 3rem;
          }

          .hero-3d-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100vw;
            height: 100%;
            right: auto;
            opacity: 0.18;
            pointer-events: none;
            z-index: 0;
          }

          .hero-content-container {
            padding-left: 1.25rem;
            padding-right: 1.25rem;
          }

          .hero-content-inner {
            max-width: 100%;
          }

          .hero-main-title {
            font-size: clamp(2.6rem, 12vw, 3.8rem);
            margin-bottom: 1rem;
          }

          .hero-typing-container {
            font-size: clamp(0.95rem, 4.2vw, 1.25rem);
            min-height: 36px;
            margin-bottom: 1rem;
          }

          .hero-description {
            font-size: 0.95rem;
            margin-bottom: 1.5rem;
          }

          .hero-telemetry-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            padding: 0.85rem 1rem;
            margin-bottom: 2rem;
          }

          .hero-stat-value {
            font-size: 0.78rem;
          }

          .hero-buttons-row {
            flex-direction: column;
            gap: 0.75rem;
          }

          .hero-buttons-row button,
          .hero-buttons-row a {
            width: 100%;
            justify-content: center;
            padding: 0.85rem 1.2rem !important;
            font-size: 0.9rem !important;
          }
        }

        /* ── SMALL PHONE: <= 400px ── */
        @media (max-width: 400px) {
          .hero-main-title {
            font-size: 2.4rem;
          }

          .hero-typing-container {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/delta2-removebg-preview.png';

const BOOT_LOGS = [
  'MOUNTING VAISHNAV SHINDE SYSTEM ARCHITECTURE...',
  'PARSING RESUME & CAPABILITIES (MIT ADT UNIVERSITY)...',
  'LOADING FASTAPI & RAG PIPELINE SPECIFICATIONS...',
  'INITIALIZING FULL STACK & BLOCKCHAIN MODULES...',
  'SYSTEM READY // PUNE, INDIA'
];

export default function MasterLoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 350);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 9) + 4;
        return next > 100 ? 100 : next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const currentStep = Math.min(Math.floor((progress / 100) * BOOT_LOGS.length), BOOT_LOGS.length - 1);
    setLogIndex(currentStep);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--t-bg)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: 'var(--t-text-primary)'
      }}
    >
      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '12px',
            border: '2px solid var(--t-border)',
            borderTopColor: 'var(--red-accent)',
            boxShadow: 'none'
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src={logoImg}
            alt="Delta Logo"
            style={{
              height: '54px',
              width: '54px',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      <div style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '1.75rem',
        fontWeight: '800',
        letterSpacing: '-0.02em',
        marginBottom: '0.4rem',
        textAlign: 'center'
      }}>
        VAISHNAV<span style={{ color: 'var(--red-accent)' }}>.SHINDE</span>
      </div>

      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.78rem',
        color: 'var(--t-text-muted)',
        height: '24px',
        marginBottom: '1.75rem',
        textAlign: 'center'
      }}>
        &gt; {BOOT_LOGS[logIndex]}
      </div>

      <div style={{
        width: '100%',
        maxWidth: '360px',
        height: '4px',
        backgroundColor: 'var(--t-input-border)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <motion.div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: 'var(--red-accent)',
            boxShadow: 'none'
          }}
        />
      </div>

      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.82rem',
        color: 'var(--red-accent)',
        fontWeight: '700',
        marginTop: '0.75rem'
      }}>
        {progress}%
      </div>

    </motion.div>
  );
}

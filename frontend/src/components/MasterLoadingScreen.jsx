import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import logoImg from '../assets/delta2-removebg-preview.png';

export default function MasterLoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

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

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000', // Solid black background for loader screen
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '2rem'
      }}
    >
      {/* Logo */}
      <img
        src={logoImg}
        alt="Delta Logo"
        style={{
          height: '60px',
          width: '110px',
          objectFit: 'contain',
        }}
      />

      {/* White Loading Circle */}
      <motion.div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid #ffffff',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.0,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </motion.div>
  );
}


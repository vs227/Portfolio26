import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/delta2-removebg-preview.png';

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'Timeline' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Certifications' },
  { id: 'contact', label: 'Contact' }
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
      const scrollPos = window.scrollY + 220;

      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const sec = document.getElementById(NAV_ITEMS[i].id);
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveSection(NAV_ITEMS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="site-navbar"
      style={{
        backgroundColor: isScrolled ? 'var(--t-nav-bg)' : 'var(--t-nav-bg-transparent)',
        boxShadow: isScrolled ? 'var(--t-nav-shadow)' : 'var(--t-nav-shadow-rest)',
      }}
    >
      <div className="navbar-inner">
        <div
          onClick={() => scrollToSection('hero')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <img
            src={logoImg}
            alt="Delta Logo"
            style={{
              height: '38px',
              width: 'auto',
              objectFit: 'contain',
              filter: 'none',
              transition: 'filter 0.3s ease'
            }}
          />
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.92rem',
            fontWeight: '800',
            color: 'var(--t-nav-text-primary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }} className="brand-text">
            <span style={{ color: 'var(--red-accent)', fontWeight: 'bold' }}>//</span>
            <span style={{ color: 'var(--t-nav-text-muted)', fontSize: '0.72rem', fontWeight: '500' }}>Dev</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          <nav
            className="desktop-end-nav"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    position: 'relative',
                    padding: '0.45rem 0.85rem',
                    background: 'transparent',
                    border: 'none',
                    color: isActive ? 'var(--t-nav-text-primary)' : 'var(--t-nav-text-muted)',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '0.86rem',
                    fontWeight: isActive ? '700' : '400',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'var(--t-nav-tab-active-bg)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--t-nav-tab-active-border)',
                        borderRadius: '6px',
                        zIndex: -1
                      }}
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Creative Non-Glow Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <div className="theme-toggle-track">
              <span className={`toggle-track-icon dark ${theme === 'dark' ? 'active' : ''}`}>
                <FiMoon size={11} />
              </span>
              <span className={`toggle-track-icon light ${theme === 'light' ? 'active' : ''}`}>
                <FiSun size={11} />
              </span>
            </div>
            <div className="theme-toggle-knob">
              {theme === 'dark' ? <FiMoon size={11} /> : <FiSun size={11} />}
            </div>
          </button>

        </div>
      </div>

      {/* Mobile sub-navbar containing links, displayed below the main navbar header */}
      <div className="mobile-sub-navbar">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`mobile-sub-nav-item ${isActive ? 'active' : ''}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicatorMobile"
                  className="mobile-sub-nav-indicator"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
              {item.label}
            </button>
          );
        })}
      </div>

      <style>{`
        .site-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid var(--t-nav-border);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .navbar-inner {
          width: 100%;
          padding: 0 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .desktop-end-nav {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .mobile-sub-navbar {
          display: none;
        }

        @media (max-width: 960px) {
          .desktop-end-nav { display: none !important; }
          
          .mobile-sub-navbar {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            overflow-x: auto;
            padding: 0.5rem 1.25rem;
            border-top: 1px solid var(--t-nav-border);
            scrollbar-width: none;
            -ms-overflow-style: none;
            width: 100%;
          }
          
          .mobile-sub-navbar::-webkit-scrollbar {
            display: none;
          }

          .mobile-sub-nav-item {
            position: relative;
            padding: 0.4rem 0.75rem;
            background: transparent;
            border: none;
            color: var(--t-text-muted);
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.82rem;
            font-weight: 400;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s ease;
            white-space: nowrap;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-tap-highlight-color: transparent;
          }

          .mobile-sub-nav-item.active {
            color: var(--t-text-primary);
            font-weight: 700;
          }

          .mobile-sub-nav-indicator {
            position: absolute;
            inset: 0;
            background-color: var(--t-tab-active-bg);
            backdrop-filter: blur(8px);
            border: 1px solid var(--t-tab-active-border);
            border-radius: 6px;
            z-index: -1;
          }
        }

        @media (max-width: 768px) {
          .navbar-inner {
            padding: 0 1.25rem;
            height: 60px;
          }
        }

        @media (max-width: 600px) {
          .brand-text { display: none !important; }
        }
      `}</style>
    </motion.header>
  );
}

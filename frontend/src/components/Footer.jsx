import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiGithub, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';

export default function Footer() {
  const [showPhone, setShowPhone] = useState(false);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">

          <div className="footer-brand">
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: '800',
              fontSize: '1.05rem',
              color: 'var(--t-text-primary)',
              marginBottom: '0.25rem'
            }}>
              Powered by <span style={{ color: 'var(--red-accent)' }}>Delta AI</span>
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, monospace',
              fontSize: '0.74rem',
              color: 'var(--t-text-muted)'
            }}>
              © {new Date().getFullYear()} VAISHNAV SHINDE • DEV
            </div>
          </div>

          <div className="footer-links">
            <a
              href="https://github.com/vs227"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              <FiGithub size={16} />
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/vaishnav-shinde-815871260"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              <FiLinkedin size={16} color="var(--red-accent)" />
              <span>LinkedIn</span>
            </a>

            <a
              href="mailto:vaishnavshinde186@gmail.com"
              className="footer-link"
            >
              <FiMail size={16} />
              <span>Email</span>
            </a>

            <div
              className="footer-link"
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div onClick={() => setShowPhone(!showPhone)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiPhone size={16} />
                <span>Phone</span>
              </div>
              <AnimatePresence>
                {showPhone && (
                  <motion.a
                    href="tel:+919579437409"
                    className="phone-number-copiable"
                    initial={{ opacity: 0, x: -10, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, x: -10, width: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      marginLeft: '0.3rem',
                      color: 'var(--t-text-primary)',
                      fontWeight: '700',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--t-text-primary)'}
                  >
                    +91 9579437409
                  </motion.a>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className="footer-top-btn"
          >
            <span>Back to Top</span>
            <FiArrowUp size={15} color="var(--red-accent)" />
          </motion.button>

        </div>
      </div>

      <style>{`
        .site-footer {
          border-top: 1px solid var(--t-footer-border);
          background-color: var(--t-footer-bg);
          padding: 2.5rem 0 2rem 0;
          position: relative;
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .footer-link {
          color: var(--t-text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          text-decoration: none;
          font-family: 'Space Grotesk', sans-serif;
          transition: color 0.25s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .footer-link:active,
        .footer-link:hover {
          color: var(--red-accent);
        }

        .footer-top-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border-radius: 6px;
          background-color: var(--t-btn-ghost-bg);
          border: 1px solid var(--t-btn-ghost-border);
          color: var(--t-text-primary);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        @media (max-width: 768px) {
          .footer-inner {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.25rem;
          }

          .footer-brand {
            text-align: center;
          }

          .footer-links {
            justify-content: center;
            gap: 1rem;
          }

          .footer-top-btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 400px) {
          .footer-links {
            flex-direction: column;
            gap: 0.65rem;
          }
        }
      `}</style>
    </footer>
  );
}

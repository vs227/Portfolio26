import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiCheckCircle } from 'react-icons/fi';

const CERTS = [
  { name: 'AWS Academy Graduate', org: 'AWS Cloud Foundations', year: '2025', id: 'AWS-CF' },
  { name: 'Java Programming Masterclass', org: 'Udemy Certification', year: '2024', id: 'JV-MC' },
  { name: 'Networking Basics', org: 'Cisco Networking Academy', year: '2025', id: 'CS-NW' },
  { name: 'Web3 & Solidity Development', org: 'Udemy Blockchain', year: '2025', id: 'W3-SOL' },
  { name: 'Data Analyst Certification', org: 'Udemy Analytics', year: '2026', id: 'DA-ANA' }
];

export default function EducationSection() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <section
      id="education"
      className="education-section"
    >
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
      >

        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--t-text-primary)' }}>
            Verified <span className="gradient-title-white">Certifications</span>
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: '0.94rem' }}>
            Technical credentials, badges, and competencies verified by global authorities.
          </p>
        </div>

        <div className="certs-grid">
          {CERTS.map((cert, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <motion.div
                key={cert.id}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="master-glass-card cert-card"
                style={{
                  padding: '1.8rem 1.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isHovered ? '1px solid var(--red-accent)' : '1px solid var(--t-border-faint)',
                  boxShadow: isHovered ? '0 8px 25px rgba(255, 0, 60, 0.08)' : 'none',
                  backgroundColor: 'var(--t-card-bg-solid)',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: isHovered ? 'rgba(255, 0, 60, 0.05)' : 'var(--t-tag-bg)',
                      border: isHovered ? '1px solid rgba(255, 0, 60, 0.2)' : '1px solid var(--t-tag-border)',
                      color: isHovered ? 'var(--red-accent)' : 'var(--t-text-muted)',
                      transition: 'all 0.25s ease'
                    }}>
                      <FiAward size={16} />
                    </div>

                    <span style={{
                      fontFamily: 'Space Grotesk',
                      fontSize: '0.62rem',
                      color: isHovered ? 'var(--red-accent)' : 'var(--t-text-dim)',
                      fontWeight: '800',
                      letterSpacing: '0.04em',
                      transition: 'color 0.25s ease'
                    }}>
                      CRED_ID // {cert.id}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '800',
                    color: 'var(--t-text-primary)',
                    fontFamily: 'Space Grotesk',
                    lineHeight: 1.3,
                    marginBottom: '0.3rem'
                  }}>
                    {cert.name}
                  </h3>

                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--t-text-muted)',
                    fontFamily: 'Space Grotesk'
                  }}>
                    {cert.org}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--t-border-faint)',
                  paddingTop: '0.8rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--t-text-dim)', fontSize: '0.64rem', fontFamily: 'Space Grotesk', fontWeight: '800' }}>
                    <FiCheckCircle size={12} color={isHovered ? 'var(--red-accent)' : 'var(--t-text-dim)'} style={{ transition: 'color 0.25s ease' }} />
                    <span style={{ color: isHovered ? 'var(--t-text-primary)' : 'var(--t-text-dim)', transition: 'color 0.25s ease' }}>VERIFIED</span>
                  </div>

                  <span style={{
                    fontFamily: 'Space Grotesk',
                    fontSize: '0.68rem',
                    color: isHovered ? 'var(--red-accent)' : 'var(--t-text-muted)',
                    fontWeight: '700',
                    transition: 'color 0.25s ease'
                  }}>
                    [ #{cert.year} ]
                  </span>
                </div>

              </motion.div>
            );
          })}
        </div>

      </motion.div>

      <style>{`
        .education-section {
          position: relative;
          height: 100vh;
          min-height: 700px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 0;
          box-sizing: border-box;
          overflow: hidden;
        }

        .certs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }

        .cert-card {
          height: 180px;
        }

        @media (max-width: 768px) {
          .education-section {
            height: auto !important;
            min-height: auto !important;
            padding: 4rem 0 !important;
          }
          .education-section > .container {
            height: auto !important;
          }
          .certs-grid {
            grid-template-columns: 1fr !important;
          }
          .cert-card {
            height: auto !important;
            padding: 1.35rem 1.25rem !important;
          }
        }
      `}</style>
    </section>
  );
}

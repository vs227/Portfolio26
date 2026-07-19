import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiCalendar } from 'react-icons/fi';

const CONTRIBUTIONS = [
  {
    num: '01',
    title: 'Node.js Backend Engine',
    desc: 'Developed core server-side business logic and structures, building event-driven backend services.',
    tech: 'Node.js / Express'
  },
  {
    num: '02',
    title: 'RESTful API Routing',
    desc: 'Designed clean endpoints, handling controller logic, payloads, and client route structures.',
    tech: 'REST APIs'
  },
  {
    num: '03',
    title: 'Testing & Git Pipeline',
    desc: 'Audited API route validation using Postman and synced development branches with Git.',
    tech: 'Postman / Git'
  }
];

export default function ExperienceSection() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section id="experience" className="section-padding experience-section">
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2 }}
      >

        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 4rem auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '1rem', color: 'var(--t-text-primary)' }}>
            Professional <span className="gradient-title-white">Experience</span>
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: '1.02rem' }}>
            A clean breakdown of my contributions during my software developer internship.
          </p>
        </div>

        <div className="experience-layout">

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <div style={{
              borderLeft: '2px solid var(--red-accent)',
              paddingLeft: '1.5rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem'
            }}>
              <span style={{
                fontFamily: 'Space Grotesk',
                fontSize: '0.74rem',
                color: 'var(--red-accent)',
                fontWeight: '800',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                SOFTWARE DEVELOPER INTERN
              </span>

              <h3 style={{
                fontSize: '1.9rem',
                fontWeight: '700',
                color: 'var(--t-text-primary)',
                fontFamily: 'Space Grotesk',
                marginBottom: '1rem'
              }}>
                ITDevHub Technologies
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                color: 'var(--t-text-muted)',
                fontSize: '0.88rem',
                fontFamily: 'Space Grotesk'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiMapPin size={14} color="var(--t-text-muted)" />
                  <span>Pune, India</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiCalendar size={14} color="var(--t-text-muted)" />
                  <span>June - July 2025</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.2rem'
          }}>
            <div style={{
              position: 'absolute',
              top: '8px',
              bottom: '8px',
              left: '11px',
              width: '1px',
              backgroundColor: 'var(--t-experience-line)',
              zIndex: 1
            }} />

            {CONTRIBUTIONS.map((item, idx) => {
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={item.num}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    position: 'relative',
                    paddingLeft: '2.5rem',
                    zIndex: 2,
                    cursor: 'default'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: '6px',
                    top: '6px',
                    width: '11px',
                    height: '11px',
                    borderRadius: '50%',
                    backgroundColor: isHovered ? 'var(--red-accent)' : 'var(--t-experience-dot-bg)',
                    border: isHovered ? '2px solid var(--red-accent)' : '1px solid var(--t-border-strong)',
                    boxShadow: isHovered ? '0 0 8px var(--red-accent)' : 'none',
                    transition: 'all 0.25s ease',
                    zIndex: 3
                  }} />

                  <motion.div
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{
                        fontFamily: 'Space Grotesk',
                        fontSize: '0.72rem',
                        color: isHovered ? 'var(--red-accent)' : 'var(--t-text-dim)',
                        fontWeight: '700',
                        transition: 'color 0.25s ease'
                      }}>
                        PHASE {item.num}
                      </span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--t-border-strong)' }}>//</span>
                      <span style={{
                        fontFamily: 'Space Grotesk',
                        fontSize: '0.7rem',
                        color: 'var(--t-text-muted)',
                        fontWeight: '600'
                      }}>
                        {item.tech}
                      </span>
                    </div>

                    <h4 style={{
                      fontSize: '1.15rem',
                      fontWeight: '700',
                      color: isHovered ? 'var(--red-accent)' : 'var(--t-text-primary)',
                      fontFamily: 'Space Grotesk',
                      marginBottom: '0.45rem',
                      transition: 'color 0.25s ease'
                    }}>
                      {item.title}
                    </h4>

                    <p style={{
                      color: 'var(--t-text-muted)',
                      fontSize: '0.94rem',
                      lineHeight: 1.55
                    }}>
                      {item.desc}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>

        </div>

      </motion.div>

      <style>{`
        .experience-section {
          position: relative;
          overflow: hidden;
        }

        .experience-layout {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
          max-width: 900px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .experience-layout {
            grid-template-columns: 1fr !important;
            gap: 2rem;
          }
        }
      `}</style>
    </section>
  );
}

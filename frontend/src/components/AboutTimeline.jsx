import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiMapPin, FiAward, FiCpu } from 'react-icons/fi';

const ROADMAP_ITEMS = [
  {
    id: 2,
    year: '2021',
    period: 'Completed 2021',
    title: 'SSC (10th Standard)',
    org: "Blossom Children's Academy, Wai",
    stat: '90.80%',
    type: 'Secondary Education',
    desc: 'Completed secondary education with top-tier marks, establishing a strong base in science, mathematics, and logic.',
    tags: ['Science', 'Mathematics', 'Logic'],
    icon: <FiBookOpen size={15} />,
    accent: '#888890',
    lineStyle: 'start'
  },
  {
    id: 1,
    year: '2023',
    period: 'Completed 2023',
    title: 'HSC (12th Science)',
    org: 'Kalasagar Jr. College, Wai',
    stat: '64.00%',
    type: 'Higher Secondary',
    desc: 'Higher secondary education with focused coursework in Physics, Chemistry, Mathematics, and Computer Science.',
    tags: ['Physics', 'Chemistry', 'Mathematics'],
    icon: <FiBookOpen size={15} />,
    accent: '#888890',
    lineStyle: 'middle'
  },
  {
    id: 0,
    year: '2023 - 2027',
    period: 'Ongoing Education',
    title: 'BTech CSE',
    org: 'MIT ADT University, Pune',
    stat: 'CGPA 8.22',
    type: 'Undergraduate',
    desc: 'Deep study of Data Structures, Algorithms, FastAPI development, database systems, and modern AI/RAG architectures.',
    tags: ['DSA', 'FastAPI', 'RAG Systems', 'DBMS'],
    icon: <FiBookOpen size={15} />,
    accent: '#FF003C',
    lineStyle: 'end'
  }
];

export default function AboutTimeline() {
  return (
    <section
      id="about"
      className="about-section"
    >
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', position: 'relative', zIndex: 2 }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--t-text-primary)' }}>
            Academic <span className="gradient-title-white">Journey</span>
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: '0.94rem' }}>
            A chronological timeline of my academic milestones and qualifications.
          </p>
        </div>

        <div className="timeline-grid">

          {ROADMAP_ITEMS.map((item, idx) => {
            const isBTech = item.id === 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >

                <div style={{
                  fontFamily: 'Space Grotesk',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  color: isBTech ? 'var(--red-accent)' : 'var(--t-text-muted)',
                  marginBottom: '0.75rem',
                  letterSpacing: '0.04em'
                }}>
                  {item.year}
                </div>

                <div className="timeline-connector-area">

                  {(item.lineStyle === 'middle' || item.lineStyle === 'end') && (
                    <div className="timeline-line-left" />
                  )}

                  {(item.lineStyle === 'start' || item.lineStyle === 'middle') && (
                    <div className="timeline-line-right" />
                  )}

                  {isBTech && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: '50%',
                      height: '2px',
                      background: `linear-gradient(90deg, var(--t-experience-line), var(--red-accent))`,
                      zIndex: 1
                    }} />
                  )}

                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--t-timeline-node-bg)',
                    border: `2px solid ${isBTech ? 'var(--red-accent)' : 'var(--t-border-strong)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isBTech ? 'var(--red-accent)' : 'var(--t-text-muted)',
                    boxShadow: isBTech ? '0 0 12px rgba(255, 0, 60, 0.35)' : 'none',
                    zIndex: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}>
                    {item.icon}
                  </div>
                </div>

                <div
                  className="master-glass-card timeline-card"
                  style={{
                    padding: '1.25rem 1.4rem',
                    border: isBTech ? '1px solid rgba(255, 0, 60, 0.2)' : '1px solid var(--t-border-faint)',
                    boxShadow: isBTech ? '0 5px 15px rgba(255, 0, 60, 0.02)' : 'none',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      color: isBTech ? 'var(--red-accent)' : 'var(--t-text-dim)',
                      fontFamily: 'Space Grotesk',
                      letterSpacing: '0.04em'
                    }}>
                      {item.type.toUpperCase()}
                    </span>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.66rem',
                      fontWeight: '700',
                      color: 'var(--t-text-primary)',
                      backgroundColor: 'var(--t-tag-bg)',
                      border: '1px solid var(--t-tag-border)',
                      borderRadius: '4px',
                      padding: '0.15rem 0.4rem'
                    }}>
                      <FiAward size={10} color="var(--red-accent)" />
                      <span>{item.stat}</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--t-text-primary)', marginBottom: '0.35rem', fontFamily: 'Space Grotesk', lineHeight: 1.25 }}>
                    {item.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--t-text-muted)', marginBottom: '0.75rem' }}>
                    <FiMapPin size={11} color="var(--red-accent)" />
                    <span>{item.org}</span>
                  </div>

                  <p className="timeline-card-desc" style={{ color: 'var(--t-text-muted)', fontSize: '0.84rem', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                    {item.desc}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.58rem', fontWeight: '800', color: 'var(--t-text-dim)', marginRight: '0.15rem' }}>
                      <FiCpu size={9} color="var(--red-accent)" />
                      <span>FOCUS:</span>
                    </div>
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.62rem',
                          color: 'var(--t-text-primary)',
                          backgroundColor: 'var(--t-tag-bg)',
                          border: '1px solid var(--t-tag-border)',
                          borderRadius: '4px',
                          padding: '0.1rem 0.35rem'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>

              </motion.div>
            );
          })}
        </div>

      </motion.div>

      <style>{`
        .about-section {
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

        .timeline-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          position: relative;
        }

        .timeline-connector-area {
          position: relative;
          width: 100%;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .timeline-line-left {
          position: absolute;
          left: 0;
          right: 50%;
          height: 2px;
          background-color: var(--t-experience-line);
          z-index: 1;
        }

        .timeline-line-right {
          position: absolute;
          left: 50%;
          right: 0;
          height: 2px;
          background-color: var(--t-experience-line);
          z-index: 1;
        }

        .timeline-card {
          width: 90%;
        }

        @media (max-width: 900px) {
          .about-section {
            height: auto;
            min-height: auto;
            padding: 4rem 0;
          }

          .timeline-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }

          .timeline-grid > div {
            align-items: flex-start !important;
            text-align: left !important;
          }

          .timeline-card {
            width: 100% !important;
          }

          .timeline-connector-area {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .timeline-card-desc {
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </section>
  );
}

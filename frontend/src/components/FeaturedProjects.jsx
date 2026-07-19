import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGithub } from 'react-icons/fi';

const PROJECTS = [
  {
    id: 'job-aggregator',
    title: 'Job Aggregator Platform',
    category: 'AI & Backend Systems',
    desc: 'Asynchronous scrapers with vector-indexed RAG embeddings and LLM resume scoring.',
    tech: ['FastAPI', 'Supabase', 'RAG', 'Python'],
    github: 'https://github.com/vs227/Job_Aggregator'
  },
  {
    id: 'health-storage',
    title: 'Decentralized Health Storage',
    category: 'Blockchain & Privacy',
    desc: 'Decentralized patient medical data record vaults built with IPFS and secure smart contracts.',
    tech: ['Solidity', 'IPFS', 'Ethereum', 'Aadhaar Auth'],
    github: 'https://github.com/vs227/Blockchain_Healthcare'
  },
  {
    id: 'financial-predictor',
    title: 'Adaptive Market Model',
    category: 'Machine Learning & Quant',
    desc: 'Historical market price action training pipeline with automated backtesting strategies.',
    tech: ['Python', 'TensorFlow', 'Pandas', 'Strategy'],
    github: 'https://github.com/vs227/ML_forex_Framework'
  },
  {
    id: 'intrusion-detection',
    title: 'Intelligent Intrusion Detection',
    category: 'Cybersecurity & ML',
    desc: 'Network intrusion detection and traffic anomaly identification using neural networks.',
    tech: ['Python', 'TensorFlow', 'Wireshark', 'Pandas'],
    github: 'https://github.com/vs227/Intrusion'
  }
];

export default function FeaturedProjects() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section
      id="projects"
      className="projects-section"
    >
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
      >

        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--t-text-primary)' }}>
            Featured <span className="gradient-title-white">Projects</span>
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: '0.94rem' }}>
            Production-ready backend architectures, machine learning models, and security systems.
          </p>
        </div>

        <div className="projects-2x2-grid">
          {PROJECTS.map((proj) => {
            const isHovered = hoveredId === proj.id;

            return (
              <motion.div
                key={proj.id}
                onMouseEnter={() => setHoveredId(proj.id)}
                onMouseLeave={() => setHoveredId(null)}
                animate={{
                  y: isHovered ? -5 : 0,
                  borderColor: isHovered ? 'var(--red-accent)' : 'var(--t-border-faint)',
                  boxShadow: isHovered ? '0 12px 30px rgba(255, 0, 60, 0.08)' : 'none'
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="master-glass-card"
                style={{
                  padding: '1.85rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--t-card-bg-solid)',
                  position: 'relative',
                  boxSizing: 'border-box',
                  border: '1px solid var(--t-border-faint)'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.66rem',
                    color: 'var(--red-accent)',
                    fontFamily: 'Space Grotesk',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem'
                  }}>
                    {proj.category}
                  </div>

                  <h3 style={{
                    fontSize: '1.35rem',
                    fontWeight: '800',
                    color: 'var(--t-text-primary)',
                    fontFamily: 'Space Grotesk',
                    marginBottom: '0.6rem',
                    lineHeight: 1.25
                  }}>
                    {proj.title}
                  </h3>

                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--t-text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '1.5rem'
                  }}>
                    {proj.desc}
                  </p>
                </div>

                <div className="project-card-footer">
                  <div className="project-tech-list">
                    {proj.tech.join('  •  ')}
                  </div>

                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: isHovered ? 'var(--red-accent)' : 'var(--t-text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <FiGithub size={17} />
                  </a>
                </div>

              </motion.div>
            );
          })}
        </div>

      </motion.div>

      <style>{`
        .projects-section {
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

        .projects-2x2-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
          align-items: stretch;
        }

        .project-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--t-separator);
          padding-top: 0.95rem;
          margin-top: auto;
          gap: 0.75rem;
        }

        .project-tech-list {
          font-size: 0.74rem;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--t-text-muted);
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        @media (max-width: 960px) {
          .projects-section {
            height: auto !important;
            min-height: auto !important;
            padding: 4rem 0 !important;
          }
          .projects-section > .container {
            height: auto !important;
          }
          .projects-2x2-grid {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
        }

        @media (max-width: 480px) {
          .projects-2x2-grid .master-glass-card {
            padding: 1.25rem 1.15rem !important;
          }
          .project-tech-list {
            font-size: 0.68rem;
          }
        }
      `}</style>
    </section>
  );
}

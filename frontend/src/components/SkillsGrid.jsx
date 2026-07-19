import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SiPython, SiJavascript, SiReact, SiFastapi, SiNodedotjs, SiExpress,
  SiPostgresql, SiMongodb, SiDocker, SiGit, SiGithub,
  SiLangchain, SiSolidity, SiIpfs, SiHtml5, SiPostman, SiBootstrap, SiMysql
} from 'react-icons/si';
import { FaJava, FaBrain, FaDatabase, FaExchangeAlt, FaCss3Alt } from 'react-icons/fa';
import { TbBrandOpenai } from 'react-icons/tb';

const SKILLS = [
  { name: 'RAG Engine', category: 'AI & Blockchain', catId: 'ai', icon: <FaBrain size={18} />, code: 'AI // RAG-01' },
  { name: 'LangChain', category: 'AI & Blockchain', catId: 'ai', icon: <SiLangchain size={18} />, code: 'AI // LC-02' },
  { name: 'Prompt Eng.', category: 'AI & Blockchain', catId: 'ai', icon: <TbBrandOpenai size={18} />, code: 'AI // PR-03' },
  { name: 'IPFS Storage', category: 'AI & Blockchain', catId: 'ai', icon: <SiIpfs size={18} />, code: 'W3 // IPFS' },

  { name: 'Python', category: 'Programming & Backend', catId: 'backend', icon: <SiPython size={18} />, code: 'STK // PY-3' },
  { name: 'JavaScript', category: 'Programming & Backend', catId: 'backend', icon: <SiJavascript size={18} />, code: 'STK // JS-6' },
  { name: 'FastAPI', category: 'Backend & APIs', catId: 'backend', icon: <SiFastapi size={18} />, code: 'API // FA-09' },
  { name: 'Node.js', category: 'Backend & APIs', catId: 'backend', icon: <SiNodedotjs size={18} />, code: 'API // NO-11' },
  { name: 'Java', category: 'Programming & Backend', catId: 'backend', icon: <FaJava size={18} />, code: 'STK // JV-8' },
  { name: 'Solidity', category: 'Programming & Backend', catId: 'backend', icon: <SiSolidity size={18} />, code: 'W3 // SOL' },
  { name: 'Express.js', category: 'Backend & APIs', catId: 'backend', icon: <SiExpress size={18} />, code: 'API // EX-12' },
  { name: 'REST APIs', category: 'Backend & APIs', catId: 'backend', icon: <FaExchangeAlt size={18} />, code: 'API // REST' },

  { name: 'PostgreSQL', category: 'Databases', catId: 'databases', icon: <SiPostgresql size={18} />, code: 'DB // PG-SQL' },
  { name: 'MongoDB', category: 'Databases', catId: 'databases', icon: <SiMongodb size={18} />, code: 'DB // MG-NOSQ' },
  { name: 'MySQL', category: 'Databases', catId: 'databases', icon: <SiMysql size={18} />, code: 'DB // MY-SQL' },
  { name: 'SQL', category: 'Databases', catId: 'databases', icon: <FaDatabase size={18} />, code: 'DB // SQL-Q' },

  { name: 'React.js', category: 'Frontend', catId: 'frontend', icon: <SiReact size={18} />, code: 'UI // RE-ACT' },
  { name: 'HTML5', category: 'Frontend', catId: 'frontend', icon: <SiHtml5 size={18} />, code: 'UI // HTML-5' },
  { name: 'CSS3', category: 'Frontend', catId: 'frontend', icon: <FaCss3Alt size={18} />, code: 'UI // CSS-3' },
  { name: 'Bootstrap', category: 'Frontend', catId: 'frontend', icon: <SiBootstrap size={18} />, code: 'UI // BSTRAP' },

  { name: 'Git', category: 'Tools & Concepts', catId: 'tools', icon: <SiGit size={18} />, code: 'SYS // GIT-VC' },
  { name: 'GitHub', category: 'Tools & Concepts', catId: 'tools', icon: <SiGithub size={18} />, code: 'SYS // GITHUB' },
  { name: 'Postman', category: 'Tools & Concepts', catId: 'tools', icon: <SiPostman size={18} />, code: 'SYS // PM-TST' },
  { name: 'Docker', category: 'Tools & Concepts', catId: 'tools', icon: <SiDocker size={18} />, code: 'SYS // DK-CON' }
];

const CATEGORIES = [
  { id: 'all', name: 'ALL STACK' },
  { id: 'backend', name: 'BACKEND' },
  { id: 'ai', name: 'AI & WEB3' },
  { id: 'databases', name: 'DATABASES' },
  { id: 'frontend', name: 'FRONTEND' },
  { id: 'tools', name: 'DEV TOOLS' }
];

export default function SkillsGrid() {
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsExpanded(false);
  }, [activeTab]);

  const filteredSkills = activeTab === 'all'
    ? SKILLS
    : SKILLS.filter(s => s.catId === activeTab);

  const displayedSkills = (isMobile && !isExpanded)
    ? filteredSkills.slice(0, 8)
    : filteredSkills;

  return (
    <section id="skills" className="section-padding skills-section">
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 2 }}
      >

        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '1rem', color: 'var(--t-text-primary)' }}>
            Skills & <span className="gradient-title-white">Capabilities</span>
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: '1.02rem' }}>
            System nodes and stack coordinates powering my backend modules.
          </p>
        </div>

        <div className="skills-category-bar">
          {CATEGORIES.map((cat) => {
            const isSelected = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`skills-cat-btn ${isSelected ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="skills-grid-wrapper">
          <motion.div
            layout
            className="skills-grid"
          >
            <AnimatePresence mode="popLayout">
              {displayedSkills.map((skill) => {
              const isHovered = hoveredSkill === skill.name;
              return (
                <motion.div
                  layout
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 6 }}
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  className="master-glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    border: isHovered ? '1px solid var(--red-accent)' : '1px solid var(--t-border-faint)',
                    boxShadow: isHovered ? '0 8px 25px rgba(255, 0, 60, 0.12)' : 'none',
                    cursor: 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(255, 0, 60, 0.05) 0%, transparent 80%)',
                    opacity: isHovered ? 1 : 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.25s ease',
                    zIndex: 1
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', position: 'relative', zIndex: 2 }}>
                    <span style={{
                      fontSize: '0.58rem',
                      color: isHovered ? 'var(--t-text-muted)' : 'var(--t-text-dim)',
                      fontWeight: '700',
                      fontFamily: 'Space Grotesk',
                      letterSpacing: '0.04em',
                      transition: 'color 0.25s ease'
                    }}>
                      {skill.code}
                    </span>
                    <span style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: isHovered ? 'var(--red-accent)' : 'var(--t-dot-default)',
                      boxShadow: isHovered ? '0 0 6px var(--red-accent)' : 'none',
                      transition: 'all 0.25s ease'
                    }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', position: 'relative', zIndex: 2 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isHovered ? 'var(--red-accent)' : 'var(--t-skill-icon)',
                      transition: 'color 0.25s ease'
                    }}>
                      {skill.icon}
                    </div>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: isHovered ? 'var(--t-text-primary)' : 'var(--t-skill-name)',
                      fontFamily: 'Space Grotesk, sans-serif',
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'color 0.25s ease'
                    }}>
                      {skill.name}
                    </span>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
          </motion.div>
          {isMobile && !isExpanded && filteredSkills.length > 8 && (
            <div className="skills-grid-overlay" />
          )}
        </div>

        {isMobile && filteredSkills.length > 8 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="skills-expand-btn"
            >
              {isExpanded ? 'Show Less' : `Show More (+${filteredSkills.length - 8})`}
            </button>
          </div>
        )}

      </motion.div>

      <style>{`
        .skills-section {
          position: relative;
          overflow: hidden;
        }

        .skills-category-bar {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.55rem;
          margin-bottom: 3.5rem;
        }

        .skills-cat-btn {
          padding: 0.5rem 1.15rem;
          border-radius: 6px;
          background-color: var(--t-category-btn-bg);
          border: 1px solid var(--t-border);
          color: var(--t-text-muted);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.84rem;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          min-height: 40px;
        }

        .skills-cat-btn.active {
          background-color: var(--t-btn-primary-bg);
          border: none;
          color: var(--t-btn-primary-text);
          font-weight: 800;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
        }

        .skills-grid-wrapper {
          position: relative;
        }

        .skills-grid-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          background: linear-gradient(to top, var(--t-bg) 0%, transparent 100%);
          pointer-events: none;
          z-index: 5;
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 1rem;
        }

        .skills-expand-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem 1.75rem;
          border-radius: 8px;
          background: transparent;
          border: 1px solid var(--red-accent);
          color: var(--red-accent);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          outline: none;
          margin-top: 2rem;
          box-shadow: 0 0 12px rgba(255, 0, 60, 0.1);
        }

        .skills-expand-btn:hover {
          background-color: var(--red-accent);
          color: #FFFFFF;
          box-shadow: 0 0 20px rgba(255, 0, 60, 0.35);
        }

        @media (max-width: 768px) {
          .skills-category-bar {
            gap: 0.4rem;
            margin-bottom: 2.5rem;
          }
          .skills-cat-btn {
            padding: 0.45rem 0.85rem;
            font-size: 0.78rem;
          }
          .skills-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.75rem;
          }
        }

        @media (max-width: 400px) {
          .skills-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.6rem;
          }
        }
      `}</style>
    </section>
  );
}

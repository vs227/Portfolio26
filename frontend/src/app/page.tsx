"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, MoveRight, Plus, Moon, Sun } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroll from "@/components/SmoothScroll";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import AiAssistant from "@/components/AiAssistant";
import ContactForm from "@/components/ContactForm";
import { trackVisitor } from "@/utils/visitorTracker";

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { number: "01", title: "Market Pattern Model", kind: "Machine learning / Forecasting", description: "Historical market-data training, strategy-based pattern analysis, retest logic and backtesting for signal evaluation.", github: "https://github.com/vs227/ML_forex_Framework" },
  { number: "02", title: "Job Aggregator", kind: "FastAPI / Supabase / RAG", description: "Multi-source job aggregation with AI-powered resume matching and personalised job recommendations.", github: "https://github.com/vs227/Job_Aggregator" },
  { number: "03", title: "Portfolio RAG", kind: "LangChain / FastAPI", description: "A retrieval-augmented assistant that answers questions about my experience, projects and technical stack.", github: "https://github.com/vs227/Portfolio26" },
  { number: "04", title: "Health Data Storage", kind: "IPFS / Solidity", description: "Decentralized patient-data storage with Aadhaar verification and blockchain hash logging for integrity and access control.", github: "https://github.com/vs227/Blockchain_Healthcare" },
  { number: "05", title: "Intrusion Detection", kind: "ML / Network Security", description: "Machine learning-based network intrusion detection system for identifying and classifying malicious traffic patterns.", github: "https://github.com/vs227/Intrusion" },
];

const capabilities = [
  ["01", "Intelligent systems", "RAG pipelines, retrieval logic, model interfaces and AI experiences that make complex information useful."],
  ["02", "Reliable backend", "APIs and data services engineered with Python, FastAPI, Node.js, Express, PostgreSQL and thoughtful architecture."],
  ["03", "Private by design", "Blockchain and IPFS work for systems where control, traceability and privacy are part of the product."],
];

function MagneticLink({ children, href, className = "" }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });
  return <motion.a ref={ref} href={href} style={{ x: sx, y: sy }} className={className}
    onMouseMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (r) { x.set((e.clientX - r.left - r.width / 2) * .14); y.set((e.clientY - r.top - r.height / 2) * .14); } }}
    onMouseLeave={() => { x.set(0); y.set(0); }}>{children}</motion.a>;
}

function SectionIntro({ index, eyebrow, title }: { index: string; eyebrow: string; title: string }) {
  return <div className="section-intro reveal">
    <span className="section-index">({index})</span><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>
  </div>;
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setLoaded(true);
    trackVisitor();
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              end: "bottom top",
              toggleActions: "play reverse play reverse"
            }
          }
        );
      });
      gsap.utils.toArray<HTMLElement>(".project-row").forEach((element) => {
        gsap.fromTo(
          element,
          { clipPath: "inset(0 0 100% 0)", opacity: 0 },
          {
            clipPath: "inset(0 0 0% 0)",
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              end: "bottom top",
              toggleActions: "play reverse play reverse"
            }
          }
        );
      });

      const sectionsColorMap = [
        { selector: ".hero", color: "#e9ff6c" },
        { selector: "#work", color: "#ff7054" },
        { selector: "#about", color: "#c1bdff" },
        { selector: "#experience", color: "#ff7054" },
        { selector: "#academics", color: "#e9ff6c" },
        { selector: "#certifications", color: "#73a6fc" },
        { selector: "#contact", color: "#ff7054" }
      ];

      sectionsColorMap.forEach(({ selector, color }) => {
        ScrollTrigger.create({
          trigger: selector,
          start: "top 50%",
          end: "bottom 50%",
          onEnter: () => {
            document.documentElement.style.setProperty("--dynamic-accent", color);
          },
          onEnterBack: () => {
            document.documentElement.style.setProperty("--dynamic-accent", color);
          },
          onRefresh: (self) => {
            if (self.isActive) {
              document.documentElement.style.setProperty("--dynamic-accent", color);
            }
          }
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return <SmoothScroll>
    <main className={darkMode ? "theme-dark" : ""}>
      <motion.div className="intro-screen" animate={loaded ? { y: "-100%" } : { y: 0 }} transition={{ delay: .45, duration: 1.1, ease: [0.76, 0, .24, 1] }}><span>VS / 2026</span><span>Loading field</span></motion.div>
      <nav className="nav"><a href="#top" className="brand" style={{ display: "flex", alignItems: "center" }}><Image src="/logo.png" alt="VS Logo" width={96} height={32} className="brand-logo" priority /></a><div className="nav-links"><a href="#work">PROJECTS</a><a href="#about">Profile</a><a href="#experience">Experience</a><a href="#academics">Academics</a><a href="#certifications">Certifications</a><a href="#contact">Contact</a></div><a href="/Vaishnav_Shinde_Resume12.pdf" target="_blank" rel="noreferrer" className="theme-toggle" aria-label="Download Resume"><Plus size={15} /><span>Resume</span></a><button onClick={() => setMenu(!menu)} className="menu-button" aria-label="Toggle navigation"><span /> <span /></button></nav>
      {menu && <div className="mobile-menu"><a onClick={() => setMenu(false)} href="#work">PROJECTS</a><a onClick={() => setMenu(false)} href="#about">Profile</a><a onClick={() => setMenu(false)} href="#experience">Experience</a><a onClick={() => setMenu(false)} href="#academics">Academics</a><a onClick={() => setMenu(false)} href="#certifications">Certifications</a><a onClick={() => setMenu(false)} href="#contact">Contact</a></div>}

      <section id="top" className="hero">
        <div className="hero-field"><i className="orb orb-one" /><i className="orb orb-two" /><i className="orbit orbit-a" /><i className="orbit orbit-b" /><span className="field-grid" /></div>
        <div className="hero-copy"><motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25 }} className="hero-kicker">Full stack developer</motion.p>
          <h1 className="name-hero"><span className="line-mask"><motion.span initial={{ y: "115%" }} animate={{ y: 0 }} transition={{ delay: .82, duration: 1.1, ease: [0.16, 1, .3, 1] }}>Vaishnav</motion.span></span><span className="line-mask italic-line"><motion.span initial={{ y: "115%" }} animate={{ y: 0 }} transition={{ delay: .98, duration: 1.1, ease: [0.16, 1, .3, 1] }}>Shinde.</motion.span></span></h1>
          <motion.div className="hero-bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}><p className="italic-line" style={{ fontStyle: "italic", fontSize: "clamp(1.2rem, 2.2vw, 1.8rem)", letterSpacing: "-0.03em", margin: "0.2rem 0 1rem", color: "inherit" }}>BTech CSE</p><MagneticLink href="#work" className="round-link">Explore work <ArrowDownRight size={18} /></MagneticLink></motion.div>
        </div><a className="scroll-callout" href="#work"><span>Scroll to unfold</span><i /></a>
      </section>

      <section className="statement"><p className="reveal">I design the <em>invisible machinery</em> behind products that deserve to feel inevitable.</p><div className="statement-meta reveal"><span>01 — Practice</span><span>Software / AI / Web3</span></div></section>

      <section id="work" className="work section-shell"><SectionIntro index="02" eyebrow="Selected systems" title="Work with a pulse." /><div className="projects">
        {projects.map((project) => <article key={project.title} className="project-row project-panel"><span className="project-number">{project.number}</span><div className="project-signal"><i /><i /><i /></div><div className="project-detail"><p>{project.kind}</p><h3>{project.title}</h3><p className="project-desc">{project.description}</p></div><a href={project.github} target="_blank" rel="noreferrer" className="project-github">GitHub <ArrowUpRight /></a></article>)}
      </div><div className="work-end reveal"><span>Five focused explorations.</span><span>More prototypes and experiments in progress.</span></div></section>

      <section className="capabilities section-shell"><SectionIntro index="03" eyebrow="How I contribute" title="Technical, but never cold." /><div className="cap-grid">{capabilities.map(([num, title, text]) => <article className="cap-card reveal" key={num}><span>{num}</span><h3>{title}</h3><p>{text}</p><div className="card-arc" /></article>)}</div></section>

      <section id="about" className="about"><div className="about-shape" /><div className="about-content"><SectionIntro index="04" eyebrow="Profile" title="Curious by default. Precise by practice." /><div className="about-grid"><p className="about-lede reveal">I’m completing a BTech in Computer Science at MIT ADT University, Pune, while translating complex ideas into clean, working software.</p><div className="about-facts reveal"><div><span>Current focus</span><strong>Full stack / AI / blockchain</strong></div><div><span>Experience</span><strong>Software Developer Intern<br />ITDevHub Technologies, 2025</strong></div><div><span>Foundation</span><strong>CGPA 8.22 / 10</strong></div></div></div><div className="skill-stream reveal">{["Java", "JavaScript", "Python", "Solidity", "SQL", "React", "FastAPI", "Node.js", "Express", "JWT", "PostgreSQL", "MySQL", "MongoDB", "Supabase", "RAG", "LangChain", "IPFS", "Docker", "Git", "Postman"].map(s => <span key={s}>{s}<i /></span>)}</div></div></section>

      <section id="experience" className="experience section-shell"><SectionIntro index="05" eyebrow="Professional experience" title="Applied practice." /><div className="timeline"><div className="timeline-line" /><article className="reveal"><span>Jun—Jul 2025</span><div><h3>Software Developer Intern</h3><p>ITDevHub Technologies, Pune · contributed to Node.js backend tasks and APIs, frontend development, debugging and collaborative workflows.</p></div></article></div></section>

      <section id="academics" className="trajectory section-shell"><SectionIntro index="06" eyebrow="Academic path" title="The path so far." /><div className="timeline"><div className="timeline-line" /><article className="reveal"><span>2021</span><div><h3>Secondary School</h3><p>Blossom Children’s Academy, Wai · SSC (10th), 90.80% · July 2021.</p></div></article><article className="reveal"><span>2023</span><div><h3>Higher Secondary School</h3><p>Kalasagar Academy and Junior College, Wai · HSC (12th Science), 64% · July 2023.</p></div></article><article className="reveal"><span>2023—2027</span><div><h3>BTech, Computer Science</h3><p>MIT ADT University, Pune · currently pursuing BTech CSE · expected August 2027 · CGPA 8.22 / 10.</p></div></article></div></section>

      <section id="certifications" className="credentials section-shell"><SectionIntro index="07" eyebrow="Certifications" title="Proof of practice." /><div className="credential-grid reveal"><span>Java Programming<br /><b>Udemy · 2024</b></span><span>Networking Basics<br /><b>Cisco · 2025</b></span><span>AWS Academy Graduate<br /><b>Cloud Foundation · 2025</b></span><span>Web3 Development<br /><b>Udemy · 2025</b></span><span>Data Analyst<br /><b>Udemy · 2026</b></span></div></section>
      <section id="contact" className="contact"><div className="contact-glow" /><p className="eyebrow reveal">08 / Let’s make it useful</p><h2 className="reveal">Have a difficult<br /><em>question?</em></h2><div className="contact-action reveal"><p>I’m always interested in systems with real stakes, clear purpose and room for thoughtful engineering.<br /><a className="contact-phone" href="tel:+919579437409">+91 95794 37409</a></p><ContactForm /></div><footer><span>© 2026 Vaishnav Shinde</span><div><a href="https://github.com/vs227" target="_blank" rel="noreferrer"><FiGithub size={16} /> Github</a><a href="https://www.linkedin.com/in/vaishnav-shinde-815871260" target="_blank" rel="noreferrer"><FiLinkedin size={16} /> LinkedIn</a><a href="/Vaishnav_Shinde_Resume12.pdf" target="_blank" rel="noreferrer"><Plus size={16} /> Resume</a></div></footer></section>
      <AiAssistant />
    </main>
  </SmoothScroll>;
}

"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiGithub, FiArrowUpRight } from "react-icons/fi";

const PROJECTS = [
  {
    id: "job-aggregator",
    title: "Job Aggregator Platform",
    category: "AI & Backend Systems",
    desc: "Asynchronous scrapers with vector-indexed RAG embeddings and LLM resume scoring.",
    tech: ["FastAPI", "Supabase", "RAG", "Python"],
    github: "https://github.com/vs227/Job_Aggregator",
    num: "01",
    img: "/project_job_aggregator.png"
  },
  {
    id: "health-storage",
    title: "Decentralized Health Storage",
    category: "Blockchain & Privacy",
    desc: "Decentralized patient medical data record vaults built with IPFS and secure smart contracts.",
    tech: ["Solidity", "IPFS", "Ethereum", "Aadhaar Auth"],
    github: "https://github.com/vs227/Blockchain_Healthcare",
    num: "02",
    img: "/project_health_storage.png"
  },
  {
    id: "financial-predictor",
    title: "Adaptive Market Model",
    category: "Machine Learning & Quant",
    desc: "Historical market price action training pipeline with automated backtesting strategies.",
    tech: ["Python", "TensorFlow", "Pandas", "Strategy"],
    github: "https://github.com/vs227/ML_forex_Framework",
    num: "03",
    img: "/project_market_model.png"
  },
  {
    id: "intrusion-detection",
    title: "Intelligent Intrusion Detection",
    category: "Cybersecurity & ML",
    desc: "Network intrusion detection and traffic anomaly identification using neural networks.",
    tech: ["Python", "TensorFlow", "Wireshark", "Pandas"],
    github: "https://github.com/vs227/Intrusion",
    num: "04",
    img: "/project_intrusion_detection.png"
  }
];

export default function HorizontalProjects() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Translate vertical scroll progress into horizontal displacement
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <div ref={targetRef} className="relative h-[300vh] bg-transparent">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden bg-neutral-950/20 backdrop-blur-3xl">
        {/* Section Title Header */}
        <div className="px-6 md:px-12 mb-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="font-mono text-xs text-neutral-400 tracking-[0.25em] uppercase mb-3 block">
              02 / SELECTED WORK
            </span>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight text-white">
              FEATURED <span className="text-neutral-500">PROJECTS</span>
            </h2>
          </div>
          <p className="text-neutral-400 text-xs md:text-sm max-w-xs font-mono uppercase tracking-widest text-neutral-500">
            [ scroll vertically to navigate horizontally ]
          </p>
        </div>

        {/* Moving track */}
        <div className="flex items-center">
          <motion.div style={{ x }} className="flex gap-8 pl-[calc(max(24px,100vw-1280px)/2+24px)] md:pl-[calc(max(48px,100vw-1280px)/2+48px)] pr-12">
            {PROJECTS.map((project) => (
              <motion.div
                key={project.id}
                data-cursor="view"
                className="relative w-[85vw] sm:w-[45vw] h-[55vh] flex-shrink-0 rounded-2xl border border-white/5 p-8 md:p-12 flex flex-col justify-between group overflow-hidden bg-black/60"
                whileHover={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Background image container with Zoom & Overlay */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-[#000000]/70 z-10 transition-colors duration-500 group-hover:bg-[#000000]/55" />
                  <motion.img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                  />
                </div>

                {/* Accent glow corner */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/2 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Info */}
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block mb-2">
                      {project.category}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider group-hover:text-neutral-300 transition-colors duration-300">
                      {project.title}
                    </h3>
                  </div>
                  <span className="font-sans font-black text-5xl md:text-7xl text-white/5 group-hover:text-white/10 transition-colors duration-300 select-none">
                    {project.num}
                  </span>
                </div>

                {/* Description & Tech */}
                <div className="mt-auto z-10">
                  <p className="text-neutral-400 text-sm md:text-base font-light leading-relaxed max-w-md mb-8">
                    {project.desc}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 bg-white/5 border border-white/5 rounded-full font-mono text-[10px] text-neutral-300 uppercase tracking-wider"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                      data-cursor="pointer"
                    >
                      <FiGithub size={14} /> VIEW REPOSITORY
                    </a>

                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                    >
                      <FiArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

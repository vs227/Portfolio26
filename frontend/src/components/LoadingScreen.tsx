"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += Math.floor(Math.random() * 6) + 2;
      if (start >= 100) {
        start = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(() => {
            onComplete();
          }, 600); // Allow fadeout animation time
        }, 400);
      }
      setProgress(start);
    }, 35);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[99999] flex flex-col justify-between bg-[#020202] p-8 md:p-16 select-none"
        >
          {/* Top Brand Name */}
          <div className="flex justify-between items-center w-full">
            <span className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase">
              VAISHNAV SHINDE — DEV PORTFOLIO
            </span>
            <span className="font-mono text-xs text-neutral-400 tracking-[0.2em] uppercase">
              [ STABLE BUILD v2.2.7 ]
            </span>
          </div>

          {/* Middle Cinematic Headline Reveal */}
          <div className="overflow-hidden my-auto max-w-4xl">
            <h1 className="text-[10vw] sm:text-[6vw] font-black uppercase leading-none tracking-tight text-white flex flex-wrap">
              {"VAISHNAV SHINDE".split("").map((letter, idx) => (
                <motion.span
                  key={idx}
                  initial={{ y: "100%", rotate: 3 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block origin-left mr-[0.02em]"
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 max-w-md mt-4 font-mono tracking-widest uppercase">
              ENGINEERING INTELLIGENT SYSTEMS & SCALABLE BACKEND ARCHITECTURES.
            </p>
          </div>

          {/* Bottom Count-up and Progress Bar */}
          <div className="w-full flex justify-between items-end">
            <div className="w-full max-w-[200px] h-[1px] bg-neutral-900 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="font-mono text-[8vw] sm:text-[5vw] font-bold text-white leading-none tabular-nums">
              {progress}%
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

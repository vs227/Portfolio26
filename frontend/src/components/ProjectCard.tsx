"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  link?: string;
  index: number;
}

export default function ProjectCard({ title, category, image, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Position of cursor relative to center of the card
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Convert mouse coordinates into rotation degrees (limit to ~10 deg max)
    const rX = -(mouseY / height) * 12;
    const rY = (mouseX / width) * 12;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="group relative cursor-pointer"
      data-cursor="view"
    >
      {/* 3D Tilt Wrapper */}
      <motion.div
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative overflow-hidden aspect-[4/3] rounded-lg bg-neutral-900 border border-neutral-800 transition-all duration-300"
      >
        {/* Animated Border/Glow Overlay */}
        <div
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 40%)`,
          }}
        />

        {/* Hover image mask zoom */}
        <motion.div
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover filter grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-90 transition-all duration-700"
          />
        </motion.div>

        {/* Info panel rising with depth */}
        <div
          style={{ transform: "translateZ(30px)" }}
          className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end"
        >
          <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-1">
            {category}
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">
            {title}
          </h3>
        </div>
      </motion.div>

      {/* Shadow layer below card with floating depth */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.3 : 0.1,
          scale: isHovered ? 0.95 : 0.9,
          y: isHovered ? 10 : 0,
        }}
        className="absolute inset-0 bg-black rounded-lg blur-xl -z-10 transition-all duration-300"
      />
    </motion.div>
  );
}

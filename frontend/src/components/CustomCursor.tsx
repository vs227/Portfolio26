"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CursorVariant {
  width: number;
  height: number;
  backgroundColor: string;
  borderRadius: string;
  border?: string;
  color?: string;
}

export default function CustomCursor() {
  const [cursorType, setCursorType] = useState<string>("default");
  const [cursorText, setCursorText] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 40, stiffness: 400, mass: 0.4 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return; // Hide custom cursor on mobile/touch screens

    setIsVisible(true);

    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check for links, buttons or data-cursor attributes
      const interactiveEl = target.closest("[data-cursor], a, button, [role='button']");
      
      if (interactiveEl) {
        const type = (interactiveEl as HTMLElement).getAttribute("data-cursor");
        if (type) {
          setCursorType(type);
          if (type === "view") setCursorText("VIEW");
          else if (type === "drag") setCursorText("DRAG");
          else if (type === "send") setCursorText("SEND");
        } else {
          setCursorType("pointer");
          setCursorText("");
        }
      } else {
        setCursorType("default");
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", moveMouse);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  // Variants based on hover states
  const variants: Record<string, CursorVariant> = {
    default: {
      width: 12,
      height: 12,
      backgroundColor: "#ffffff",
      borderRadius: "50%",
    },
    pointer: {
      width: 48,
      height: 48,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      borderRadius: "50%",
    },
    view: {
      width: 80,
      height: 80,
      backgroundColor: "#ffffff",
      borderRadius: "50%",
      color: "#020202",
    },
    drag: {
      width: 80,
      height: 80,
      backgroundColor: "#ffffff",
      borderRadius: "50%",
      color: "#020202",
    },
    send: {
      width: 80,
      height: 80,
      backgroundColor: "#ffffff",
      borderRadius: "50%",
      color: "#020202",
    }
  };

  const currentVariant = variants[cursorType] || variants.default;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        pointerEvents: "none",
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mixBlendMode: cursorType === "default" || cursorType === "pointer" ? "difference" : "normal",
      }}
      animate={{
        width: currentVariant.width,
        height: currentVariant.height,
        backgroundColor: currentVariant.backgroundColor,
        border: currentVariant.border || "none",
        borderRadius: currentVariant.borderRadius,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.2 }}
    >
      {cursorText && (
        <span
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#020202",
          }}
        >
          {cursorText}
        </span>
      )}
    </motion.div>
  );
}

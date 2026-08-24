"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Message = { role: "user" | "assistant"; content: string };
const welcome: Message = { role: "assistant", content: "Hi, I'm Vaishnav's portfolio assistant. Ask me about his projects, technical skills, internship, education, or how to get in touch." };
const defaultPrompts = ["What projects has Vaishnav built?", "What is his technical stack?", "Tell me about his internship."];

const placeholders = [
  "Ask about Vaishnav's projects…",
  "What tech stack does he use?",
  "Tell me about his internship…",
  "How can I contact Vaishnav?",
  "What has he built with AI?",
];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vanishFrameRef = useRef<number>(0);

  // ── ScrollTrigger to raise chat above footer ──
  useEffect(() => {
    const anim = gsap.to(".portfolio-chat", {
      y: -75,
      scrollTrigger: {
        trigger: "footer",
        start: "top bottom",
        end: "bottom bottom",
        scrub: true
      }
    });
    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  // ── Click outside handler to close chatbox ──
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open]);

  // ── Auto-scroll chat ──
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, open]);

  // ── Auto-focus input when panel opens or when response finishes typing ──
  useEffect(() => {
    if (open && !loading && !typing) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, loading, typing]);


  // ── Cycle placeholder text ──
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [open]);

  // ── Markdown renderer for assistant bubbles ──
  const renderContent = (msg: Message) => {
    if (msg.role === "user") return msg.content;
    return <ReactMarkdown>{msg.content}</ReactMarkdown>;
  };

  // ── Vanish animation: capture text pixels → animate particles ──
  const vanishAndSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    const inputEl = inputRef.current;
    if (!canvas || !inputEl || !input.trim() || animating) return;

    setAnimating(true);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) { setAnimating(false); return; }

    const rect = inputEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const computedStyle = getComputedStyle(inputEl);
    ctx.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.fillText(input, 0, rect.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const particles: { x: number; y: number; r: number; g: number; b: number; a: number; vx: number; vy: number; life: number }[] = [];
    const step = 2;

    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const i = (y * canvas.width + x) * 4;
        if (pixels[i + 3] > 30) {
          particles.push({
            x: x / dpr,
            y: y / dpr,
            r: pixels[i],
            g: pixels[i + 1],
            b: pixels[i + 2],
            a: 1,
            vx: (Math.random() - 0.5) * 1.5 + 0.8,
            vy: (Math.random() - 0.5) * 1.2 - 0.4,
            life: 1,
          });
        }
      }
    }

    const submittedText = input;
    setInput("");

    const decay = 0.008;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height);
      let alive = false;

      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;
        p.life -= decay;
        p.a = Math.max(0, p.life);

        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a})`;
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      }

      if (alive) {
        vanishFrameRef.current = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setAnimating(false);
      }
    };

    vanishFrameRef.current = requestAnimationFrame(animate);
    ask(submittedText);
  }, [input, animating]);

  useEffect(() => {
    return () => {
      if (vanishFrameRef.current) cancelAnimationFrame(vanishFrameRef.current);
    };
  }, []);

  const ask = async (question: string) => {
    const message = question.trim(); if (!message || loading || typing) return;
    const history = messages; setMessages((current) => [...current, { role: "user", content: message }]); setLoading(true);
    let responseText = "";
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${base}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history }) });
      if (response.status === 429) {
        const errData = await response.json().catch(() => ({}));
        responseText = errData.detail || "Rate limit reached. Please wait a moment before sending another message.";
      } else if (!response.ok) {
        throw new Error("RAG API unavailable");
      } else {
        const data = await response.json();
        responseText = data.response;
      }
    } catch {
      responseText = "The portfolio assistant is currently offline. You can still reach Vaishnav directly at vaishnavshinde186@gmail.com.";
    }

    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
    setLoading(false);
    setTyping(true);

    setMessages((current) => [...current, { role: "assistant", content: "" }]);
    let currentText = "";
    for (let i = 0; i < responseText.length; i++) {
      currentText += responseText[i];
      setMessages((current) => {
        const copy = [...current];
        if (copy.length > 0) {
          copy[copy.length - 1] = { role: "assistant", content: currentText };
        }
        return copy;
      });

      const char = responseText[i];
      let delay = 10;
      const rhythmicFactor = Math.sin(i / 4.0);
      delay += rhythmicFactor * 6;

      if (char === " ") {
        delay += Math.random() * 25 + 10;
      } else if (char === "," || char === "." || char === "?" || char === "!") {
        delay += Math.random() * 100 + 60;
      } else {
        delay += Math.random() * 8;
      }

      await new Promise((resolve) => setTimeout(resolve, Math.max(3, delay)));
    }
    setTyping(false);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || loading || typing || animating) return;
    vanishAndSubmit();
  };

  return (
    <div ref={containerRef} className="portfolio-chat">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, scale: 0.92, filter: "blur(12px)", transition: { duration: 0.22, ease: [0.32, 0.72, 0, 1] } }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="chat-panel"
            data-lenis-prevent
          >
            <header>
              <div><span>ASSISTANT</span></div>
              <button onClick={() => setOpen(false)} aria-label="Close assistant"><FiX /></button>
            </header>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                  {renderContent(message)}
                </div>
              ))}
              {loading && (
                <div className="chat-bubble assistant chat-loading">
                  <b /><b /><b />
                </div>
              )}
              <div ref={endRef} />
            </div>
            {messages.length === 1 && !loading && !typing && (
              <div className="chat-prompts">
                {defaultPrompts.map((prompt) => (
                  <button key={prompt} onClick={() => ask(prompt)}>{prompt}</button>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="chat-vanish-form">
              <div className="vanish-input-wrapper">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={loading || typing}
                  className={animating ? "vanish-hidden" : ""}
                />
                <canvas ref={canvasRef} className="vanish-canvas" />
                {!input && !animating && (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIndex}
                      className="vanish-placeholder"
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 0.45 }}
                      exit={{ y: -8, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {placeholders[placeholderIndex]}
                    </motion.span>
                  </AnimatePresence>
                )}
              </div>
              <button disabled={loading || typing || !input.trim()} aria-label="Send message"><FiSend /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      <motion.button
        className="chat-trigger"
        onClick={() => setOpen((value) => !value)}
        whileTap={{ scale: 0.94 }}
        aria-label="Open portfolio assistant"
      >
        {open ? <FiX /> : <FiMessageCircle />}
        <span>{open ? "Close" : "Ask Vaishnav's AI"}</span>
      </motion.button>
    </div>
  );
}
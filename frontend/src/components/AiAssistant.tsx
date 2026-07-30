"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Message = { role: "user" | "assistant"; content: string };
const welcome: Message = { role: "assistant", content: "Hi, I’m Vaishnav’s portfolio assistant. Ask me about his projects, technical skills, internship, education, or how to get in touch." };
const prompts = ["What projects has Vaishnav built?", "What is his technical stack?", "Tell me about his internship."];

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, open]);
  const ask = async (question: string) => {
    const message = question.trim(); if (!message || loading || typing) return;
    const history = messages; setMessages((current) => [...current, { role: "user", content: message }]); setInput(""); setLoading(true);
    let responseText = "";
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${base}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history }) });
      if (!response.ok) throw new Error("RAG API unavailable");
      const data = await response.json();
      responseText = data.response;
    } catch {
      responseText = "The portfolio assistant is currently offline. You can still reach Vaishnav directly at vaishnavshinde186@gmail.com.";
    }

    // Thinking delay to simulate natural cognition
    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
    setLoading(false);
    setTyping(true);

    // Type out response with variable speed
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
      const rhythmicFactor = Math.sin(i / 4.0); // Natural slow-fast-slow-fast typing rhythm
      delay += rhythmicFactor * 6;

      if (char === " ") {
        delay += Math.random() * 25 + 10; // Pause between words
      } else if (char === "," || char === "." || char === "?" || char === "!") {
        delay += Math.random() * 100 + 60; // Pause for punctuation marks
      } else {
        delay += Math.random() * 8; // Organic human hand jitter
      }

      await new Promise((resolve) => setTimeout(resolve, Math.max(3, delay)));
    }
    setTyping(false);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); ask(input); };

  return <div className="portfolio-chat">
    <AnimatePresence>{open && <motion.section initial={{ opacity: 0, y: 18, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: .96 }} transition={{ duration: .28 }} className="chat-panel" data-lenis-prevent>
      <header><div><span>ASSISTANT</span></div><button onClick={() => setOpen(false)} aria-label="Close assistant"><FiX /></button></header>
      <div className="chat-messages">{messages.map((message, index) => <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>{message.content}</div>)}{loading && <div className="chat-bubble assistant chat-loading"><b /><b /><b /></div>}<div ref={endRef} /></div>
      {messages.length === 1 && !loading && !typing && <div className="chat-prompts">{prompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)}>{prompt}</button>)}</div>}
      <form onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about Vaishnav…" disabled={loading || typing} /><button disabled={loading || typing || !input.trim()} aria-label="Send message"><FiSend /></button></form>
    </motion.section>}</AnimatePresence>
    <motion.button className="chat-trigger" onClick={() => setOpen((value) => !value)} whileTap={{ scale: .94 }} aria-label="Open portfolio assistant">{open ? <FiX /> : <FiMessageCircle />}<span>{open ? "Close" : "Ask Vaishnav’s AI"}</span></motion.button>
  </div>;
}
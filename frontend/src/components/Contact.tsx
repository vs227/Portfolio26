"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiCheckCircle, FiAlertTriangle, FiGithub, FiLinkedin, FiMail, FiPhone } from "react-icons/fi";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [statusState, setStatusState] = useState<"idle" | "sending" | "delivered" | "error">("idle");
  const [showPhone, setShowPhone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatusState("sending");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY",
          name: formData.name,
          email: formData.email,
          message: formData.message,
          from_name: "Vaishnav Shinde Portfolio",
          subject: `New Portfolio Inquiry from ${formData.name}`
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatusState("delivered");
      } else {
        setStatusState("error");
      }
    } catch (err) {
      console.error("Form transmission error:", err);
      setStatusState("error");
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 bg-[#020202] relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-start">
        {/* Typographic side column */}
        <div className="w-full lg:w-1/2">
          <span className="font-mono text-xs text-neutral-400 tracking-[0.25em] uppercase mb-4 block">
            09 / CONTACT
          </span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-6 leading-none">
            LET'S <br />
            BUILD <span className="text-neutral-500">SOMETHING</span> <br />
            GREAT.
          </h2>
          <p className="text-neutral-400 text-md md:text-lg max-w-md font-light leading-relaxed mb-8">
            Reach out via email or schedule an introductory call. We typically respond within 24 business hours.
          </p>

          <div className="flex flex-col gap-4 font-mono text-xs uppercase tracking-wider text-neutral-400">
            <a href="mailto:vaishnavshinde186@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors py-1">
              <FiMail size={14} />
              <span>vaishnavshinde186@gmail.com</span>
            </a>
            <a href="https://github.com/vs227" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white transition-colors py-1">
              <FiGithub size={14} />
              <span>GITHUB / VS227</span>
            </a>
            <a href="https://www.linkedin.com/in/vaishnav-shinde-815871260" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white transition-colors py-1">
              <FiLinkedin size={14} />
              <span>LINKEDIN / VAISHNAV-SHINDE</span>
            </a>
            <div className="flex items-center gap-3 cursor-pointer py-1" onClick={() => setShowPhone(!showPhone)}>
              <FiPhone size={14} />
              <span>PHONE / DISPLAY</span>
              <AnimatePresence>
                {showPhone && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="ml-2 text-white font-bold"
                  >
                    +91 9579437409
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Input Form Column */}
        <div className="w-full lg:w-1/2 bg-neutral-950 border border-neutral-900 rounded-lg p-8 md:p-12 relative">
          <AnimatePresence mode="wait">
            {statusState === "idle" || statusState === "sending" ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={statusState === "sending"}
                    className="peer w-full bg-transparent border-b border-neutral-800 focus:border-white text-white font-light py-3 outline-none transition-colors placeholder-transparent text-sm"
                    id="name"
                    placeholder="Your Name"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-0 -top-3.5 text-neutral-500 font-mono text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-[10px]"
                  >
                    YOUR NAME
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={statusState === "sending"}
                    className="peer w-full bg-transparent border-b border-neutral-800 focus:border-white text-white font-light py-3 outline-none transition-colors placeholder-transparent text-sm"
                    id="email"
                    placeholder="Email Address"
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 -top-3.5 text-neutral-500 font-mono text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-[10px]"
                  >
                    EMAIL ADDRESS
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={statusState === "sending"}
                    className="peer w-full bg-transparent border-b border-neutral-800 focus:border-white text-white font-light py-3 resize-none outline-none transition-colors placeholder-transparent text-sm"
                    id="message"
                    placeholder="Project Brief"
                  />
                  <label
                    htmlFor="message"
                    className="absolute left-0 -top-3.5 text-neutral-500 font-mono text-[10px] uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-white peer-focus:text-[10px]"
                  >
                    MESSAGE / PROJECT BRIEF
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={statusState === "sending"}
                  className="w-full py-4 bg-white text-[#020202] text-xs font-mono font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors cursor-pointer"
                  data-cursor="send"
                >
                  <span>{statusState === "sending" ? "SENDING..." : "SEND ENQUIRY"}</span>
                  <FiSend size={12} />
                </button>
              </form>
            ) : statusState === "delivered" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 flex flex-col items-center"
              >
                <FiCheckCircle size={44} className="text-white mb-4" />
                <h3 className="text-2xl font-bold uppercase tracking-tight text-white mb-2">
                  TRANSMISSION COMPLETED
                </h3>
                <p className="text-neutral-400 text-sm max-w-sm mb-8 font-light">
                  Thank you. Your project logs have been transmitted. We will initialize contact shortly.
                </p>
                <button
                  onClick={() => {
                    setStatusState("idle");
                    setFormData({ name: "", email: "", message: "" });
                  }}
                  className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-mono text-xs uppercase tracking-widest rounded hover:border-white transition-colors"
                >
                  SEND ANOTHER
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 flex flex-col items-center"
              >
                <FiAlertTriangle size={44} className="text-white mb-4" />
                <h3 className="text-2xl font-bold uppercase tracking-tight text-white mb-2">
                  LOG DELIVERY FAILED
                </h3>
                <p className="text-neutral-400 text-sm max-w-sm mb-8 font-light">
                  Transmission failed. Please check your connection parameters and try again.
                </p>
                <button
                  onClick={() => setStatusState("idle")}
                  className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-white font-mono text-xs uppercase tracking-widest rounded hover:border-white transition-colors"
                >
                  RETRY
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Check, Send } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    setStatus("sending");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      if (!accessKey) {
        throw new Error("Web3Forms access key not found");
      }
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
          from_name: "Vaishnav Shinde Portfolio",
          subject: `New Portfolio Inquiry from ${form.get("name")}`
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error("Contact request failed");
      setStatus("sent");
      formElement.reset();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form className="contact-form" onSubmit={submit}>
      <input name="name" required placeholder="Your name" aria-label="Your name" />
      <input name="email" type="email" required placeholder="Email address" aria-label="Email address" />
      <textarea name="message" required placeholder="Tell me about your idea" aria-label="Your message" rows={3} />
      <motion.button 
        whileTap={{ scale: .97 }} 
        disabled={status === "sending"}
      >
        {status === "sent" ? (
          <><Check size={16} /> Sent — thank you</>
        ) : status === "sending" ? (
          "Sending…"
        ) : (
          <><Send size={15} /> Send message</>
        )}
      </motion.button>
      {status === "error" && (
        <p className="form-error">Something went wrong. Please check your network or email Vaishnav directly.</p>
      )}
    </form>
  );
}
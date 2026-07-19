import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheckCircle, FiAlertTriangle, FiGithub, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';

export default function ContactTerminal() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [statusState, setStatusState] = useState('idle');
  const [showPhone, setShowPhone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatusState('sending');

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY",
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `New Portfolio Message from ${formData.name}`
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatusState('delivered');
      } else {
        setStatusState('error');
      }
    } catch (err) {
      console.error("Form transmission error:", err);
      setStatusState('error');
    }
  };

  return (
    <section
      id="contact"
      className="contact-section"
    >
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
      >

        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--t-text-primary)' }}>
            Get In <span className="gradient-title-white">Touch</span>
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: '0.94rem' }}>
            Send a direct message or reach out through my professional channels.
          </p>
        </div>

        <div className="contact-form-wrapper">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.4 }}
            className="master-glass-card contact-card"
          >
            {statusState === 'idle' || statusState === 'sending' ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                <div>
                  <label className="contact-label">
                    YOUR NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    disabled={statusState !== 'idle'}
                    className="contact-input"
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--red-accent)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--t-input-border)'}
                  />
                </div>

                <div>
                  <label className="contact-label">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    disabled={statusState !== 'idle'}
                    className="contact-input"
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--red-accent)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--t-input-border)'}
                  />
                </div>

                <div>
                  <label className="contact-label">
                    MESSAGE
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Type your message here..."
                    disabled={statusState !== 'idle'}
                    className="contact-input contact-textarea"
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--red-accent)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--t-input-border)'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={statusState !== 'idle'}
                  className="contact-submit-btn"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--red-accent)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--t-btn-primary-bg)';
                    e.currentTarget.style.color = 'var(--t-btn-primary-text)';
                  }}
                >
                  <span>{statusState === 'idle' ? 'Send Message' : 'Sending...'}</span>
                  <FiSend size={13} />
                </button>
              </form>
            ) : statusState === 'delivered' ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <FiCheckCircle size={38} color="var(--red-accent)" style={{ marginBottom: '0.8rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--t-text-primary)', marginBottom: '0.35rem', fontFamily: 'Space Grotesk' }}>
                  Message Sent
                </h4>
                <p style={{ color: 'var(--t-text-muted)', fontSize: '0.84rem', lineHeight: 1.45, marginBottom: '1.5rem' }}>
                  Thank you. I will respond to your email as soon as possible.
                </p>
                <button
                  onClick={() => { setStatusState('idle'); setFormData({ name: '', email: '', message: '' }); }}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--t-btn-ghost-bg)',
                    border: '1px solid var(--t-border)',
                    color: 'var(--t-text-primary)',
                    fontFamily: 'Space Grotesk',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.25s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--red-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--t-border)'}
                >
                  Send Another
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <FiAlertTriangle size={38} color="var(--red-accent)" style={{ marginBottom: '0.8rem' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--t-text-primary)', marginBottom: '0.35rem', fontFamily: 'Space Grotesk' }}>
                  Delivery Failed
                </h4>
                <p style={{ color: 'var(--t-text-muted)', fontSize: '0.84rem', lineHeight: 1.45, marginBottom: '1.5rem' }}>
                  Something went wrong during message delivery. Please try again.
                </p>
                <button
                  onClick={() => setStatusState('idle')}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--t-btn-ghost-bg)',
                    border: '1px solid var(--t-border)',
                    color: 'var(--t-text-primary)',
                    fontFamily: 'Space Grotesk',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.25s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--red-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--t-border)'}
                >
                  Try Again
                </button>
              </div>
            )}

            <div style={{
              borderTop: '1px solid var(--t-separator)',
              margin: '1.5rem 0 1.25rem 0'
            }} />

            <div className="contact-channels">
              <a
                href="mailto:vaishnavshinde186@gmail.com"
                className="contact-channel-link"
              >
                <FiMail size={14} />
                <span>Email</span>
              </a>

              <a
                href="https://github.com/vs227"
                target="_blank"
                rel="noreferrer"
                className="contact-channel-link"
              >
                <FiGithub size={14} />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/vaishnav-shinde-815871260"
                target="_blank"
                rel="noreferrer"
                className="contact-channel-link"
              >
                <FiLinkedin size={14} />
                <span>LinkedIn</span>
              </a>

              <div
                className="contact-channel-link"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div onClick={() => setShowPhone(!showPhone)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiPhone size={14} />
                  <span>Phone</span>
                </div>
                <AnimatePresence>
                  {showPhone && (
                    <motion.a
                      href="tel:+919579437409"
                      className="phone-number-copiable"
                      initial={{ opacity: 0, x: -10, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 'auto' }}
                      exit={{ opacity: 0, x: -10, width: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        marginLeft: '0.3rem',
                        color: 'var(--t-text-primary)',
                        fontWeight: '700',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red-accent)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--t-text-primary)'}
                    >
                      +91 9579437409
                    </motion.a>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </motion.div>
        </div>

      </motion.div>

      <style>{`
        .contact-section {
          position: relative;
          height: 100vh;
          min-height: 700px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 0;
          box-sizing: border-box;
          overflow: hidden;
        }

        .contact-form-wrapper {
          max-width: 540px;
          width: 100%;
          margin: 0 auto;
        }

        .contact-card {
          padding: 2.25rem 2rem;
          background-color: var(--t-card-bg-solid);
          box-sizing: border-box;
        }

        .contact-label {
          display: block;
          font-size: 0.64rem;
          font-family: 'Space Grotesk', sans-serif;
          color: var(--t-text-muted);
          margin-bottom: 0.35rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .contact-input {
          width: 100%;
          padding: 0.75rem 0.9rem;
          border-radius: 6px;
          background-color: var(--t-input-bg);
          border: 1px solid var(--t-input-border);
          color: var(--t-text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
          /* Prevent iOS zoom on focus */
          font-size: max(16px, 0.88rem);
        }

        .contact-textarea {
          resize: none;
        }

        .contact-submit-btn {
          padding: 0.8rem;
          border-radius: 6px;
          background-color: var(--t-btn-primary-bg);
          border: none;
          color: var(--t-btn-primary-text);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.88rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          margin-top: 0.3rem;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .contact-channels {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .contact-channel-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.82rem;
          color: var(--t-text-muted);
          text-decoration: none;
          font-family: 'Space Grotesk', sans-serif;
          transition: color 0.25s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .contact-channel-link:active,
        .contact-channel-link:hover {
          color: var(--red-accent);
        }

        @media (max-width: 768px) {
          .contact-section {
            height: auto !important;
            min-height: auto !important;
            padding: 4rem 0 !important;
          }
          .contact-section > .container {
            height: auto !important;
          }
          .contact-card {
            padding: 1.5rem 1.25rem !important;
          }
          .contact-channels {
            gap: 1rem;
          }
        }

        @media (max-width: 400px) {
          .contact-channels {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </section>
  );
}

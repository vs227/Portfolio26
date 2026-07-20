import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiCpu, FiMessageSquare, FiInfo, FiCode, FiUser } from 'react-icons/fi';
import logoImg from '../assets/delta2-removebg-preview.png';
import { useTheme } from '../context/ThemeContext';

const SUGGESTIONS = [
  { text: "What projects has he built?", icon: <FiCode /> },
  { text: "What are his main tech skills?", icon: <FiCpu /> },
  { text: "Tell me about his education", icon: <FiInfo /> },
  { text: "How can I contact him?", icon: <FiUser /> }
];

export default function AiAssistant() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am Vaishnav's AI Assistant Core. Ask me anything about his skills, education, certifications, or projects!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'about'
  const [typingMessageIndex, setTypingMessageIndex] = useState(-1);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const TypewriterText = ({ text, onComplete, onUpdate }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
      let index = 0;
      const interval = setInterval(() => {
        index += 3;
        if (index >= text.length) {
          setDisplayedText(text);
          clearInterval(interval);
          onComplete();
        } else {
          setDisplayedText(text.slice(0, index));
          onUpdate();
        }
      }, 10);
      
      return () => clearInterval(interval);
    }, [text, onComplete, onUpdate]);

    return <>{formatMessage(displayedText)}</>;
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (text) => {
    const query = text || input;
    if (!query.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      setMessages(prev => {
        const next = [...prev, { role: 'assistant', content: data.response }];
        setTypingMessageIndex(next.length - 1);
        return next;
      });
    } catch (error) {
      console.error('RAG Query Error:', error);
      setMessages(prev => {
        const next = [...prev, { 
          role: 'assistant', 
          content: "I'm having trouble connecting to my server. Please make sure the RAG backend server is running in the background!" 
        }];
        setTypingMessageIndex(next.length - 1);
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse simple markdown inline styles (bold, code, lists)
  const formatMessage = (text) => {
    if (!text) return '';
    const lines = text.split('\n');
    let inList = false;
    const renderedElements = [];
    let currentListItems = [];

    const parseInlineStyles = (rawText) => {
      let parsed = rawText;
      // Bold text: **text**
      parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Code blocks: `code`
      parsed = parsed.replace(/`(.*?)`/g, '<code class="ai-inline-code">$1</code>');
      return <span dangerouslySetInnerHTML={{ __html: parsed }} />;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        if (!inList) {
          inList = true;
          currentListItems = [];
        }
        // Remove bullet prefix
        const itemContent = trimmed.replace(/^[\*\-\d+\.]\s*/, '');
        currentListItems.push(
          <li key={`li-${idx}`} className="ai-list-item">
            {parseInlineStyles(itemContent)}
          </li>
        );
      } else {
        if (inList) {
          renderedElements.push(
            <ul key={`ul-${idx}`} className="ai-unordered-list">
              {currentListItems}
            </ul>
          );
          inList = false;
        }
        if (trimmed.length > 0) {
          renderedElements.push(
            <p key={`p-${idx}`} className="ai-paragraph">
              {parseInlineStyles(line)}
            </p>
          );
        }
      }
    });

    if (inList) {
      renderedElements.push(
        <ul key="ul-end" className="ai-unordered-list">
          {currentListItems}
        </ul>
      );
    }

    return renderedElements;
  };

  return (
    <div style={{ zIndex: 9999, position: 'relative' }}>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`ai-fab-btn ${isOpen ? 'active' : ''}`}
        aria-label="Toggle AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex' }}
            >
              <FiX size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <img
                src={logoImg}
                alt="Delta Logo"
                style={{
                  height: '20px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: theme === 'light' ? 'invert(1) brightness(0.3)' : 'none',
                  transition: 'filter 0.3s ease'
                }}
              />
              <span className="ai-fab-text">Ask AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="ai-chat-window"
            data-lenis-prevent
          >
            {/* Header */}
            <div className="ai-chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div>
                  <h3 className="ai-header-title">DELTA AI</h3>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setMessages([{
                      role: 'assistant',
                      content: "Hello! I am Vaishnav's AI Assistant Core. Ask me anything about his skills, education, certifications, or projects!"
                    }]);
                    setTypingMessageIndex(-1);
                  }} 
                  className="ai-action-btn"
                  title="Reset Conversation"
                >
                  Reset
                </button>
                <button onClick={() => setIsOpen(false)} className="ai-close-btn">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Dashboard / Empty State (If only the welcome message is present) */}
            {messages.length === 1 ? (
              <div className="ai-dashboard" data-lenis-prevent>
                <div className="ai-dashboard-hero">
                  <div className="ai-dashboard-core-visual">
                    <img
                      src={logoImg}
                      alt="Delta Logo"
                      style={{
                        height: '42px',
                        width: 'auto',
                        objectFit: 'contain',
                        filter: theme === 'light' ? 'invert(1) brightness(0.3)' : 'none',
                        transition: 'filter 0.3s ease'
                      }}
                    />
                  </div>
                  <h4 className="ai-dashboard-welcome">Systems Initialized</h4>
                  <p className="ai-dashboard-desc">
                    Query Vaishnav Shinde's interactive index. Access verified project logs, skill vectors, and credential data.
                  </p>
                </div>
                
                <div className="ai-dashboard-suggestions">
                  <p className="suggestions-header">Log Access Shortcuts</p>
                  <div className="suggestions-grid">
                    {SUGGESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug.text)}
                        className="ai-suggestion-card"
                      >
                        <span className="suggestion-card-icon">{sug.icon}</span>
                        <span className="suggestion-card-text">{sug.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message Flow Mode */
              <div className="ai-chat-messages" data-lenis-prevent>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`ai-message-row ${msg.role}`}>
                    <div className={`ai-message-avatar ${msg.role}`}>
                      {msg.role === 'user' ? <FiUser size={12} /> : <FiCpu size={12} />}
                    </div>
                    <div className={`ai-message-bubble ${msg.role}`}>
                      {msg.role === 'assistant' && idx === typingMessageIndex ? (
                        <TypewriterText 
                          text={msg.content} 
                          onComplete={() => setTypingMessageIndex(-1)} 
                          onUpdate={scrollToBottom}
                        />
                      ) : (
                        formatMessage(msg.content)
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="ai-message-row assistant">
                    <div className="ai-message-avatar assistant">
                      <FiCpu size={12} className="ai-pulse-icon" />
                    </div>
                    <div className="ai-message-bubble assistant loading-bubble">
                      <div className="typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="ai-chat-input-form"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Submit pipeline query..."
                className="ai-chat-input-field"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="ai-chat-send-btn"
              >
                <FiSend size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* --- Floating Action Button --- */
        .ai-fab-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 0 1.25rem;
          height: 48px;
          border-radius: 24px;
          background: var(--t-card-bg);
          border: 1px solid var(--t-border-strong);
          color: var(--t-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-fab-btn:hover {
          border-color: var(--red-accent);
          box-shadow: var(--glow-red), 0 10px 30px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }

        .ai-fab-btn.active {
          width: 48px;
          padding: 0;
          border-radius: 50%;
        }

        .ai-fab-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .ai-pulse-icon {
          animation: corePulse 2s infinite alternate ease-in-out;
        }

        @keyframes corePulse {
          0% { filter: drop-shadow(0 0 2px var(--red-accent)); color: var(--t-text-primary); }
          100% { filter: drop-shadow(0 0 8px var(--red-accent)); color: var(--red-accent); }
        }

        /* --- Chat Window --- */
        .ai-chat-window {
          position: fixed;
          bottom: 95px;
          right: 30px;
          width: 390px;
          height: 530px;
          max-height: 75vh;
          border-radius: 16px;
          background: var(--t-card-bg);
          border: 1px solid var(--t-border-strong);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* --- Header Section --- */
        .ai-chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.9rem 1.25rem;
          border-bottom: 1px solid var(--t-border);
          background: var(--t-bg-alt);
          flex-shrink: 0;
        }

        .ai-header-title {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 1.05rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--t-text-primary);
          margin: 0;
        }

        .ai-header-subtitle {
          font-family: var(--font-body);
          font-size: 0.68rem;
          color: #00ff66;
          margin: 0.1rem 0 0 0;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .status-indicator {
          position: relative;
          display: flex;
          width: 8px;
          height: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #00ff66;
        }

        .status-ping {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #00ff66;
          animation: statusPing 1.8s infinite ease-out;
        }

        @keyframes statusPing {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.8); opacity: 0; }
        }

        .ai-action-btn {
          background: transparent;
          border: 1px solid var(--t-border);
          color: var(--t-text-muted);
          font-size: 0.72rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-body);
          transition: all 0.2s ease;
        }

        .ai-action-btn:hover {
          color: var(--t-text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .ai-close-btn {
          background: transparent;
          border: none;
          color: var(--t-text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.2s ease;
        }

        .ai-close-btn:hover {
          color: var(--red-accent);
        }

        /* --- Empty Splash Dashboard --- */
        .ai-dashboard {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1.25rem;
          overflow-y: auto;
          scrollbar-width: none;
          overscroll-behavior: contain;
        }

        .ai-dashboard::-webkit-scrollbar {
          display: none;
        }

        .ai-dashboard-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .ai-dashboard-core-visual {
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.85rem;
        }

        .ai-core-spinner {
          font-size: 2.5rem;
          color: var(--t-text-primary);
          z-index: 2;
          animation: coreSpin 12s infinite linear;
        }

        @keyframes coreSpin {
          100% { transform: rotate(360deg); }
        }

        .core-glow {
          position: absolute;
          width: 48px;
          height: 48px;
          background: var(--red-accent);
          filter: blur(16px);
          opacity: 0.3;
          border-radius: 50%;
          animation: corePulse 2s infinite alternate ease-in-out;
        }

        .ai-dashboard-welcome {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin: 0 0 0.4rem 0;
          color: var(--t-text-primary);
        }

        .ai-dashboard-desc {
          font-family: var(--font-body);
          font-size: 0.76rem;
          color: var(--t-text-muted);
          line-height: 1.45;
          margin: 0;
          max-width: 90%;
        }

        .ai-dashboard-suggestions {
          margin-top: auto;
        }

        .suggestions-header {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.72rem;
          color: var(--t-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 0.65rem 0;
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        .ai-suggestion-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 0.75rem;
          background: var(--t-badge-bg);
          border: 1px solid var(--t-border-faint);
          border-radius: 8px;
          color: var(--t-text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ai-suggestion-card:hover {
          background: rgba(255, 0, 60, 0.04);
          border-color: var(--red-accent);
          transform: translateY(-1px);
        }

        .suggestion-card-icon {
          font-size: 0.95rem;
          color: var(--red-accent);
          margin-bottom: 0.4rem;
        }

        .suggestion-card-text {
          font-family: var(--font-body);
          font-size: 0.74rem;
          line-height: 1.35;
          font-weight: 500;
        }

        /* --- Message Flow Mode --- */
        .ai-chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          scrollbar-width: thin;
          scrollbar-color: var(--t-scrollbar-thumb) var(--t-scrollbar-track);
          overscroll-behavior: contain;
        }

        .ai-chat-messages::-webkit-scrollbar {
          width: 4px;
        }

        .ai-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .ai-chat-messages::-webkit-scrollbar-thumb {
          background: var(--t-scrollbar-thumb);
          border-radius: 2px;
        }

        .ai-message-row {
          display: flex;
          align-items: flex-end;
          gap: 0.65rem;
          width: 100%;
        }

        .ai-message-row.user {
          flex-direction: row-reverse;
        }

        .ai-message-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--t-badge-bg);
          border: 1px solid var(--t-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--t-text-muted);
          flex-shrink: 0;
        }

        .ai-message-avatar.user {
          border-color: var(--red-accent);
          color: var(--red-accent);
          background: rgba(255, 0, 60, 0.05);
        }

        .ai-message-bubble {
          max-width: 78%;
          padding: 0.75rem 0.95rem;
          border-radius: 14px;
          font-size: 0.84rem;
          word-wrap: break-word;
          font-family: var(--font-body);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .ai-message-bubble.user {
          background: var(--red-accent);
          color: #ffffff;
          border-bottom-right-radius: 3px;
          box-shadow: var(--glow-red);
        }

        .ai-message-bubble.assistant {
          background: var(--t-badge-bg);
          border: 1px solid var(--t-border);
          color: var(--t-text-secondary);
          border-bottom-left-radius: 3px;
        }

        /* --- Text Custom Formatting --- */
        .ai-paragraph {
          margin: 0 0 0.65rem 0;
          line-height: 1.45;
        }

        .ai-paragraph:last-child {
          margin-bottom: 0;
        }

        .ai-unordered-list {
          margin: 0 0 0.65rem 1rem;
          padding-left: 0;
          list-style-type: disc;
        }

        .ai-list-item {
          margin-bottom: 0.35rem;
          line-height: 1.4;
        }

        .ai-inline-code {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--t-border);
          padding: 1px 4px;
          border-radius: 4px;
          color: var(--t-text-primary);
        }

        /* --- Loading State bubble --- */
        .ai-message-bubble.loading-bubble {
          padding: 0.55rem 0.85rem;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 10px;
        }

        .typing-dot {
          width: 5px;
          height: 5px;
          background: var(--t-text-muted);
          border-radius: 50%;
          animation: dotBounce 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.3); opacity: 0.4; }
          40% { transform: scale(1.0); opacity: 1; }
        }

        /* --- Input Form Section --- */
        .ai-chat-input-form {
          display: flex;
          align-items: center;
          padding: 0.8rem 1.15rem;
          gap: 0.75rem;
          border-top: 1px solid var(--t-border);
          background: var(--t-bg-alt);
          flex-shrink: 0;
        }

        .ai-chat-input-field {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--t-text-primary);
          font-family: var(--font-body);
          font-size: 0.84rem;
          outline: none;
        }

        .ai-chat-input-field::placeholder {
          color: var(--t-text-dim);
        }

        .ai-chat-send-btn {
          background: transparent;
          border: none;
          color: var(--t-text-muted);
          cursor: pointer;
          transition: color 0.2s ease, transform 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
        }

        .ai-chat-send-btn:hover:not(:disabled) {
          color: var(--red-accent);
          transform: scale(1.08);
        }

        .ai-chat-send-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* --- Mobile responsiveness --- */
        @media (max-width: 600px) {
          .ai-chat-window {
            width: calc(100% - 30px);
            right: 15px;
            left: 15px;
            bottom: 85px;
            height: 480px;
          }
          
          .ai-fab-btn {
            bottom: 20px;
            right: 20px;
            height: 44px;
            border-radius: 22px;
          }

          .ai-fab-btn.active {
            width: 44px;
            border-radius: 50%;
          }

          .suggestions-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

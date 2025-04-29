import React, { useState, useRef, useEffect } from 'react';
import { FaRedo } from 'react-icons/fa';

const SAMPLE_QA = [
  {
    q: 'What is Movacash Forum?',
    a: 'Movacash Forum is a modern platform for discussing finance, investing, and money management with a supportive community.'
  },
  {
    q: 'How do I create a discussion?',
    a: 'Simply click the "New Discussion" button on the Discussions page, fill in your topic, and submit!'
  },
  {
    q: 'Can I upload images to my post?',
    a: 'Yes! When creating a discussion, you can upload images to make your post more engaging.'
  },
  {
    q: 'How do I create a testimony?',
    a: 'Go to the Testimonies page, click "Create Testimony", fill out the form with text, rating, date, and upload images. Your testimony will be submitted for admin approval.'
  },
  {
    q: 'How can I approve pending testimonies?',
    a: 'If you are an admin, click "Approve Testimonies" in the navigation to view and moderate pending testimonies by approving or rejecting them.'
  },
  {
    q: 'Where can I view approved testimonies?',
    a: 'Visit the Testimonies page to see a list of all approved testimonies from users.'
  },
  {
    q: 'How do I manage my profile?',
    a: 'Go to the Profile page to view and update your account information, including username and password.'
  }
];

export default function ChatBotFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef();
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFABClick = () => setOpen(o => !o);

  const handleRestart = () => {
    setMessages([]);
    setOpen(true);
  };

  // Stream bot response character by character
  const handleStreamResponse = (text) => new Promise(resolve => {
    let idx = 0;
    const now = new Date();
    setMessages(prev => [...prev, { from: 'bot', text: '', timestamp: now }]);
    const interval = setInterval(() => {
      idx++;
      setMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1].text = text.slice(0, idx);
        return msgs;
      });
      if (idx >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, 30);
  });

  const handleSample = async (qa) => {
    setOpen(true);
    const now = new Date();
    setMessages(prev => [...prev, { from: 'user', text: qa.q, timestamp: now }]);
    await handleStreamResponse(qa.a);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setOpen(true);
    const now = new Date();
    const question = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: question, timestamp: now }]);
    setInput('');
    const matched = SAMPLE_QA.find(qa => qa.q.toLowerCase() === question.toLowerCase());
    const answerText = matched
      ? matched.a
      : "Sorry, I don't have an answer to that. Try selecting a sample question.";
    await handleStreamResponse(answerText);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`chatbot-fab${open ? ' open' : ''}`}
        onClick={handleFABClick}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="#1976d2" />
          <path d="M34 18v8a6 6 0 0 1-6 6H20l-6 6v-6a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6z" fill="#fff" />
          <circle cx="18" cy="24" r="2" fill="#1976d2" />
          <circle cx="24" cy="24" r="2" fill="#1976d2" />
          <circle cx="30" cy="24" r="2" fill="#1976d2" />
        </svg>
      </button>
      {/* Chat Modal */}
      {open && (
        <div className="chatbot-modal animate-zoom-in" style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '320px',
          maxWidth: '95%',
          height: '400px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          padding: '8px',
          zIndex: 9999
        }}>
          <div className="chatbot-header d-flex align-items-center">
            <span className="fw-bold">Mova Assistant</span>
            <button className="chatbot-startover ms-auto me-2" onClick={handleRestart} aria-label="Start over" style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>
              <FaRedo size={18} />
            </button>
            <button className="chatbot-close" onClick={handleFABClick} aria-label="Close chat" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </div>
          <div className="chatbot-body d-flex flex-column" style={{ flex: 1 }}>
            <div ref={messagesContainerRef} className="chatbot-messages flex-grow-1 mb-3" style={{ overflowY: 'auto' }}>
              {messages.map((m, i) => (
                <div key={i} className={`chatbot-msg chatbot-msg-${m.from} mb-2`}>  
                  <div>{m.text}</div>
                  <div className="chatbot-timestamp text-muted" style={{ fontSize: '0.75rem', textAlign: m.from === 'user' ? 'right' : 'left' }}>
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
            {/* Sample questions always visible */}
            <div className="chatbot-samples" style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: 'auto' }}>
              <div className="fw-semibold mb-2" style={{color:'#1976d2'}}>Try asking:</div>
              {SAMPLE_QA.map((qa, i) => (
                <button key={i} className="chatbot-sample-btn mb-1" onClick={() => handleSample(qa)}>{qa.q}</button>
              ))}
            </div>
          </div>
          <form className="chatbot-footer" onSubmit={handleSend} autoComplete="off">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
              aria-label="Type your question"
            />
            <button className="chatbot-send" type="submit" aria-label="Send">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 21l21-9-21-9v7l15 2-15 2v7z" fill="#1976d2"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

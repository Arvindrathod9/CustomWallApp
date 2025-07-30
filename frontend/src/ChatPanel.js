import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE } from './api';

const socket = io(API_BASE);

export default function ChatPanel({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('chat-history', (history) => {
      setMessages(history);
    });
    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off('chat-history');
      socket.off('chat-message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setSending(true);
    const msg = {
      user: user?.username || 'Guest',
      text: input,
      timestamp: new Date().toLocaleString(),
    };
    socket.emit('chat-message', msg);
    setInput('');
    setSending(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 24, boxShadow: '0 4px 32px #bfa16c22', padding: 0, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', minHeight: 500, display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <div style={{ background: '#bfa16c', color: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 32px', fontWeight: 900, fontSize: 28, letterSpacing: 1, textAlign: 'center' }}>
        Public Wall Chat
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0 24px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            background: msg.user === user?.username ? '#f5faff' : '#fffbe6',
            borderRadius: 18,
            boxShadow: '0 2px 8px #bfa16c22',
            padding: '12px 18px',
            margin: '8px 0',
            maxWidth: '80%',
            alignSelf: msg.user === user?.username ? 'flex-end' : 'flex-start',
            border: msg.user === user?.username ? '2px solid #bfa16c' : '2px solid #e0e0e0',
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
            color: '#333',
          }}>
            <div style={{ fontWeight: 600, color: '#bfa16c', marginBottom: 4 }}>{msg.user}</div>
            <div>{msg.text}</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{msg.timestamp}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: 24, borderTop: '1.5px solid #f5e6c6', background: '#fff', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '12px 18px', borderRadius: 18, border: '2px solid #bfa16c', fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', marginRight: 12 }}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{ background: '#bfa16c', color: 'white', fontWeight: 'bold', padding: '12px 28px', borderRadius: 18, fontSize: 18, border: 'none', cursor: sending || !input.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 2px 8px #bfa16c33' }}
        >
          Send
        </button>
      </div>
    </div>
  );
} 
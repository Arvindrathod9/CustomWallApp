import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        setIsLoggingIn(false);
        return;
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      }
      setIsLoggingIn(false);
    } catch (err) {
      setError('Network error');
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/home.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 24, boxShadow: '0 4px 32px #bfa16c22', padding: 40, width: '100%', maxWidth: 400, textAlign: 'center', backdropFilter: 'blur(8px)' }}>
        <h2 style={{ color: '#bfa16c', marginBottom: 24, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Admin Username" style={{ padding: '12px 16px', border: '2px solid #bfa16c', borderRadius: 18, fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ padding: '12px 16px', border: '2px solid #bfa16c', borderRadius: 18, fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
          {error && <div style={{ color: '#c62828', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>{error}</div>}
          <button type="submit" disabled={isLoggingIn} style={{ background: isLoggingIn ? '#cccccc' : '#bfa16c', color: 'white', fontWeight: 'bold', padding: '14px 24px', borderRadius: 24, fontSize: 16, border: 'none', cursor: isLoggingIn ? 'not-allowed' : 'pointer', boxShadow: isLoggingIn ? 'none' : '0 2px 8px #bfa16c33', transition: 'all 0.3s ease', opacity: isLoggingIn ? 0.7 : 1, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>{isLoggingIn ? 'Logging In...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
} 
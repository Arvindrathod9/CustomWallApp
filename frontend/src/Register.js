import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { API_BASE } from './api';

// Modern NavBar (from Home.js)
function ModernNavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isMobile = window.innerWidth <= 700;
  return (
    <nav className="modern-navbar">
      <div className="modern-navbar-logo" onClick={() => navigate('/')}>MEMORY WALL</div>
      {isMobile ? (
        <>
          <button
            className="hamburger-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: 8 }}
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Open menu"
          >
            <div style={{ width: 28, height: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
            </div>
          </button>
          {menuOpen && (
            <div className="mobile-menu-overlay" style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.98)', zIndex: 9999,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32
            }}>
              <button onClick={() => { setMenuOpen(false); navigate('/'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none', marginBottom: 16 }}>Home</button>
              <button onClick={() => { setMenuOpen(false); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Features</button>
              <button onClick={() => { setMenuOpen(false); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Gallery</button>
              <button onClick={() => { setMenuOpen(false); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>How It Works</button>
              <button onClick={() => { setMenuOpen(false); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Contact</button>
              <button className="modern-navbar-btn" onClick={() => { setMenuOpen(false); navigate('/login'); }} style={{ fontSize: 22, marginTop: 24 }}>Get Started</button>
              <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, fontSize: 32, color: '#bfa16c', background: 'none', border: 'none' }}>&times;</button>
            </div>
          )}
        </>
      ) : (
        <>
          <ul className="modern-navbar-menu">
            <li onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</li>
            <li style={{ cursor: 'pointer' }}>Features</li>
            <li style={{ cursor: 'pointer' }}>Gallery</li>
            <li style={{ cursor: 'pointer' }}>How It Works</li>
            <li style={{ cursor: 'pointer' }}>Contact</li>
          </ul>
          <button className="modern-navbar-btn" onClick={() => navigate('/login')}>Get Started</button>
        </>
      )}
    </nav>
  );
}

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const [localUser, setLocalUser] = useState(null);
  const bgRef = useRef(null);
  const [step, setStep] = useState(1); // 1: form, 2: code
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingUsername, setPendingUsername] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  // Handle create account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);
    if (!username || !password || !confirmPassword || !name || !email || !country) {
      setError('Please fill in all fields');
      setIsCreating(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsCreating(false);
      return;
    }
    if (password.length < 1) {
      setError('Password must be at least 1 character long');
      setIsCreating(false);
      return;
    }
    if (password.length > 8) {
      setError('Password must be at most 8 characters long');
      setIsCreating(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsCreating(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, email, country })
      });
      const data = await res.json();
      if (!res.ok) {
        // If pending registration, show code input and resend
        if (data.error && data.error.toLowerCase().includes('pending')) {
          setPendingEmail(email);
          setPendingUsername(username);
          setStep(2);
          setError('');
          setResendMsg('A registration is already pending for this email. Please enter the code or resend.');
        } else {
          setError(data.error || 'Registration failed');
        }
        setIsCreating(false);
        return;
      }
      setPendingEmail(email);
      setPendingUsername(username);
      setStep(2);
      setIsCreating(false);
      setError('');
    } catch (err) {
      setError('Network error');
      setIsCreating(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyMsg('');
    if (!verifyCode || verifyCode.length !== 4) {
      setVerifyMsg('Enter the 4-digit code sent to your email.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: verifyCode })
      });
      const data = await res.json();
      if (!res.ok) {
        setVerifyMsg(data.error || 'Verification failed');
        return;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (onRegister) onRegister(data);
      setLocalUser(data);
      setVerifyMsg('Registration complete! Redirecting...');
      setTimeout(() => {
        navigate('/wall');
      }, 1200);
    } catch (err) {
      setVerifyMsg('Verification failed.');
    }
  };

  const handleResendCode = async () => {
    setResendMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: pendingUsername, password, name, email: pendingEmail, country })
      });
      const data = await res.json();
      if (!res.ok) {
        setResendMsg(data.error || 'Failed to resend code.');
        return;
      }
      setResendMsg('Verification code resent to your email.');
    } catch (err) {
      setResendMsg('Failed to resend code.');
    }
  };

  useEffect(() => {
    if (localUser) {
      const pendingDraftId = localStorage.getItem('pendingDraftId');
      if (pendingDraftId) {
        localStorage.removeItem('pendingDraftId');
        navigate(`/shared/${pendingDraftId}`);
      } else {
        navigate('/wall');
      }
    }
  }, [localUser, navigate]);

  // Parallax effect for background (optional, like Home.js)
  const [parallax, setParallax] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setParallax(scrollY * 0.3);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="modern-home-root" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Parallax background like Home.js */}
      <div
        ref={bgRef}
        className="modern-hero-bg-parallax"
        style={{
          backgroundImage: 'url(/home.jpg)',
          transform: `scale(${1 + parallax / 1000}) translateY(${parallax}px)`
        }}
      />
      <ModernNavBar />
      <div className="modern-hero-overlay" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 48 }}>
        <div className="modern-card" style={{ width: '100%', maxWidth: 420, margin: '0 auto', marginTop: 32 }}>
          {step === 1 ? (
            <>
              <h2 className="modern-hero-title" style={{ marginBottom: 24, textAlign: 'center', width: '100%' }}>Create Your Account</h2>
              <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="modern-input"
              placeholder="Username"
              style={{ padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 16 }}
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="modern-input"
              placeholder="Password"
              style={{ padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 16 }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="modern-input"
              placeholder="Confirm Password"
              style={{ padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 16 }}
            />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="modern-input"
              placeholder="Full Name"
              style={{ padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 16 }}
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="modern-input"
              placeholder="Email Address"
              style={{ padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 16 }}
            />
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="modern-input"
              placeholder="Country"
              style={{ padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 16 }}
            />
            {error && (
              <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 'bold' }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="modern-btn-primary"
              style={{ opacity: isCreating ? 0.7 : 1 }}
            >
              {isCreating ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div style={{ marginTop: 24, color: '#666' }}>
            <span>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="modern-btn-secondary"
                style={{ padding: '6px 18px', fontSize: 15, borderRadius: 16, marginLeft: 4 }}
              >
                Login here
              </button>
            </span>
          </div>
        </>
          ) : (
            <>
              <h2 className="modern-hero-title" style={{ marginBottom: 24, textAlign: 'center', width: '100%' }}>Verify Your Email</h2>
              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                  className="modern-input"
                  placeholder="Enter 4-digit code"
                  style={{ padding: '12px 16px', borderRadius: 8, border: '2px solid #e0e0e0', fontSize: 16, letterSpacing: 4, textAlign: 'center' }}
                />
                {verifyMsg && <div style={{ background: verifyMsg.includes('complete') ? '#e0ffe0' : '#ffebee', color: verifyMsg.includes('complete') ? '#1e7b2a' : '#c62828', padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 'bold' }}>{verifyMsg}</div>}
                <button
                  type="submit"
                  className="modern-btn-primary"
                  style={{ opacity: isCreating ? 0.7 : 1 }}
                  disabled={isCreating}
                >
                  Verify & Complete Registration
                </button>
              </form>
              <button
                type="button"
                onClick={handleResendCode}
                className="modern-btn-secondary"
                style={{ marginTop: 16, padding: '10px 18px', borderRadius: 16, fontSize: 15 }}
              >
                Resend Code
              </button>
              {resendMsg && <div style={{ marginTop: 10, color: resendMsg.includes('resent') ? '#1e7b2a' : '#c62828', fontWeight: 'bold' }}>{resendMsg}</div>}
              <div style={{ marginTop: 24, color: '#666', textAlign: 'center' }}>
                <span>
                  Didn't get the code? Check your spam folder or click Resend Code.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
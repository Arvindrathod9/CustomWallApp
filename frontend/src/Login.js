import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NavBarLogin() {
  const navigate = useNavigate();
  const handleFeaturesClick = () => {
    navigate('/home#features');
  };
  return (
    <nav className="modern-navbar">
      <div className="modern-navbar-logo" onClick={() => navigate('/home')}>MEMORY WALL</div>
      <ul className="modern-navbar-menu">
        <li className="active" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>Home</li>
        <li onClick={handleFeaturesClick} style={{ cursor: 'pointer' }}>Features</li>
        <li>Gallery</li>
        <li>How It Works</li>
        <li>Contact</li>
      </ul>
    </nav>
  );
}

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Removed problematic useEffect that reloads the page

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      // Try admin login first
      let res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify({ username: 'admin', isAdmin: true, token: data.token }));
          setIsLoggingIn(false);
          if (onLogin) onLogin({ username: 'admin', isAdmin: true, token: data.token });
          setTimeout(() => navigate('/wall'), 50);
          return;
        }
      }
      // If not admin, try user login
      res = await fetch('http://localhost:5000/api/login', {
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
        localStorage.setItem('token', data.token);
        // Remove any admin token if present
        localStorage.removeItem('adminToken');
      }
      if (onLogin) onLogin(data);
      setIsLoggingIn(false);
      navigate('/wall');
    } catch (err) {
      setError('Network error');
      setIsLoggingIn(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/home.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
    }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <NavBarLogin />
      </div>
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.55)',
          borderRadius: 24,
          boxShadow: '0 4px 32px #bfa16c22',
          padding: 40,
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          {/* Header */}
          <div style={{
            marginBottom: 32,
            padding: '16px 0',
            background: 'none',
            borderRadius: 16,
            margin: '-40px -40px 32px -40px'
          }}>
            <span style={{
              color: '#bfa16c',
              fontWeight: 900,
              fontSize: 42,
              letterSpacing: 2,
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
            }}>
              MEMORY WALL
            </span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{
                display: 'block',
                textAlign: 'left',
                marginBottom: 8,
                fontWeight: 'bold',
                color: '#7b6c4b',
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #bfa16c',
                  borderRadius: 18,
                  fontSize: 16,
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                  fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
                }}
                placeholder="Enter username"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                textAlign: 'left',
                marginBottom: 8,
                fontWeight: 'bold',
                color: '#7b6c4b',
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #bfa16c',
                  borderRadius: 18,
                  fontSize: 16,
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                  fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
                }}
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div style={{
                background: '#fff8e1',
                color: '#bfa16c',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                background: '#bfa16c',
                color: '#fff',
                fontWeight: 700,
                padding: '14px 24px',
                borderRadius: 24,
                fontSize: 16,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #bfa16c33',
                transition: 'all 0.3s ease',
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Logging In...' : 'Login'}
            </button>
          </form>

          {/* Switch to Register */}
          <div style={{ marginTop: 24, color: '#666' }}>
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#bfa16c',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textDecoration: 'underline'
                }}
              >
                Create one here
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 
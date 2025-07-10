import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Only refresh the first time in this session
    if (!window.sessionStorage.getItem('loginPageRefreshed')) {
      window.sessionStorage.setItem('loginPageRefreshed', 'true');
      window.location.reload();
    }
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        return;
      }
      const data = await res.json();
      console.log('Login response:', data); // Debug: log backend response
      onLogin(data);
      navigate('/home');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e0f2ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 4px 32px #0002',
        padding: 40,
        width: '100%',
        maxWidth: 400,
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: 32,
          padding: '16px 0',
          background: '#e0f2ff',
          borderRadius: 16,
          margin: '-40px -40px 32px -40px'
        }}>
          <span style={{
            color: '#3f51b5',
            fontWeight: 'bold',
            fontSize: 42,
            letterSpacing: 2,
            fontFamily: 'Creepster, Park Avenue, "Dancing Script", serif',
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
              color: '#333'
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
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
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
              color: '#333'
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
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 'bold'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: '#2a509c',
              color: 'white',
              fontWeight: 'bold',
              padding: '14px 24px',
              borderRadius: 8,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(42, 80, 156, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Login
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
                color: '#2a509c',
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
  );
}

export default Login; 
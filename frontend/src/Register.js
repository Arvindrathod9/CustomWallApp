import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle create account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 1) {
      setError('Password must be at least 1 character long');
      return;
    }
    if (password.length > 8) {
      setError('Password must be at most 8 characters long');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        return;
      }
      const data = await res.json();
      if (onRegister) onRegister(data);
      // Show alert message when account is created successfully
      alert(`Account "${username}" created successfully! Welcome to Memory Wall!`);
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

        {/* Register Form */}
        <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

          <div>
            <label style={{
              display: 'block',
              textAlign: 'left',
              marginBottom: 8,
              fontWeight: 'bold',
              color: '#333'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Confirm password"
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
            Create Account
          </button>
        </form>

        {/* Switch to Login */}
        <div style={{ marginTop: 24, color: '#666' }}>
          <span>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2a509c',
                cursor: 'pointer',
                fontWeight: 'bold',
                textDecoration: 'underline'
              }}
            >
              Login here
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register; 
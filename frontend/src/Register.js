import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ onRegister }) {
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
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsCreating(false);
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, email, country })
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        setIsCreating(false);
        return;
      }
      
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (onRegister) onRegister(data);
      setLocalUser(data); // Set local user state for redirect
      alert(`Account "${username}" created successfully! Welcome to Memory Wall!`);
      // navigate('/wall'); // Remove this, let useEffect handle redirect
    } catch (err) {
      setError('Network error');
      setIsCreating(false);
    }
  };

  // After successful registration
  useEffect(() => {
    if (localUser) {
      const pendingDraftId = localStorage.getItem('pendingDraftId');
      console.log('pendingDraftId after registration:', pendingDraftId);
      if (pendingDraftId) {
        localStorage.removeItem('pendingDraftId');
        navigate(`/shared/${pendingDraftId}`); // Fixed route to match SharedWall.js
      } else {
        navigate('/wall'); // or your default dashboard
      }
    }
  }, [localUser, navigate]);

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

          <div>
            <label style={{
              display: 'block',
              textAlign: 'left',
              marginBottom: 8,
              fontWeight: 'bold',
              color: '#333'
            }}>
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your full name"
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email address"
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
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: 8,
                fontSize: 16,
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your country"
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
            disabled={isCreating}
            style={{
              background: isCreating ? '#cccccc' : '#2a509c',
              color: 'white',
              fontWeight: 'bold',
              padding: '14px 24px',
              borderRadius: 8,
              fontSize: 16,
              border: 'none',
              cursor: isCreating ? 'not-allowed' : 'pointer',
              boxShadow: isCreating ? 'none' : '0 2px 8px rgba(42, 80, 156, 0.3)',
              transition: 'all 0.3s ease',
              opacity: isCreating ? 0.7 : 1
            }}
          >
            {isCreating ? 'Creating Account...' : 'Create Account'}
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
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NavBar component displays the app title, user info, and logout button.
 * Props:
 *   user: current user object
 *   onLogout: function to call on logout
 *   onProfileClick: function to call when profile is clicked
 */
function NavBar({ user, onLogout, onProfileClick }) {
  const navigate = useNavigate();
  // Only show Admin Dashboard if user is admin
  const isAdmin = user && user.isAdmin;
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/home');
  };
  return (
    <nav style={{
      width: '100%',
      background: 'rgba(255,255,255,0.35)',
      zIndex: 100,
      padding: '12px 0 0 0',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
    }}>
      <div style={{
        background: 'none',
        boxShadow: 'none',
        borderRadius: 0,
        padding: '8px 300px',
        display: 'inline-block',
        minWidth: 1300,
        maxWidth: '99vw',
        position: 'relative'
      }}>
        {/* App Title */}
        <span style={{
          color: '#bfa16c',
          fontWeight: 900,
          fontSize: 54,
          letterSpacing: 2,
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
        }}>
          MEMORY WALL
        </span>
        {/* Profile logo and user info */}
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <button
            onClick={onProfileClick}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#bfa16c',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 'bold',
              color: 'white',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px #bfa16c33'
            }}
            onMouseOver={e => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseOut={e => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </button>
          <span style={{
            color: '#bfa16c',
            fontWeight: 700,
            fontSize: 16,
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
          }}>
            Welcome, {user?.name || user?.username}!
          </span>
        </div>

        {/* Logout and Admin Dashboard button */}
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: '#bfa16c',
                color: 'white',
                border: 'none',
                borderRadius: 24,
                fontWeight: 700,
                padding: '8px 16px',
                fontSize: 14,
                cursor: 'pointer',
                marginRight: 8,
                boxShadow: '0 1px 6px #bfa16c33',
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
              }}
            >
              Admin Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'white',
              color: '#bfa16c',
              border: '2px solid #bfa16c',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 24,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 6px #bfa16c33',
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
            }}
            onMouseOver={e => {
              e.target.style.background = '#bfa16c';
              e.target.style.color = '#fff';
            }}
            onMouseOut={e => {
              e.target.style.background = 'white';
              e.target.style.color = '#bfa16c';
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar; 
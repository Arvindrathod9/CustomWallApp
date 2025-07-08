import React from 'react';

/**
 * NavBar component displays the app title, user info, and logout button.
 * Props:
 *   user: current user object
 *   onLogout: function to call on logout
 */
function NavBar({ user, onLogout }) {
  return (
    <nav style={{
      width: '100%',
      background: '#e0f2ff',
      zIndex: 100,
      padding: '12px 0 0 0',
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        borderRadius: 16,
        padding: '8px 300px',
        display: 'inline-block',
        minWidth: 1300,
        maxWidth: '99vw',
        position: 'relative'
      }}>
        {/* App Title */}
        <span style={{
          color: '#3f51b5',
          fontWeight: 'bold',
          fontSize: 54,
          letterSpacing: 2,
          fontFamily: 'Creepster, Park Avenue, "Dancing Script", serif',
        }}>
          MEMORY WALL
        </span>
        {/* User info and logout button */}
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <span style={{
            color: '#3f51b5',
            fontWeight: 'bold',
            fontSize: 16
          }}>
            Welcome, {user?.username}!
          </span>
          <button
            onClick={onLogout}
            style={{
              background: '#fff',
              color: '#2a509c',
              border: '2px solid #2a509c',
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 1px 6px #0002'
            }}
            onMouseOver={e => {
              e.target.style.background = '#2a509c';
              e.target.style.color = '#fff';
            }}
            onMouseOut={e => {
              e.target.style.background = '#fff';
              e.target.style.color = '#2a509c';
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
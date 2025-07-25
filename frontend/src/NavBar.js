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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isMobile = window.innerWidth <= 700;
  // Only show Admin Dashboard if user is admin
  const isAdmin = user && user.isAdmin;
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/home');
  };
  return (
    <nav style={{
      width: '100%',
      background: 'rgba(255,255,255,0.35)',
      zIndex: 100,
      padding: isMobile ? '8px 0' : '12px 0 0 0',
      textAlign: 'center',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'center',
      fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
      position: 'relative'
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
                <button onClick={() => { setMenuOpen(false); navigate('/wall'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none', marginBottom: 16 }}>My Wall</button>
                <button onClick={() => { setMenuOpen(false); navigate('/drafts'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Drafts</button>
                <button onClick={() => { setMenuOpen(false); navigate('/home'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Home</button>
                {isAdmin && (
                  <button onClick={() => { setMenuOpen(false); navigate('/admin'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Admin Dashboard</button>
                )}
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none', marginTop: 24 }}>Logout</button>
                <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, fontSize: 32, color: '#bfa16c', background: 'none', border: 'none' }}>&times;</button>
              </div>
            )}
          </>
        ) : null}
        {/* Profile logo and user info (show on desktop only) */}
        {!isMobile && (
          <>
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
                  boxShadow: '0 2px 8px #bfa16c33',
                  overflow: 'hidden',
                  padding: 0
                }}
                onMouseOver={e => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseOut={e => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {user?.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'
                )}
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
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar; 
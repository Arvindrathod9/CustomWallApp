import React from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import AdminUsers from './AdminUsers';
import AdminAnalytics from './AdminAnalytics';
import AdminAltars from './AdminAltars';
import AdminFlags from './AdminFlags';
import AdminSubscriptions from './AdminSubscriptions';
import AdminPayments from './AdminPayments';
import AdminPlans from './AdminPlans';
import { FaUsers, FaChartBar, FaMoneyBill, FaCrown, FaFlag, FaUserShield, FaClipboardList } from 'react-icons/fa';

function AdminNavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isMobile = window.innerWidth <= 700;
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  return (
    <nav style={{
      background: 'rgba(255,255,255,0.35)',
      color: '#bfa16c',
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
      boxShadow: '0 2px 12px #bfa16c11',
      backdropFilter: 'blur(6px)',
      borderBottom: '1.5px solid #bfa16c',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ fontWeight: 900, fontSize: 24, color: '#bfa16c', letterSpacing: 2, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Admin Dashboard</div>
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
              <button onClick={() => { setMenuOpen(false); navigate('/admin/users'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none', marginBottom: 16 }}>Users</button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/altars'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Altars</button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/flags'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Flags</button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/subscriptions'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Subscriptions</button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/payments'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Payments</button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/analytics'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Analytics</button>
              <button onClick={() => { setMenuOpen(false); navigate('/admin/plans'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Plans</button>
              <button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none', marginTop: 24 }}>Logout</button>
              <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, fontSize: 32, color: '#bfa16c', background: 'none', border: 'none' }}>&times;</button>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          <Link to="/admin/users" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Users</Link>
          <Link to="/admin/altars" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Altars</Link>
          <Link to="/admin/flags" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Flags</Link>
          <Link to="/admin/subscriptions" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Subscriptions</Link>
          <Link to="/admin/payments" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Payments</Link>
          <Link to="/admin/analytics" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Analytics</Link>
          <Link to="/admin/plans" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Plans</Link>
          <button onClick={handleLogout} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 24, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', marginLeft: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Logout</button>
        </div>
      )}
    </nav>
  );
}

function DashboardOverview() {
  // Example stats (replace with real data if available)
  const stats = [
    { label: 'Users', icon: <FaUsers size={32} color="#bfa16c" />, link: '/admin/users', color: '#bfa16c' },
    { label: 'Subscriptions', icon: <FaCrown size={32} color="#7b2ff2" />, link: '/admin/subscriptions', color: '#7b2ff2' },
    { label: 'Payments', icon: <FaMoneyBill size={32} color="#1e7b2a" />, link: '/admin/payments', color: '#1e7b2a' },
    { label: 'Analytics', icon: <FaChartBar size={32} color="#2a509c" />, link: '/admin/analytics', color: '#2a509c' },
    { label: 'Flags', icon: <FaFlag size={32} color="#e53935" />, link: '/admin/flags', color: '#e53935' },
    { label: 'Altars', icon: <FaClipboardList size={32} color="#888" />, link: '/admin/altars', color: '#888' },
    { label: 'Admins', icon: <FaUserShield size={32} color="#2a509c" />, link: '/admin/users', color: '#2a509c' },
  ];
  const navigate = useNavigate();
  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
      <h1 style={{ color: '#bfa16c', fontWeight: 900, fontSize: 40, marginBottom: 24, letterSpacing: 2, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Admin Dashboard</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginTop: 24 }}>
        {stats.map(stat => (
          <div key={stat.label} onClick={() => navigate(stat.link)} style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 20,
            boxShadow: `0 2px 16px ${stat.color}22`,
            padding: 32,
            minWidth: 180,
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
            border: `2.5px solid ${stat.color}`,
            fontWeight: 700,
            fontSize: 22,
            position: 'relative',
          }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {stat.icon}
            <div style={{ marginTop: 18, color: stat.color, fontWeight: 900, fontSize: 22 }}>{stat.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, color: '#888', fontSize: 18, textAlign: 'center', maxWidth: 600 }}>
        Welcome to the modern Admin Dashboard!<br />
        Use the cards above or the navigation bar to manage users, subscriptions, payments, analytics, and more.
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/home.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
      <AdminNavBar />
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="altars" element={<AdminAltars />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="plans" element={<AdminPlans />} />
        <Route path="*" element={<DashboardOverview />} />
      </Routes>
    </div>
  );
} 
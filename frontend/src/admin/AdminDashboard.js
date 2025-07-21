import React from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import AdminUsers from './AdminUsers';
import AdminAnalytics from './AdminAnalytics';
import AdminAltars from './AdminAltars';
import AdminFlags from './AdminFlags';
import AdminSubscriptions from './AdminSubscriptions';
import AdminPayments from './AdminPayments';

function AdminNavBar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
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
    }}>
      <div style={{ fontWeight: 900, fontSize: 24, color: '#bfa16c', letterSpacing: 2, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Admin Dashboard</div>
      <div style={{ display: 'flex', gap: 24 }}>
        <Link to="/admin/users" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Users</Link>
        <Link to="/admin/altars" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Altars</Link>
        <Link to="/admin/flags" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Flags</Link>
        <Link to="/admin/subscriptions" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Subscriptions</Link>
        <Link to="/admin/payments" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Payments</Link>
        <Link to="/admin/analytics" style={{ color: '#bfa16c', textDecoration: 'none', fontWeight: 700, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Analytics</Link>
        <button onClick={handleLogout} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 24, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', marginLeft: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Logout</button>
      </div>
    </nav>
  );
}

function Placeholder({ title }) {
  return <div style={{ padding: 32, fontSize: 24, color: '#2a509c' }}>{title} coming soon...</div>;
}

export default function AdminDashboard() {
  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/home.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
      <AdminNavBar />
      <Routes>
        <Route path="users" element={<AdminUsers />} />
        <Route path="altars" element={<AdminAltars />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="subscriptions" element={<AdminSubscriptions />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="*" element={<Placeholder title="Welcome to the Admin Dashboard" />} />
      </Routes>
    </div>
  );
} 
import React, { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch('http://localhost:5000/api/admin/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setSummary(data);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchSummary();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Analytics & Reports</h2>
      {loading ? <div>Loading analytics...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : summary && (
        <div style={{ display: 'flex', gap: 40, marginTop: 32 }}>
          <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 32, minWidth: 220, textAlign: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: '#bfa16c' }}>{summary.userCount}</div>
            <div style={{ fontSize: 18, color: '#bfa16c', marginTop: 8 }}>Total Users</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 32, minWidth: 220, textAlign: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: '#bfa16c' }}>{summary.totalRevenue}</div>
            <div style={{ fontSize: 18, color: '#bfa16c', marginTop: 8 }}>Total Revenue</div>
          </div>
        </div>
      )}
    </div>
  );
} 
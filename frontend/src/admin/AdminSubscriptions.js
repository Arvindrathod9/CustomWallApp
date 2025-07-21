import React, { useEffect, useState } from 'react';

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  const fetchSubs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/admin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 500) {
          setError('Subscriptions table missing. Please create the subscriptions table in the database.');
          setSubs([]);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch subscriptions');
      }
      const data = await res.json();
      setSubs(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleView = (sub) => {
    setSelectedSub(sub);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Subscriptions</h2>
      {loading ? <div>Loading subscriptions...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 12, boxShadow: '0 2px 12px #bfa16c11', borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>User ID</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }}>Start</th>
              <th style={{ padding: 10 }}>End</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(sub => (
              <tr key={sub.id}>
                <td style={{ padding: 10 }}>{sub.id}</td>
                <td style={{ padding: 10 }}>{sub.user_id}</td>
                <td style={{ padding: 10 }}>{sub.status}</td>
                <td style={{ padding: 10 }}>{sub.start_date}</td>
                <td style={{ padding: 10 }}>{sub.end_date}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => handleView(sub)} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* View Subscription Modal */}
      {selectedSub && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setSelectedSub(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Subscription Details</h3>
            <div><b>ID:</b> {selectedSub.id}</div>
            <div><b>User ID:</b> {selectedSub.user_id}</div>
            <div><b>Status:</b> {selectedSub.status}</div>
            <div><b>Start:</b> {selectedSub.start_date}</div>
            <div><b>End:</b> {selectedSub.end_date}</div>
            <button onClick={() => setSelectedSub(null)} style={{ marginTop: 16, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 
import React, { useEffect, useState } from 'react';

export default function AdminFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  const fetchFlags = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/flags', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 500) {
          setError('Flagged content table missing. Please create the flagged_content table in the database.');
          setFlags([]);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch flagged content');
      }
      const data = await res.json();
      setFlags(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  const handleView = (flag) => {
    setSelectedFlag(flag);
  };

  const handleResolve = async (id) => {
    setIsResolving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/flags/${id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to resolve flag');
      setSelectedFlag(null);
      fetchFlags();
    } catch (e) {
      setError(e.message);
    }
    setIsResolving(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Flagged Content</h2>
      {loading ? <div>Loading flagged content...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 12, boxShadow: '0 2px 12px #bfa16c11', borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>Content Type</th>
              <th style={{ padding: 10 }}>Content ID</th>
              <th style={{ padding: 10 }}>Reason</th>
              <th style={{ padding: 10 }}>Resolved</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map(flag => (
              <tr key={flag.id}>
                <td style={{ padding: 10 }}>{flag.id}</td>
                <td style={{ padding: 10 }}>{flag.content_type}</td>
                <td style={{ padding: 10 }}>{flag.content_id}</td>
                <td style={{ padding: 10 }}>{flag.reason}</td>
                <td style={{ padding: 10 }}>{flag.resolved ? 'Yes' : 'No'}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => handleView(flag)} style={{ marginRight: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>View</button>
                  {!flag.resolved && <button onClick={() => handleResolve(flag.id)} style={{ color: 'white', background: '#bfa16c', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }} disabled={isResolving}>{isResolving ? 'Resolving...' : 'Resolve'}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* View Flag Modal */}
      {selectedFlag && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setSelectedFlag(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Flag Details</h3>
            <div><b>ID:</b> {selectedFlag.id}</div>
            <div><b>Content Type:</b> {selectedFlag.content_type}</div>
            <div><b>Content ID:</b> {selectedFlag.content_id}</div>
            <div><b>Reason:</b> {selectedFlag.reason}</div>
            <div><b>Resolved:</b> {selectedFlag.resolved ? 'Yes' : 'No'}</div>
            <button onClick={() => setSelectedFlag(null)} style={{ marginTop: 16, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 
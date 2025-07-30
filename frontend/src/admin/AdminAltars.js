import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

export default function AdminAltars() {
  const [altars, setAltars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAltar, setSelectedAltar] = useState(null);
  const [editAltar, setEditAltar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAltars = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/altars`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 500) {
          setError('Altar table missing. Please create the altar table in the database.');
          setAltars([]);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch altars');
      }
      const data = await res.json();
      setAltars(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAltars(); }, []);

  const handleView = async (id) => {
    setError('');
    setSelectedAltar(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/altars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch altar');
      const data = await res.json();
      setSelectedAltar(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (altar) => {
    setEditAltar({ ...altar });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/altars/${editAltar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editAltar.name, description: editAltar.description })
      });
      if (!res.ok) throw new Error('Failed to update altar');
      setEditAltar(null);
      fetchAltars();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this altar?')) return;
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/altars/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete altar');
      fetchAltars();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Altar Management</h2>
      {loading ? <div>Loading altars...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 12, boxShadow: '0 2px 12px #bfa16c11', borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Description</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {altars.map(altar => (
              <tr key={altar.id}>
                <td style={{ padding: 10 }}>{altar.id}</td>
                <td style={{ padding: 10 }}>{altar.name}</td>
                <td style={{ padding: 10 }}>{altar.description}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => handleView(altar.id)} style={{ marginRight: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>View</button>
                  <button onClick={() => handleEdit(altar)} style={{ marginRight: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Edit</button>
                  <button onClick={() => handleDelete(altar.id)} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #e5393533' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* View Altar Modal */}
      {selectedAltar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setSelectedAltar(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Altar Details</h3>
            <div><b>ID:</b> {selectedAltar.id}</div>
            <div><b>Name:</b> {selectedAltar.name}</div>
            <div><b>Description:</b> {selectedAltar.description}</div>
            <button onClick={() => setSelectedAltar(null)} style={{ marginTop: 16, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Close</button>
          </div>
        </div>
      )}
      {/* Edit Altar Modal */}
      {editAltar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setEditAltar(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Edit Altar</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Name:</label>
              <input type="text" value={editAltar.name} onChange={e => setEditAltar({ ...editAltar, name: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Description:</label>
              <input type="text" value={editAltar.description} onChange={e => setEditAltar({ ...editAltar, description: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <button onClick={handleSave} disabled={isSaving} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', marginRight: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>{isSaving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditAltar(null)} style={{ background: '#fff', color: '#bfa16c', border: '1.5px solid #bfa16c', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 
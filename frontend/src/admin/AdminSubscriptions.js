import React, { useEffect, useState } from 'react';

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [editSub, setEditSub] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addSubUser, setAddSubUser] = useState(null);
  const [newPlan, setNewPlan] = useState('premium');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  // Fetch subscriptions
  const fetchSubs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      const data = await res.json();
      setSubs(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      // Optionally handle error
    }
  };

  useEffect(() => {
    fetchSubs();
    fetchUsers();
  }, []);

  // Helper to get subscription for a user (if any)
  const getSubscription = (user) =>
    subs.find(sub => sub.userid === user.id);

  // Add subscription for a user
  const handleAddSubscription = async () => {
    if (!addSubUser) return;
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userid: addSubUser.id,
          plan: newPlan,
          start_date: newStart,
          end_date: newEnd
        })
      });
      if (!res.ok) throw new Error('Failed to add subscription');
      setAddSubUser(null);
      fetchSubs();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  // Edit subscription handler
  const handleEdit = (sub) => {
    setEditSub({ ...sub });
  };

  // Save subscription changes
  const handleSave = async () => {
    if (!editSub) return;
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/subscriptions/${editSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          plan: editSub.plan,
          start_date: editSub.start_date,
          end_date: editSub.end_date
        })
      });
      if (!res.ok) throw new Error('Failed to update subscription');
      setEditSub(null);
      fetchSubs();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  // Delete subscription handler
  const handleDelete = async (sub) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/subscriptions/${sub.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete subscription');
      fetchSubs();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Subscriptions</h2>
      {loading ? <div>Loading subscriptions...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 12, boxShadow: '0 2px 12px #bfa16c11', borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}>User</th>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Role</th>
              <th style={{ padding: 10 }}>Plan</th>
              <th style={{ padding: 10 }}>Start</th>
              <th style={{ padding: 10 }}>End</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const sub = getSubscription(user);
              return (
                <tr key={user.id}>
                  <td style={{ padding: 10 }}>{user.name || user.username}</td>
                  <td style={{ padding: 10 }}>{user.email}</td>
                  <td style={{ padding: 10 }}>{user.role}</td>
                  <td style={{ padding: 10 }}>{sub ? sub.plan : 'free'}</td>
                  <td style={{ padding: 10 }}>{sub ? sub.start_date : '-'}</td>
                  <td style={{ padding: 10 }}>{sub ? sub.end_date : '-'}</td>
                  <td style={{ padding: 10 }}>
                    {sub ? (
                      <>
                        <button onClick={() => handleEdit(sub)} style={{ marginRight: 8, background: '#7b2ff2', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #7b2ff233' }}>Edit</button>
                        <button onClick={() => handleDelete(sub)} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #e5393533' }}>Delete</button>
                      </>
                    ) : (
                      <button onClick={() => { setAddSubUser(user); setNewPlan('premium'); setNewStart(''); setNewEnd(''); }} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Add Subscription</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {/* Add Subscription Modal */}
      {addSubUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setAddSubUser(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Add Subscription for {addSubUser.name || addSubUser.username}</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Plan:</label>
              <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
                <option value="advanced">Advanced</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Start Date:</label>
              <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>End Date:</label>
              <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <button onClick={handleAddSubscription} disabled={isSaving} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', marginRight: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>{isSaving ? 'Saving...' : 'Add'}</button>
            <button onClick={() => setAddSubUser(null)} style={{ background: '#fff', color: '#bfa16c', border: '1.5px solid #bfa16c', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}
      {/* Edit Subscription Modal */}
      {editSub && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setEditSub(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Edit Subscription</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Plan:</label>
              <select value={editSub.plan} onChange={e => setEditSub({ ...editSub, plan: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
                <option value="advanced">Advanced</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Start Date:</label>
              <input type="date" value={editSub.start_date || ''} onChange={e => setEditSub({ ...editSub, start_date: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>End Date:</label>
              <input type="date" value={editSub.end_date || ''} onChange={e => setEditSub({ ...editSub, end_date: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <button onClick={handleSave} disabled={isSaving} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', marginRight: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>{isSaving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditSub(null)} style={{ background: '#fff', color: '#bfa16c', border: '1.5px solid #bfa16c', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 
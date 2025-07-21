import React, { useEffect, useState } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleView = async (id) => {
    setError('');
    setSelectedUser(null);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setSelectedUser(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleEdit = (user) => {
    setEditUser({ ...user });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editUser.name, email: editUser.email, country: editUser.country })
      });
      if (!res.ok) throw new Error('Failed to update user');
      setEditUser(null);
      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('adminToken');
    window.open(`http://localhost:5000/api/admin/analytics/export?token=${token}`, '_blank');
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>User Management</h2>
      <button onClick={handleExport} style={{ marginBottom: 16, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 24, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Export as CSV</button>
      {loading ? <div>Loading users...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>Username</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Country</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: 10 }}>{user.id}</td>
                <td style={{ padding: 10 }}>{user.username}</td>
                <td style={{ padding: 10 }}>{user.name}</td>
                <td style={{ padding: 10 }}>{user.email}</td>
                <td style={{ padding: 10 }}>{user.country}</td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => handleView(user.id)} style={{ marginRight: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>View</button>
                  <button onClick={() => handleEdit(user)} style={{ marginRight: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Edit</button>
                  <button onClick={() => handleDelete(user.id)} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #e5393533' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* View User Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setSelectedUser(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>User Details</h3>
            <div><b>ID:</b> {selectedUser.id}</div>
            <div><b>Username:</b> {selectedUser.username}</div>
            <div><b>Name:</b> {selectedUser.name}</div>
            <div><b>Email:</b> {selectedUser.email}</div>
            <div><b>Country:</b> {selectedUser.country}</div>
            <div><b>Created At:</b> {selectedUser.created_at}</div>
            <button onClick={() => setSelectedUser(null)} style={{ marginTop: 16, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Close</button>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {editUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setEditUser(null)}>
          <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>Edit User</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Name:</label>
              <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Email:</label>
              <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Country:</label>
              <input type="text" value={editUser.country} onChange={e => setEditUser({ ...editUser, country: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <button onClick={handleSave} disabled={isSaving} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', marginRight: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>{isSaving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditUser(null)} style={{ background: '#fff', color: '#bfa16c', border: '1.5px solid #bfa16c', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 
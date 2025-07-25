import React, { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const STICKERS = [
  'Wine.png',
  'banana.png',
  'garland1.png',
  'garland2.png',
  'candle.png',
  'fruitbasket.png',
  'deepam.png',
  'orange.png',
  'table1.png',
  'table2.png',
  'table3.png',
  'roundflow.png',
];

const PREMIUM_STICKERS = [
  'premium1.png',
  'premimum2.png',
  'premium3.png',
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkRole, setBulkRole] = useState('free');
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editUserStickers, setEditUserStickers] = useState([]);
  const [isLoadingStickers, setIsLoadingStickers] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
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

  // Filtering and search
  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Bulk selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(u => u.id));
    }
  };
  const toggleSelect = (id) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const clearSelection = () => setSelectedIds([]);

  // Bulk role assignment
  const handleBulkRole = async () => {
    if (!bulkRole || selectedIds.length === 0) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      for (const userId of selectedIds) {
        const user = users.find(u => u.id === userId);
        if (user.role === 'admin') continue; // skip admin
        const res = await fetch('http://localhost:5000/api/admin/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, newRole: bulkRole })
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update role');
        }
      }
      setSuccess('Roles updated successfully!');
      fetchUsers();
      clearSelection();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm('Are you sure you want to delete the selected users?')) return;
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      for (const userId of selectedIds) {
        const user = users.find(u => u.id === userId);
        if (user.role === 'admin') continue; // skip admin
        const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete user');
        }
      }
      setSuccess('Users deleted successfully!');
      fetchUsers();
      clearSelection();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  // Export filtered users
  const handleExportFiltered = () => {
    // Export only filtered users as CSV
    const csvRows = [
      ['ID', 'Username', 'Name', 'Email', 'Country', 'Role'],
      ...filteredUsers.map(u => [u.id, u.username, u.name, u.email, u.country, u.role || 'free'])
    ];
    const csv = csvRows.map(row => row.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleView = async (id) => {
    setError('');
    setSelectedUser(null);
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
    window.open(`http://localhost:5000/api/admin/analytics/export?token=${token}`, '_blank');
  };

  const handleRoleChange = async (userId, newRole) => {
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, newRole })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update role');
      }
      fetchUsers();
      setEditUser(null);
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  // Fetch stickers when opening edit modal
  useEffect(() => {
    if (editUser) {
      setIsLoadingStickers(true);
      const token = localStorage.getItem('token');
      fetch(`http://localhost:5000/api/admin/user/${editUser.id}/stickers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setEditUserStickers(data))
        .catch(() => setEditUserStickers([]))
        .finally(() => setIsLoadingStickers(false));
    }
  }, [editUser]);

  // Save stickers for user
  const handleSaveStickers = async () => {
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/user/${editUser.id}/stickers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stickers: editUserStickers })
      });
      if (!res.ok) throw new Error('Failed to update stickers');
      setSuccess('Stickers updated!');
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>User Management</h2>
      {success && <div style={{ background: '#e0ffe0', color: '#1e7b2a', padding: 12, borderRadius: 8, marginBottom: 16, fontWeight: 'bold' }}>{success}</div>}
      {error && <div style={{ background: '#ffe0e0', color: '#c62828', padding: 12, borderRadius: 8, marginBottom: 16, fontWeight: 'bold' }}>{error}</div>}
      <button onClick={handleExport} style={{ marginBottom: 16, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 24, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Export as CSV</button>
      <button onClick={handleExportFiltered} style={{ marginLeft: 8, marginBottom: 16, background: '#7b2ff2', color: 'white', border: 'none', borderRadius: 24, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #7b2ff233' }}>Export Filtered</button>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search username or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', minWidth: 220 }}
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <option value="all">All Roles</option>
          <option value="free">Free</option>
          <option value="advanced">Advanced</option>
          <option value="premium">Premium</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={clearSelection} style={{ background: '#fff', color: '#bfa16c', border: '1.5px solid #bfa16c', borderRadius: 18, padding: '8px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Clear Selection</button>
      </div>
      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', color: '#bfa16c' }}>{selectedIds.length} selected</span>
          <select value={bulkRole} onChange={e => setBulkRole(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
            <option value="free">Set as Free</option>
            <option value="advanced">Set as Advanced</option>
            <option value="premium">Set as Premium</option>
          </select>
          <button onClick={() => window.confirm('Are you sure you want to set the role for selected users?') && handleBulkRole()} disabled={isSaving} style={{ background: '#7b2ff2', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #7b2ff233' }}>Set Role</button>
          <button onClick={() => window.confirm('Are you sure you want to delete the selected users?') && handleBulkDelete()} disabled={isSaving} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #e5393533' }}>Delete Selected</button>
        </div>
      )}
      <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', background: 'rgba(255,255,255,0.55)' }}>
        <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', zIndex: 2 }}>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}><input type="checkbox" checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0} onChange={toggleSelectAll} /></th>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>Avatar</th>
              <th style={{ padding: 10 }}>Username</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Country</th>
              <th style={{ padding: 10 }}>Role</th>
              <th style={{ padding: 10 }}>Plan</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ width: 40, height: 40, border: '4px solid #bfa16c', borderTop: '4px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></td></tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} style={selectedIds.includes(user.id) ? { background: '#f7f8fa' } : {}}>
                <td style={{ padding: 10 }}><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} disabled={user.role === 'admin'} /></td>
                <td style={{ padding: 10 }}>{user.id}</td>
                <td style={{ padding: 10 }}>
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #bfa16c', background: '#fff' }} />
                  ) : (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#bfa16c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>
                      {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || <FaUserCircle />}
                    </div>
                  )}
                </td>
                <td style={{ padding: 10 }}>{user.username}</td>
                <td style={{ padding: 10 }}>{user.name}</td>
                <td style={{ padding: 10 }}>{user.email}</td>
                <td style={{ padding: 10 }}>{user.country}</td>
                <td style={{ padding: 10 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontWeight: 700,
                    color: '#fff',
                    background: user.role === 'admin' ? '#2a509c' : user.role === 'premium' ? '#7b2ff2' : user.role === 'advanced' ? '#1e7b2a' : '#bfa16c',
                    fontSize: 14,
                    letterSpacing: 1
                  }}>{user.role || 'free'}</span>
                </td>
                <td style={{ padding: 10 }}>
                  <span style={{ fontWeight: 700, color: '#7b2ff2', fontSize: 15 }}>{user.subscription_plan || 'free'}</span>
                </td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => handleView(user.id)} style={{ marginRight: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>View</button>
                  <button onClick={() => handleEdit(user)} style={{ marginRight: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>Edit</button>
                  <button onClick={() => handleDelete(user.id)} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #e5393533' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        @media (max-width: 900px) {
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { position: sticky; top: 0; background: #fff; z-index: 2; }
          td, th { min-width: 120px; }
          tr { margin-bottom: 16px; }
        }
        .spinner { border-top: 4px solid #fff !important; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
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
            <div><b>Role:</b> {selectedUser.role || 'free'}</div>
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
            <div style={{ marginBottom: 12 }}>
              <label>Role:</label>
              <select
                value={editUser.role || 'free'}
                onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                disabled={editUser.role === 'admin'}
              >
                <option value="free">Free</option>
                <option value="advanced">Advanced</option>
                <option value="premium">Premium</option>
              </select>
              {editUser.role === 'admin' && <div style={{ color: '#c62828', fontSize: 13, marginTop: 4 }}>Cannot change admin role</div>}
            </div>
            {/* Extra Stickers Section */}
            <div style={{ marginBottom: 12 }}>
              <label>Extra Stickers:</label>
              {isLoadingStickers ? (
                <div style={{ color: '#bfa16c', fontSize: 14 }}>Loading stickers...</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                  {PREMIUM_STICKERS.map(sticker => (
                    <label key={sticker} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', border: editUserStickers.includes(sticker) ? '2px solid #bfa16c' : '1.5px solid #ccc', borderRadius: 8, padding: 4, background: '#fff' }}>
                      <input
                        type="checkbox"
                        checked={editUserStickers.includes(sticker)}
                        onChange={e => {
                          if (e.target.checked) setEditUserStickers(prev => [...prev, sticker]);
                          else setEditUserStickers(prev => prev.filter(s => s !== sticker));
                        }}
                        disabled={editUser.role === 'admin'}
                      />
                      <img src={`/stickers/${sticker}`} alt={sticker} style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4, background: '#fafafa', border: '1px solid #eee' }} />
                    </label>
                  ))}
                </div>
              )}
              <button
                onClick={handleSaveStickers}
                disabled={isSaving || editUser.role === 'admin'}
                style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: isSaving || editUser.role === 'admin' ? 'not-allowed' : 'pointer', marginTop: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}
              >
                {isSaving ? 'Saving...' : 'Save Stickers'}
              </button>
            </div>
            <button onClick={handleSave} disabled={isSaving} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', marginRight: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>{isSaving ? 'Saving...' : 'Save'}</button>
            <button
              onClick={() => handleRoleChange(editUser.id, editUser.role)}
              disabled={isSaving || editUser.role === 'admin'}
              style={{ background: '#7b2ff2', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving || editUser.role === 'admin' ? 'not-allowed' : 'pointer', marginRight: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #7b2ff233' }}
            >
              Set Role
            </button>
            <button onClick={() => setEditUser(null)} style={{ background: '#fff', color: '#bfa16c', border: '1.5px solid #bfa16c', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 
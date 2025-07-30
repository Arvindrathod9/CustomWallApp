import React, { useEffect, useState } from 'react';
import { API_BASE } from '../api';

const API_URL = `${API_BASE}/api/admin/plans`;

// Common feature types for plans
const FEATURE_OPTIONS = [
  { key: 'share', label: 'Can Share', type: 'boolean' },
  { key: 'drafts_limit', label: 'Max Drafts', type: 'number' },
  { key: 'ultra', label: 'Ultra Feature', type: 'boolean' },
  { key: 'custom', label: 'Custom', type: 'text' },
];

function getFeatureType(key) {
  const found = FEATURE_OPTIONS.find(f => f.key === key);
  return found ? found.type : 'text';
}

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch plans from backend
  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Open modal for new or edit
  const openModal = (plan = null) => {
    setEditPlan(
      plan
        ? { ...plan, features: plan.features.map(f => ({ ...f })) }
        : { name: '', price: 0, display_order: 0, features: [{ feature_key: 'share', feature_value: 'true', feature_label: 'Can Share', feature_order: 0 }] }
    );
    setShowModal(true);
  };

  // Handle plan field change
  const handlePlanChange = (e) => {
    setEditPlan({ ...editPlan, [e.target.name]: e.target.value });
  };

  // Handle feature change
  const handleFeatureChange = (idx, field, value) => {
    let features = editPlan.features.map((f, i) =>
      i === idx ? { ...f, [field]: value } : f
    );
    // If feature_key changes, update label and value to defaults
    if (field === 'feature_key') {
      const opt = FEATURE_OPTIONS.find(opt => opt.key === value);
      features[idx].feature_label = opt ? opt.label : '';
      features[idx].feature_value = opt && opt.type === 'boolean' ? 'true' : '';
    }
    setEditPlan({ ...editPlan, features });
  };

  // Add new feature row
  const addFeature = () => {
    setEditPlan({
      ...editPlan,
      features: [
        ...editPlan.features,
        { feature_key: 'share', feature_value: 'true', feature_label: 'Can Share', feature_order: 0 }
      ]
    });
  };

  // Remove feature row
  const removeFeature = (idx) => {
    setEditPlan({ ...editPlan, features: editPlan.features.filter((_, i) => i !== idx) });
  };

  // Save plan (create or update)
  const savePlan = async () => {
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const method = editPlan.id ? 'PUT' : 'POST';
      const url = editPlan.id ? `${API_URL}/${editPlan.id}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editPlan.name,
          price: parseFloat(editPlan.price),
          display_order: parseInt(editPlan.display_order),
          features: editPlan.features.filter(f => f.feature_key && f.feature_label)
        })
      });
      if (!res.ok) throw new Error('Failed to save plan');
      setShowModal(false);
      setEditPlan(null);
      fetchPlans();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  // Delete plan
  const deletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    setIsSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete plan');
      fetchPlans();
    } catch (e) {
      setError(e.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Plans Management</h2>
      <button
        style={{ background: '#bfa16c', color: 'white', borderRadius: 18, padding: '10px 28px', fontWeight: 'bold', fontSize: 18, marginBottom: 24, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33', border: 'none', cursor: 'pointer' }}
        onClick={() => openModal()}
      >
        + Add New Plan
      </button>
      {loading ? <div>Loading plans...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.55)', borderRadius: 12, boxShadow: '0 2px 12px #bfa16c11', borderCollapse: 'collapse', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.35)' }}>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Price</th>
              <th style={{ padding: 10 }}>Order</th>
              <th style={{ padding: 10 }}>Features</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.id}>
                <td style={{ padding: 10 }}>{plan.name}</td>
                <td style={{ padding: 10 }}>₹{plan.price}</td>
                <td style={{ padding: 10 }}>{plan.display_order}</td>
                <td style={{ padding: 10 }}>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {plan.features.map(f => (
                      <li key={f.id}>
                        <b>{f.feature_label}:</b> {getFeatureType(f.feature_key) === 'boolean' ? (f.feature_value === 'true' ? 'Enabled' : 'Disabled') : f.feature_value}
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: 10 }}>
                  <button onClick={() => openModal(plan)} style={{ marginRight: 8, background: '#7b2ff2', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #7b2ff233' }}>Edit</button>
                  <button onClick={() => deletePlan(plan.id)} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #e5393533' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal for Add/Edit Plan */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 4px 32px #bfa16c22', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#bfa16c' }}>{editPlan.id ? 'Edit Plan' : 'Add New Plan'}</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Name:</label>
              <input type="text" name="name" value={editPlan.name} onChange={handlePlanChange} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Price (₹):</label>
              <input type="number" name="price" value={editPlan.price} onChange={handlePlanChange} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Display Order:</label>
              <input type="number" name="display_order" value={editPlan.display_order} onChange={handlePlanChange} style={{ width: '100%', padding: 8, borderRadius: 12, border: '1.5px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Features:</label>
              {editPlan.features.map((f, idx) => {
                const type = getFeatureType(f.feature_key);
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                    <select
                      value={f.feature_key}
                      onChange={e => handleFeatureChange(idx, 'feature_key', e.target.value)}
                      style={{ padding: 6, borderRadius: 8, border: '1px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                    >
                      {FEATURE_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                    {type === 'boolean' ? (
                      <select
                        value={f.feature_value}
                        onChange={e => handleFeatureChange(idx, 'feature_value', e.target.value)}
                        style={{ padding: 6, borderRadius: 8, border: '1px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                      >
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                      </select>
                    ) : type === 'number' ? (
                      <input
                        type="number"
                        value={f.feature_value}
                        onChange={e => handleFeatureChange(idx, 'feature_value', e.target.value)}
                        placeholder="Value"
                        style={{ width: 80, padding: 6, borderRadius: 8, border: '1px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={f.feature_value}
                        onChange={e => handleFeatureChange(idx, 'feature_value', e.target.value)}
                        placeholder="Value"
                        style={{ width: 120, padding: 6, borderRadius: 8, border: '1px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                      />
                    )}
                    <input
                      type="text"
                      value={f.feature_label}
                      onChange={e => handleFeatureChange(idx, 'feature_label', e.target.value)}
                      placeholder="Label"
                      style={{ width: 120, padding: 6, borderRadius: 8, border: '1px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                    />
                    <input
                      type="number"
                      value={f.feature_order}
                      onChange={e => handleFeatureChange(idx, 'feature_order', e.target.value)}
                      placeholder="Order"
                      style={{ width: 60, padding: 6, borderRadius: 8, border: '1px solid #bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                    />
                    <button onClick={() => removeFeature(idx)} style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 12, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>×</button>
                  </div>
                );
              })}
              <button onClick={addFeature} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 12, padding: '4px 14px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', marginTop: 6 }}>+ Add Feature</button>
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
              <button onClick={savePlan} disabled={isSaving} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', boxShadow: '0 1px 6px #bfa16c33' }}>{isSaving ? 'Saving...' : 'Save'}</button>
              <button onClick={() => setShowModal(false)} style={{ background: '#fff', color: '#bfa16c', border: '1.5px solid #bfa16c', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Cancel</button>
            </div>
            {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 
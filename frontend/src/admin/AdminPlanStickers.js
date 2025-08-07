import React, { useEffect, useState } from 'react';
import { FaCrown, FaUsers, FaSave, FaTrash } from 'react-icons/fa';
import { API_BASE } from '../api';

const PREMIUM_STICKERS = [
  'premium1.png',
  'premium2.png',
  'premium3.png',
];

const BASIC_STICKERS = [
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

const ALL_STICKERS = [...BASIC_STICKERS, ...PREMIUM_STICKERS];

export default function AdminPlanStickers() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planStickers, setPlanStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userCounts, setUserCounts] = useState({});

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/plans/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = [];
      if (res.ok) {
        data = await res.json();
      }
      // Default plans
      const defaultPlans = ['Free', 'Advanced', 'Premium'];
      // Merge API plans with defaults, case-insensitive, unique
      const mergedPlans = Array.from(new Set([...data.map(p => (typeof p === 'string' ? p : p.name || p)), ...defaultPlans]));
      setPlans(mergedPlans);
      // Get all users once, then count per plan
      const userCountsData = {};
      const usersRes = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let users = [];
      if (usersRes.ok) {
        users = await usersRes.json();
      }
      for (const plan of mergedPlans) {
        // Accept both plan name and role fields, and handle common variants
        const planLower = plan.toLowerCase();
        userCountsData[plan] = users.filter(u => {
          const planField = (u.subscription_plan || '').toLowerCase();
          const roleField = (u.role || '').toLowerCase();
          // Accept 'free' for 'free', 'basic', etc.
          if (planLower === 'free') {
            return planField === 'free' || planField === 'basic' || roleField === 'free' || roleField === 'basic';
          }
          if (planLower === 'advanced') {
            return planField === 'advanced' || roleField === 'advanced';
          }
          if (planLower === 'premium') {
            return planField === 'premium' || roleField === 'premium';
          }
          // fallback: match by plan name
          return planField === planLower || roleField === planLower;
        }).length;
      }
      setUserCounts(userCountsData);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const fetchPlanStickers = async (planName) => {
    if (!planName) return;
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/plan/${planName}/stickers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch plan stickers');
      const data = await res.json();
      setPlanStickers(data);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan) {
      fetchPlanStickers(selectedPlan);
    }
  }, [selectedPlan]);

  const handleSavePlanStickers = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/plan/${selectedPlan}/stickers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ stickers: planStickers })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save plan stickers');
      }
      setSuccess(`Stickers saved for ${selectedPlan} plan!`);
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  const handleStickerToggle = (sticker) => {
    setPlanStickers(prev => 
      prev.includes(sticker) 
        ? prev.filter(s => s !== sticker)
        : [...prev, sticker]
    );
  };

  const handleClearStickers = () => {
    setPlanStickers([]);
  };

  const handleSelectAllPremium = () => {
    setPlanStickers(PREMIUM_STICKERS);
  };

  const handleSelectAllBasic = () => {
    setPlanStickers(BASIC_STICKERS);
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', marginBottom: 24 }}>
        Plan Stickers Management
      </h2>
      
      {success && (
        <div style={{ 
          background: '#e0ffe0', 
          color: '#1e7b2a', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16, 
          fontWeight: 'bold' 
        }}>
          {success}
        </div>
      )}
      
      {error && (
        <div style={{ 
          background: '#ffe0e0', 
          color: '#c62828', 
          padding: 12, 
          borderRadius: 8, 
          marginBottom: 16, 
          fontWeight: 'bold' 
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          <label style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold', 
            color: '#bfa16c',
            fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
          }}>
            Select Plan:
          </label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 12,
              border: '2px solid #bfa16c',
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
              fontSize: 16,
              background: '#fff'
            }}
          >
            <option value="">Choose a plan...</option>
            {plans.map(plan => (
              <option key={plan} value={plan}>
                {plan} ({userCounts[plan] || 0} users)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPlan && (
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: 16, 
          padding: 24, 
          boxShadow: '0 2px 12px #bfa16c11',
          marginBottom: 24
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24 
          }}>
            <h3 style={{ 
              color: '#bfa16c', 
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
              margin: 0
            }}>
              Stickers for {selectedPlan} Plan
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSelectAllBasic}
                style={{
                  background: '#bfa16c',
                  color: 'white',
                  border: 'none',
                  borderRadius: 18,
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
                  fontSize: 14
                }}
              >
                Select Basic
              </button>
              <button
                onClick={handleSelectAllPremium}
                style={{
                  background: '#7b2ff2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 18,
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
                  fontSize: 14
                }}
              >
                Select Premium
              </button>
              <button
                onClick={handleClearStickers}
                style={{
                  background: '#e53935',
                  color: 'white',
                  border: 'none',
                  borderRadius: 18,
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
                  fontSize: 14
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ 
              color: '#7b2ff2', 
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
              marginBottom: 12
            }}>
              Premium Stickers
            </h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 12, 
              marginBottom: 24 
            }}>
              {PREMIUM_STICKERS.map(sticker => (
                <label
                  key={sticker}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    border: planStickers.includes(sticker) ? '3px solid #7b2ff2' : '2px solid #ddd',
                    borderRadius: 12,
                    padding: 12,
                    background: planStickers.includes(sticker) ? '#f0e6ff' : '#fff',
                    transition: 'all 0.2s',
                    minWidth: 80
                  }}
                >
                  <input
                    type="checkbox"
                    checked={planStickers.includes(sticker)}
                    onChange={() => handleStickerToggle(sticker)}
                    style={{ margin: 0 }}
                  />
                  <img
                    src={`/stickers/${sticker}`}
                    alt={sticker}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'contain',
                      borderRadius: 8,
                      background: '#fafafa',
                      border: '1px solid #eee'
                    }}
                  />
                  <span style={{
                    fontSize: 12,
                    color: '#666',
                    textAlign: 'center',
                    fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
                  }}>
                    {sticker.replace('.png', '')}
                  </span>
                </label>
              ))}
            </div>

            <h4 style={{ 
              color: '#bfa16c', 
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
              marginBottom: 12
            }}>
              Basic Stickers
            </h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 12 
            }}>
              {BASIC_STICKERS.map(sticker => (
                <label
                  key={sticker}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    border: planStickers.includes(sticker) ? '3px solid #bfa16c' : '2px solid #ddd',
                    borderRadius: 12,
                    padding: 12,
                    background: planStickers.includes(sticker) ? '#fff8e6' : '#fff',
                    transition: 'all 0.2s',
                    minWidth: 80
                  }}
                >
                  <input
                    type="checkbox"
                    checked={planStickers.includes(sticker)}
                    onChange={() => handleStickerToggle(sticker)}
                    style={{ margin: 0 }}
                  />
                  <img
                    src={`/stickers/${sticker}`}
                    alt={sticker}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'contain',
                      borderRadius: 8,
                      background: '#fafafa',
                      border: '1px solid #eee'
                    }}
                  />
                  <span style={{
                    fontSize: 12,
                    color: '#666',
                    textAlign: 'center',
                    fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
                  }}>
                    {sticker.replace('.png', '')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px 0',
            borderTop: '2px solid #eee'
          }}>
            <div style={{ 
              color: '#666', 
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
              fontSize: 14
            }}>
              Selected: {planStickers.length} stickers
            </div>
            <button
              onClick={handleSavePlanStickers}
              disabled={saving}
              style={{
                background: '#bfa16c',
                color: 'white',
                border: 'none',
                borderRadius: 18,
                padding: '12px 24px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? (
                <>
                  <div style={{
                    width: 16,
                    height: 16,
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Plan Stickers
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        borderRadius: 16, 
        padding: 24, 
        boxShadow: '0 2px 12px #bfa16c11'
      }}>
        <h3 style={{ 
          color: '#bfa16c', 
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
          marginBottom: 16
        }}>
          How It Works
        </h3>
        <div style={{ 
          color: '#666', 
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
          lineHeight: 1.6
        }}>
          <p><strong>Plan-based Sticker Assignment:</strong></p>
          <ul style={{ marginLeft: 20, marginTop: 8 }}>
            <li>When you assign stickers to a plan, all users in that plan automatically receive those stickers</li>
            <li>New users who register with that plan will also receive the same stickers</li>
            <li>When users upgrade to a new plan, they automatically get the stickers for that plan</li>
            <li>Individual user stickers are preserved and combined with plan stickers</li>
          </ul>
          <p style={{ marginTop: 16 }}>
            <strong>Note:</strong> This will affect {userCounts[selectedPlan] || 0} users currently in the {selectedPlan} plan.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 
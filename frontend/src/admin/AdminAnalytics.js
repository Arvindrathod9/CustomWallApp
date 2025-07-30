import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { API_BASE } from '../api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activity, setActivity] = useState([]);
  const [roleBreakdown, setRoleBreakdown] = useState({});
  const [countryBreakdown, setCountryBreakdown] = useState({});
  const [growth, setGrowth] = useState([]);
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        // Summary
        const res = await fetch(`${API_BASE}/api/admin/analytics/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        const data = await res.json();
        setSummary(data);
        // Role breakdown
        const res2 = await fetch(`${API_BASE}/api/admin/analytics/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoleBreakdown(await res2.json());
        // Country breakdown
        const res3 = await fetch(`${API_BASE}/api/admin/analytics/countries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCountryBreakdown(await res3.json());
        // Growth
        const res4 = await fetch(`${API_BASE}/api/admin/analytics/growth`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGrowth(await res4.json());
        // Revenue
        const res5 = await fetch(`${API_BASE}/api/admin/analytics/revenue`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRevenue(await res5.json());
        // Activity
        const res6 = await fetch(`${API_BASE}/api/admin/analytics/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data6 = await res6.json();
        setActivity(Array.isArray(data6) ? data6 : []);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  // Prepare chart data
  const rolePie = {
    labels: Object.keys(roleBreakdown),
    datasets: [{
      data: Object.values(roleBreakdown),
      backgroundColor: ['#bfa16c', '#1e7b2a', '#7b2ff2', '#2a509c'],
    }]
  };
  const countryPie = {
    labels: Object.keys(countryBreakdown),
    datasets: [{
      data: Object.values(countryBreakdown),
      backgroundColor: ['#bfa16c', '#7b2ff2', '#2a509c', '#1e7b2a', '#e53935', '#888'],
    }]
  };
  const growthLine = {
    labels: growth.map(g => g.month),
    datasets: [{
      label: 'New Users',
      data: growth.map(g => g.count),
      borderColor: '#bfa16c',
      backgroundColor: 'rgba(191,161,108,0.2)',
      tension: 0.3,
      fill: true
    }]
  };
  const revenueBar = {
    labels: revenue.map(r => r.month),
    datasets: [{
      label: 'Revenue',
      data: revenue.map(r => r.amount),
      backgroundColor: '#7b2ff2',
    }]
  };

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <h2 style={{ color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Analytics & Reports</h2>
      {loading ? <div style={{ textAlign: 'center', margin: 40 }}><div className="spinner" style={{ width: 40, height: 40, border: '4px solid #bfa16c', borderTop: '4px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : error ? <div style={{ color: 'red' }}>{error}</div> : summary && (
        <>
          <div style={{ display: 'flex', gap: 40, marginTop: 32, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 32, minWidth: 220, textAlign: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#bfa16c' }}>{summary.userCount}</div>
              <div style={{ fontSize: 18, color: '#bfa16c', marginTop: 8 }}>Total Users</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 32, minWidth: 220, textAlign: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#7b2ff2' }}>{summary.totalRevenue}</div>
              <div style={{ fontSize: 18, color: '#7b2ff2', marginTop: 8 }}>Total Revenue</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 32, minWidth: 220, textAlign: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#1e7b2a' }}>{roleBreakdown.premium || 0}</div>
              <div style={{ fontSize: 18, color: '#1e7b2a', marginTop: 8 }}>Premium Users</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 32, minWidth: 220, textAlign: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#2a509c' }}>{roleBreakdown.advanced || 0}</div>
              <div style={{ fontSize: 18, color: '#2a509c', marginTop: 8 }}>Advanced Users</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 40, marginTop: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24 }}>
              <h4 style={{ color: '#bfa16c', marginBottom: 16 }}>User Growth</h4>
              <Line data={growthLine} options={{ plugins: { legend: { display: false } } }} height={180} />
            </div>
            <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24 }}>
              <h4 style={{ color: '#7b2ff2', marginBottom: 16 }}>Revenue by Month</h4>
              <Bar data={revenueBar} options={{ plugins: { legend: { display: false } } }} height={180} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 40, marginTop: 40, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24 }}>
              <h4 style={{ color: '#bfa16c', marginBottom: 16 }}>Users by Role</h4>
              <Pie data={rolePie} height={180} />
            </div>
            <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24 }}>
              <h4 style={{ color: '#bfa16c', marginBottom: 16 }}>Top Countries</h4>
              <Pie data={countryPie} height={180} />
            </div>
          </div>
          <div style={{ marginTop: 40, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24 }}>
            <h4 style={{ color: '#bfa16c', marginBottom: 16 }}>Recent Activity</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Array.isArray(activity) && activity.length === 0 ? (
                <li style={{ color: '#888' }}>No recent activity.</li>
              ) : Array.isArray(activity) ? (
                activity.map((a, i) => (
                  <li key={i} style={{ marginBottom: 10, color: '#2a509c', fontWeight: 500 }}>
                    {a.time} — <span style={{ color: '#bfa16c' }}>{a.type}</span> — {a.user}
                  </li>
                ))
              ) : (
                <li style={{ color: '#888' }}>No recent activity.</li>
              )}
            </ul>
          </div>
          <style>{`
            .spinner { border-top: 4px solid #fff !important; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </>
      )}
    </div>
  );
} 
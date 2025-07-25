import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserFriends } from 'react-icons/fa';

function DraftsNavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = window.innerWidth <= 700;
  return (
    <nav className="modern-navbar">
      <div className="modern-navbar-logo" onClick={() => navigate('/wall')}>MEMORY WALL</div>
      {isMobile ? (
        <>
          <button
            className="hamburger-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: 8 }}
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Open menu"
          >
            <div style={{ width: 28, height: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
            </div>
          </button>
          {menuOpen && (
            <div className="mobile-menu-overlay" style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.98)', zIndex: 9999,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32
            }}>
              <button onClick={() => { setMenuOpen(false); navigate('/wall'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none', marginBottom: 16 }}>My Wall</button>
              <button onClick={() => { setMenuOpen(false); navigate('/drafts'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Drafts</button>
              <button onClick={() => { setMenuOpen(false); navigate('/home'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Home</button>
              <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, fontSize: 32, color: '#bfa16c', background: 'none', border: 'none' }}>&times;</button>
            </div>
          )}
        </>
      ) : (
        <ul className="modern-navbar-menu">
          <li onClick={() => navigate('/wall')} style={{ cursor: 'pointer' }}>My Wall</li>
          <li onClick={() => navigate('/drafts')} style={{ cursor: 'pointer' }}>Drafts</li>
          <li onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>Home</li>
        </ul>
      )}
    </nav>
  );
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [sharedDrafts, setSharedDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Role-based feature restriction
  const canShareOrSave = user && ['advanced', 'premium', 'admin'].includes(user.role);

  // Helper to get feature value
  const getFeatureValue = (key) => {
    if (!user || !user.features) return null;
    const f = user.features.find(f => f.feature_key === key);
    return f ? f.feature_value : null;
  };
  const draftsLimit = parseInt(getFeatureValue('drafts_limit')) || 0;
  const canShare = getFeatureValue('share') === 'true';

  useEffect(() => {
    async function fetchDrafts() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        // Fetch own drafts
        const res = await axios.get(`http://localhost:5000/api/drafts?userid=${user.userid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDrafts(res.data);
        // Fetch drafts shared with user
        const sharedRes = await axios.get('http://localhost:5000/api/drafts/shared', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSharedDrafts(sharedRes.data);
      } catch (e) {
        setError('Failed to load drafts');
      } finally {
        setLoading(false);
      }
    }
    fetchDrafts();
  }, [user.userid]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/drafts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrafts(drafts.filter(d => d.id !== id));
    } catch {
      alert('Failed to delete draft');
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/wall/draft/${id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const handleCreateNewDraft = async () => {
    if (draftsLimit && drafts.length >= draftsLimit) {
      alert(`You have reached your drafts limit (${draftsLimit}). Delete a draft or upgrade your plan to save more.`);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Default wall state for a new draft
      const wallState = {
        selectedType: 'image',
        selectedWall: '/walls/wall1.jpg',
        selectedColor: '#ffffff',
        uploadedWall: null,
        width: 800,
        height: 500,
        wallImages: [],
      };
      // Find next draft name
      const nums = drafts.map(d => parseInt(d.name)).filter(n => !isNaN(n));
      const name = String(nums.length > 0 ? Math.max(...nums) + 1 : 1);
      const payload = {
        userid: user.userid,
        name,
        data: JSON.stringify(wallState),
        public: true,
      };
      const res = await axios.post('http://localhost:5000/api/drafts', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newId = res.data.id;
      if (newId) {
        navigate(`/wall/draft/${newId}`);
      } else {
        alert('Failed to create draft');
      }
    } catch {
      alert('Failed to create draft');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading drafts...</div>;
  if (error) return <div style={{ color: '#c62828', textAlign: 'center', marginTop: 40 }}>{error}</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/home.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', padding: 40 }}>
      <DraftsNavBar />
      <h2 style={{ color: '#bfa16c', marginBottom: 32, textAlign: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Your Drafts</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <button
          style={{ background: canShareOrSave ? '#bfa16c' : '#ccc', color: 'white', borderRadius: 24, padding: '10px 32px', fontWeight: 'bold', fontSize: 18, boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', cursor: canShareOrSave ? 'pointer' : 'not-allowed' }}
          onClick={canShareOrSave ? handleCreateNewDraft : undefined}
          disabled={!canShareOrSave}
          title={canShareOrSave ? '+ Create New Draft' : 'Upgrade to Advanced or Premium to create drafts'}
        >
          + Create New Draft
        </button>
      </div>
      {!canShareOrSave && (
        <div style={{ color: '#c62828', marginBottom: 24, fontWeight: 'bold', textAlign: 'center' }}>
          Upgrade to Advanced or Premium to create, save, or share drafts.
          <button
            style={{ marginLeft: 16, background: '#bfa16c', color: 'white', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 15, boxShadow: '0 1px 6px #bfa16c33', cursor: 'pointer' }}
            onClick={() => navigate('/upgrade')}
          >
            Upgrade
          </button>
        </div>
      )}
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {drafts.length === 0 && <div style={{ textAlign: 'center', color: '#888' }}>No drafts found.</div>}
        {drafts.map(d => (
          <div key={d.id} style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, backdropFilter: 'blur(6px)' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 20, color: '#bfa16c', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Draft {d.name}</div>
              <div style={{ color: d.public ? '#1e7b2a' : '#c62828', fontWeight: 'bold', marginTop: 4 }}>{d.public ? 'Public' : 'Private'}</div>
              <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Last updated: {d.created_at ? new Date(d.created_at).toLocaleString() : 'N/A'}</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                style={{ background: '#bfa16c', color: 'white', borderRadius: 24, padding: '8px 20px', fontWeight: 'bold', fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                onClick={() => navigate(`/wall/draft/${d.id}`)}
              >
                Edit
              </button>
              <button
                style={{ background: canShareOrSave && canShare ? '#7b2ff2' : '#ccc', color: 'white', borderRadius: 24, padding: '8px 20px', fontWeight: 'bold', fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', cursor: canShareOrSave && canShare ? 'pointer' : 'not-allowed' }}
                onClick={canShareOrSave && canShare ? () => handleShare(d.id) : undefined}
                disabled={!canShareOrSave || !canShare}
                title={canShareOrSave && canShare ? 'Share draft' : 'Upgrade your plan to share drafts'}
              >
                Share
              </button>
              <button
                style={{ background: '#e53935', color: 'white', borderRadius: 24, padding: '8px 20px', fontWeight: 'bold', fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                onClick={() => handleDelete(d.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Shared drafts section - always visible */}
      <div style={{ maxWidth: 800, margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h3 style={{ color: '#7b2ff2', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
          <FaUserFriends size={22} /> Drafts Shared With You
        </h3>
        {sharedDrafts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: 32, background: 'rgba(255,255,255,0.55)', borderRadius: 16, boxShadow: '0 2px 12px #7b2ff211', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, backdropFilter: 'blur(6px)' }}>
            <FaUserFriends size={48} style={{ opacity: 0.2 }} />
            <div style={{ fontSize: 18, marginTop: 8 }}>No drafts have been shared with you yet.</div>
            <div style={{ fontSize: 14, color: '#aaa' }}>When someone adds you as an editor, their draft will appear here.</div>
          </div>
        ) : (
          sharedDrafts.map(d => (
            <div key={d.id} style={{ background: 'rgba(255,255,255,0.35)', borderRadius: 16, boxShadow: '0 2px 12px #7b2ff211', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, backdropFilter: 'blur(4px)' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 18, color: '#7b2ff2', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>Draft {d.name}</div>
                <div style={{ color: d.public ? '#1e7b2a' : '#c62828', fontWeight: 'bold', marginTop: 4 }}>{d.public ? 'Public' : 'Private'}</div>
                <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Last updated: {d.created_at ? new Date(d.created_at).toLocaleString() : 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  style={{ background: '#7b2ff2', color: 'white', borderRadius: 24, padding: '8px 20px', fontWeight: 'bold', fontSize: 16, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
                  onClick={() => navigate(`/wall/draft/${d.id}`)}
                >
                  Open
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
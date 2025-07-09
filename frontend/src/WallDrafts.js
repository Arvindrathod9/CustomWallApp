import React, { useState } from 'react';
import axios from 'axios';

export default function WallDrafts({
  user,
  wallState,
  setWallState,
  defaultWalls
}) {
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);

  // API helpers
  const fetchDrafts = async (userid) => {
    const res = await axios.get(`http://localhost:5000/api/drafts?userid=${userid}`);
    return res.data;
  };
  const saveDraft = async (userid, name, data) => {
    const res = await axios.post('http://localhost:5000/api/drafts', { userid, name, data });
    return res.data;
  };
  const deleteDraft = async (id) => {
    const res = await axios.delete(`http://localhost:5000/api/drafts/${id}`);
    return res.data;
  };

  // Serialize wall state for drafts
  const getWallDraftData = () => JSON.stringify(wallState);
  // Restore wall state from draft
  const loadWallDraftData = (data) => {
    try {
      const d = JSON.parse(data);
      setWallState({
        selectedType: d.selectedType || 'image',
        selectedWall: d.selectedWall || defaultWalls[0],
        selectedColor: d.selectedColor || '#ffffff',
        uploadedWall: d.uploadedWall || null,
        width: d.width || 800,
        height: d.height || 500,
        wallImages: d.wallImages || [],
      });
    } catch (e) {
      alert('Failed to load draft');
    }
  };

  // Get next serial draft name
  const getNextDraftName = () => {
    if (drafts.length === 0) return '1';
    // Find max numeric name
    const nums = drafts.map(d => parseInt(d.name)).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return String(max + 1);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={async () => {
          // Always create a new draft with serial name
          const allDrafts = drafts.length ? drafts : await fetchDrafts(user.userid);
          setDrafts(allDrafts);
          const name = getNextDraftName();
          const wallData = getWallDraftData();
          await saveDraft(user.userid, name, wallData);
          alert('Draft saved as ' + name);
        }}>
          Save as Draft
        </button>
        <button onClick={async () => {
          const drafts = await fetchDrafts(user.userid);
          setDrafts(drafts);
          setShowDrafts(true);
        }}>
          Drafts
        </button>
      </div>
      {showDrafts && (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 16, marginTop: 8, borderRadius: 10, minWidth: 320 }}>
          <h3>Your Drafts</h3>
          {drafts.length === 0 && <div>No drafts found.</div>}
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {drafts.map(draft => (
              <li key={draft.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><strong>{draft.name}</strong></span>
                <span>
                  <button style={{ marginLeft: 8 }} onClick={() => {
                    loadWallDraftData(draft.data);
                    setShowDrafts(false);
                  }}>
                    Load
                  </button>
                  <button style={{ marginLeft: 8, color: 'red' }} onClick={async () => {
                    await deleteDraft(draft.id);
                    setDrafts(drafts.filter(d => d.id !== draft.id));
                  }}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowDrafts(false)} style={{ marginTop: 8 }}>Close</button>
        </div>
      )}
    </div>
  );
} 
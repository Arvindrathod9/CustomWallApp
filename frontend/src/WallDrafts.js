import React, { useState } from 'react';
import axios from 'axios';
import { toBase64 } from './MainWall';

export default function WallDrafts({
  user,
  wallState,
  setWallState,
  defaultWalls,
  currentDraftId,
  setCurrentDraftId
}) {
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);

  // API helpers
  const fetchDrafts = async (userid) => {
    const res = await axios.get(`http://localhost:5000/api/drafts?userid=${userid}`);
    return res.data;
  };
  const saveDraft = async (userid, name, data, id) => {
    const payload = id ? { userid, name, data, id } : { userid, name, data };
    const res = await axios.post('http://localhost:5000/api/drafts', payload);
    return res.data;
  };
  const deleteDraft = async (id) => {
    const res = await axios.delete(`http://localhost:5000/api/drafts/${id}`);
    return res.data;
  };

  // Serialize wall state for drafts
  const getWallDraftData = async () => {
    // Deep copy wallState
    const state = JSON.parse(JSON.stringify(wallState));
    // Convert wall background to base64 if needed
    if (state.selectedType === 'upload' && state.uploadedWall && !state.uploadedWall.startsWith('data:')) {
      state.uploadedWall = await toBase64(state.uploadedWall);
    }
    // Convert all wallImages src to base64 if needed
    if (Array.isArray(state.wallImages)) {
      for (let img of state.wallImages) {
        if (img.src && !img.src.startsWith('data:')) {
          img.src = await toBase64(img.src);
        }
      }
    }
    return JSON.stringify(state);
  };
  // Restore wall state from draft
  const loadWallDraftData = (data, id) => {
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
        draftId: id,
      });
      setCurrentDraftId(id);
    } catch (e) {
      console.error('Failed to load draft:', e);
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
          const allDrafts = drafts.length ? drafts : await fetchDrafts(user.userid);
          setDrafts(allDrafts);
          let name = getNextDraftName();
          let id = null;
          // If editing an existing draft, update it
          if (currentDraftId != null) {
            id = Number(currentDraftId);
            const draft = allDrafts.find(d => d.id == id);
            if (draft) {
              name = draft.name;
            }
          }
          const wallData = await getWallDraftData();
          await saveDraft(user.userid, name, wallData, id);
          console.log(id ? 'Draft updated.' : 'Draft saved as ' + name);
          // Show alert message when draft is saved
          alert(id ? `Draft "${name}" updated successfully!` : `Draft "${name}" saved successfully!`);
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
                    loadWallDraftData(draft.data, Number(draft.id));
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
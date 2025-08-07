import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toBase64 } from './MainWall';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './api';

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
  const [isPublic, setIsPublic] = useState(true); // Default to public
  const [shareLink, setShareLink] = useState('');
  const navigate = useNavigate();
  const lastSavedState = useRef(null);

  // Role-based feature restriction
  const canShareOrSave = user && (user.isAdmin || ['advanced', 'premium', 'admin'].includes(user.role));

  // Helper to get feature value
  const getFeatureValue = (key) => {
    if (!user || !user.features) return null;
    const f = user.features.find(f => f.feature_key === key);
    return f ? f.feature_value : null;
  };
  const draftsLimit = parseInt(getFeatureValue('drafts_limit')) || 0;
  const canShare = getFeatureValue('share') === 'true';

  // API helpers
  const fetchDrafts = async (userid) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_BASE}/api/drafts?userid=${userid}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };
  const saveDraft = async (userid, name, data, id, isPublicVal) => {
    const token = localStorage.getItem('token');
    const payload = id ? { userid, name, data, id, public: isPublicVal } : { userid, name, data, public: isPublicVal };
    const res = await axios.post(`${API_BASE}/api/drafts`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  };
  const deleteDraft = async (id) => {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`${API_BASE}/api/drafts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
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
      console.log('Loaded draft data:', d); // Debug log
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

  // Handle share link copy
  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/wall/draft/${id}`;
    navigator.clipboard.writeText(url);
    setShareLink(url);
    alert('Share link copied to clipboard!');
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!currentDraftId || !user || !user.userid) return;
    let isMounted = true;
    const saveIfChanged = async () => {
      const wallData = await getWallDraftData();
      if (lastSavedState.current !== wallData) {
        lastSavedState.current = wallData;
        try {
          await saveDraft(user.userid, 'Draft', wallData, currentDraftId, true);
          // Optionally: show a "Saved" indicator here
        } catch (e) {
          // Optionally: handle save error
        }
      }
    };
    const timeout = setTimeout(() => { if (isMounted) saveIfChanged(); }, 1000);
    return () => { isMounted = false; clearTimeout(timeout); };
  }, [wallState, currentDraftId, user]);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* Removed public/private status text */}
        {currentDraftId && (
          <button
            style={{ background: canShare && canShareOrSave ? '#bfa16c' : '#ccc', color: 'white', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', marginLeft: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 16, boxShadow: '0 1px 6px #bfa16c33', cursor: canShare && canShareOrSave ? 'pointer' : 'not-allowed' }}
            onClick={canShare && canShareOrSave ? () => handleCopyLink(currentDraftId) : undefined}
            disabled={!canShare || !canShareOrSave}
            title={canShare && canShareOrSave ? 'Copy share link' : 'Upgrade your plan to share'}
          >
            Copy Share Link
          </button>
        )}
        {currentDraftId && shareLink && (
          <span style={{ marginLeft: 8, color: '#2a509c', fontSize: 13 }}>{shareLink}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Save as New Draft button: only show if not editing an existing draft */}
        {!currentDraftId && (
        <button onClick={canShareOrSave ? async () => {
          const allDrafts = drafts.length ? drafts : await fetchDrafts(user.userid);
          setDrafts(allDrafts);
          if (draftsLimit && allDrafts.length >= draftsLimit) {
            alert(`You have reached your drafts limit (${draftsLimit}). Delete a draft or upgrade your plan to save more.`);
            return;
          }
          let name = getNextDraftName();
          let publicVal = true; // Always public
            const wallData = await getWallDraftData();
            const result = await saveDraft(user.userid, name, wallData, null, publicVal);
            alert(`Draft \"${name}\" saved successfully!`);
            // Do NOT setCurrentDraftId here, so further saves are always new drafts
            if (result && result.id) navigate(`/wall/draft/${result.id}`);
          } : undefined}
          style={{ background: canShareOrSave ? '#bfa16c' : '#ccc', color: 'white', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 16, boxShadow: '0 1px 6px #bfa16c33', cursor: canShareOrSave ? 'pointer' : 'not-allowed' }}
          disabled={!canShareOrSave}
          title={canShareOrSave ? 'Save as new draft' : 'Upgrade to Advanced or Premium to save drafts'}
        >
            Save as New Draft
        </button>
        )}
        {/* Update Draft button: only show if editing an existing draft */}
        {currentDraftId && (
          <button onClick={canShareOrSave ? async () => {
            const allDrafts = drafts.length ? drafts : await fetchDrafts(user.userid);
            setDrafts(allDrafts);
            let id = Number(currentDraftId);
            let name = 'Draft';
            let publicVal = true;
            const draft = allDrafts.find(d => d.id == id);
            if (draft) {
              name = draft.name;
              publicVal = true;
          }
          const wallData = await getWallDraftData();
          const result = await saveDraft(user.userid, name, wallData, id, publicVal);
            alert(`Draft \"${name}\" updated successfully!`);
            if (id) navigate(`/wall/draft/${id}`);
        } : undefined}
          style={{ background: canShareOrSave ? '#bfa16c' : '#ccc', color: 'white', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 16, boxShadow: '0 1px 6px #bfa16c33', cursor: canShareOrSave ? 'pointer' : 'not-allowed' }}
          disabled={!canShareOrSave}
          title={canShareOrSave ? 'Update draft' : 'Upgrade to Advanced or Premium to update drafts'}
        >
            Update Draft
        </button>
        )}
        <button onClick={async () => {
          // Instead of showing drafts in the panel, navigate to the Drafts page
          navigate('/drafts');
        }}
          style={{ background: '#bfa16c', color: 'white', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 16, boxShadow: '0 1px 6px #bfa16c33', cursor: 'pointer' }}
        >
          Load Drafts
        </button>
        {currentDraftId && (
          <button onClick={async () => {
            await deleteDraft(currentDraftId);
            setCurrentDraftId(null);
            alert('Draft deleted');
          }}
            style={{ background: '#e53935', color: 'white', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 16, boxShadow: '0 1px 6px #e5393533', cursor: 'pointer' }}
          >
            Delete Draft
          </button>
        )}
      </div>
      {/* List drafts for loading */}
      {showDrafts && (
        <div style={{ marginTop: 16 }}>
          <h4>Drafts</h4>
          <ul>
            {drafts.map(d => (
              <li key={d.id} style={{ marginBottom: 8 }}>
                <button onClick={() => {
                  loadWallDraftData(d.data, d.id);
                  navigate(`/wall/draft/${d.id}`);
                }} style={{ marginRight: 8, background: '#bfa16c', color: 'white', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 15, boxShadow: '0 1px 6px #bfa16c33', cursor: 'pointer' }}>
                  Load Draft {d.name}
                </button>
                <button style={{ marginLeft: 8, background: '#bfa16c', color: 'white', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 15, boxShadow: '0 1px 6px #bfa16c33', cursor: 'pointer' }} onClick={() => handleCopyLink(d.id)}>Copy Link</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!canShareOrSave && (
        <div style={{ color: '#c62828', marginTop: 16, fontWeight: 'bold' }}>
          Upgrade to Advanced or Premium to save or share drafts.
          <button
            style={{ marginLeft: 16, background: '#bfa16c', color: 'white', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 15, boxShadow: '0 1px 6px #bfa16c33', cursor: 'pointer' }}
            onClick={() => navigate('/upgrade')}
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
} 
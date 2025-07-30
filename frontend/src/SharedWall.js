import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Wall from './Wall';
import WallControls from './WallControls';
import { toBase64 } from './MainWall';
import NavBar from './NavBar';
import ProfilePanel from './ProfilePanel';
import { API_BASE } from './api';

const defaultWalls = [
  '/walls/wall1.jpg',
  '/walls/wall2.jpg',
  '/walls/wall3.jpg',
  '/walls/wall4.jpg',
  '/walls/wall5.jpg',
  '/walls/wall6.jpg',
];

export default function SharedWall({ user, onLogout }) {
  const { id } = useParams();
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [selectedType, setSelectedType] = useState('image');
  const [selectedWall, setSelectedWall] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [uploadedWall, setUploadedWall] = useState(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(500);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const wallRef = useRef();
  const [selectedImgId, setSelectedImgId] = useState(null);
  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [wallImages, setWallImages] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [editors, setEditors] = useState([]);
  const [newEditor, setNewEditor] = useState('');
  const [editorError, setEditorError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = window.innerWidth <= 700;

  useEffect(() => {
    async function fetchDraft() {
      setError('');
      setDraft(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/draft/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || 'Draft not found or not public');
          return;
        }
        const data = await res.json();
        setDraft(data);
        // Set wall state for editing
        let wallData = {};
        try {
          wallData = JSON.parse(data.data);
        } catch {}
        setSelectedType(wallData.selectedType || 'image');
        setSelectedWall(wallData.selectedWall || null);
        setSelectedColor(wallData.selectedColor || '#ffffff');
        setUploadedWall(wallData.uploadedWall || null);
        setWidth(wallData.width || 800);
        setHeight(wallData.height || 500);
        setWallImages(wallData.wallImages || []);
        // Robustly load editors from draft
        let loadedEditors = [];
        try {
          loadedEditors = data.editors && data.editors.startsWith('[') ? JSON.parse(data.editors) : [];
        } catch (e) {
          loadedEditors = [];
        }
        setEditors(loadedEditors);
        console.log('Loaded editors:', loadedEditors, 'Raw editors:', data.editors);
      } catch (e) {
        setError('Failed to load draft');
      }
    }
    fetchDraft();
  }, [id]);

  // Auto-save editors when they change (owner only)
  useEffect(() => {
    if (!draft || !user || draft.userid !== user.userid) return;
    // Only auto-save if draft is loaded and user is owner
    const saveEditors = async () => {
      try {
        const token = localStorage.getItem('token');
        const payload = {
          userid: user.userid,
          name: draft.name,
          data: draft.data, // Save the current wall state as-is
          id: draft.id,
          public: draft.public,
          editors,
        };
        await fetch(`${API_BASE}/api/drafts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        // Optionally, show a toast or log
        console.log('Editors auto-saved:', editors);
      } catch (e) {
        console.error('Failed to auto-save editors:', e);
      }
    };
    saveEditors();
    // Only run when editors changes
  }, [editors]);

  if (error) {
    return <div style={{ color: '#c62828', textAlign: 'center', marginTop: 40 }}>{error}</div>;
  }
  if (!draft) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading wall...</div>;
  }

  if (!user) {
    // Store the draft ID for post-register redirect
    localStorage.setItem('pendingDraftId', id);
    window.location.href = '/main';
    return null;
  }

  const isOwner = user && draft.userid === user.userid;
  const isEditor = user && editors.includes(user.username);

  // Wall background prop
  let wallBg = null;
  if (selectedType === 'image') wallBg = { type: 'image', value: selectedWall };
  else if (selectedType === 'color') wallBg = { type: 'color', value: selectedColor };
  else if (selectedType === 'upload') wallBg = { type: 'upload', value: uploadedWall };

  // Save/update draft
  const handleSaveDraft = async () => {
    try {
      const token = localStorage.getItem('token');
      // Prepare wall state
      const wallState = {
        selectedType,
        selectedWall,
        selectedColor,
        uploadedWall,
        width,
        height,
        wallImages,
      };
      // Convert wall background to base64 if needed
      if (wallState.selectedType === 'upload' && wallState.uploadedWall && !wallState.uploadedWall.startsWith('data:')) {
        wallState.uploadedWall = await toBase64(wallState.uploadedWall);
      }
      // Convert all wallImages src to base64 if needed
      if (Array.isArray(wallState.wallImages)) {
        for (let img of wallState.wallImages) {
          if (img.src && !img.src.startsWith('data:')) {
            img.src = await toBase64(img.src);
          }
        }
      }
      const payload = {
        userid: user.userid,
        name: draft.name,
        data: JSON.stringify(wallState),
        id: draft.id,
        public: true,
        editors, // Always send the current editors array
      };
      await fetch(`${API_BASE}/api/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      alert('Draft updated successfully!');
    } catch {
      alert('Failed to update draft');
    }
  };

  // Share link
  const handleShare = () => {
    const url = `${window.location.origin}/wall/draft/${draft.id}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  // Handlers for left-side background selection
  const handleWallClick = (wall) => {
    setSelectedType('image');
    setSelectedWall(wall);
    setUploadedWall(null);
  };
  const handleColorButtonClick = () => {
    setShowColorPicker((prev) => !prev);
  };
  const handleColorChange = (color) => {
    setSelectedType('color');
    setSelectedColor(color.hex);
    setSelectedWall(null);
    setUploadedWall(null);
  };
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedType('upload');
      const base64 = await toBase64(file);
      setUploadedWall(base64);
      setSelectedWall(null);
    }
  };
  // Wall size controls
  const handleWidthChange = (e) => setWidth(Number(e.target.value));
  const handleHeightChange = (e) => setHeight(Number(e.target.value));
  // Profile handlers
  const handleProfileClick = () => setShowProfile(true);
  const handleProfileClose = () => setShowProfile(false);

  // Editor management UI (owner only)
  const renderEditorsUI = () => (
    <div style={{ margin: '16px 0', background: '#f7f8fa', borderRadius: 10, padding: 16, boxShadow: '0 1px 6px #0001' }}>
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Editors (can edit this wall):</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {editors.map((editor, idx) => (
          <span key={editor} style={{ background: '#e0e7ff', color: '#2a509c', borderRadius: 6, padding: '4px 10px', display: 'inline-flex', alignItems: 'center' }}>
            {editor}
            <button style={{ marginLeft: 6, background: 'none', color: '#c62828', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setEditors(editors.filter(e => e !== editor))} title="Remove editor">&times;</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={newEditor}
          onChange={e => { setNewEditor(e.target.value); setEditorError(''); }}
          placeholder="Add editor username"
          style={{ borderRadius: 4, border: '1px solid #bbb', padding: '4px 8px' }}
        />
        <button
          style={{ background: '#bfa16c', color: 'white', borderRadius: 18, fontWeight: 'bold', padding: '4px 18px', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 15, boxShadow: '0 1px 6px #bfa16c33', cursor: 'pointer' }}
          onClick={async () => {
            if (!newEditor || editors.includes(newEditor)) return;
            setEditorError('');
            try {
              const res = await fetch(`${API_BASE}/api/users/exists/${encodeURIComponent(newEditor)}`);
              const data = await res.json();
              if (data.exists) {
                setEditors([...editors, newEditor]);
                setNewEditor('');
              } else {
                setEditorError('User does not exist.');
              }
            } catch {
              setEditorError('Failed to check username.');
            }
          }}
        >Add</button>
      </div>
      {editorError && <div style={{ color: '#c62828', marginTop: 6 }}>{editorError}</div>}
    </div>
  );

  // Role-based feature restriction
  const canShareOrSave = user && ['advanced', 'premium', 'admin'].includes(user.role);

  return (
    <>
      {/* Top navigation bar */}
      <NavBar user={user} onLogout={onLogout} onProfileClick={handleProfileClick} />
      {isMobile && (
        <button
          className="hamburger-btn"
          style={{ position: 'fixed', top: 18, left: 18, zIndex: 1002, background: 'white', border: '2px solid #bfa16c', borderRadius: 8, padding: 8, boxShadow: '0 2px 8px #bfa16c33' }}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open wall options"
        >
          <div style={{ width: 28, height: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
            <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
            <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
          </div>
        </button>
      )}
      {isMobile && sidebarOpen && (
        <div className="mobile-wall-sidebar" style={{
          position: 'fixed', top: 0, left: 0, width: '80vw', maxWidth: 340, height: '100vh', background: 'rgba(255,255,255,0.98)', zIndex: 2000,
          boxShadow: '2px 0 16px #bfa16c33', display: 'flex', flexDirection: 'column', padding: 24, gap: 18
        }}>
          <button onClick={() => setSidebarOpen(false)} style={{ alignSelf: 'flex-end', fontSize: 32, color: '#bfa16c', background: 'none', border: 'none', marginBottom: 12 }}>&times;</button>
          {/* Wall background selection and upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            {defaultWalls.map((wall, idx) => (
              <img
                key={wall}
                src={wall}
                alt={`Wall ${idx + 1}`}
                style={{ width: 80, height: 56, objectFit: 'cover', border: selectedType === 'image' && selectedWall === wall ? '3px solid #2a509c' : '2px solid #ccc', borderRadius: 8, cursor: isOwner ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #0002', background: '#eee', opacity: isOwner ? 1 : 0.5 }}
                onClick={() => isOwner && (handleWallClick(wall), setSidebarOpen(false))}
              />
            ))}
            <div style={{ marginTop: 16 }}>
              <input type="file" accept="image/*" onChange={handleUpload} id="wall-upload" style={{ display: 'none' }} />
              <label htmlFor="wall-upload" style={{ background: '#bfa16c', color: 'white', padding: '6px 16px', borderRadius: 18, cursor: isOwner ? 'pointer' : 'not-allowed', fontWeight: 'bold', boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', opacity: isOwner ? 1 : 0.5 }}>
                Upload Wall
              </label>
              {uploadedWall && (
                <img src={uploadedWall} alt="Uploaded Wall" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: selectedType === 'upload' ? '3px solid #2a509c' : '2px solid #ccc', cursor: isOwner ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #0002', background: '#eee', opacity: isOwner ? 1 : 0.5 }} onClick={() => isOwner && (setSelectedType('upload'), setSidebarOpen(false))} />
              )}
            </div>
            {/* Color picker and color selection */}
            <div style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button onClick={handleColorButtonClick} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 18px', fontWeight: 'bold', marginBottom: 8, opacity: isOwner ? 1 : 0.5, cursor: isOwner ? 'pointer' : 'not-allowed' }}>Choose Color</button>
              {showColorPicker && (
                <input type="color" value={selectedColor} onChange={e => handleColorChange({ hex: e.target.value })} style={{ width: 48, height: 48, border: 'none', borderRadius: 24, marginBottom: 8 }} disabled={!isOwner} />
              )}
              <div style={{ width: 32, height: 32, background: selectedColor, border: '2px solid #bfa16c', borderRadius: 16 }} />
            </div>
          </div>
          {/* Wall size controls */}
          <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '10px 18px', marginBottom: 4 }}>
            <label>
              Width:
              <input type="number" value={width} min={200} max={2000} onChange={e => setWidth(Number(e.target.value))} style={{ marginLeft: 4, width: 60, borderRadius: 4, border: '1px solid #bbb', padding: '2px 6px' }} disabled={!isOwner} />
            </label>
            <label>
              Height:
              <input type="number" value={height} min={200} max={2000} onChange={e => setHeight(Number(e.target.value))} style={{ marginLeft: 4, width: 60, borderRadius: 4, border: '1px solid #bbb', padding: '2px 6px' }} disabled={!isOwner} />
            </label>
          </div>
        </div>
      )}
      <div className="main-layout" style={{
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: isMobile ? 0 : 40,
        backgroundImage: 'url(/home.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
        width: '100vw',
        overflowX: 'auto',
      }}>
        {/* Left: Wall background selection (hide on mobile) */}
        {!isMobile && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120, marginTop: 40, gap: 24,
            background: 'rgba(255,255,255,0.55)', borderRadius: 18, boxShadow: '0 2px 16px #bfa16c11', padding: '24px 12px', backdropFilter: 'blur(6px)'
          }}>
            {/* Preset wall backgrounds */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              {defaultWalls.map((wall, idx) => (
                <img
                  key={wall}
                  src={wall}
                  alt={`Wall ${idx + 1}`}
                  style={{ width: 80, height: 56, objectFit: 'cover', border: selectedType === 'image' && selectedWall === wall ? '3px solid #2a509c' : '2px solid #ccc', borderRadius: 8, cursor: isOwner ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #0002', background: '#eee', opacity: isOwner ? 1 : 0.5 }}
                  onClick={() => isOwner && handleWallClick(wall)}
                />
              ))}
            </div>
            {/* Upload custom wall background */}
            <div style={{ marginTop: 16 }}>
              <input type="file" accept="image/*" onChange={handleUpload} id="wall-upload" style={{ display: 'none' }} />
              <label htmlFor="wall-upload" style={{ background: '#bfa16c', color: 'white', padding: '6px 16px', borderRadius: 18, cursor: isOwner ? 'pointer' : 'not-allowed', fontWeight: 'bold', boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', opacity: isOwner ? 1 : 0.5 }}>
                Upload Wall
              </label>
              {uploadedWall && (
                <img src={uploadedWall} alt="Uploaded Wall" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: selectedType === 'upload' ? '3px solid #2a509c' : '2px solid #ccc', cursor: isOwner ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #0002', background: '#eee', opacity: isOwner ? 1 : 0.5 }} onClick={() => isOwner && setSelectedType('upload')} />
              )}
            </div>
            {/* Color picker and color selection (desktop only) */}
            <div style={{ marginTop: 16, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button onClick={handleColorButtonClick} style={{ background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 18px', fontWeight: 'bold', marginBottom: 8, opacity: isOwner ? 1 : 0.5, cursor: isOwner ? 'pointer' : 'not-allowed' }}>Choose Color</button>
              {showColorPicker && (
                <input type="color" value={selectedColor} onChange={e => handleColorChange({ hex: e.target.value })} style={{ width: 48, height: 48, border: 'none', borderRadius: 24, marginBottom: 8 }} disabled={!isOwner} />
              )}
              <div style={{ width: 32, height: 32, background: selectedColor, border: '2px solid #bfa16c', borderRadius: 16 }} />
            </div>
          </div>
        )}
        {/* Center: Wall preview and size controls */}
        <div style={{ flex: 1, minWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.55)', borderRadius: 24, boxShadow: '0 4px 32px #bfa16c22', padding: 32, marginTop: 32, marginBottom: 16, backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content',
          }}>
            {/* Show owner's username if available */}
            {draft && draft.owner_username && (
              <div style={{ fontWeight: 'bold', color: '#2a509c', marginBottom: 12 }}>
                Shared by: {draft.owner_username}
              </div>
            )}
            {/* Wall preview */}
            <Wall
              wallBg={wallBg}
              wallSize={{ width, height }}
              wallRef={wallRef}
              images={wallImages}
              setImages={(isOwner || isEditor) ? setWallImages : () => {}}
              selectedImgId={(isOwner || isEditor) ? selectedImgId : null}
              setSelectedImgId={(isOwner || isEditor) ? setSelectedImgId : () => {}}
              showShapeSelector={(isOwner || isEditor) ? showShapeSelector : false}
              setShowShapeSelector={(isOwner || isEditor) ? setShowShapeSelector : () => {}}
            />
            {/* Wall size controls */}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '10px 18px', marginBottom: 4 }}>
              <label>
                Width:
                <input type="number" value={width} min={200} max={2000} onChange={(isOwner || isEditor) ? handleWidthChange : undefined} style={{ marginLeft: 4, width: 60, borderRadius: 4, border: '1px solid #bbb', padding: '2px 6px' }} disabled={!(isOwner || isEditor)} />
              </label>
              <label>
                Height:
                <input type="number" value={height} min={200} max={2000} onChange={(isOwner || isEditor) ? handleHeightChange : undefined} style={{ marginLeft: 4, width: 60, borderRadius: 4, border: '1px solid #bbb', padding: '2px 6px' }} disabled={!(isOwner || isEditor)} />
              </label>
            </div>
            {/* Editors UI (owner only) */}
            {isOwner && renderEditorsUI()}
            {/* Share and Update Draft buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                style={{ background: canShareOrSave ? '#bfa16c' : '#ccc', color: 'white', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 16, boxShadow: '0 1px 6px #bfa16c33', cursor: canShareOrSave ? 'pointer' : 'not-allowed' }}
                onClick={canShareOrSave ? handleShare : undefined}
                disabled={!canShareOrSave}
                title={canShareOrSave ? 'Copy share link' : 'Upgrade to Advanced or Premium to share'}
              >
                Share
              </button>
              {(isOwner || isEditor) && (
                <button
                  style={{ background: canShareOrSave ? '#bfa16c' : '#ccc', color: 'white', borderRadius: 18, padding: '8px 22px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 16, boxShadow: '0 1px 6px #bfa16c33', cursor: canShareOrSave ? 'pointer' : 'not-allowed' }}
                  onClick={canShareOrSave ? handleSaveDraft : undefined}
                  disabled={!canShareOrSave}
                  title={canShareOrSave ? 'Update draft' : 'Upgrade to Advanced or Premium to update drafts'}
                >
                  Update Draft
                </button>
              )}
            </div>
            {!canShareOrSave && (
              <div style={{ color: '#c62828', marginTop: 16, fontWeight: 'bold' }}>
                Upgrade to Advanced or Premium to save or share drafts.
                <button
                  style={{ marginLeft: 16, background: '#bfa16c', color: 'white', borderRadius: 18, padding: '6px 18px', fontWeight: 'bold', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', fontSize: 15, boxShadow: '0 1px 6px #bfa16c33', cursor: 'pointer' }}
                  onClick={() => window.location.href = '/upgrade'}
                >
                  Upgrade
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Right: Controls (color picker, upload, stickers, shape/frame, save/delete) */}
        {(isOwner || isEditor) && (
          <WallControls
            showColorPicker={showColorPicker}
            handleColorButtonClick={handleColorButtonClick}
            selectedColor={selectedColor}
            handleColorChange={handleColorChange}
            handleImageUpload={async (e) => {
              const files = Array.from(e.target.files);
              const newImages = await Promise.all(files.map(async (file, index) => ({
                id: Date.now() + index,
                src: await toBase64(file),
                x: 0,
                y: 0,
                width: 150,
                height: 150,
                shape: 'rectangle',
                zoom: 1,
                frame: { enabled: false, style: 'black', thickness: 6 },
              })));
              setWallImages((prev) => [...prev, ...newImages]);
            }}
            handleSelectShape={() => { if (selectedImgId) setShowShapeSelector(true); }}
            selectedImgId={selectedImgId}
            wallImages={wallImages}
            handleToggleFrame={() => {
              if (selectedImgId) {
                setWallImages(prev => prev.map(img =>
                  img.id === selectedImgId
                    ? { ...img, frame: { ...img.frame, enabled: !img.frame?.enabled } }
                    : img
                ));
              }
            }}
            handleFrameChange={frame => {
              if (selectedImgId) {
                setWallImages(prev => prev.map(img =>
                  img.id === selectedImgId
                    ? { ...img, frame: { ...img.frame, ...frame, enabled: true } }
                    : img
                ));
              }
            }}
            handleSaveWall={canShareOrSave ? handleSaveDraft : undefined}
            handleDeleteSelected={() => {
              if (selectedImgId !== null) {
                setWallImages((prev) => prev.filter((img) => img.id !== selectedImgId));
                setSelectedImgId(null);
              }
            }}
            setWallImages={setWallImages}
            setSelectedImgId={setSelectedImgId}
            setShowShapeSelector={setShowShapeSelector}
          />
        )}
      </div>
      {/* Profile Panel */}
      <ProfilePanel
        user={user}
        isOpen={showProfile}
        onClose={handleProfileClose}
        onUpdateUser={() => {}}
      />
      {/* Overlay to close profile when clicking outside */}
      {showProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            width: '50%',
            height: '100vh',
            zIndex: 999
          }}
          onClick={handleProfileClose}
        />
      )}
    </>
  );
} 
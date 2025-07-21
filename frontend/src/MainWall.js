import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Wall from './Wall';
import WallControls from './WallControls';
import WallDrafts from './WallDrafts';
import ProfilePanel from './ProfilePanel';

const defaultWalls = [
  '/walls/wall1.jpg',
  '/walls/wall2.jpg',
  '/walls/wall3.jpg',
  '/walls/wall4.jpg',
  '/walls/wall5.jpg',
  '/walls/wall6.jpg',
];

/**
 * MainWall is the main layout for the memory wall app.
 * It manages all state and handlers, and composes the UI from subcomponents.
 */
function MainWall({ user, onLogout, onUserUpdate }) {
  const navigate = useNavigate();
  // Wall background state
  const [selectedType, setSelectedType] = useState('image');
  const [selectedWall, setSelectedWall] = useState(defaultWalls[0]);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [uploadedWall, setUploadedWall] = useState(null);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(500);
  const [showColorPicker, setShowColorPicker] = useState(false);
  // Wall image editing state (for right controls)
  const wallRef = useRef();
  const [selectedImgId, setSelectedImgId] = useState(null);
  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [wallImages, setWallImages] = useState([]);
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Handle logout
  const handleLogout = () => {
    setTimeout(() => onLogout(), 0);
  };

  // Handle profile panel
  const handleProfileClick = () => {
    setShowProfile(true);
  };

  // Handle profile close
  const handleProfileClose = () => {
    setShowProfile(false);
  };

  // Handle user update
  const handleUserUpdate = (updatedUser) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };
  // Handle wall background selection
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
  // Wall image controls (for images placed on the wall)
  const handleImageUpload = async (e) => {
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
  };
  const handleSelectShape = () => {
    if (selectedImgId) setShowShapeSelector(true);
  };
  const handleDeleteSelected = () => {
    if (selectedImgId !== null) {
      setWallImages((prev) => prev.filter((img) => img.id !== selectedImgId));
      setSelectedImgId(null);
    }
  };
  const handleSaveWall = async () => {
    if (!wallRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(wallRef.current);
    const link = document.createElement('a');
    link.download = 'custom-wall.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  // Frame controls
  const handleToggleFrame = () => {
    if (selectedImgId) {
      setWallImages(prev => prev.map(img =>
        img.id === selectedImgId
          ? { ...img, frame: { ...img.frame, enabled: !img.frame?.enabled } }
          : img
      ));
    }
  };
  const handleFrameChange = (frame) => {
    if (selectedImgId) {
      setWallImages(prev => prev.map(img =>
        img.id === selectedImgId
          ? { ...img, frame: { ...img.frame, ...frame, enabled: true } }
          : img
      ));
    }
  };
  // Compose wallBg prop for Wall
  let wallBg = null;
  if (selectedType === 'image') wallBg = { type: 'image', value: selectedWall };
  else if (selectedType === 'color') wallBg = { type: 'color', value: selectedColor };
  else if (selectedType === 'upload') wallBg = { type: 'upload', value: uploadedWall };

  // Compose wallState and setWallState for drafts
  const wallState = {
    selectedType,
    selectedWall,
    selectedColor,
    uploadedWall,
    width,
    height,
    wallImages,
  };
  const setWallState = (state) => {
    setSelectedType(state.selectedType);
    setSelectedWall(state.selectedWall);
    setSelectedColor(state.selectedColor);
    setUploadedWall(state.uploadedWall);
    setWidth(state.width);
    setHeight(state.height);
    setWallImages(state.wallImages);
    // Handle draft ID if present
    if (state.draftId !== undefined) {
      setCurrentDraftId(state.draftId);
    }
  };

  // Main layout: NavBar, left (background), center (preview), right (controls)
  return (
    <>
      {/* Top navigation bar */}
      <NavBar user={user} onLogout={handleLogout} onProfileClick={handleProfileClick} />
      <div className="main-layout" style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 40,
        backgroundImage: 'url(/home.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
      }}>
        {/* Left: Wall background selection */}
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
                style={{
                  width: 80,
                  height: 56,
                  objectFit: 'cover',
                  border: selectedType === 'image' && selectedWall === wall ? '3px solid #2a509c' : '2px solid #ccc',
                  borderRadius: 8,
                  cursor: 'pointer',
                  boxShadow: '0 1px 6px #0002',
                  background: '#eee',
                }}
                onClick={() => handleWallClick(wall)}
              />
            ))}
          </div>
          {/* Upload custom wall background */}
          <div style={{ marginTop: 16 }}>
            <input type="file" accept="image/*" onChange={handleUpload} id="wall-upload" style={{ display: 'none' }} />
            <label htmlFor="wall-upload" style={{ background: '#bfa16c', color: 'white', padding: '6px 16px', borderRadius: 18, cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              Upload Wall
            </label>
            {uploadedWall && (
              <img src={uploadedWall} alt="Uploaded Wall" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: selectedType === 'upload' ? '3px solid #2a509c' : '2px solid #ccc', cursor: 'pointer', boxShadow: '0 1px 6px #0002', background: '#eee' }} onClick={() => setSelectedType('upload')} />
            )}
          </div>
        </div>
        {/* Center: Wall preview and size controls */}
        <div style={{ flex: 1, minWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(255,255,255,0.55)', borderRadius: 24, boxShadow: '0 4px 32px #bfa16c22', padding: 32, marginTop: 32, marginBottom: 16, backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content',
          }}>
            {/* Wall preview */}
            <Wall
              wallBg={wallBg}
              wallSize={{ width, height }}
              wallRef={wallRef}
              images={wallImages}
              setImages={setWallImages}
              selectedImgId={selectedImgId}
              setSelectedImgId={setSelectedImgId}
              showShapeSelector={showShapeSelector}
              setShowShapeSelector={setShowShapeSelector}
            />
            {/* Wall size controls */}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', background: '#f7f8fa', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '10px 18px', marginBottom: 4 }}>
              <label>
                Width:
                <input type="number" value={width} min={200} max={2000} onChange={e => setWidth(Number(e.target.value))} style={{ marginLeft: 4, width: 60, borderRadius: 4, border: '1px solid #bbb', padding: '2px 6px' }} />
              </label>
              <label>
                Height:
                <input type="number" value={height} min={200} max={2000} onChange={e => setHeight(Number(e.target.value))} style={{ marginLeft: 4, width: 60, borderRadius: 4, border: '1px solid #bbb', padding: '2px 6px' }} />
              </label>
            </div>
            {/* Drafts feature as a separate component */}
            <WallDrafts
              user={user}
              wallState={wallState}
              setWallState={setWallState}
              defaultWalls={defaultWalls}
              currentDraftId={currentDraftId}
              setCurrentDraftId={setCurrentDraftId}
            />
          </div>
        </div>
        {/* Right: Controls (color picker, upload, stickers, shape/frame, save/delete) */}
        <WallControls
          showColorPicker={showColorPicker}
          handleColorButtonClick={handleColorButtonClick}
          selectedColor={selectedColor}
          handleColorChange={handleColorChange}
          handleImageUpload={handleImageUpload}
          handleSelectShape={handleSelectShape}
          selectedImgId={selectedImgId}
          wallImages={wallImages}
          handleToggleFrame={handleToggleFrame}
          handleFrameChange={handleFrameChange}
          handleSaveWall={handleSaveWall}
          handleDeleteSelected={handleDeleteSelected}
          setWallImages={setWallImages}
          setSelectedImgId={setSelectedImgId}
          setShowShapeSelector={setShowShapeSelector}
        />
      </div>

      {/* Profile Panel */}
      <ProfilePanel
        user={user}
        isOpen={showProfile}
        onClose={handleProfileClose}
        onUpdateUser={handleUserUpdate}
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

// Utility to convert File or URL to base64 data URL
export async function toBase64(fileOrUrl) {
  if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('data:')) return fileOrUrl;
  if (typeof fileOrUrl === 'string') {
    // Fetch and convert URL to base64
    const res = await fetch(fileOrUrl);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  // File object
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrUrl);
  });
}

export default MainWall; 
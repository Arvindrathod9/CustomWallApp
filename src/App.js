import React, { useState, useRef } from 'react';
import Wall from './Wall';
import './Wall.css';
import { ChromePicker } from 'react-color';
import FrameSelector from './FrameSelector';

const defaultWalls = [
  '/walls/wall1.jpg',
  '/walls/wall2.jpg',
  '/walls/wall3.jpg',
  '/walls/wall4.jpg',
  '/walls/wall5.jpg',
  '/walls/wall6.jpg',
];

function App() {
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
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedType('upload');
      setUploadedWall(URL.createObjectURL(file));
      setSelectedWall(null);
    }
  };

  // Wall image controls (for images placed on the wall)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      src: URL.createObjectURL(file),
      x: 0,
      y: 0,
      width: 150,
      height: 150,
      shape: 'rectangle',
      zoom: 1,
      frame: { enabled: false, style: 'black', thickness: 6 },
    }));
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

  return (
    <>
      {/* NavBar */}
      <nav style={{
        width: '100%',
        background: '#e0f2ff',
        zIndex: 100,
        padding: '12px 0 0 0',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
          borderRadius: 16,
          padding: '8px 300px',
          display: 'inline-block',
          minWidth: 1300,
          maxWidth: '99vw',
        }}>
          <span style={{
            color: '#3f51b5',
            fontWeight: 'bold',
            fontSize: 54,
            letterSpacing: 2,
            fontFamily: 'Creepster, Park Avenue, "Dancing Script", serif',
          }}>
            WALL POSTER
          </span>
        </div>
      </nav>
      <div className="main-layout" style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100vh', gap: 40, background: '#e0f2ff' }}>
        {/* Left: Wall background selection (vertical) */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120, marginTop: 40, gap: 24,
          background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #0001', padding: '24px 12px',
        }}>
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
            <label htmlFor="wall-upload" style={{ background: '#2a509c', color: 'white', padding: '6px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 1px 6px #0002' }}>
              Upload Wall
            </label>
            {uploadedWall && (
              <img src={uploadedWall} alt="Uploaded Wall" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: selectedType === 'upload' ? '3px solid #2a509c' : '2px solid #ccc', cursor: 'pointer', boxShadow: '0 1px 6px #0002', background: '#eee' }} onClick={() => setSelectedType('upload')} />
            )}
          </div>
        </div>
        {/* Center: Wall preview and controls */}
        <div style={{ flex: 1, minWidth: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            background: '#fff', borderRadius: 24, boxShadow: '0 4px 32px #0002', padding: 32, marginTop: 32, marginBottom: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'fit-content',
          }}>
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
            {/* Wall size controls (moved below preview) */}
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
          </div>
        </div>
        {/* Right: Controls (color picker toggle and wall image controls) */}
        <div style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginTop: 40, background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #0001', padding: '24px 18px' }}>
          <button
            style={{ background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 6, fontSize: 18, width: 200, marginBottom: 8, boxShadow: '0 1px 6px #0002' }}
            onClick={handleColorButtonClick}
          >
            Choose Background Color
          </button>
          {showColorPicker && (
            <div style={{ zIndex: 100, marginBottom: 16 }}>
              <ChromePicker color={selectedColor} onChange={handleColorChange} disableAlpha={true} />
            </div>
          )}
          <input type="file" accept="image/*" multiple id="upload-wall-img" style={{ display: 'none' }} onChange={handleImageUpload} />
          <label htmlFor="upload-wall-img" style={{ background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 6, fontSize: 18, width: 200, textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 6px #0002' }}>
            Upload Image
          </label>
          <button
            style={{ background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 6, fontSize: 18, width: 200, opacity: selectedImgId ? 1 : 0.5, cursor: selectedImgId ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #0002' }}
            onClick={handleSelectShape}
            disabled={!selectedImgId}
          >
            Select Shape
          </button>
          {/* Frame toggle and selector */}
          <button
            style={{ background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 6, fontSize: 18, width: 200, opacity: selectedImgId ? 1 : 0.5, cursor: selectedImgId ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #0002' }}
            onClick={handleToggleFrame}
            disabled={!selectedImgId}
          >
            {selectedImgId && wallImages.find(img => img.id === selectedImgId)?.frame?.enabled ? 'Disable Frame' : 'Enable Frame'}
          </button>
          {selectedImgId && wallImages.find(img => img.id === selectedImgId)?.frame?.enabled && (
            <FrameSelector
              frame={wallImages.find(img => img.id === selectedImgId)?.frame}
              onChange={handleFrameChange}
            />
          )}
          <button
            style={{ background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 6, fontSize: 18, width: 200, boxShadow: '0 1px 6px #0002' }}
            onClick={handleSaveWall}
          >
            Save Wall
          </button>
          <button
            style={{ background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 6, fontSize: 18, width: 200, boxShadow: '0 1px 6px #0002' }}
            onClick={handleDeleteSelected}
          >
            Delete Selected Image
          </button>
        </div>
      </div>
    </>
  );
}

export default App; 
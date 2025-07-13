import React from 'react';
import { ChromePicker } from 'react-color';
import FrameSelector from './FrameSelector';
import StickerSelector from './StickerSelector';
import { toBase64 } from './MainWall';

/**
 * WallControls component for right-side controls: color picker, upload, stickers, shape/frame, save/delete.
 * Props: see MainWall for details.
 */
function WallControls({ showColorPicker, handleColorButtonClick, selectedColor, handleColorChange, handleImageUpload, handleSelectShape, selectedImgId, wallImages, handleToggleFrame, handleFrameChange, handleSaveWall, handleDeleteSelected, setWallImages, setSelectedImgId, setShowShapeSelector }) {
  return (
    <div style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginTop: 40, background: '#fff', borderRadius: 18, boxShadow: '0 2px 16px #0001', padding: '24px 18px' }}>
      {/* Background color picker toggle */}
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
      {/* Upload image to wall */}
      <input type="file" accept="image/*" multiple id="upload-wall-img" style={{ display: 'none' }} onChange={handleImageUpload} />
      <label htmlFor="upload-wall-img" style={{ background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 6, fontSize: 18, width: 200, textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 6px #0002' }}>
        Upload Image
      </label>
      {/* StickerSelector for adding stickers */}
      <StickerSelector
        onStickerSelect={async (src) => {
          const base64 = await toBase64(src);
          const newSticker = {
            id: Date.now() + Math.random(),
            src: base64,
            x: 50,
            y: 50,
            width: 120,
            height: 120,
            shape: 'rectangle',
            zoom: 1,
            frame: { enabled: false, style: 'black', thickness: 6 },
          };
          setWallImages(prev => [...prev, newSticker]);
          setSelectedImgId(newSticker.id);
        }}
      />
      {/* Shape selector button */}
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
      {/* Save and delete buttons */}
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
  );
}

export default WallControls; 
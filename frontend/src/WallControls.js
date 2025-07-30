import React from 'react';
import { ChromePicker } from 'react-color';
import FrameSelector from './FrameSelector';
import StickerSelector from './StickerSelector';
import { toBase64 } from './MainWall';

/**
 * WallControls component for right-side controls: color picker, upload, stickers, shape/frame, save/delete.
 * Props: see MainWall for details.
 */
function WallControls({ showColorPicker, handleColorButtonClick, selectedColor, handleColorChange, handleImageUpload, handleSelectShape, selectedImgId, wallImages, handleToggleFrame, handleFrameChange, handleSaveWall, handleDeleteSelected, setWallImages, setSelectedImgId, setShowShapeSelector, extraStickers }) {
  const isMobile = window.innerWidth <= 700;
  return (
    <div style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginTop: 40, background: 'rgba(255,255,255,0.55)', borderRadius: 18, boxShadow: '0 2px 16px #bfa16c11', padding: '24px 18px', backdropFilter: 'blur(6px)', width: isMobile ? '100vw' : 220 }}>
      {/* Background color picker toggle */}
      {!isMobile && (
        <button
          style={{ background: '#bfa16c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 18, fontSize: 18, width: 200, marginBottom: 8, boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', cursor: 'pointer' }}
          onClick={handleColorButtonClick}
        >
          Choose Background Color
        </button>
      )}
      {showColorPicker && isMobile && (
        <div style={{ position: 'fixed', left: 0, bottom: 0, width: '100vw', background: 'rgba(255,255,255,0.98)', zIndex: 99999, boxShadow: '0 -2px 16px #bfa16c33', padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ChromePicker color={selectedColor} onChange={handleColorChange} disableAlpha={true} style={{ width: '100vw', maxWidth: 340 }} />
          <button onClick={handleColorButtonClick} style={{ marginTop: 8, background: '#bfa16c', color: 'white', border: 'none', borderRadius: 18, padding: '8px 24px', fontWeight: 'bold' }}>Close</button>
        </div>
      )}
      {/* On mobile, show floating color button at bottom left */}
      {isMobile && !showColorPicker && (
        <button
          className="fab-color"
          style={{ position: 'fixed', bottom: 90, left: 18, zIndex: 10002, background: '#bfa16c', color: 'white', border: 'none', borderRadius: '50%', width: 56, height: 56, boxShadow: '0 2px 8px #bfa16c33', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={handleColorButtonClick}
          aria-label="Choose wall color"
        >
          🎨
        </button>
      )}
      {/* Upload image to wall */}
      <input type="file" accept="image/*" multiple id="upload-wall-img" style={{ display: 'none' }} onChange={handleImageUpload} />
      <label htmlFor="upload-wall-img" style={{ background: '#bfa16c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 18, fontSize: 18, width: 200, textAlign: 'center', cursor: 'pointer', boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
        Upload Image
      </label>
      {/* StickerSelector for adding stickers */}
      <StickerSelector
        onStickerSelect={async (src) => {
          const base64 = await toBase64(src);
          
          // Create sticker object but don't place it yet
          const newSticker = {
            id: Date.now() + Math.random(),
            src: base64,
            x: 0, // Will be set when user clicks on wall
            y: 0, // Will be set when user clicks on wall
            width: 120,
            height: 120,
            shape: 'rectangle',
            zoom: 1,
            frame: { enabled: false, style: 'black', thickness: 6 },
          };
          
          // Store the sticker for placement when user clicks on wall
          window.pendingStickerPlacement = newSticker;
          // (No alert)
        }}
        extraStickers={extraStickers}
      />
      {/* Shape selector button */}
      <button
        style={{ background: '#bfa16c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 18, fontSize: 18, width: 200, opacity: selectedImgId ? 1 : 0.5, cursor: selectedImgId ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
        onClick={handleSelectShape}
        disabled={!selectedImgId}
      >
        Select Shape
      </button>
      {/* Frame toggle and selector */}
      <button
        style={{ background: '#bfa16c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 18, fontSize: 18, width: 200, opacity: selectedImgId ? 1 : 0.5, cursor: selectedImgId ? 'pointer' : 'not-allowed', boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
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
        style={{ background: '#bfa16c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 18, fontSize: 18, width: 200, boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', cursor: 'pointer' }}
        onClick={handleSaveWall}
      >
        Save Wall
      </button>
      <button
        style={{ background: '#bfa16c', color: 'white', fontWeight: 'bold', padding: '10px 24px', borderRadius: 18, fontSize: 18, width: 200, boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', cursor: 'pointer' }}
        onClick={handleDeleteSelected}
      >
        Delete Selected Image
      </button>
    </div>
  );
}

export default WallControls; 
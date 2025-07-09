import React from 'react';
import { Rnd } from 'react-rnd';
import './Wall.css';
import ShapeSelector, { getMaskStyle } from './ShapeSelector';

const Wall = ({ wallBg, wallSize, wallRef, images, setImages, selectedImgId, setSelectedImgId, showShapeSelector, setShowShapeSelector }) => {
  // Handle double click to select image
  const handleSelectImage = (imgId) => {
    setSelectedImgId(imgId);
    setShowShapeSelector(false);
  };

  // Handle zoom with mouse wheel
  const handleWheel = (e, imgId) => {
    if (selectedImgId !== imgId) return;
    e.preventDefault();
    setImages((prev) =>
      prev.map((img) =>
        img.id === imgId
          ? { ...img, zoom: Math.max(0.5, Math.min(2, img.zoom + (e.deltaY < 0 ? 0.05 : -0.05))) }
          : img
      )
    );
  };

  // Handle shape change
  const handleShapeChange = (shape) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImgId ? { ...img, shape } : img
      )
    );
    setShowShapeSelector(false);
  };

  // Handle zoom change from ShapeSelector (for preview)
  const handleZoomChange = (zoom) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImgId ? { ...img, zoom } : img
      )
    );
  };

  // Get selected image object
  const selectedImg = images.find((img) => img.id === selectedImgId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {/* Wall preview only */}
      <div
        className="custom-wall"
        ref={wallRef}
        style={{
          backgroundColor: wallBg && wallBg.type === 'color' ? wallBg.value : undefined,
          backgroundImage: wallBg && wallBg.type !== 'color' ? `url('${wallBg.value}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: wallSize.width + 'px',
          height: wallSize.height + 'px',
          position: 'relative',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onDoubleClick={e => {
          if (e.target === e.currentTarget) {
            setSelectedImgId(null);
            setShowShapeSelector(false);
          }
        }}
      >
        {/* Display uploaded image if present */}
        {images.map((img) => {
          const maskStyle = getMaskStyle(img.shape);
          const isPolygonShape = img.shape === 'triangle' || img.shape === 'heart';
          const frameColor =
            img.frame?.style === 'black' ? '#222' :
            img.frame?.style === 'brown' ? '#8B5C2A' :
            img.frame?.style === 'gold' ? '#FFD700' :
            img.frame?.style === 'silver' ? '#C0C0C0' : '#222';
          return (
            <Rnd
              key={img.id}
              size={{ width: img.width, height: img.height }}
              position={{ x: img.x, y: img.y }}
              onDragStop={(e, d) => {
                setImages(prev =>
                  prev.map(i =>
                    i.id === img.id ? { ...i, x: d.x, y: d.y } : i
                  )
                );
                console.log('Dragged image', img.id, 'to', d.x, d.y);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                setImages(prev =>
                  prev.map(i =>
                    i.id === img.id
                      ? {
                          ...i,
                          width: parseInt(ref.style.width, 10),
                          height: parseInt(ref.style.height, 10),
                          x: position.x,
                          y: position.y,
                        }
                      : i
                  )
                );
                console.log('Resized image', img.id, 'to', ref.style.width, ref.style.height, 'at', position.x, position.y);
              }}
              bounds="parent"
              minWidth={50}
              minHeight={50}
              disableDragging={img.locked}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  border: !isPolygonShape && img.frame?.enabled
                    ? `${img.frame.thickness || 6}px solid ${frameColor}`
                    : 'none',
                  borderRadius: img.shape === 'circle' ? '50%' : 8,
                  transition: 'border 0.2s',
                  boxShadow: selectedImgId === img.id ? '0 0 8px #2a509c' : 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  ...(isPolygonShape && img.frame?.enabled ? maskStyle : {}),
                  outline: isPolygonShape && img.frame?.enabled
                    ? `${img.frame.thickness || 6}px solid ${frameColor}`
                    : 'none',
                  outlineOffset: isPolygonShape && img.frame?.enabled ? '-2px' : undefined,
                }}
                onMouseDown={() => {
                  handleSelectImage(img.id);
                  setImages(prev =>
                    prev.map(i =>
                      i.id === img.id ? { ...i, locked: true } : i
                    )
                  );
                }}
                onDoubleClick={() => {
                  setImages(prev =>
                    prev.map(i =>
                      i.id === img.id ? { ...i, locked: false } : i
                    )
                  );
                }}
              >
                <img
                  src={img.src}
                  alt="user-img"
                  style={{
                    width: `${img.zoom * 100}%`,
                    height: `${img.zoom * 100}%`,
                    objectFit: 'cover',
                    border: selectedImgId === img.id ? '2px solid #2a509c' : 'none',
                    boxShadow: 'none',
                    borderRadius: img.shape === 'circle' ? '50%' : 8,
                    transition: 'all 0.2s',
                    ...maskStyle,
                  }}
                  onWheel={(e) => handleWheel(e, img.id)}
                />
              </div>
            </Rnd>
          );
        })}
        {/* Shape selector popup */}
        {selectedImg && showShapeSelector && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, background: '#232526', borderRadius: 12, padding: 24, boxShadow: '0 4px 24px #0008' }}>
            <ShapeSelector
              image={selectedImg.src}
              shape={selectedImg.shape}
              zoom={selectedImg.zoom}
              onShapeChange={handleShapeChange}
              onZoomChange={handleZoomChange}
            />
            <button style={{ marginTop: 16, background: '#2a509c', color: 'white', fontWeight: 'bold', padding: '8px 24px', borderRadius: 6, fontSize: 16 }} onClick={() => setShowShapeSelector(false)}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wall;
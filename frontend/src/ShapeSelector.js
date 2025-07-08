import React, { useState } from 'react';

const shapes = [
  { label: 'Rectangle', value: 'rectangle' },
  { label: 'Square', value: 'square' },
  { label: 'Circle', value: 'circle' },
  { label: 'Triangle', value: 'triangle' },
  { label: 'Heart', value: 'heart' },
];

// Exported utility for applying shape masks
export function getMaskStyle(shape) {
  switch (shape) {
    case 'circle':
      return { borderRadius: '50%' };
    case 'square':
      return { aspectRatio: '1 / 1', borderRadius: 8 };
    case 'triangle':
      return {
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
      };
    case 'heart':
      return {
        clipPath: 'polygon(50% 95%, 68% 85%, 98% 62%, 98% 38%, 81% 18%, 63% 18%, 50% 32%, 37% 18%, 19% 18%, 2% 38%, 2% 62%, 32% 85%)',
      };
    default:
      return { borderRadius: 8 };
  }
}

const ShapeSelector = ({ image, onShapeChange, onZoomChange, shape = 'rectangle', zoom = 1 }) => {
  const [selectedShape, setSelectedShape] = useState(shape);
  const [zoomLevel, setZoomLevel] = useState(zoom);

  const handleShapeChange = (e) => {
    setSelectedShape(e.target.value);
    if (onShapeChange) onShapeChange(e.target.value);
  };

  const handleZoomChange = (e) => {
    const z = parseFloat(e.target.value);
    setZoomLevel(z);
    if (onZoomChange) onZoomChange(z);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        {shapes.map((s) => (
          <label key={s.value} style={{ color: '#f5f5f5' }}>
            <input
              type="radio"
              name="shape"
              value={s.value}
              checked={selectedShape === s.value}
              onChange={handleShapeChange}
            />
            {s.label}
          </label>
        ))}
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={{ color: '#f5f5f5' }}>
          Zoom:
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.01}
            value={zoomLevel}
            onChange={handleZoomChange}
            style={{ marginLeft: 8 }}
          />
          <span style={{ marginLeft: 8 }}>{Math.round(zoomLevel * 100)}%</span>
        </label>
      </div>
      <div
        style={{
          width: 120,
          height: 120,
          background: '#232526',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          ...getMaskStyle(selectedShape),
        }}
      >
        {image && (
          <img
            src={image}
            alt="preview"
            style={{
              width: `${zoomLevel * 100}%`,
              height: `${zoomLevel * 100}%`,
              objectFit: 'cover',
              transition: 'all 0.2s',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ShapeSelector; 
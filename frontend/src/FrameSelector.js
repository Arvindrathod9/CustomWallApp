import React from 'react';

const FRAME_STYLES = [
  { name: 'Black', value: 'black', color: '#222' },
  { name: 'Brown', value: 'brown', color: '#8B5C2A' },
  { name: 'Gold', value: 'gold', color: '#FFD700' },
  { name: 'Silver', value: 'silver', color: '#C0C0C0' },
];

export default function FrameSelector({ frame, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginTop: 8 }}>
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Frame Style</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {FRAME_STYLES.map(style => (
          <button
            key={style.value}
            style={{
              background: style.color,
              border: frame?.style === style.value ? '3px solid #2a509c' : '2px solid #ccc',
              borderRadius: 6,
              width: 36,
              height: 36,
              cursor: 'pointer',
              outline: 'none',
            }}
            title={style.name}
            onClick={() => onChange({ ...frame, style: style.value })}
          />
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <label style={{ fontWeight: 'bold', marginRight: 6 }}>Thickness:</label>
        <input
          type="range"
          min={2}
          max={24}
          value={frame?.thickness || 6}
          onChange={e => onChange({ ...frame, thickness: Number(e.target.value) })}
          style={{ verticalAlign: 'middle' }}
        />
        <span style={{ marginLeft: 8 }}>{frame?.thickness || 6}px</span>
      </div>
    </div>
  );
} 
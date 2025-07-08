import React, { useState } from 'react';

// List of sticker image paths (should be placed in public/stickers/)
const STICKERS = [
  '/stickers/Wine.png',
  '/stickers/banana.png',
  '/stickers/garland1.png',
  '/stickers/garland2.png',
  '/stickers/candle.png',
  '/stickers/fruitbasket.png',
  '/stickers/deepam.png',
  '/stickers/orange.png',
  '/stickers/table1.png',
  '/stickers/table2.png',
  '/stickers/table3.png',
  '/stickers/roundflow.png',
];

const StickerSelector = ({ onStickerSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 8, textAlign: 'center' }}>
      <button
        style={{
          background: '#2a509c',
          color: 'white',
          fontWeight: 'bold',
          padding: '10px 24px',
          borderRadius: 6,
          fontSize: 18,
          width: 200,
          boxShadow: '0 1px 6px #0002',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 8
        }}
        onClick={() => setOpen(true)}
      >
        Choose Sticker
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              boxShadow: '0 4px 32px #0004',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              maxWidth: 600,
              maxHeight: 400,
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#e53935',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '4px 12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: 16
              }}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            {STICKERS.map((src, idx) => (
              <img
                key={src}
                src={`/stickers/${src.split('/').pop()}`}
                alt={`sticker-${idx}`}
                style={{
                  width: src.includes('roomdecorflower.png') ? 56 : 72,
                  height: src.includes('roomdecorflower.png') ? 56 : 72,
                  objectFit: 'contain',
                  borderRadius: 8,
                  border: '2px solid #eee',
                  cursor: 'pointer',
                  background: '#fafafa',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => {
                  onStickerSelect(src);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StickerSelector; 
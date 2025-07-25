import React, { useState } from 'react';
import { createPortal } from 'react-dom';

// List of sticker image paths (should be placed in public/stickers/)
const DEFAULT_STICKERS = [
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
const PREMIUM_STICKERS = [
  '/stickers/premium1.png',
  '/stickers/premium2.png',
  '/stickers/premium3.png',
];

const StickerSelector = ({ onStickerSelect, extraStickers = [] }) => {
  const [open, setOpen] = useState(false);
  // Only show premium stickers if assigned
  const assignedPremium = PREMIUM_STICKERS.filter(s => extraStickers.includes(s.split('/').pop()));
  const allStickers = [...DEFAULT_STICKERS, ...assignedPremium];

  const modalRoot = document.getElementById('modal-root');

  return (
    <div style={{ marginTop: 8, textAlign: 'center' }}>
      <button
        style={{
          background: '#bfa16c',
          color: 'white',
          fontWeight: 'bold',
          padding: '10px 24px',
          borderRadius: 18,
          fontSize: 18,
          width: 200,
          boxShadow: '0 1px 6px #bfa16c33',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 8,
          fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif'
        }}
        onClick={() => {
          console.log('Choose Sticker button clicked'); // Debug log
          setOpen(true);
        }}
      >
        Choose Sticker
      </button>
      {open && modalRoot && (() => {
        try {
          return createPortal(
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.4)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
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
                {allStickers.map((src, idx) => (
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
            </div>,
            modalRoot
          );
        } catch (err) {
          if (err instanceof DOMException && err.name === 'NotFoundError') {
            console.warn('Portal unmount NotFoundError suppressed:', err);
            return null;
          }
          throw err;
        }
      })()}
    </div>
  );
};

export default StickerSelector; 
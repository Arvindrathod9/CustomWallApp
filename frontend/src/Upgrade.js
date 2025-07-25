import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Upgrade() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', backgroundImage: 'url(/home.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', padding: 40 }}>
      <div style={{ maxWidth: 600, margin: '60px auto', background: 'rgba(255,255,255,0.85)', borderRadius: 24, boxShadow: '0 4px 32px #bfa16c22', padding: 40, textAlign: 'center', backdropFilter: 'blur(8px)' }}>
        <h1 style={{ color: '#bfa16c', marginBottom: 24 }}>Upgrade Your Plan</h1>
        <p style={{ fontSize: 18, marginBottom: 32 }}>
          Unlock more features by upgrading your Memory Wall account!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24, minWidth: 200 }}>
            <h2 style={{ color: '#888', fontSize: 22 }}>Free</h2>
            <ul style={{ textAlign: 'left', margin: '16px 0', color: '#555', fontSize: 15 }}>
              <li>Basic wall creation</li>
              <li>View and edit your own wall</li>
              <li style={{ color: '#c62828' }}>No sharing or advanced features</li>
            </ul>
            <div style={{ color: '#bfa16c', fontWeight: 'bold', fontSize: 18 }}>₹0</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24, minWidth: 200 }}>
            <h2 style={{ color: '#2a509c', fontSize: 22 }}>Advanced</h2>
            <ul style={{ textAlign: 'left', margin: '16px 0', color: '#555', fontSize: 15 }}>
              <li>All Free features</li>
              <li>Share your wall with others</li>
              <li>Collaborate with editors</li>
              <li>Priority support</li>
            </ul>
            <div style={{ color: '#bfa16c', fontWeight: 'bold', fontSize: 18 }}>₹199/year</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c11', padding: 24, minWidth: 200 }}>
            <h2 style={{ color: '#7b2ff2', fontSize: 22 }}>Premium</h2>
            <ul style={{ textAlign: 'left', margin: '16px 0', color: '#555', fontSize: 15 }}>
              <li>All Advanced features</li>
              <li>Premium stickers & decorations</li>
              <li>Early access to new features</li>
              <li>Personalized support</li>
            </ul>
            <div style={{ color: '#bfa16c', fontWeight: 'bold', fontSize: 18 }}>₹499/year</div>
          </div>
        </div>
        <p style={{ fontSize: 16, marginBottom: 24 }}>
          To upgrade, please contact our support team or click below to request an upgrade. (Payment integration coming soon!)
        </p>
        <button
          style={{ background: '#bfa16c', color: 'white', borderRadius: 24, padding: '12px 32px', fontWeight: 'bold', fontSize: 18, boxShadow: '0 1px 6px #bfa16c33', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif', cursor: 'pointer' }}
          onClick={() => window.open('mailto:support@memorywall.com?subject=Upgrade%20Request', '_blank')}
        >
          Contact Support
        </button>
        <div style={{ marginTop: 32 }}>
          <button
            style={{ background: 'white', color: '#bfa16c', border: '2px solid #bfa16c', fontWeight: 700, padding: '8px 24px', borderRadius: 24, fontSize: 16, cursor: 'pointer', marginTop: 8, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}
            onClick={() => navigate('/wall')}
          >
            Back to Wall
          </button>
        </div>
      </div>
    </div>
  );
} 
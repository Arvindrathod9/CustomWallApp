import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function NavBar({ onFeaturesClick, onHowItWorksClick, onContactClick }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isMobile = window.innerWidth <= 700;
  return (
    <nav className="modern-navbar">
      <div className="modern-navbar-logo" onClick={() => navigate('/')}>MEMORY WALL</div>
      {isMobile ? (
        <>
          <button
            className="hamburger-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, marginLeft: 8 }}
            onClick={() => setMenuOpen(m => !m)}
            aria-label="Open menu"
          >
            <div style={{ width: 28, height: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
              <div style={{ height: 4, background: '#bfa16c', borderRadius: 2 }} />
            </div>
          </button>
          {menuOpen && (
            <div className="mobile-menu-overlay" style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.98)', zIndex: 9999,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32
            }}>
              <button onClick={() => { setMenuOpen(false); navigate('/'); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none', marginBottom: 16 }}>Home</button>
              <button onClick={() => { setMenuOpen(false); onFeaturesClick(); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Features</button>
              <button onClick={() => { setMenuOpen(false); onHowItWorksClick(); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>How It Works</button>
              <button onClick={() => { setMenuOpen(false); onContactClick(); }} style={{ fontSize: 22, color: '#bfa16c', background: 'none', border: 'none' }}>Contact</button>
              <button className="modern-navbar-btn" onClick={() => { setMenuOpen(false); navigate('/login'); }} style={{ fontSize: 22, marginTop: 24 }}>Get Started</button>
              <button onClick={() => setMenuOpen(false)} style={{ position: 'absolute', top: 24, right: 24, fontSize: 32, color: '#bfa16c', background: 'none', border: 'none' }}>&times;</button>
            </div>
          )}
        </>
      ) : (
        <>
          <ul className="modern-navbar-menu">
            <li className="active">Home</li>
            <li onClick={onFeaturesClick} style={{ cursor: 'pointer' }}>Features</li>
            <li onClick={onHowItWorksClick} style={{ cursor: 'pointer' }}>How It Works</li>
            <li onClick={onContactClick} style={{ cursor: 'pointer' }}>Contact</li>
          </ul>
          <button className="modern-navbar-btn" onClick={() => navigate('/login')}>Get Started</button>
        </>
      )}
    </nav>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const contactRef = useRef(null);
  const [parallax, setParallax] = useState(0);

  // Parallax effect for hero background
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setParallax(scrollY * 0.3); // Adjust multiplier for effect strength
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to features section
  const handleFeaturesClick = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // Scroll to how it works section
  const handleHowItWorksClick = () => {
    if (howItWorksRef.current) {
      howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleContactClick = () => {
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="modern-home-root">
      <NavBar onFeaturesClick={handleFeaturesClick} onHowItWorksClick={handleHowItWorksClick} onContactClick={handleContactClick} />
      <header className="modern-hero-section">
        <div
          className="modern-hero-bg-parallax"
          style={{
            backgroundImage: 'url(/home.jpg)',
            transform: `scale(${1 + parallax / 1000}) translateY(${parallax}px)`,
            minHeight: window.innerWidth <= 600 ? '220px' : '400px',
            width: '100vw',
          }}
        />
        <div className="modern-hero-overlay">
          <div className="modern-hero-content">
            <div className="modern-hero-subtitle">CELEBRATE MEMORIES, HONOR LOVED ONES</div>
            <h1 className="modern-hero-title">Create Your Virtual Memory Wall</h1>
            <p className="modern-hero-desc">
              Build a beautiful, interactive wall to remember, celebrate, and share the stories of those who matter most. Decorate with photos, stickers, and heartfelt messages—all in one vibrant digital space.
            </p>
            <div className="modern-hero-buttons">
              <button className="modern-btn-primary" onClick={() => navigate('/login')}>Start Your Wall</button>
            </div>
          </div>
        </div>
      </header>
      <main className="modern-main-content">
        <section ref={featuresRef} className="modern-section">
          <h2>Features</h2>
          <ul className="features-list">
            <li><strong>Customizable Walls:</strong> Choose backgrounds, colors, and layouts to make your wall unique.</li>
            <li><strong>Photo Uploads:</strong> Add and arrange photos of loved ones, events, or special memories.</li>
            <li><strong>Stickers & Decorations:</strong> Decorate your wall with a variety of digital stickers and frames.</li>
            <li><strong>Personal Messages:</strong> Write and display heartfelt notes, quotes, or dedications.</li>
            <li><strong>Drafts & Autosave:</strong> Save your wall as a draft and continue editing anytime.</li>
            <li><strong>Easy Sharing:</strong> Share your memory wall with friends and family via a unique link.</li>
            <li><strong>Responsive Design:</strong> Enjoy a seamless experience on desktop, tablet, or mobile.</li>
            <li><strong>Privacy Controls:</strong> Choose to keep your wall private or share it publicly.</li>
          </ul>
        </section>
        <section className="modern-section">
          <h2>What is Memory Wall?</h2>
          <p>Memory Wall is your personal digital altar. Create, decorate, and share a wall of memories for loved ones, special events, or cherished moments. Add photos, stickers, and custom messages to make it truly yours.</p>
        </section>
        <section ref={howItWorksRef} className="modern-section">
          <h2>How It Works</h2>
          <ul className="features-list">
            <li>Sign up for a free account or log in.</li>
            <li>Start a new wall and choose your background and layout.</li>
            <li>Upload photos and arrange them as you like.</li>
            <li>Add stickers, frames, and decorations to personalize your wall.</li>
            <li>Write personal messages, dedications, or quotes.</li>
            <li>Save your wall as a draft and continue editing anytime.</li>
            <li>When ready, share your wall with friends and family using a unique link.</li>
            <li>Control privacy—keep your wall private or make it public.</li>
          </ul>
        </section>
        <section ref={contactRef} className="modern-section">
          <h2>Contact</h2>
          <p>We'd love to hear from you! Reach out for support, feedback, or partnership opportunities.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center', marginTop: 24 }}>
            <div style={{ background: '#bfa16c', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c44', padding: 32, minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 18, marginBottom: 8 }}>Email</div>
              <a href="mailto:memorywall9@gmail.com" style={{ color: 'white', fontSize: 16, textDecoration: 'none', fontWeight: 600 }}>memorywall9@gmail.com</a>
            </div>
            <div style={{ background: '#bfa16c', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c44', padding: 32, minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 18, marginBottom: 8 }}>Phone</div>
              <a href="tel:+911234567890" style={{ color: 'white', fontSize: 16, textDecoration: 'none', fontWeight: 600 }}>+91 12345 67890</a>
            </div>
            <div style={{ background: '#bfa16c', borderRadius: 16, boxShadow: '0 2px 12px #bfa16c44', padding: 32, minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 18, marginBottom: 8 }}>Address</div>
              <div style={{ color: 'white', fontSize: 16, fontWeight: 600, textAlign: 'center' }}>123 Memory Lane,<br />Remembrance City,<br />India</div>
            </div>
          </div>
          <p style={{ marginTop: 32, color: '#bfa16c', fontWeight: 600, textAlign: 'center' }}>Our team will get back to you as soon as possible!</p>
        </section>
      </main>
      <footer className="modern-footer">&copy; {new Date().getFullYear()} Memory Wall. All rights reserved.</footer>
    </div>
  );
} 
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

function NavBar({ onFeaturesClick }) {
  const navigate = useNavigate();
  return (
    <nav className="modern-navbar">
      <div className="modern-navbar-logo" onClick={() => navigate('/')}>MEMORY WALL</div>
      <ul className="modern-navbar-menu">
        <li className="active">Home</li>
        <li onClick={onFeaturesClick} style={{ cursor: 'pointer' }}>Features</li>
        <li>Gallery</li>
        <li>How It Works</li>
        <li>Contact</li>
      </ul>
      <button className="modern-navbar-btn" onClick={() => navigate('/login')}>Get Started</button>
    </nav>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
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

  return (
    <div className="modern-home-root">
      <NavBar onFeaturesClick={handleFeaturesClick} />
      <header className="modern-hero-section">
        <div
          className="modern-hero-bg-parallax"
          style={{
            backgroundImage: 'url(/home.jpg)', // Use the new image in the public directory
            transform: `scale(${1 + parallax / 1000}) translateY(${parallax}px)`
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
              <button className="modern-btn-secondary">See Gallery</button>
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
        <section className="modern-section">
          <h2>How It Works</h2>
          <p>Sign up, start a new wall, and unleash your creativity! Drag and drop images, choose backgrounds, add stickers, and write messages. Save your wall as a draft or share it with friends and family.</p>
        </section>
      </main>
      <footer className="modern-footer">&copy; {new Date().getFullYear()} Memory Wall. All rights reserved.</footer>
    </div>
  );
} 
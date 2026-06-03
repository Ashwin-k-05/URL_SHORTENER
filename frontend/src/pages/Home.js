import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <div className="home-bg">
        <div className="home-orb home-orb-1" />
        <div className="home-orb home-orb-2" />
        <div className="home-grid" />
      </div>

      <section className="hero">
        <div className="hero-eyebrow">
          <span className="badge badge-warning">⚡ Fast & Free URL Shortener</span>
        </div>
        <h1 className="hero-title">
          Short links,<br />
          <span className="text-accent">Big impact.</span>
        </h1>
        <p className="hero-subtitle">
          Transform long, ugly URLs into clean, trackable short links.
          Monitor clicks, analyze traffic, and manage all your links in one place.
        </p>
        <div className="hero-cta">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary hero-btn">
              Open Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/signup" className="btn btn-primary hero-btn">
                Start for Free →
              </Link>
              <Link to="/login" className="btn btn-ghost hero-btn">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          {[
            { icon: '⚡', title: 'Instant Shortening', desc: 'Turn any URL into a compact link in milliseconds. Custom aliases supported.' },
            { icon: '📊', title: 'Click Analytics', desc: 'Track every visit with timestamps, referrers, and user agents.' },
            { icon: '🔐', title: 'Secure & Private', desc: 'Your links are protected with JWT authentication. Only you can manage them.' },
            { icon: '📋', title: 'One-Click Copy', desc: 'Copy your short URLs instantly. Share across any platform.' },
            { icon: '🗑', title: 'Full Control', desc: 'Delete links whenever you want. You own your data.' },
            { icon: '🌐', title: 'Fast Redirects', desc: 'Blazing fast 301 redirects with near-zero latency.' },
          ].map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

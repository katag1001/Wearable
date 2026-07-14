import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import wearableLogo from '../assets/images/wearable_logo.png';
import './header.css';

const Header = ({ loggedIn, title }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <nav className="navbar">

        <div className="navbar-left">
          <Link to="/" onClick={closeMenu}>
            <img
              src={wearableLogo}
              alt="Wearable Logo"
              className="navbar-logo"
            />
          </Link>

          {/* Burger menu (mobile only) */}
          <div
            className={`menu_toggle ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {title && (
          <div className="navbar-title">
            <h1>{title}</h1>
          </div>
        )}

        <div className={`navbar-right ${menuOpen ? 'open' : ''}`}>
          {loggedIn ? (
            <>
              <Link to="/clothes" className="nav-link" onClick={closeMenu}>Clothes</Link>
              <Link to="/matches" className="nav-link" onClick={closeMenu}>Outfits</Link>
              <Link to="/today-outfits" className="nav-link" onClick={closeMenu}>Today</Link>
              <Link to="/user" className="nav-link" onClick={closeMenu}>User</Link>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
              <span className="separator">|</span>
              <Link to="/register" className="nav-link" onClick={closeMenu}>Register</Link>
            </div>
          )}
        </div>

      </nav>
    </header>
  );
};

export default Header;
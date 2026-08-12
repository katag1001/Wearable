import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
/*import wearableLogo from '../assets/images/wearable_logo.png';*/
import './header.css';

const Header = ({ loggedIn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show the header at the very top of the page
      if (currentScrollY <= 0) {
        setHeaderHidden(false);
        lastScrollY = currentScrollY;
        return;
      }

      // Scrolling down -> hide header
      if (currentScrollY > lastScrollY) {
        setHeaderHidden(true);
      }

      // Scrolling up -> show header
      else if (currentScrollY < lastScrollY) {
        setHeaderHidden(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`header ${headerHidden ? 'header-hidden' : ''}`}>
      <nav className="navbar">

        <div className="navbar-left">
          {/* <Link to="/" onClick={closeMenu} className="navbar-logo-link">
            <img
              src={wearableLogo}
              alt="Wearable Logo"
              className="navbar-logo"
            />
          </Link> */}

          {/* Burger menu (mobile only) */}
          <div
            className={`menu_toggle ${menuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                toggleMenu();
              }
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="navbar-title">
          <h1>LWS</h1>
        </div>

        <div className={`navbar-right ${menuOpen ? 'open' : ''}`}>
          {loggedIn ? (
            <>
              <Link to="/" className="nav-link" onClick={closeMenu}>
                Home
              </Link>

              <Link to="/clothes" className="nav-link" onClick={closeMenu}>
                Clothes
              </Link>

              <Link to="/matches" className="nav-link" onClick={closeMenu}>
                Outfits
              </Link>

              <Link to="/user" className="nav-link" onClick={closeMenu}>
                User
              </Link>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>

              <span className="separator">|</span>

              <Link to="/register" className="nav-link" onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>

      </nav>
    </header>
  );
};

export default Header;

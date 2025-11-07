import React from 'react';
import { Link } from 'react-router-dom';
import wearableLogo from '../assets/images/wearable_logo.png';
import './header.css';

const Header = ({ loggedIn }) => {
  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/">
            <img src={wearableLogo} alt="Wearable Logo" className="navbar-logo" />
          </Link>
        </div>

        <div className="navbar-right">
          {loggedIn ? (
            <>
              
              <Link to="/clothes" className="nav-link">Clothes</Link>
              <Link to="/matches" className="nav-link">Outfits</Link>
              <Link to="/today-outfits" className="nav-link">Today</Link>
              <Link to="/user" className="nav-link">User</Link>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <span className="separator">|</span>
              <Link to="/register" className="nav-link">Register</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

import React from 'react';
import Header from '../components/header';
import ViewMatches from '../components/matches/viewMatches';
import { Link } from 'react-router-dom';
import './Pages.css';

const OldMatches = ({ loggedIn, logout }) => {
  return (

  <div className="full-page">

      <Header loggedIn={loggedIn} />

      <div className="clothes-page-container">

      <p className="under-button-title">Rejected Outfits</p>

      <div className="sticky-upload-container">
        <Link to="/buildmatches">
          <button className="top-button">Build Outfits</button>
        </Link>
      </div>

      <div className="extra-space">
      <Link to="/matches">
        <button className="regular-button">View Current Outfits</button>
      </Link>
      </div>
      
      <ViewMatches mode="rejected" />
      
      </div>
    </div>

  );
};

export default OldMatches;


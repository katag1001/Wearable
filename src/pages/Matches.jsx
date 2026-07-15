import React from 'react';
import Header from '../components/header';
import ViewMatches from '../components/matches/viewMatches';
import { Link } from 'react-router-dom';
import './pages.css';

const Matches = ({ loggedIn, logout }) => {
  return (

  <div className="full-page-container">

      <Header loggedIn={loggedIn} title="My Outfits" />

      <div className="extra-space">
      <Link to="/oldmatches">
        <button className="regular-button">View Rejected Outfits</button>
      </Link>
      </div>
        
      <ViewMatches mode="active" />
      

  </div>

  );
};

export default Matches;

import React from 'react';
import Header from '../components/header';
import ViewMatches from '../components/matches/viewMatches';
import { Link } from 'react-router-dom';
import './Pages.css';

const Matches = ({ loggedIn, logout }) => {
  return (

  <div className="full-page">

      <Header loggedIn={loggedIn} title="My Outfits" />

      <div className="clothes-page-container">


      <div className="extra-space">
      <Link to="/oldmatches">
        <button className="regular-button">View Rejected Outfits</button>
      </Link>
        </div>
        
      <ViewMatches mode="active" />
      

      </div>
    </div>

  );
};

export default Matches;

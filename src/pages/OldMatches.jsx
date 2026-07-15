import React from 'react';
import Header from '../components/header';
import ViewMatches from '../components/matches/viewMatches';
import { Link } from 'react-router-dom';
import './Pages.css';

const OldMatches = ({ loggedIn, logout }) => {
  return (

  <div className="full-page-container">

      <Header loggedIn={loggedIn} title="Rejected Outfits"/>


      <div className="extra-space">
      <Link to="/matches">
        <button className="regular-button">View Current Outfits</button>
      </Link>
      </div>
      
      <ViewMatches mode="rejected" />
      

    </div>

  );
};

export default OldMatches;


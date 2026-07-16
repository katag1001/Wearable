import React from 'react';
import Header from '../components/header';
import ViewMatches from '../components/matches/viewMatches';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

const Matches = ({ loggedIn, logout }) => {
  return (

  <div className="full-page-container">
    
      <Header loggedIn={loggedIn} title="My Outfits" />
      <ViewMatches mode="active" />
      
  </div>

  );
};

export default Matches;

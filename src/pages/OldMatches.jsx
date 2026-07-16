import React from 'react';
import Header from '../components/header';
import ViewMatches from '../components/matches/viewMatches';
import { Link } from 'react-router-dom';
import '../styles/pages.css';

const OldMatches = ({ loggedIn, logout }) => {
  return (

  <div className="full-page-container">

      <Header loggedIn={loggedIn} title="Rejected Outfits"/>
      
      <ViewMatches mode="rejected" />
      

    </div>

  );
};

export default OldMatches;


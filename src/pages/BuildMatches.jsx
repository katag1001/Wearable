import React from 'react';
import Header from '../components/header';
import CreateMatch from '../components/matches/createMatch';
import '../styles/pages.css'; 

const BuildMatches = ({ loggedIn, logout }) => {
  return (
    <>
      <div className="full-page-container">
      <Header loggedIn={loggedIn}/>
      <h2 className="page-title">Build Outfits</h2>
      <CreateMatch />
      </div>
    </>
  );
};

export default BuildMatches;


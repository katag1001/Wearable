import React from 'react';
import Header from '../components/header';
import CreateMatch from '../components/matches/createMatch';
import './pages.css'; 

const BuildMatches = ({ loggedIn, logout }) => {
  return (
    <>
      <div className="full-page-container">
      <Header loggedIn={loggedIn} title="Build outfits"/>
      <CreateMatch />
      </div>
    </>
  );
};

export default BuildMatches;


import React, { useState } from 'react';
import Header from '../components/header';
import AutoWeather from '../components/today/autoWeather';
import ViewToday from '../components/today/viewToday';
import './pages.css';

const TodayOutfits = ({ loggedIn, logout }) => {

  return (
  <div className="full-page-container">
      <Header loggedIn={loggedIn} />

        <h2 className="page-title">Today's Outfit</h2>
      <AutoWeather />
      <ViewToday />

</div>

  );
};

export default TodayOutfits;

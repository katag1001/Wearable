import React, { useState } from 'react';
import Header from '../components/header';
import AutoWeather from '../components/today/autoWeather';
import ViewToday from '../components/today/viewToday';
import '../styles/pages.css';

const TodayOutfits = ({ loggedIn, logout }) => {

  return (
  <div className="full-page-container" >
      <Header loggedIn={loggedIn}  title="Today's Outfit"/>

      <div className="main-container">
        <AutoWeather />
        <ViewToday />
      </div>

</div>

  );
};

export default TodayOutfits;

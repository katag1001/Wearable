import React, { useState } from 'react';
import Header from '../components/header';
import AutoWeather from '../components/today/autoWeather';
import ViewToday from '../components/today/viewToday';
import '../styles/pages.css';

const TodayOutfits = ({ loggedIn, logout }) => {

  const [todayReady, setTodayReady] = useState(false);

  return (
    <div className="full-page-container">
      <Header loggedIn={loggedIn} title="Today's Outfit"/>

      <div className="main-container">
        <AutoWeather setTodayReady={setTodayReady} />
        <ViewToday todayReady={todayReady} />
      </div>
    </div>
  );
};

export default TodayOutfits;

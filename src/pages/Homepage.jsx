import React, { useState } from 'react';
import { Link } from 'react-router-dom';


import AutoWeather from '../components/today/autoWeather';
import ViewToday from '../components/today/viewToday';
import ViewMatches from '../components/matches/viewMatches';
import ViewClothes from '../components/clothes/viewClothes';

import Header from '../components/header';
import '../styles/pages.css';


const Homepage = ({ loggedIn, logout }) => {
  const [todayReady, setTodayReady] = useState(false);

  return (
    <>
      <div className="full-page-container">
      <Header loggedIn={loggedIn} />
      <div className="main-container">
        {loggedIn ? (


          <>
        <AutoWeather setTodayReady={setTodayReady} />
        <ViewToday todayReady={todayReady} />
          </>


        ) : (
          <div className="not-logged-in-container">
            <p>You are not logged in.</p>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          
        )}
        </div>
      
      
      </div>
    </>
  );
};

export default Homepage;

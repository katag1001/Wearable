import React from 'react';
import { Link } from 'react-router-dom';

import TodayFullBlock from '../components/today/todayFullBlock';

import Header from '../components/header';
import '../styles/pages.css';
import '../styles/homepage.css';



const Homepage = ({ loggedIn }) => {

  return (
    <>
      <div className="full-page-container">

        <Header 
        loggedIn={loggedIn}/>

        <div className="main-container">

          {loggedIn ? (
            <>
              {/* Today */}
              <TodayFullBlock />
            </>

          ) : (

            <div className="not-logged-in-container">

              <p>You are not logged in.</p>

              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>

            </div>

          )}

        </div>

      </div>
    </>
  );
};

export default Homepage;

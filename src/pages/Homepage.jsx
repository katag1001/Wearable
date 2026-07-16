import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import '../styles/pages.css';


const Homepage = ({ loggedIn, logout }) => {
  return (
    <>
      <div className="full-page-container">
      <Header loggedIn={loggedIn} />
      <div className="main-container">
        {loggedIn ? (
          <>
          
            <h2 className="page-title">Welcome</h2>
            <button  className="logout-button" onClick={logout}>Logout</button>
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

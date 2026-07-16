
import React from 'react';
import Header from '../components/header';
import '../styles/pages.css';


const User = ({ loggedIn, logout }) => {
  return (
    <>
    <div className="full-page-container">
      <Header loggedIn={loggedIn} />
      <div className="main-container">
        <h2 className="page-title">You are logged in</h2>
        <button className="logout-button" onClick={logout}>Logout</button>
    </div>
    </div>
    </>
  );
};

export default User;

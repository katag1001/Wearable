
import React from 'react';
import Header from '../components/header';
import './Pages.css';
import './user.css'

const User = ({ loggedIn, logout }) => {
  return (
    <>
    <div className="full-page">
      <Header loggedIn={loggedIn} />
      <div className="clothes-page-container">
        <h2 className="page-title">You are logged in</h2>
        <button className="logout-button" onClick={logout}>Logout</button>
      </div>
      </div>
    </>
  );
};

export default User;

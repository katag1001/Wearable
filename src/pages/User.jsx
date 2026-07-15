
import React from 'react';
import Header from '../components/header';
import './pages.css';


const User = ({ loggedIn, logout }) => {
  return (
    <>
    <div className="full-page-container">
      <Header loggedIn={loggedIn} />
        <h2 className="page-title">You are logged in</h2>
        <button className="logout-button" onClick={logout}>Logout</button>
    </div>
    </>
  );
};

export default User;

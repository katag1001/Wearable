// src/pages/Login.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../components/header';
import LoginForm from '../components/login/LoginForm';
import './Pages.css';

const Login = ({ login, logout, loggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) {
      navigate('/');
    }
  }, [loggedIn, navigate]);

  return (
    <div className="full-page">
      <Header loggedIn={loggedIn} />
      <div className="clothes-page-container">
        {loggedIn ? (
          <>
          
            <p>You are logged in</p>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
          <h2 className="page-title">Login</h2>
          <LoginForm login={login} />
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

// src/pages/Login.jsx
//
// The admin's way in to /trends (there's no other use for logging in on
// the website now). Once logged in it goes straight to /trends.

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "../components/login/LoginForm";

const Login = ({ login, loggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (loggedIn) {
      navigate("/trends", { replace: true });
    }
  }, [loggedIn, navigate]);

  return (
    <div className="full-page-container">
      <div className="main-container">
        <h2 className="page-title">Login</h2>
        <LoginForm login={login} />
      </div>
    </div>
  );
};

export default Login;

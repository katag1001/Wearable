// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { URL } from "./config";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Pages
import Homepage from './pages/Homepage';
import AddClothes from './pages/AddClothes';
import BuildMatches from './pages/BuildMatches';
import OldMatches from './pages/OldMatches';
import Clothes from './pages/Clothes';
import Matches from './pages/Matches';
import TodayOutfits from './pages/TodayOutfits';
import User from './pages/User';
import Register from './pages/Register';
import Login from './pages/Login';

// Components
import Enter from './components/Enter';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  // 🔁 Restore session on refresh
  useEffect(() => {
    console.log('🔁 Checking stored auth...');

    const token = localStorage.getItem('token');
    const email = localStorage.getItem('user');

    console.log('🔑 Token:', token);
    console.log('👤 Email:', email);

    if (!token) {
      setLoggedIn(false);
      setIsCheckingToken(false);
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Optional but recommended: verify token with backend
    axios.post(`${URL}/users/verify_token`)
      .then((res) => {
        console.log('✅ Token verification:', res.data);

        if (res.data.ok) {
          setLoggedIn(true);

          // Prefer stored email fallback (backend JWT payload may vary)
          const safeEmail =
            res.data.succ?.email ||
            res.data.succ?.userEmail ||
            email ||
            '';

          setUserEmail(safeEmail);
          localStorage.setItem('user', safeEmail);
        } else {
          console.log('❌ Invalid token');
          setLoggedIn(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }

        setIsCheckingToken(false);
      })
      .catch((err) => {
        console.log('❌ Token verification failed:', err);
        setLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsCheckingToken(false);
      });
  }, []);

  // ✅ Login handler
  const login = (token, email) => {
    console.log('📦 Logging in user:', email);

    localStorage.setItem('token', token);
    localStorage.setItem('user', email);

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setLoggedIn(true);
    setUserEmail(email);

    console.log('✅ Logged in successfully');
  };

  // ✅ Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    delete axios.defaults.headers.common['Authorization'];

    setLoggedIn(false);
    setUserEmail('');

    console.log('🚪 Logged out');
  };

  if (isCheckingToken) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />

      <Router>
        <Routes>

          {/* Public */}
          <Route path="/register" element={<Register />} />

          <Route
            path="/login"
            element={
              <Login
                login={login}
                logout={logout}
                loggedIn={loggedIn}
              />
            }
          />

          <Route
            path="/enter/:email/:link"
            element={<Enter signIn={() => {}} />}
          />

          {/* Homepage */}
          <Route
            path="/"
            element={
              <Homepage
                loggedIn={loggedIn}
                logout={logout}
              />
            }
          />

          {/* Protected */}
          <Route
            path="/addclothes"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <AddClothes loggedIn={loggedIn} logout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/buildmatches"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <BuildMatches loggedIn={loggedIn} logout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/oldmatches"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <OldMatches loggedIn={loggedIn} logout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clothes"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <Clothes loggedIn={loggedIn} logout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <Matches loggedIn={loggedIn} logout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/today-outfits"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <TodayOutfits loggedIn={loggedIn} logout={logout} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <User loggedIn={loggedIn} logout={logout} />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </>
  );
};

export default App;
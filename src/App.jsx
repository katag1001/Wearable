import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { URL } from "./config";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

/* Pages */
import Homepage from "./pages/homepage";
import BuildMatches from "./pages/buildMatches";
import OldMatches from "./pages/oldMatches";
import Clothes from "./pages/clothes";
import Matches from "./pages/matches";
import TodayOutfits from "./pages/todayOutfits";
import User from "./pages/user";
import Register from "./pages/register";
import Login from "./pages/login";

/* Components */
import Enter from "./components/login/enter";
import ProtectedRoute from "./components/login/protectedRoute";

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  /* -------------------- RESTORE SESSION -------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("user");

    if (!token) {
      setLoggedIn(false);
      setIsCheckingToken(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    axios
      .post(`${URL}/users/verify_token`)
      .then((res) => {
        if (res.data.ok) {
          setLoggedIn(true);

          const decodedEmail = res.data.decoded?.email || email || "";

          setUserEmail(decodedEmail);
          localStorage.setItem("user", decodedEmail);
        } else {
          setLoggedIn(false);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        setIsCheckingToken(false);
      })
      .catch(() => {
        setLoggedIn(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsCheckingToken(false);
      });
  }, []);

  /* -------------------- LOGIN -------------------- */
  const login = (token, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", email);

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setLoggedIn(true);
    setUserEmail(email);
  };

  /* -------------------- LOGOUT -------------------- */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];

    setLoggedIn(false);
    setUserEmail("");
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
              <Login login={login} logout={logout} loggedIn={loggedIn} />
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
              <Homepage loggedIn={loggedIn} logout={logout} />
            }
          />

          {/* Protected */}

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
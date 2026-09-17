import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { URL } from "./config";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./App.css";
import "./styles/sharedComponents.css";

/* Pages */
import Homepage from "./pages/Homepage";
import BuildMatches from "./pages/BuildMatches";
import Clothes from "./pages/Clothes";
import Matches from "./pages/Matches";
import User from "./pages/User";
import Register from "./pages/Register";
import Login from "./pages/Login";
import StyleQuiz from "./pages/StyleQuiz";

import  "./styles/pages.css";

/* Components */
import Enter from "./components/login/Enter";
import ProtectedRoute from "./components/login/ProtectedRoute";
import StyleQuizGate from "./components/login/StyleQuizGate";

/* -------------------- SCROLL TO TOP -------------------- */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [needsStyleQuiz, setNeedsStyleQuiz] = useState(false);

  /* -------------------- STYLE QUIZ CHECK --------------------
     Called once per login / session restore (never on route
     navigation) so we don't hit /preferences repeatedly. */
  const checkNeedsStyleQuiz = async () => {
    try {
      const res = await axios.get(`${URL}/preferences`);
      const prefs = res.data?.data;

      const isComplete =
        prefs?.gender && prefs?.style && prefs?.colour && prefs?.pattern;

      setNeedsStyleQuiz(!isComplete);
    } catch (err) {
      if (err.response?.status === 404) {
        setNeedsStyleQuiz(true);
      } else {
        console.error("Failed to check style quiz status:", err);
      }
    }
  };

  /* -------------------- RESTORE SESSION -------------------- */
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("user");

      if (!token) {
        setLoggedIn(false);
        setIsCheckingToken(false);
        return;
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const res = await axios.post(`${URL}/users/verify_token`);

        if (res.data.ok) {
          const decodedEmail = res.data.decoded?.email || email || "";

          setUserEmail(decodedEmail);
          localStorage.setItem("user", decodedEmail);

          await checkNeedsStyleQuiz();

          setLoggedIn(true);
        } else {
          setLoggedIn(false);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        setLoggedIn(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsCheckingToken(false);
      }
    };

    restoreSession();
  }, []);

  /* -------------------- LOGIN -------------------- */
  const login = async (token, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", email);

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    await checkNeedsStyleQuiz();

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
    setNeedsStyleQuiz(false);
  };

  if (isCheckingToken) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />

      <Router>
        {/* Reset scroll position whenever the route changes */}
        <ScrollToTop />

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
              <StyleQuizGate loggedIn={loggedIn} needsStyleQuiz={needsStyleQuiz}>
                <Homepage loggedIn={loggedIn} logout={logout} />
              </StyleQuizGate>
            }
          />

          {/* Style quiz (protected, but not itself gated by needsStyleQuiz) */}
          <Route
            path="/style-quiz"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <StyleQuiz
                  loggedIn={loggedIn}
                  onComplete={() => setNeedsStyleQuiz(false)}
                />
              </ProtectedRoute>
            }
          />

          {/* Protected */}

          <Route
            path="/buildmatches"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <StyleQuizGate loggedIn={loggedIn} needsStyleQuiz={needsStyleQuiz}>
                  <BuildMatches loggedIn={loggedIn} logout={logout} />
                </StyleQuizGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/clothes"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <StyleQuizGate loggedIn={loggedIn} needsStyleQuiz={needsStyleQuiz}>
                  <Clothes loggedIn={loggedIn} logout={logout} />
                </StyleQuizGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <StyleQuizGate loggedIn={loggedIn} needsStyleQuiz={needsStyleQuiz}>
                  <Matches loggedIn={loggedIn} logout={logout} />
                </StyleQuizGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <StyleQuizGate loggedIn={loggedIn} needsStyleQuiz={needsStyleQuiz}>
                  <User loggedIn={loggedIn} logout={logout} />
                </StyleQuizGate>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;

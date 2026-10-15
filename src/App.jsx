import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
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

/* Shared with the mobile app */
import { PagedCacheProvider } from "@core/cache/PagedCacheProvider.jsx";
import { useAuthSession } from "@core/hooks/useAuthSession.js";

/* -------------------- SCROLL TO TOP -------------------- */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const {
    isCheckingToken,
    loggedIn,
    needsStyleQuiz,
    login,
    logout,
    completeStyleQuiz,
  } = useAuthSession();

  if (isCheckingToken) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />

      <PagedCacheProvider loggedIn={loggedIn}>
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
                  onComplete={completeStyleQuiz}
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
      </PagedCacheProvider>
    </>
  );
};

export default App;

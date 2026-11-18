// The website, now that the app lives on phones
// (context/cloudflare-migration-plan.md, phase 1): a "Coming soon" page,
// plus the admin's login and /trends editor. Everything else goes to
// "Coming soon". The API (server/, api/) and the code shared with the
// phone app (core/, shared/) are unchanged.

import React from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import "./App.css";
import "./styles/sharedComponents.css";
import "./styles/pages.css";

import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/Login";
import Trends from "./pages/Trends";
import ProtectedRoute from "./components/login/ProtectedRoute";

/* Shared with the mobile app */
import { useAuthSession } from "@core/hooks/useAuthSession.js";

const App = () => {
  const { isCheckingToken, loggedIn, login, logout } = useAuthSession();

  if (isCheckingToken) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />

      <Router>
        <Routes>
          <Route path="/" element={<ComingSoon />} />

          <Route path="/login" element={<Login login={login} loggedIn={loggedIn} />} />

          {/* Admins only, with no link to it: the server refuses everyone
              else, and the page then sends them to "Coming soon". */}
          <Route
            path="/trends"
            element={
              <ProtectedRoute loggedIn={loggedIn}>
                <Trends logout={logout} />
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

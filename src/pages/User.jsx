import React, { useState } from 'react';
import Header from '../components/header';
import MessagePopup from '../components/general/messagePopup';
import { URL } from '../config';
import '../styles/pages.css';
import '../styles/userPage.css';
import WeeklyPreferences from '../components/preferences/weeklyPreferences';

const User = ({ loggedIn, logout }) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activeScreen, setActiveScreen] =
    useState('weekly-preferences');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log("URL from config:", URL);
  console.log("Delete endpoint:", `${URL}/users/delete`);

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${URL}/users/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete account."
        );
      }

      // Account successfully deleted
      setShowDeletePopup(false);

      // Clear the user's login state
      logout();

    } catch (error) {
      console.error("Delete account error:", error);

      setDeleting(false);
      setShowDeletePopup(true);
    }
  };

  const handleLogout = () => {
    setShowLogoutPopup(false);
    setSidebarOpen(false);
    logout();
  };

  const handleScreenChange = (screen) => {
    setActiveScreen(screen);
    setSidebarOpen(false);
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'weekly-preferences':
        return <WeeklyPreferences />;

      default:
        return <WeeklyPreferences />;
    }
  };

  return (
    <>
      <div className="full-page-container">

        <Header loggedIn={loggedIn} />

        <div className="main-container">

          <div className="user-container">

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              className="user-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open user menu"
              aria-expanded={sidebarOpen}
            >
              Menu
            </button>


            {/* MOBILE SIDEBAR OVERLAY */}

            {sidebarOpen && (
              <button
                type="button"
                className="user-sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close user menu"
              />
            )}


            {/* SIDEBAR */}

            <aside
              className={`user-sidebar ${
                sidebarOpen ? 'user-sidebar--open' : ''
              }`}
            >

              {/* MOBILE CLOSE BUTTON */}

              <button
                type="button"
                className="user-sidebar__close"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close user menu"
              >
                ×
              </button>


              {/* SIDEBAR NAVIGATION */}

              <nav className="user-sidebar__nav">

                <button
                  type="button"
                  className={`user-sidebar__button ${
                    activeScreen === 'weekly-preferences'
                      ? 'user-sidebar__button--active'
                      : ''
                  }`}
                  onClick={() =>
                    handleScreenChange('weekly-preferences')
                  }
                >
                  Weekly Preferences
                </button>

              </nav>


              {/* SIDEBAR BOTTOM ACTIONS */}

              <div className="user-sidebar__bottom">

                <button
                  type="button"
                  className="user-sidebar__action"
                  onClick={() => {
                    setShowLogoutPopup(true);
                    setSidebarOpen(false);
                  }}
                >
                  Logout
                </button>

                <button
                  type="button"
                  className="user-sidebar__action user-sidebar__action--delete"
                  onClick={() => {
                    setShowDeletePopup(true);
                    setSidebarOpen(false);
                  }}
                >
                  Delete Account
                </button>

              </div>

            </aside>


            {/* CONTENT */}

            <main className="user-content">
              {renderActiveScreen()}
            </main>

          </div>

        </div>
      </div>


      {/* LOGOUT POPUP */}

      <MessagePopup
        isOpen={showLogoutPopup}
        title="Logout"
        message="Are you sure you want to log out?"
        onClose={() => setShowLogoutPopup(false)}
        onConfirm={handleLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />


      {/* DELETE ACCOUNT POPUP */}

      <MessagePopup
        isOpen={showDeletePopup}
        title="Delete Account"
        message={
          deleting
            ? "Deleting your account..."
            : "Are you sure you want to delete your account? This will permanently delete your clothes, outfits, today's outfits, preferences, and all other account data. This action cannot be undone."
        }
        onClose={() => {
          if (!deleting) {
            setShowDeletePopup(false);
          }
        }}
        onConfirm={
          deleting
            ? undefined
            : handleDeleteAccount
        }
        confirmText={
          deleting
            ? "Deleting..."
            : "Delete Account"
        }
        cancelText="Cancel"
      />

    </>
  );
};

export default User;

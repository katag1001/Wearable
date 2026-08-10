import React, { useState } from 'react';
import Header from '../components/header';
import MessagePopup from '../components/general/messagePopup';
import { URL } from '../config';
import '../styles/pages.css';
import WeeklyPreferences from '../components/preferences/weeklyPreferences';

const User = ({ loggedIn, logout }) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        throw new Error(data.message || "Failed to delete account.");
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

  return (
    <>
      <div className="full-page-container">
        <Header loggedIn={loggedIn} />

        <div className="main-container">
          <h2 className="page-title">You are logged in</h2>

          <WeeklyPreferences />
          
          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

          <button
            className="logout-button"
            onClick={() => setShowDeletePopup(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

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
        onConfirm={deleting ? undefined : handleDeleteAccount}
        confirmText={deleting ? "Deleting..." : "Delete Account"}
        cancelText="Cancel"
      />
    </>
  );
};

export default User;

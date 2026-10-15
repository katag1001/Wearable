import React from 'react';
import { Link } from 'react-router-dom';
import { useSeasonPreviews } from "@core/hooks/useSeasonPreviews.js";
import { deleteWardrobeItem } from "@core/wardrobe/itemKinds.js";

import TodayFullBlock from '../components/today/todayFullBlock';
import ViewMatches from '../components/matches/viewMatches';
import ViewClothes from '../components/clothes/viewClothes';

import Header from '../components/header';
import '../styles/pages.css';
import '../styles/homepage.css';



const Homepage = ({ loggedIn }) => {

  // This season's clothes and outfits (useSeasonPreviews, shared with the
  // mobile Today tab) - the "View All" links have the rest.
  const {
    clothes: seasonClothes,
    outfits: seasonMatches,
    reloadClothes,
    reloadOutfits: reloadMatches,
  } = useSeasonPreviews({ enabled: loggedIn });

  // The preview shows clothes only. Failures are logged; the card stays.
  const deleteSeasonItem = async (id) => {
    try {
      await deleteWardrobeItem("clothing", id);
      reloadClothes();
      return true;
    } catch (err) {
      console.error("Delete item error:", err);
      return false;
    }
  };

  return (
    <>
      <div className="full-page-container">

        <Header 
        loggedIn={loggedIn}/>

        <div className="main-container">

          {loggedIn ? (
            <>
              {/* Today */}
              <TodayFullBlock />

              {/* Clothes & Matches */}

              <div className="bottom-dashboard">

                <div className="dashboard-section">

                  <Link
                    to="/clothes"
                    className="dashboard-link"
                  >
                    View All Clothes
                  </Link>

                  <ViewClothes
                    items={seasonClothes}
                    onEdit={() => {}}
                    onDelete={deleteSeasonItem}
                  />

                </div>

                <div className="dashboard-section">

                  <Link
                    to="/matches"
                    className="dashboard-link"
                  >
                    View All Matches
                  </Link>

                  <ViewMatches
  matches={seasonMatches}
  editable={false}
  refresh={reloadMatches}
/>

                </div>
              </div>
            </>

          ) : (

            <div className="not-logged-in-container">

              <p>You are not logged in.</p>

              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>

            </div>

          )}

        </div>

      </div>
    </>
  );
};

export default Homepage;
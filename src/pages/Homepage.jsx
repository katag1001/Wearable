import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePagedList } from "../hooks/usePagedList";
import { buildMatchFilterQuery } from "../utils/matchQuery";
import { buildClothingFilterQuery } from "../utils/clothingQuery";
import { withPage } from "../utils/pageQuery";

import TodayFullBlock from '../components/today/todayFullBlock';
import ViewMatches from '../components/matches/viewMatches';
import ViewClothes from '../components/clothes/viewClothes';

import Header from '../components/header';
import '../styles/pages.css';
import '../styles/homepage.css';



const Homepage = ({ loggedIn, logout }) => {

  /*------------------------- Season----------------------------------*/
 
  const getCurrentSeason = () => {
    const month = new Date().getMonth();

    if ([2, 3, 4].includes(month)) return "spring";
    if ([5, 6, 7].includes(month)) return "summer";
    if ([8, 9, 10].includes(month)) return "autumn";

    return "winter";
  };

  const [currentSeason] = useState(
    getCurrentSeason()
  );

  /*-------------------------Clothes-------------------------*/

  // A preview of this season's newest clothes / outfits - the "View All"
  // links have the rest. Both are cached for the session, so returning
  // here is instant.
  const HOME_CLOTHES_LIMIT = 14;
  const HOME_MATCHES_LIMIT = 8;

  const homeClothesQuery = withPage(
    buildClothingFilterQuery({
      filters: { seasons: [currentSeason] },
      limit: HOME_CLOTHES_LIMIT,
    }),
    1
  );

  const {
    data: clothesData,
    reload: reloadClothes,
  } = usePagedList("clothes", homeClothesQuery, {
    enabled: loggedIn,
    errorMessage: "Failed to fetch clothes",
  });

  /*-------------------------Matches-------------------------*/

  const homeMatchesQuery = withPage(
    buildMatchFilterQuery({
      season: currentSeason,
      limit: HOME_MATCHES_LIMIT,
    }),
    1
  );

  const {
    data: matchesData,
    reload: reloadMatches,
  } = usePagedList("matches", homeMatchesQuery, {
    enabled: loggedIn,
    errorMessage: "Failed to fetch matches",
  });

  const seasonClothes = clothesData?.items ?? [];

  const seasonMatches = matchesData?.matches ?? [];

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
                    refresh={reloadClothes}
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
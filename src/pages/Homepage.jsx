import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import { URL } from "../config";

import TodayBlock from '../components/today/TodayBlock';
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

  const [clothes, setClothes] = useState([]);
  const [clothesError, setClothesError] = useState(null);

  const fetchClothes = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setClothesError("No user logged in");
        return;
      }

      const res = await axios.get(
        `${URL}/clothing/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClothes(res.data);

    } catch (err) {
      setClothesError("Failed to fetch clothes");
    }
  };

  /*-------------------------Matches-------------------------*/

  const [matches, setMatches] = useState([]);
  const [matchesError, setMatchesError] = useState(null);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMatchesError("No user logged in");
        return;
      }

      const response = await axios.get(
        `${URL}/match/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMatches(response.data);

    } catch (err) {
      setMatchesError("Failed to fetch matches");
    }
  };

  /*-------------------------Fetch dashboard data-------------------------*/

  useEffect(() => {
    if (loggedIn) {
      fetchClothes();
      fetchMatches();
    }
  }, [loggedIn]);

  /*-------------------------Season filtering -------------------------*/

  const seasonClothes = clothes.filter(
    (item) => item[currentSeason]
  );

  const seasonMatches = matches.filter(
    (match) => match[currentSeason]
  );

  return (
    <>
      <div className="full-page-container">

        <Header 
        loggedIn={loggedIn}/>

        <div className="main-container">

          {loggedIn ? (
            <>
              {/* Today */}
              <TodayBlock />

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
                    refresh={fetchClothes}
                    setError={setClothesError}
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
  refresh={fetchMatches}
  setError={setMatchesError}
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
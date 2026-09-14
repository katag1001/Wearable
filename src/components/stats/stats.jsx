import { useEffect, useState } from "react";
import { URL } from "../../config";
import "./stats.css";
import "../../styles/pages.css";


const Stats = () => {
  const [matches, setMatches] = useState([]);
  const [clothes, setClothes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("allTime");


  const getToken = () => {
    return localStorage.getItem("token");
  };


  useEffect(() => {
    const fetchStats = async () => {

      const token = getToken();

      if (!token) {
        setError(
          "You must be logged in to view your stats."
        );

        setLoading(false);

        return;
      }

      try {

        const [matchesResponse, clothesResponse] =
          await Promise.all([
            fetch(`${URL}/match/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch(`${URL}/clothing/`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (!matchesResponse.ok || !clothesResponse.ok) {
          throw new Error("Failed to load stats.");
        }

        const matchesData = await matchesResponse.json();
        const clothesData = await clothesResponse.json();

        setMatches(
          Array.isArray(matchesData) ? matchesData : []
        );

        setClothes(
          Array.isArray(clothesData) ? clothesData : []
        );

      } catch (err) {

        console.error(
          "Error fetching stats:",
          err
        );

        setError(
          err.message || "Failed to load stats."
        );

      } finally {

        setLoading(false);
      }
    };

    fetchStats();
  }, []);


  /* ------------------------- COUNT HELPERS ------------------------- */

  const countField =
    mode === "thisYear"
      ? "timesWornThisYear"
      : "timesWorn";


  const getTopByCount = (items, limit) => {

    return [...items]
      .filter(
        (item) => (item?.[countField] || 0) > 0
      )
      .sort(
        (a, b) =>
          (b?.[countField] || 0) -
          (a?.[countField] || 0)
      )
      .slice(0, limit);
  };


  const topOutfits = getTopByCount(matches, 3);
  const topClothes = getTopByCount(clothes, 5);


  const formatCount = (count) => {
    return `Worn ${count} ${count === 1 ? "time" : "times"}`;
  };


  /* ------------------------- RENDER OUTFIT IMAGES ------------------------- */

  const renderOutfitImages = (outfit) => {

    return (
      <div className="stats-outfit-images">

        {(outfit.clothes || [])
          .map(
            (item) =>
              item?.imageUrl && (
                <img
                  key={item._id}
                  src={item.imageUrl}
                  alt={item.name}
                  className="stats-outfit-image"
                />
              )
          )
          .filter(Boolean)}

      </div>
    );
  };


  /* ------------------------- RENDER STATES ------------------------- */

  if (loading) {
    return (
      <p className="loading">
        Loading stats...
      </p>
    );
  }

  if (error) {
    return (
      <p className="today-message">
        {error}
      </p>
    );
  }


  /* ------------------------- MAIN RENDER ------------------------- */

  return (
    <div className="stats">

      {/* HEADER */}

      <div className="stats-header">

        <h2 className="page-title">
          Your Favourites
        </h2>


        <div className="stats-toggle">

          <button
            type="button"
            className={`stats-toggle-button ${
              mode === "allTime"
                ? "stats-toggle-button--active"
                : ""
            }`}
            onClick={() => setMode("allTime")}
          >
            All Time
          </button>

          <button
            type="button"
            className={`stats-toggle-button ${
              mode === "thisYear"
                ? "stats-toggle-button--active"
                : ""
            }`}
            onClick={() => setMode("thisYear")}
          >
            This Year
          </button>

        </div>

      </div>


      {/* TOP OUTFITS */}

      <div className="stats-section">

        <h3 className="stats-section-title">
          Top Outfits
        </h3>

        {topOutfits.length > 0 ? (

          <div className="stats-outfit-grid">

            {topOutfits.map((outfit, index) => (

              <div
                key={outfit._id}
                className="stats-outfit-card"
              >

                <span className="stats-rank-badge">
                  #{index + 1}
                </span>

                {renderOutfitImages(outfit)}

                <span className="stats-count-label">
                  {formatCount(outfit[countField])}
                </span>

              </div>

            ))}

          </div>

        ) : (

          <p className="stats-empty-message">
            {mode === "thisYear"
              ? "No outfits worn this year."
              : "No outfits worn yet."}
          </p>

        )}

      </div>


      {/* TOP CLOTHES */}

      <div className="stats-section">

        <h3 className="stats-section-title">
          Top Clothes
        </h3>

        {topClothes.length > 0 ? (

          <div className="stats-clothes-grid">

            {topClothes.map((item, index) => (

              <div
                key={item._id}
                className="stats-clothing-card"
              >

                <span className="stats-rank-badge">
                  #{index + 1}
                </span>

                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="stats-clothing-image"
                  />
                )}

                <span className="stats-clothing-name">
                  {item.name}
                </span>

                <span className="stats-count-label">
                  {formatCount(item[countField])}
                </span>

              </div>

            ))}

          </div>

        ) : (

          <p className="stats-empty-message">
            {mode === "thisYear"
              ? "No clothes worn this year."
              : "No clothes worn yet."}
          </p>

        )}

      </div>

    </div>
  );
};

export default Stats;

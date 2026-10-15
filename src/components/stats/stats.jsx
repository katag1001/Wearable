import { getImageUrl } from "@core/utils/getImageUrl.js";
import { useStats } from "@core/hooks/useStats.js";
import { formatWornCount as formatCount } from "@core/stats/topWorn.js";
import "./stats.css";
import "../../styles/pages.css";


// The logic lives in useStats (shared with the mobile app); this only
// renders it.
const Stats = () => {
  const {
    loading,
    error,
    mode,
    setMode,
    countField,
    topOutfits,
    topClothes,
  } = useStats();


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
                  src={getImageUrl(item.imageUrl, 200)}
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
                    src={getImageUrl(item.imageUrl, 200)}
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

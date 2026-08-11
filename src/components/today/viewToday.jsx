import React, { useEffect, useState } from "react";
import axios from "axios";
import "./viewToday.css";
import { URL } from "../../config";
import todayOutfitSort from "./todayOutfitSort";
import MessagePopup from "../general/messagePopup.jsx";
import { fetchTodayInfo } from "./todayHelpers";
import { tagOptions } from "../../constants/optionsBank";


const ViewToday = ({ todayReady }) => {
  const [outfits, setOutfits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [alternativePage, setAlternativePage] = useState(0);

  const [selectedTag, setSelectedTag] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checkingToday, setCheckingToday] = useState(false);
  const [message, setMessage] = useState(null);

  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
  });

  const ALTERNATIVES_PER_PAGE = 4;


  const getToken = () => {
    return localStorage.getItem("token");
  };


  /* ------------------------- GET TODAY'S OUTFITS ------------------------- */

  const fetchTodayOutfits = async (
    todayTagName = null,
    attempt = 0
  ) => {

    try {

      const token = getToken();

      const response = await axios.get(
        `${URL}/today/get`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;


      // Today is still being created

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {

        if (attempt < 10) {

          setCheckingToday(true);

          setTimeout(() => {
            fetchTodayOutfits(
              todayTagName,
              attempt + 1
            );
          }, 1000);

          return;
        }


        setCheckingToday(false);

        setMessage(
          "No outfits saved for today."
        );

        setLoading(false);

        return;
      }


      // Today outfits are ready

      const sortedOutfits =
        todayOutfitSort(
          data,
          todayTagName
        );


      setOutfits(sortedOutfits);

      setCurrentIndex(0);
      setAlternativePage(0);

      setCheckingToday(false);
      setLoading(false);

    } catch (err) {

      console.error(
        "Failed to fetch today's outfits:",
        err
      );

      setCheckingToday(false);
      setLoading(false);

      setMessage(
        "Error fetching outfits: " +
        err.message
      );
    }
  };


  /* ------------------------- LOAD TODAY ------------------------- */

  useEffect(() => {

    if (!todayReady) {
      return;
    }


    const loadToday = async () => {

      const {
        dayOfWeek,
        todayTag
      } = await fetchTodayInfo();


      console.log(
        "Today:",
        dayOfWeek
      );

      console.log(
        "Today's tag:",
        todayTag
      );


      await fetchTodayOutfits(
        todayTag
      );
    };


    loadToday();

  }, [todayReady]);


  /* ------------------------- FILTER BY TAG ------------------------- */

  const filteredOutfits =
    selectedTag
      ? outfits.filter(
          (outfit) =>
            outfit?.matchId?.tags?.includes(
              selectedTag
            )
        )
      : outfits;


  /* ------------------------- SELECT TAG ------------------------- */

  const selectTag = (tagName) => {

    if (
      selectedTag === tagName
    ) {

      setSelectedTag(null);
      setCurrentIndex(0);
      setAlternativePage(0);

      return;
    }

    setSelectedTag(tagName);
    setCurrentIndex(0);
    setAlternativePage(0);
  };


  /* ------------------------- SELECT OUTFIT ------------------------- */

  const selectOutfit = (index) => {

    if (
      index < 0 ||
      index >= filteredOutfits.length
    ) {
      return;
    }


    setCurrentIndex(index);
    setAlternativePage(0);
  };


  /* ------------------------- NEXT / PREVIOUS ------------------------- */

  const goNext = () => {

    if (
      filteredOutfits.length <= 1
    ) {
      return;
    }


    setCurrentIndex(
      (prev) =>
        (prev + 1) %
        filteredOutfits.length
    );

    setAlternativePage(0);
  };


  const goPrev = () => {

    if (
      filteredOutfits.length <= 1
    ) {
      return;
    }


    setCurrentIndex(
      (prev) =>
        (prev - 1 +
          filteredOutfits.length) %
        filteredOutfits.length
    );

    setAlternativePage(0);
  };


  /* ------------------------- ALTERNATIVE OUTFITS ------------------------- */

  const getAlternativeOutfits = () => {

    if (
      filteredOutfits.length <= 1
    ) {
      return [];
    }


    const alternatives = [];


    // Build all outfits except the currently selected one

    for (
      let offset = 1;
      offset < filteredOutfits.length;
      offset++
    ) {

      const index =
        (currentIndex + offset) %
        filteredOutfits.length;


      alternatives.push({
        outfit:
          filteredOutfits[index],

        index,
      });
    }


    // Only show the current page

    const start =
      alternativePage *
      ALTERNATIVES_PER_PAGE;


    return alternatives.slice(
      start,
      start + ALTERNATIVES_PER_PAGE
    );
  };


  const alternativeCount =
    Math.max(
      filteredOutfits.length - 1,
      0
    );


  const totalAlternativePages =
    Math.ceil(
      alternativeCount /
      ALTERNATIVES_PER_PAGE
    );


  const hasMoreAlternativePages =
    alternativePage <
    totalAlternativePages - 1;


  const goToNextAlternativePage = () => {

    if (
      !hasMoreAlternativePages
    ) {
      return;
    }


    setAlternativePage(
      (prev) => prev + 1
    );
  };


  /* ------------------------- MARK AS WORN ------------------------- */

  const markAsWornToday = async () => {

    const outfit =
      filteredOutfits[currentIndex];


    const matchId =
      outfit?.matchId?._id;


    if (!matchId) {
      return;
    }


    try {

      const token =
        getToken();


      const response =
        await fetch(
          `${URL}/match/${matchId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              lastWornDate:
                new Date().toISOString(),
            }),
          }
        );


      if (response.ok) {

        const updated =
          await response.json();


        setOutfits((prev) => {

          return prev.map(
            (outfit) => {

              if (
                outfit.matchId?._id ===
                matchId
              ) {

                return {
                  ...outfit,

                  lastWornDate:
                    updated.lastWornDate,
                };
              }


              return outfit;
            }
          );
        });


        setPopup({
          open: true,
          title: "Success",
          message:
            "Marked as worn today!",
        });
      }

    } catch (err) {

      setPopup({
        open: true,
        title: "Error",
        message:
          "Error updating lastWornDate: " +
          err.message,
      });
    }
  };


  /* ------------------------- IMAGE ------------------------- */

  const renderItemImage = (
    item,
    small = false
  ) => {

    if (!item?.imageUrl) {
      return null;
    }


    return (
      <img
        key={item._id}
        src={item.imageUrl}
        alt={item.name}
        className={
          small
            ? "today-image-small"
            : "today-image"
        }
      />
    );
  };


  /* ------------------------- RENDER OUTFIT IMAGES ------------------------- */

  const renderOutfitImages = (
    outfit,
    small = false
  ) => {

    return (
      <div
        className={
          small
            ? "today-image-group-small"
            : "today-image-group"
        }
      >

        {(outfit?.matchId?.clothes || [])
          .map((item) =>
            renderItemImage(
              item,
              small
            )
          )
          .filter(Boolean)}

      </div>
    );
  };


  /* ------------------------- RENDER STATES ------------------------- */

  if (!todayReady) {

    return (
      <p className="today-message">
        Loading outfits...
      </p>
    );
  }


  if (
    loading ||
    checkingToday
  ) {

    return (
      <p className="today-message">
        Preparing today's outfits...
      </p>
    );
  }


  if (message) {

    return (
      <p className="today-message">
        {message}
      </p>
    );
  }

  if (!outfits.length) {

    return (
      <p className="today-message">
        No outfits saved for today.
      </p>
    );
  }

  /* ------------------------- SELECTED OUTFIT ------------------------- */

const selectedOutfit =
  filteredOutfits.length > 0
    ? filteredOutfits[currentIndex]
    : null;

  const alternativeOutfits =
    getAlternativeOutfits();

  /* ------------------------- MAIN RENDER ------------------------- */

return (
  <div className="view-today-container">

    {/* TOP SECTION */}

    <div className="today-top-section">

      {/* FEATURED / MAIN OUTFIT */}

      <div className="featured-outfit">

        <div className="featured-outfit-content">

          {filteredOutfits.length > 0 ? (

            renderOutfitImages(
              selectedOutfit
            )

          ) : (

            <p className="today-message">
              No outfits found for this tag.
            </p>

          )}

        </div>


        {/* ONLY SHOW BUTTON WHEN AN OUTFIT EXISTS */}

        {filteredOutfits.length > 0 && (

          <div className="today-buttons">

            <button
              className="regular-button"
              onClick={markAsWornToday}
            >
              Mark as Worn Today
            </button>

          </div>

        )}

      </div>


      {/* ALTERNATIVE OUTFITS */}

      {filteredOutfits.length > 1 && (

        <div className="outfit-selector">

          <div className="outfit-selector-content">

            <div className="outfit-options">

              {alternativeOutfits.map(
                ({
                  outfit,
                  index
                }) => (

                  <button
                    key={
                      outfit.matchId?._id ||
                      index
                    }
                    className="outfit-option"
                    onClick={() =>
                      selectOutfit(index)
                    }
                    aria-label={`Select outfit ${
                      index + 1
                    }`}
                  >

                    {renderOutfitImages(
                      outfit,
                      true
                    )}

                  </button>

                )
              )}

            </div>


            {/* SHOW MORE */}

            {hasMoreAlternativePages && (

              <button
                className="alternative-down-button"
                onClick={
                  goToNextAlternativePage
                }
                aria-label="Show more outfits"
              >
                ↓
              </button>

            )}

          </div>

        </div>

      )}

    </div>


    {/* TAG SELECTOR */}

    <div className="today-tags-section">

      <div className="today-tags-title">
        Filter by Tag
      </div>


      <div className="today-tag-selector">

        {tagOptions.map((tag) => {

          const isSelected =
            selectedTag === tag.name;


          return (

            <button
              key={tag.name}
              className={`today-tag-option ${
                isSelected
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                selectTag(tag.name)
              }
              aria-label={`Filter by ${tag.name}`}
              aria-pressed={isSelected}
            >

              <div className="today-tag-image-wrapper">

                <img
                  src={tag.image}
                  alt={tag.name}
                  className="today-tag-icon"
                />

              </div>


              <div className="today-tag-content">

                <span>
                  {tag.name}
                </span>


                {isSelected && (

                  <span
                    className="today-tag-check"
                    aria-label="Selected"
                  >
                    ✓
                  </span>

                )}

              </div>

            </button>

          );

        })}

      </div>

    </div>


    {/* POPUP */}

    <MessagePopup
      isOpen={popup.open}
      title={popup.title}
      message={popup.message}
      onClose={() =>
        setPopup({
          open: false,
          title: "",
          message: "",
        })
      }
    />

  </div>
);
};


export default ViewToday;


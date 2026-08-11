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

  const [selectedTag, setSelectedTag] = useState(null);

  const [loading, setLoading] = useState(true);
  const [checkingToday, setCheckingToday] = useState(false);
  const [message, setMessage] = useState(null);

  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
  });


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
            Authorization:
              `Bearer ${token}`,
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


      setOutfits(
        sortedOutfits
      );

      setCurrentIndex(0);

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

      return;
    }


    setSelectedTag(tagName);
    setCurrentIndex(0);
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
  };


  /* ------------------------- GET ALTERNATIVE OUTFITS ------------------------- */

  const getAlternativeOutfits = () => {

    if (
      filteredOutfits.length <= 1
    ) {
      return [];
    }


    const alternatives = [];


    for (
      let offset = 1;
      offset <=
        Math.min(
          3,
          filteredOutfits.length - 1
        );
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


    return alternatives;
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
    filteredOutfits[currentIndex];


  const alternativeOutfits =
    getAlternativeOutfits();


  /* ------------------------- MAIN RENDER ------------------------- */

  return (
    <div className="view-today-container">

      {/* NO OUTFITS FOR SELECTED TAG */}

      {!filteredOutfits.length && (

        <p className="today-message">
          No outfits found for this tag.
        </p>

      )}


      {/* FEATURED OUTFIT */}

      {filteredOutfits.length > 0 && (

        <div className="featured-outfit">

          {renderOutfitImages(
            selectedOutfit
          )}


          <div className="today-buttons">

            <button
              className="regular-button"
              onClick={
                markAsWornToday
              }
            >
              Mark as Worn Today
            </button>

          </div>

        </div>

      )}


      {/* ALTERNATIVE OUTFITS */}

      {filteredOutfits.length > 1 && (

        <div className="outfit-selector">

          <button
            className="left-right"
            onClick={goPrev}
            aria-label="Previous outfit"
          >
            ‹
          </button>


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
                    selectOutfit(
                      index
                    )
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


          <button
            className="left-right"
            onClick={goNext}
            aria-label="Next outfit"
          >
            ›
          </button>

        </div>

      )}

      
      {/* TAG SELECTOR */}

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
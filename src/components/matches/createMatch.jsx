import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./createMatch.css";
import { URL } from "../../config";
import MessagePopup from "../general/messagePopup.jsx";


const sectionTitles = {
  top: "Tops",
  bottom: "Bottoms",
  outer: "Outerwear",
  onepiece: "One-Pieces",
};


const categories = [
  "top",
  "bottom",
  "outer",
  "onepiece",
];


const CreateMatch = () => {

  /* --------------------------------------------------------------
     State
  -------------------------------------------------------------- */

  const [formData, setFormData] = useState({
    top: [],
    bottom: [],
    outer: [],
    onepiece: [],
  });

  const [clothesData, setClothesData] = useState({
    top: [],
    bottom: [],
    outer: [],
    onepiece: [],
  });

  const [selectedCategory, setSelectedCategory] = useState("top");
  const [searchTerm, setSearchTerm] = useState("");

  const [response, setResponse] = useState(null);

  const [showPopup, setShowPopup] = useState(false);

  const [popupContent, setPopupContent] = useState({
    title: "",
    message: "",
  });


  const scrollRef = useRef(null);


  /* --------------------------------------------------------------
     Authentication
  -------------------------------------------------------------- */

  const getToken = () => localStorage.getItem("token");


  /* --------------------------------------------------------------
     Fetch Clothing
  -------------------------------------------------------------- */

  useEffect(() => {

    const fetchClothes = async () => {

      const token = getToken();

      if (!token) {
        console.error("No user logged in");
        return;
      }

      try {

        const res = await axios.get(`${URL}/clothing/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const grouped = {
          top: [],
          bottom: [],
          outer: [],
          onepiece: [],
        };

        res.data.forEach((item) => {

          if (grouped[item.type]) {
            grouped[item.type].push(item);
          }

        });

        setClothesData(grouped);

      } catch (err) {

        console.error(
          "Error fetching clothing data:",
          err
        );

      }

    };

    fetchClothes();

  }, []);


  /* --------------------------------------------------------------
     Selection
  -------------------------------------------------------------- */

  const handleSelect = (category, item) => {

    setFormData((prev) => {

      const exists = prev[category].some(
        (selected) => selected._id === item._id
      );

      return {
        ...prev,

        [category]: exists
          ? prev[category].filter(
              (selected) => selected._id !== item._id
            )
          : [...prev[category], item],
      };

    });

  };


  const isSelected = (category, item) => {

    return formData[category].some(
      (selected) => selected._id === item._id
    );

  };


  /* --------------------------------------------------------------
     Search
  -------------------------------------------------------------- */

  const filteredItems = (category) => {

    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return clothesData[category];
    }

    return clothesData[category].filter((item) => {

      return (
        item.name?.toLowerCase().includes(term) ||
        item.brand?.toLowerCase().includes(term) ||
        item.colors?.some((color) =>
          color.toLowerCase().includes(term)
        ) ||
        item.tags?.some((tag) =>
          tag.toLowerCase().includes(term)
        )
      );

    });

  };


  /* --------------------------------------------------------------
     Scroll
  -------------------------------------------------------------- */

  const scroll = (direction) => {

    const container = scrollRef.current;

    if (!container) return;

    container.scrollBy({
      left: direction * 300,
      behavior: "smooth",
    });

  };


  /* --------------------------------------------------------------
     Category Change
  -------------------------------------------------------------- */

  const handleCategoryChange = (category) => {

    setSelectedCategory(category);
    setSearchTerm("");

    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }

  };


  /* --------------------------------------------------------------
     Submit
  -------------------------------------------------------------- */

  const handleSubmit = async (e) => {

    e.preventDefault();

    const token = getToken();

    if (!token) {

      setPopupContent({
        title: "Unable to Submit Outfit",
        message: "No user is currently logged in.",
      });

      setShowPopup(true);

      return;
    }


    const selectedItems = Object.values(formData).flat();


    if (selectedItems.length === 0) {

      setPopupContent({
        title: "No Clothing Selected",
        message: "Please select at least one clothing item.",
      });

      setShowPopup(true);

      return;
    }


    const allColors = [
      ...new Set(
        selectedItems.flatMap(
          (item) => item.colors || []
        )
      ),
    ];


    const minTempAvg = Math.round(
      selectedItems.reduce(
        (sum, item) => sum + item.min_temp,
        0
      ) / selectedItems.length
    );


    const maxTempAvg = Math.round(
      selectedItems.reduce(
        (sum, item) => sum + item.max_temp,
        0
      ) / selectedItems.length
    );


    const seasonKeys = [
      "spring",
      "summer",
      "autumn",
      "winter",
    ];


    const seasons = {};


    seasonKeys.forEach((season) => {

      seasons[season] = selectedItems.every(
        (item) => item[season]
      );

    });


    const clothes = [];


    Object.values(formData).forEach((items) => {

      items.forEach((item) => {
        clothes.push(item._id);
      });

    });


    const payload = {
      clothes,
      colors: allColors,
      min_temp: minTempAvg,
      max_temp: maxTempAvg,
      ...seasons,
      styles: [],
      type: "match",
      lastWornDate: null,
      tags: [],
      userMade: true,
    };


    try {

      const res = await fetch(
        `${URL}/match/matches`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        }
      );


      const result = await res.json();


      if (!res.ok) {
        throw new Error(
          result.error ||
          "Failed to create match"
        );
      }


      setResponse(result);


      setPopupContent({
        title: "Outfit Submitted!",
        message:
          "Your outfit has been successfully added to the matches database.",
      });


      setShowPopup(true);


      setFormData({
        top: [],
        bottom: [],
        outer: [],
        onepiece: [],
      });


    } catch (err) {

      console.error(
        "Submit failed:",
        err
      );


      setResponse({
        error: err.message,
      });


      setPopupContent({
        title: "Unable to Submit Outfit",
        message: err.message,
      });


      setShowPopup(true);

    }

  };


  /* --------------------------------------------------------------
     Selected Outfit
  -------------------------------------------------------------- */

  const selectedItems = categories.flatMap(
    (category) =>
      (formData[category] || []).map(
        (item) => ({
          category,
          item,
        })
      )
  );


  /* --------------------------------------------------------------
     Current Category Items
  -------------------------------------------------------------- */

  const currentItems =
    filteredItems(selectedCategory);


  /* --------------------------------------------------------------
     Render Clothing
  -------------------------------------------------------------- */

  const renderItems = () => {

    return (

      <div className="buildmatch-items-area">

        <div className="buildmatch-category-heading">

          <div>
            <p className="buildmatch-category-label">
              {sectionTitles[selectedCategory]}
            </p>

          </div>

        </div>


        <div className="buildmatch-scroll-wrapper">

          <button
            type="button"
            className="buildmatch-scroll-arrow"
            onClick={() => scroll(-1)}
            aria-label={`Previous ${sectionTitles[selectedCategory]}`}
          >
            ‹
          </button>


          <div
            className="buildmatch-scroll-container"
            ref={scrollRef}
          >

            {currentItems.length === 0 ? (

              <div className="buildmatch-no-items">
                No items found.
              </div>

            ) : (

              currentItems.map((item) => (

                <button
                  type="button"
                  key={item._id}
                  className={`buildmatch-clothing-card ${
                    isSelected(
                      selectedCategory,
                      item
                    )
                      ? "buildmatch-clothing-card--selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelect(
                      selectedCategory,
                      item
                    )
                  }
                  aria-pressed={isSelected(
                    selectedCategory,
                    item
                  )}
                >

                  {item.imageUrl && (

                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="buildmatch-clothing-image"
                    />

                  )}

                </button>

              ))

            )}

          </div>


          <button
            type="button"
            className="buildmatch-scroll-arrow"
            onClick={() => scroll(1)}
            aria-label={`Next ${sectionTitles[selectedCategory]}`}
          >
            ›
          </button>

        </div>

      </div>

    );

  };


  /* --------------------------------------------------------------
     Render
  -------------------------------------------------------------- */

  return (

    <div className="main-container create-match-page">

      <button
        type="button"
        onClick={handleSubmit}
        className="top-action-button"
      >
        Submit Outfit
      </button>


      <MessagePopup
        isOpen={showPopup}
        title={popupContent.title}
        message={popupContent.message}
        onClose={() => setShowPopup(false)}
      />


      <div className="create-matches-container">

        <div className="buildmatch-layout">


          {/* --------------------------------------------------
              LEFT — Selected Outfit
          -------------------------------------------------- */}

          <section className="buildmatch-panel buildmatch-selected-panel">

            <div className="buildmatch-panel-header">

              <div>
                <h2 className="buildmatch-panel-title">
                  Selected Outfit
                </h2>

                <p className="buildmatch-panel-description">
                  Build your outfit by selecting
                  clothing from the panel.
                </p>
              </div>

              <span className="buildmatch-selected-count">
                {selectedItems.length}
              </span>

            </div>


            <div className="selected-outfit-content">

              {selectedItems.length === 0 ? (

                <div className="selected-empty">

                  <div className="selected-empty-plus">
                    +
                  </div>

                  <p>
                    Select clothing items to
                    build an outfit.
                  </p>

                </div>

              ) : (

                <div className="selected-items">

                  {selectedItems.map(
                    ({ category, item }) => (

                      <div
                        className="selected-card"
                        key={item._id}
                      >

                        {item.imageUrl && (

                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="selected-image"
                          />

                        )}


                        <div className="selected-card-category">
                          {sectionTitles[category]}
                        </div>


                        <button
                          type="button"
                          className="remove-selected-button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,

                              [category]:
                                prev[category].filter(
                                  (selected) =>
                                    selected._id !==
                                    item._id
                                ),
                            }))
                          }
                          aria-label={`Remove ${item.name || "item"}`}
                        >
                          ×
                        </button>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </section>


          {/* --------------------------------------------------
              RIGHT — Clothing Selection
          -------------------------------------------------- */}

          <section className="buildmatch-panel buildmatch-selection-panel">

            <div className="buildmatch-panel-header">

              <div>
                <h2 className="buildmatch-panel-title">
                  Clothing
                </h2>

                <p className="buildmatch-panel-description">
                  Choose a type and select your items.
                </p>
              </div>

            </div>


            <div className="buildmatch-selector-box">


              {/* Type buttons */}

              <div className="buildmatch-type-buttons">

                {categories.map((category) => (

                  <button
                    type="button"
                    key={category}
                    className={`buildmatch-type-button ${
                      selectedCategory === category
                        ? "buildmatch-type-button--active"
                        : ""
                    }`}
                    onClick={() =>
                      handleCategoryChange(category)
                    }
                  >
                    {sectionTitles[category]}
                  </button>

                ))}

              </div>


              {/* Search */}

              <div className="buildmatch-search">

                <input
                  type="text"
                  className="buildmatch-search-input"
                  placeholder="Search clothing..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>


              {/* Items */}

              <form
                className="buildmatch-items-form"
                onSubmit={handleSubmit}
              >
                {renderItems()}
              </form>


            </div>

          </section>


        </div>

      </div>


      {response?.error && (
        <div className="error-text">
          {response.error}
        </div>
      )}

    </div>

  );
};


export default CreateMatch;

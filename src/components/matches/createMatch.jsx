import React, { useEffect, useRef, useState } from "react";
import "./createMatch.css";
import { getImageUrl } from "@core/utils/getImageUrl.js";
import {
  ITEM_CATEGORIES as categories,
  ITEM_CATEGORY_LABELS as sectionTitles,
} from "@core/filters/filterDefaults.js";
import { useCreateMatch } from "@core/hooks/useCreateMatch.js";
import MessagePopup from "../general/messagePopup.jsx";


// The outfit-building logic lives in useCreateMatch (shared with the
// mobile app). The paging here fits the web grid, so it stays.
const CreateMatch = () => {

  const builder = useCreateMatch();

  const {
    selectedItems,
    isSelected,
    searchTerm,
    result,
  } = builder;

  const selectedCategory = builder.category;
  const handleSelect = builder.toggleItem;

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(8);

  const scrollRef = useRef(null);


  /* --------------------------------------------------------------
     Paging
  -------------------------------------------------------------- */

  // The grid always shows 2 rows; the column count changes per
  // breakpoint in the CSS, so read it from the rendered grid.
  const GRID_ROWS = 2;

  useEffect(() => {

    const measure = () => {

      const container = scrollRef.current;

      if (!container) return;

      const columns = getComputedStyle(container)
        .gridTemplateColumns
        .split(" ")
        .filter(Boolean).length;

      setPageSize(Math.max(1, columns) * GRID_ROWS);

    };

    measure();

    window.addEventListener("resize", measure);

    return () =>
      window.removeEventListener("resize", measure);

  }, []);


  const changePage = (direction) => {

    setPage((prev) =>
      Math.min(
        Math.max(prev + direction, 0),
        totalPages - 1
      )
    );

  };


  /* --------------------------------------------------------------
     Category Change
  -------------------------------------------------------------- */

  const handleCategoryChange = (category) => {

    builder.chooseCategory(category);
    setPage(0);

  };


  const handleSubmit = (e) => {

    e.preventDefault();
    builder.submit();

  };


  /* --------------------------------------------------------------
     Current Category Items
  -------------------------------------------------------------- */

  const currentItems = builder.categoryItems;

  const totalPages = Math.max(
    1,
    Math.ceil(currentItems.length / pageSize)
  );

  // Clamp in case a resize or search shrinks the page count
  const currentPage = Math.min(page, totalPages - 1);

  const pageItems = currentItems.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );


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
            onClick={() => changePage(-1)}
            disabled={currentPage === 0}
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

              pageItems.map((item) => (

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
                      src={getImageUrl(item.imageUrl, 500)}
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
            onClick={() => changePage(1)}
            disabled={currentPage >= totalPages - 1}
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
        isOpen={!!result}
        title={result?.title}
        message={result?.message}
        onClose={builder.clearResult}
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
                            src={getImageUrl(item.imageUrl, 500)}
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
                            builder.toggleItem(category, item)
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
                  onChange={(e) => {
                    builder.setSearchTerm(e.target.value);
                    setPage(0);
                  }}
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


    </div>

  );
};


export default CreateMatch;

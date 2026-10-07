import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./viewToday.css";
import { URL } from "../../config";
import todayOutfitSort from "./todayOutfitSort";
import MessagePopup from "../general/messagePopup.jsx";
import DeletePopup from "../general/deletePopup.jsx";
import MatchScoreBadge from "../general/matchScoreBadge.jsx";
import { fetchTodayInfo, isDateToday } from "./todayHelpers";
import { rejectOutfit, wasRejectedToday } from "./outfitRejection";
import { getCachedToday, cacheToday } from "./todayCache";
import { tagOptions } from "../../constants/optionsBank";
import { getImageUrl } from "../../utils/getImageUrl";


// The tagOptions entry for the weekly-preference tag (matched without
// caring about case), or null.
const findTagOption = (tagName) => {
  if (!tagName) {
    return null;
  }

  const normalized = tagName.trim().toLowerCase();

  return (
    tagOptions.find(
      (option) => option.name.toLowerCase() === normalized
    ) || null
  );
};


const ViewToday = ({ todayReady }) => {

  // Today's outfits from earlier today, if any - shown straight away on a
  // refresh, then quietly refreshed from the server in the background.
  const [cachedToday] = useState(getCachedToday);

  const [outfits, setOutfits] = useState(
    cachedToday?.outfits ?? []
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedTag, setSelectedTag] = useState(
    cachedToday?.todayTag ?? null
  );

  // Today's tag from the weekly preferences (a tagOptions name), or null.
  const [todayTag, setTodayTag] = useState(
    cachedToday?.todayTag ?? null
  );

  // Match ids with a reject request in flight, so fast clicking can't send
  // the same rejection twice.
  const pendingRejections = useRef(new Set());

  const [loading, setLoading] = useState(!cachedToday);
  const [checkingToday, setCheckingToday] = useState(false);
  const [message, setMessage] = useState(null);

  // The outfit currently marked "worn today", plus the snapshot needed to
  // undo it if a different outfit is marked worn later in the same session.
  const [wornToday, setWornToday] = useState(null);

  // Whether the full outfit-selection UI is showing, vs just the worn card.
  const [showSelector, setShowSelector] = useState(true);

  const [popup, setPopup] = useState({
    open: false,
    title: "",
    message: "",
  });

  // Whether the "delete outfit" confirmation is showing, plus a loading
  // flag for the confirm button while the delete request is in flight.
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingOutfit, setDeletingOutfit] = useState(false);

  const OUTFIT_SORT_CACHE_KEY =
    "today_outfit_sort_cache";


  const getToken = () => {
    return localStorage.getItem("token");
  };


  /* ------------------------- CACHE HELPERS ------------------------- */

  const getCachedSortedOutfitIds = () => {

    try {

      const cached =
        JSON.parse(
          localStorage.getItem(
            OUTFIT_SORT_CACHE_KEY
          )
        );


      if (
        !cached ||
        !isDateToday(cached.date) ||
        !Array.isArray(
          cached.outfitIds
        )
      ) {

        return null;
      }


      return cached.outfitIds;

    } catch {

      return null;
    }
  };


  const cacheSortedOutfits = (
    sortedOutfits
  ) => {

    try {

      const outfitIds =
        sortedOutfits
          .map(
            (outfit) =>
              outfit?.matchId?._id
          )
          .filter(Boolean);


      localStorage.setItem(
        OUTFIT_SORT_CACHE_KEY,
        JSON.stringify({
          date:
            new Date().toISOString(),

          outfitIds,
        })
      );


      console.log(
        "Cached today's outfit order:",
        outfitIds
      );

    } catch (err) {

      console.error(
        "Failed to cache today's outfit order:",
        err
      );
    }
  };


  /* ------------------------- GET TODAY'S OUTFITS ------------------------- */

  // silent: cached outfits are already showing, so refresh them without
  // the loading messages and without moving the user's place.
  const fetchTodayOutfits = async (
    todayTagName = null,
    silent = false,
    attempt = 0
  ) => {

    try {

      const token =
        getToken();


      const response =
        await axios.get(
          `${URL}/today/get`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      const data =
        response.data;


      // Today is still being created

      if (
        !Array.isArray(data) ||
        data.length === 0
      ) {

        if (attempt < 10) {

          if (!silent) {
            setCheckingToday(true);
          }

          setTimeout(() => {

            fetchTodayOutfits(
              todayTagName,
              silent,
              attempt + 1
            );

          }, 1000);

          return;
        }


        setCheckingToday(false);

        // Keep the empty outfit boxes visible.
        // Do not set a message that replaces the component.

        setOutfits([]);
        setCurrentIndex(0);
        setLoading(false);

        return;
      }


      /* -------------------------
         GET CACHED DAILY ORDER
      ------------------------- */

      const cachedOutfitIds =
        getCachedSortedOutfitIds();


      let sortedOutfits;


      /* -------------------------
         USE CACHED ORDER
      ------------------------- */

      if (cachedOutfitIds) {

        console.log(
          "Using cached today's outfit order."
        );


        const outfitMap =
          new Map(
            data
              .filter(
                (outfit) =>
                  outfit?.matchId?._id
              )
              .map(
                (outfit) => [
                  outfit.matchId._id,
                  outfit,
                ]
              )
          );


        /*
         * Reconstruct the outfit list
         * using the cached order.
         */

        sortedOutfits =
          cachedOutfitIds
            .map(
              (id) =>
                outfitMap.get(id)
            )
            .filter(Boolean);


      } else {

        /* -------------------------
           CREATE TODAY'S ORDER
        ------------------------- */

        console.log(
          "Creating today's outfit order."
        );


        sortedOutfits =
          todayOutfitSort(
            data,
            todayTagName
          );


        /*
         * Save the sorted order.
         */

        cacheSortedOutfits(
          sortedOutfits
        );
      }


      /* -------------------------
         SET OUTFITS
      ------------------------- */

      // A silent refresh keeps the user's place unless the outfits
      // themselves changed since the cached copy.
      const outfitIdsChanged =
        outfits.length !== sortedOutfits.length ||
        outfits.some(
          (outfit, index) =>
            outfit?.matchId?._id !==
            sortedOutfits[index]?.matchId?._id
        );

      setOutfits(
        sortedOutfits
      );

      if (!silent || outfitIdsChanged) {
        setCurrentIndex(0);
      }

      setCheckingToday(false);
      setLoading(false);

    } catch (err) {

      console.error(
        "Failed to fetch today's outfits:",
        err
      );

      setCheckingToday(false);
      setLoading(false);

      // Keep showing the cached outfits rather than an error.
      if (silent) {
        return;
      }

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
        todayTag: todayPreferenceTag
      } = await fetchTodayInfo();


      console.log(
        "Today:",
        dayOfWeek
      );


      console.log(
        "Today's tag:",
        todayPreferenceTag
      );


      // Use the tagOptions spelling, which is what outfit tags use.
      const todayTagName =
        findTagOption(todayPreferenceTag)?.name ||
        todayPreferenceTag ||
        null;

      setTodayTag(todayTagName);

      // Start filtered to today's tag - unless cached outfits are already
      // showing, where the user may have picked a different tag.
      if (!cachedToday) {
        setSelectedTag(todayTagName);
      }


      await fetchTodayOutfits(
        todayTagName,
        Boolean(cachedToday)
      );
    };


    loadToday();

  }, [todayReady]);


  /* ------------------------- CACHE TODAY ------------------------- */

  // Keep the cached copy in step with every change (rejections, worn,
  // deletes) so a refresh shows exactly what was on screen.
  useEffect(() => {

    if (loading) {
      return;
    }

    cacheToday({
      todayTag,
      outfits,
    });

  }, [outfits, todayTag, loading]);


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

    setSelectedTag(
      selectedTag === tagName
        ? null
        : tagName
    );

    setCurrentIndex(0);
  };


  /* ------------------------- UPDATE ONE MATCH ------------------------- */

  // Merge new values into one match in the outfit list, keeping the order.
  const updateMatchInOutfits = (
    matchId,
    fields
  ) => {

    setOutfits((prev) =>
      prev.map((outfit) =>
        outfit.matchId?._id === matchId
          ? {
              ...outfit,
              matchId: {
                ...outfit.matchId,
                ...fields,
              },
            }
          : outfit
      )
    );
  };


  /* ------------------------- REJECT OUTFIT ------------------------- */

  // Scrolling right past an outfit rejects it - at most once per outfit
  // per day, so no request is sent once it's been rejected today.
  const rejectCurrentOutfit = () => {

    const match =
      filteredOutfits[currentIndex]?.matchId;

    const matchId = match?._id;


    if (
      !matchId ||
      wasRejectedToday(match) ||
      pendingRejections.current.has(matchId)
    ) {

      return;
    }


    pendingRejections.current.add(matchId);


    rejectOutfit(matchId)
      .then(({ score, rejectedCount, lastRejectedDate }) =>
        updateMatchInOutfits(matchId, {
          score,
          rejectedCount,
          lastRejectedDate,
        })
      )
      .catch((err) =>
        console.error(
          "Failed to reject outfit:",
          err
        )
      )
      .finally(() =>
        pendingRejections.current.delete(matchId)
      );
  };


  /* ------------------------- NEXT / PREVIOUS ------------------------- */

  const goNext = () => {

    if (
      filteredOutfits.length <= 1
    ) {

      return;
    }


    rejectCurrentOutfit();


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
        (
          prev -
          1 +
          filteredOutfits.length
        ) %
        filteredOutfits.length
    );
  };


  /* ------------------------- MARK AS WORN ------------------------- */

  // Restore a previously-worn match (and its clothes) to the exact
  // values they held before they were marked worn today.
  const revertMatchToSnapshot = async (snapshot) => {

    if (!snapshot) {
      return;
    }


    try {

      const token =
        getToken();


      await fetch(
        `${URL}/match/${snapshot.matchId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            restoreSnapshot: true,
            ...snapshot.matchSnapshot,
            clothesSnapshots:
              snapshot.clothesSnapshots,
          }),
        }
      );


      // Reflect the reverted values back into local state so a later
      // re-selection of this outfit snapshots the correct baseline.

      setOutfits((prev) =>
        prev.map((outfit) => {

          if (
            outfit.matchId?._id !==
            snapshot.matchId
          ) {

            return outfit;
          }


          const revertedClothes =
            (
              outfit.matchId.clothes ||
              []
            ).map((item) => {

              const clothesSnapshot =
                snapshot.clothesSnapshots.find(
                  (entry) =>
                    entry.clothesId ===
                    item._id
                );


              return clothesSnapshot
                ? {
                    ...item,
                    ...clothesSnapshot,
                  }
                : item;
            });


          return {
            ...outfit,

            matchId: {
              ...outfit.matchId,
              ...snapshot.matchSnapshot,
              clothes: revertedClothes,
            },
          };
        })
      );

    } catch (err) {

      console.error(
        "Failed to revert previous worn outfit:",
        err
      );
    }
  };


  const markAsWornToday = async () => {

    const outfit =
      filteredOutfits[
        currentIndex
      ];


    const matchId =
      outfit?.matchId?._id;


    if (!matchId) {
      return;
    }


    // Already the active worn-today selection - just show its card.

    if (
      wornToday?.matchId ===
      matchId
    ) {

      setShowSelector(false);

      return;
    }


    try {

      // Undo the previous worn-today selection, if any,
      // before applying the new one.

      if (wornToday) {

        await revertMatchToSnapshot(
          wornToday
        );
      }


      const matchSnapshot = {
        lastWornDate:
          outfit.matchId.lastWornDate ??
          null,

        timesWorn:
          outfit.matchId.timesWorn ??
          0,

        timesWornThisYear:
          outfit.matchId
            .timesWornThisYear ?? 0,

        wornYear:
          outfit.matchId.wornYear ??
          null,
      };


      const clothesSnapshots = (
        outfit.matchId.clothes || []
      ).map((item) => ({
        clothesId: item._id,

        lastWornDate:
          item.lastWornDate ?? null,

        timesWorn:
          item.timesWorn ?? 0,

        timesWornThisYear:
          item.timesWornThisYear ??
          0,

        wornYear:
          item.wornYear ?? null,
      }));


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

              // Wearing an outfit rejected earlier today takes the
              // rejection back.
              undoRejection:
                wasRejectedToday(
                  outfit.matchId
                ),
            }),
          }
        );


      if (response.ok) {

        const updated =
          await response.json();


        /*
         * Update the live outfit data,
         * but DO NOT re-sort the outfits.
         *
         * Today's cached order remains
         * unchanged.
         */

        updateMatchInOutfits(matchId, {
          lastWornDate:
            updated.lastWornDate,
          timesWorn:
            updated.timesWorn,
          timesWornThisYear:
            updated.timesWornThisYear,
          wornYear:
            updated.wornYear,
          clothes:
            updated.clothes,
          score:
            updated.score,
          rejectedCount:
            updated.rejectedCount,
          lastRejectedDate:
            updated.lastRejectedDate,
        });


        setWornToday({
          matchId,
          outfit,
          matchSnapshot,
          clothesSnapshots,
        });

        setShowSelector(false);


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


  /* ------------------------- DELETE OUTFIT ------------------------- */

  const deleteOutfit = async () => {

    const outfit =
      filteredOutfits[
        currentIndex
      ];

    const matchId =
      outfit?.matchId?._id;

    if (!matchId) {
      setShowDeleteConfirm(false);
      return;
    }

    // Close the modal straight away - the delete carries on in the background.
    setShowDeleteConfirm(false);
    setDeletingOutfit(true);

    try {

      const token =
        getToken();

      await axios.delete(
        `${URL}/match/${matchId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      // If this outfit was the active worn-today selection, there is
      // nothing left to revert to - drop the snapshot.
      if (
        wornToday?.matchId ===
        matchId
      ) {
        setWornToday(null);
      }

      setOutfits((prev) =>
        prev.filter(
          (o) =>
            o.matchId?._id !==
            matchId
        )
      );

      setCurrentIndex(0);

      setPopup({
        open: true,
        title: "Success",
        message:
          "Outfit deleted.",
      });

    } catch (err) {

      setPopup({
        open: true,
        title: "Error",
        message:
          "Error deleting outfit: " +
          err.message,
      });

    } finally {

      setDeletingOutfit(false);
    }
  };


  /* ------------------------- IMAGE ------------------------- */

  const renderItemImage = (item) => {

    if (!item?.imageUrl) {
      return null;
    }


    return (
      <img
        key={item._id}
        src={getImageUrl(item.imageUrl, 800)}
        alt={item.name}
        className="today-image"
      />
    );
  };


  /* ------------------------- RENDER OUTFIT IMAGES ------------------------- */

  const renderOutfitImages = (outfit) => {

    return (
      <div className="today-image-group">

        {(outfit?.matchId?.clothes || [])
          .map(renderItemImage)
          .filter(Boolean)}

      </div>
    );
  };


  /* ------------------------- RENDER STATES ------------------------- */

  if (!todayReady && loading) {

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


  /* ------------------------- SELECTED OUTFIT ------------------------- */

  const selectedOutfit =
    filteredOutfits.length > 0
      ? filteredOutfits[
          currentIndex
        ]
      : null;


  /* ------------------------- WORN OUTFIT ------------------------- */

  const wornOutfit =
    wornToday
      ? outfits.find(
          (outfit) =>
            outfit.matchId?._id ===
            wornToday.matchId
        ) || wornToday.outfit
      : null;


  /* ------------------------- TAGS POPUP ------------------------- */

  const renderMainOutfitTags = (
    outfit
  ) => {

    const tags =
      outfit?.matchId?.tags;


    if (!tags?.length) {
      return null;
    }


    return (
      <div className="today-hover-tags-row">

        {tags.map((tagName) => {

          const tag =
            tagOptions.find(
              (option) =>
                option.name ===
                tagName
            );


          return (
            tag && (
              <img
                key={tagName}
                src={tag.image}
                alt={tagName}
                title={tagName}
                className="today-hover-tag-image"
              />
            )
          );

        })}

      </div>
    );
  };


  /* ------------------------- MAIN RENDER ------------------------- */

  return (
    <div className="view-today-container">

      {wornToday && !showSelector ? (

        /* ------------------------- WORN CARD VIEW ------------------------- */

        <div className="today-worn-section">

          <div className="featured-outfit">

            <div className="featured-outfit-content">

              <MatchScoreBadge
                match={wornOutfit?.matchId}
                overlay
              />

              {renderOutfitImages(
                wornOutfit
              )}

              {renderMainOutfitTags(
                wornOutfit
              )}

            </div>


            <div className="today-buttons">

              <button
                className="regular-button"
                onClick={() =>
                  setShowSelector(true)
                }
              >
                Select a different outfit
              </button>

            </div>

          </div>

        </div>

      ) : (

      <>

      {/* TOP SECTION */}

      <div className="today-top-section">

        {/* FEATURED / MAIN OUTFIT */}

        <div className="featured-outfit">

          <div className="featured-outfit-content">

            {filteredOutfits.length > 0 ? (
              <>
                <MatchScoreBadge
                  match={selectedOutfit?.matchId}
                  overlay
                />

                {renderOutfitImages(
                  selectedOutfit
                )}

                {renderMainOutfitTags(
                  selectedOutfit
                )}

                {/* PREVIOUS / NEXT - next rejects the outfit being left */}

                {filteredOutfits.length > 1 && (
                  <>
                    <button
                      className="today-arrow-button today-arrow-prev"
                      onClick={goPrev}
                      aria-label="Previous outfit"
                    >
                      ‹
                    </button>

                    <button
                      className="today-arrow-button today-arrow-next"
                      onClick={goNext}
                      aria-label="Next outfit"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            ) : (

              <p className="today-message">
                {outfits.length === 0
                  ? "No outfits saved for today."
                  : "No outfits saved for this tag."}
              </p>

            )}

          </div>


          {/* ONLY SHOW BUTTON WHEN AN OUTFIT EXISTS */}

          {filteredOutfits.length > 0 && (

            <div className="today-buttons">

              <button
                className="regular-button"
                onClick={
                  markAsWornToday
                }
              >
                Mark as Worn Today
              </button>

              <button
                className="regular-button delete-outfit-button"
                onClick={() =>
                  setShowDeleteConfirm(true)
                }
              >
                Delete Outfit
              </button>

            </div>

          )}

        </div>


        {/* TAG SELECTOR */}

        <div className="today-tags-section">

          <div className="today-tags-title">
            Filter by Tag
          </div>

          {todayTag && (

            <p className="today-tag-note">
              Today's {todayTag} outfit
            </p>

          )}


          <div className="today-tag-selector">

            {tagOptions.map((tag) => {

              const isSelected =
                selectedTag ===
                tag.name;


              return (

                <button
                  key={tag.name}
                  className={`today-tag-option ${
                    isSelected
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    selectTag(
                      tag.name
                    )
                  }
                  aria-label={`Filter by ${tag.name}`}
                  aria-pressed={
                    isSelected
                  }
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

      </div>

      </>

      )}


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


      {/* DELETE CONFIRMATION */}

      <DeletePopup
        isOpen={showDeleteConfirm}
        title="Delete Outfit"
        message="Are you sure you want to delete this outfit permanently? This cannot be undone."
        loading={deletingOutfit}
        onConfirm={deleteOutfit}
        onClose={() => {
          if (!deletingOutfit) {
            setShowDeleteConfirm(false);
          }
        }}
      />

    </div>
  );
};


export default ViewToday;

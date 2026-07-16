import React, { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../config";
import { Link } from 'react-router-dom';

import UpdateMatches from "./updateMatches";
import ViewMatchesCard from "./viewMatchesCard.jsx"; 
import ViewMatchesTop from "./viewMatchesTop";
import Filter from "../general/filter.jsx";

import "./viewMatchesCard.css"; /*.match-image for renderItemImage */
import '../../styles/pagesBottom.css'

const ViewMatches = ({ mode = "active" }) => {

  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState({

    seasons: [],
    colors: [],
    styles: [],
    tags: [],
    minTemp: null,
    maxTemp: null

  });

  const getToken = () =>
    localStorage.getItem("token");

  useEffect(() => {

  const fetchMatches = async () => {

      try {
        setError(null);
        const token = getToken();

        if (!token) {
          setError("No user logged in");
          return;
        }

        const response = await axios.get(
          `${URL}/match/`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setMatches(response.data);

      } catch (err) {
        setError(
          "Failed to fetch matches"
        );
      }
    };

    fetchMatches();

  }, []);

  const handleDeleteSuccess = (id) => {

    setMatches(prev =>
      prev.filter(
        match => match._id !== id
      )
    );

  };

  const handleUpdateSuccess = (updatedMatch) => {

    setMatches(prev =>
      prev.map(match =>
        match._id === updatedMatch._id
          ? updatedMatch
          : match
      )
    );
  };

  const handleError = (msg) => {
    setError(msg);
  };

  const handleReinstate = async (id) => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${URL}/match/${id}`,
        {
          rejected: false
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const updated = response.data;
      setMatches(prev =>
        prev.map(match =>
          match._id === id
            ? updated
            : match
        )
      );

    } catch (err) {

      setError(
        "Failed to reinstate match"
      );

    }

  };

  const renderItemImage = (item) => {

    if (!item?.imageUrl)
      return null;

    return (
      <div >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="match-image"
        />
      </div>
    );

  };

  const filteredMatches = matches.filter(match => {

    const isRejected =
      !!match.rejected;

    if (
      mode === "active" &&
      isRejected
    )
      return false;

    if (
      mode === "rejected" &&
      !isRejected
    )
      return false;

    if (
      selectedSeason &&
      !match[selectedSeason]
    )
      return false;

    if (searchTerm.trim()) {

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =
        match.name?.toLowerCase()
          .includes(search)

        ||

        match.colors?.some(color =>
          color.toLowerCase()
            .includes(search)
        )

        ||

        match.styles?.some(style =>
          style.toLowerCase()
            .includes(search)
        )

        ||

        match.tags?.some(tag =>
          tag.toLowerCase()
            .includes(search)
        );

      if (!matchesSearch)
        return false;

    }





    if (filters.seasons.length > 0) {

      if (
        !filters.seasons.some(
          season => match[season]
        )
      )
        return false;

    }





    if (filters.colors.length > 0) {

      if (
        !match.colors?.some(
          color =>
            filters.colors.includes(color)
        )
      )
        return false;

    }





    if (filters.styles.length > 0) {

      if (
        !match.styles?.some(
          style =>
            filters.styles.includes(style)
        )
      )
        return false;

    }





    if (filters.tags.length > 0) {

      if (
        !(match.tags || []).some(
          tag =>
            filters.tags.includes(tag)
        )
      )
        return false;

    }





    if (
      filters.minTemp !== null &&
      match.max_temp < filters.minTemp
    )
      return false;




    if (
      filters.maxTemp !== null &&
      match.min_temp > filters.maxTemp
    )
      return false;




    return true;


  });

  const toggleSeasonFilter = (season) => {
    setSelectedSeason(prev =>
      prev === season
        ? null
        : season
    );
  };

  const capitalize = (word) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  return (

    <div className="main-container">

      <ViewMatchesTop
        mode={mode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSeason={selectedSeason}
        toggleSeasonFilter={toggleSeasonFilter}
        setShowFilters={setShowFilters}
        capitalize={capitalize}
      />


      {error && (
        <p className="error-text">
          {error}
        </p>
      )}


      {filteredMatches.length === 0 && !error && (
        <p className="no-matches-text">
          {
            mode === "rejected"
              ? "No rejected outfits found."
              : "No outfits found."
          }
        </p>
      )}

      <div className="bottom-area-wrapper">
        <div className="items-grid">
          {filteredMatches.map(match => (

            <ViewMatchesCard
              key={match._id}
              match={match}
              mode={mode}
              renderItemImage={renderItemImage}
              capitalize={capitalize}
              handleReinstate={handleReinstate}
              handleDeleteSuccess={handleDeleteSuccess}
              setEditingMatch={setEditingMatch}
              onDeleteError={handleError}
            />
          ))}
        </div>
      </div>

      <Filter
        isOpen={showFilters}
        onClose={() =>
          setShowFilters(false)
        }
        filters={filters}
        setFilters={setFilters}
        availableColors={[
          ...new Set(
            matches.flatMap(
              match =>
                match.colors || []
            )
          )
        ]}

        availableStyles={[
          ...new Set(
            matches.flatMap(
              match =>
                match.styles || []
            )
          )
        ]}

        availableTags={[
          ...new Set(
            matches.flatMap(
              match =>
                match.tags || []
            )
          )
        ]}
      />

      {editingMatch && mode === "active" && (

        <UpdateMatches
          match={editingMatch}
          onClose={() =>
            setEditingMatch(null)
          }
          onUpdateSuccess={handleUpdateSuccess}
          onError={handleError}
        />
      )}

    </div>

  );

};


export default ViewMatches;
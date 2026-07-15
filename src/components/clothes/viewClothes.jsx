import React, { useEffect, useState } from "react";
import axios from "axios";

import deleteClothes from "./deleteClothes.jsx";
import AddUpdateClothes from "./addUpdateClothes.jsx";
import Filter from "../general/filter.jsx";

import ViewClothesTop from "./viewClothesTop.jsx";
import ViewClothesCard from "./viewClothesCard.jsx";

import '../../pages/pagesBottom.css'

import { URL } from "../../config";


const ViewClothes = () => {

  const [allItems, setAllItems] = useState([]);
  const [error, setError] = useState(null);
  const [showClothingModal, setShowClothingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState(null);

  const [filters, setFilters] = useState({

    seasons: [],
    colors: [],
    styles: [],
    minTemp: null,
    maxTemp: null

  });

  const clothingTypes = [
    "top",
    "outer",
    "bottom",
    "onepiece"
  ];

  const typeTitles = {

    top: "Top Half",
    outer: "Outerwear",
    bottom: "Bottom Half",
    onepiece: "One-Pieces"

  };

  const getToken = () =>
    localStorage.getItem("token");

  const fetchAllItems = async () => {
    try {
      setError(null);
      const token = getToken();

      if (!token) {

        setError("No user logged in");
        return;

      }

      const res = await axios.get(
        `${URL}/clothing/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!Array.isArray(res.data)) {

        setError(
          res.data?.error ||
          "Invalid response from server"
        );

        return;

      }

      setAllItems(res.data);

    } catch (err) {

      console.error(err);

      setError(
        "Failed to fetch clothing items"
      );

    }

  };

  useEffect(() => {

    fetchAllItems();

  }, []);

  const filteredItems = allItems.filter(item => {

    if (
      selectedType &&
      item.type !== selectedType
    ) {
      return false;
    }

    if (searchTerm.trim()) {

      const search =
        searchTerm.toLowerCase();


      const matchesSearch =

        item.name
          ?.toLowerCase()
          .includes(search)

        ||

        item.colors?.some(color =>
          color.toLowerCase().includes(search)
        )

        ||

        item.styles?.some(style =>
          style.toLowerCase().includes(search)
        );

      if (!matchesSearch) {
        return false;
      }

    }

    if (filters.seasons.length > 0) {

      const seasonMatch =
        filters.seasons.some(season =>
          item[season]
        );

      if (!seasonMatch) {
        return false;
      }

    }

    if (filters.colors.length > 0) {

      const colorMatch =
        item.colors?.some(color =>
          filters.colors.includes(color)
        );


      if (!colorMatch) {
        return false;
      }

    }

    if (filters.styles.length > 0) {

      const styleMatch =
        item.styles?.some(style =>
          filters.styles.includes(style)
        );


      if (!styleMatch) {
        return false;
      }

    }

    if (filters.minTemp !== null) {

      if (item.max_temp < filters.minTemp) {
        return false;
      }

    }

    if (filters.maxTemp !== null) {

      if (item.min_temp > filters.maxTemp) {
        return false;
      }

    }

    return true;

  });

  const toggleTypeFilter = (type) => {

    setSelectedType(prev =>
      prev === type
        ? null
        : type
    );

  };

  const handleDelete = async (type, id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete)
      return;

    const result = await deleteClothes(
      type,
      id
    );

    if (result.error) {

      setError(result.error);

    } else {

      fetchAllItems();

    }

  };

  const handleAddItem = () => {

    setSelectedItem(null);
    setShowClothingModal(true);

  };

  const handleEdit = (item) => {

    setSelectedItem(item);
    setShowClothingModal(true);

  };

  const closeModal = () => {

    setShowClothingModal(false);
    setSelectedItem(null);

  };

  const getSeasons = (item) => {

    const seasons = [];

    if (item.spring)
      seasons.push("Spring");
    if (item.summer)
      seasons.push("Summer");
    if (item.autumn)
      seasons.push("Autumn");
    if (item.winter)
      seasons.push("Winter");

    return seasons.length
      ? seasons.join(", ")
      : "None";

  };

  return (


    <div className="main-container">

      {error && (

        <p className="error-text">
          Error: {error}
        </p>

      )}

      <ViewClothesTop
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleAddItem={handleAddItem}
        clothingTypes={clothingTypes}
        typeTitles={typeTitles}
        selectedType={selectedType}
        toggleTypeFilter={toggleTypeFilter}
        setShowFilters={setShowFilters}
      />

      {filteredItems.length === 0 && !error && (

        <p className="no-clothing-items">
          No clothes found.
        </p>

      )}

      <div className="bottom-area-wrapper">
          <div className="items-grid">

            {filteredItems.map(item => (

              <ViewClothesCard
                key={item._id}
                item={item}
                type={item.type}
                getSeasons={getSeasons}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

            ))}

          </div>
      </div>

      {showClothingModal && (

        <AddUpdateClothes
          item={selectedItem}
          onClose={closeModal}
          refresh={fetchAllItems}
        />

      )}

      <Filter
        isOpen={showFilters}
        onClose={() =>
          setShowFilters(false)
        }
        filters={filters}
        setFilters={setFilters}
        availableColors={[
          ...new Set(
            allItems.flatMap(item =>
              item.colors || []
            )
          )
        ]}
        availableStyles={[
          ...new Set(
            allItems.flatMap(item =>
              item.styles || []
            )
          )
        ]}
      />
    </div>


  );

};

export default ViewClothes;
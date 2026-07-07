import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import deleteClothes from './deleteClothes';
import AddUpdateClothes from './addUpdateClothes';
import './viewClothes.css';
import { URL } from "../../config";

const ViewClothes = () => {

  const [itemsByType, setItemsByType] = useState({});
  const [error, setError] = useState(null);

  const [showClothingModal, setShowClothingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const clothingTypes = [
    'top',
    'bottom',
    'outer',
    'onepiece'
  ];

  const scrollRefs = useRef({});


  const getToken = () => localStorage.getItem("token");


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


      const allItems = res.data;


      if (!Array.isArray(allItems)) {

        setError(
          allItems?.error ||
          "Invalid response from server"
        );

        return;
      }


      const grouped = {};

      clothingTypes.forEach(type => {
        grouped[type] = [];
      });


      allItems.forEach(item => {

        if (grouped[item.type]) {
          grouped[item.type].push(item);
        }

      });


      setItemsByType(grouped);


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



  const handleDelete = async (type, id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );


    if (!confirmDelete) return;


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
      seasons.push('Spring');

    if (item.summer)
      seasons.push('Summer');

    if (item.autumn)
      seasons.push('Autumn');

    if (item.winter)
      seasons.push('Winter');


    return seasons.length
      ? seasons.join(', ')
      : 'None';

  };



  const scrollLeft = (type) => {

    if (scrollRefs.current[type]) {

      scrollRefs.current[type].scrollBy({
        left: -320,
        behavior: 'smooth'
      });

    }

  };



  const scrollRight = (type) => {

    if (scrollRefs.current[type]) {

      scrollRefs.current[type].scrollBy({
        left: 320,
        behavior: 'smooth'
      });

    }

  };



  const sectionTitles = {

    top: "Top Half",

    outer: "Outerwear",

    bottom: "Bottom Half",

    onepiece: "One-Pieces"

  };



  return (

    <div className="view-clothes-container">


      {error && (
        <p className="error-text">
          Error: {error}
        </p>
      )}



      <button
        className="add-item-button"
        onClick={handleAddItem}
      >
        Add Item
      </button>



      {clothingTypes.map(type => (

        <div
          key={type}
          className="clothing-section"
        >

          <div className="section-wrapper">


            <p className="section-title-viewclothes">
              {sectionTitles[type]}
            </p>



            <div className="horizontal-scroll-wrapper">


              <button
                className="scroll-arrow left-arrow"
                onClick={() => scrollLeft(type)}
              >
                ‹
              </button>



              <div
                className="scroll-container"
                ref={(el) =>
                  scrollRefs.current[type] = el
                }
              >


                {(!itemsByType[type] ||
                  itemsByType[type].length === 0) ? (

                  <p className="no-items">
                    No items found.
                  </p>

                ) : (


                  itemsByType[type].map(item => (


                    <div
                      key={item._id}
                      className="clothing-card-viewclothes"
                    >


                      {item.imageUrl && (

                        <img
                          src={item.imageUrl}
                          alt={
                            item.name ||
                            "Clothing item"
                          }
                          className="clothing-image-viewclothes"
                        />

                      )}



                      <div className="clothing-details-viewclothes">


                        <div className="item-name">
                          {item.name}
                        </div>



                        <div className="item-info">

                          <div>
                            {getSeasons(item)}
                          </div>

                          <div>
                            {item.min_temp}° - {item.max_temp}°
                          </div>

                        </div>



                        <div className="button-row">


                          <button
                            onClick={() =>
                              handleEdit(item)
                            }
                            className="text-button"
                          >
                            Edit
                          </button>



                          <button
                            onClick={() =>
                              handleDelete(
                                type,
                                item._id
                              )
                            }
                            className="text-button"
                          >
                            Delete
                          </button>


                        </div>


                      </div>


                    </div>


                  ))

                )}


              </div>



              <button
                className="scroll-arrow right-arrow"
                onClick={() => scrollRight(type)}
              >
                ›
              </button>


            </div>


          </div>


        </div>


      ))}




      {showClothingModal && (

        <AddUpdateClothes

          item={selectedItem}

          onClose={closeModal}

          refresh={fetchAllItems}

        />

      )}


    </div>

  );

};


export default ViewClothes;
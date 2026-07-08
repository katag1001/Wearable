import React, { useState } from "react";
import axios from "axios";

import ViewNewMatches from "./viewNewMatches";
import { URL } from "../../config";

import ModalOne from "./uploadComponents/modalOne";
import ModalTwo from "./uploadComponents/modalTwo";
import ModalThree from "./uploadComponents/modalThree";

import { useClothingForm } from "./uploadComponents/useClothingForm";
import { useClothingDetection } from "./uploadComponents/useClothingDetection";

import "./AddUpdateClothes.css";

const AddUpdateClothes = ({ item, onClose, refresh }) => {
  const isUpdate = !!item;

  const {
    formData,
    setFormData,
    updateField,
    toggleColor,
    toggleTag,
    toggleSeason,
    handleTempChange,
    handleSubtypeChange,
    manualTempOverride
  } = useClothingForm(item);

  const [currentPage, setCurrentPage] = useState(1);
  const [justSavedItem, setJustSavedItem] = useState(null);
  const [message, setMessage] = useState("");

  useClothingDetection(
    formData.name,
    setFormData,
    manualTempOverride
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        min_temp: Number(formData.min_temp),
        max_temp: Number(formData.max_temp),
      };

      let response;

      if (isUpdate) {
        response = await axios.put(
          `${URL}/clothing/${item._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
      } else {
        response = await axios.post(
          `${URL}/clothing`,
          {
            ...payload,
            username: localStorage.getItem("user")
          }
        );
      }

      const saved = response.data;

      setJustSavedItem({
        name: saved.name,
        type: saved.type
      });

      if (refresh) {
        refresh();
      }

      setMessage(
        isUpdate
          ? "Item updated"
          : "Item created"
      );

    } catch (err) {
      console.error("Save clothing error:", err);
      console.error(
        "Response:",
        err.response?.data
      );

      setMessage(
        err.response?.data?.error ||
        "Error saving clothing item"
      );
    }
  };


  return (
    <div className="modal-backdrop">
      <div className="add-update-modal">

        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>


        {!justSavedItem ? (

          <>
            <h2 className="modal-title">
              {isUpdate
                ? "Update Clothing Item"
                : "Add Clothing Item"}
            </h2>


            <form
              className="update-form"
              onSubmit={handleSubmit}
            >

              {currentPage === 1 && (
                <ModalOne
                  formData={formData}
                  setFormData={setFormData}
                  updateField={updateField}
                  handleSubtypeChange={handleSubtypeChange}
                />
              )}


              {currentPage === 2 && (
                <ModalTwo
                  formData={formData}
                  toggleSeason={toggleSeason}
                  handleTempChange={handleTempChange}
                />
              )}


              {currentPage === 3 && (
                <ModalThree
                  formData={formData}
                  toggleColor={toggleColor}
                  toggleTag={toggleTag}
                  updateField={updateField}
                />
              )}


              <div className="modal-navigation">

                {currentPage > 1 && (
                  <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                      setCurrentPage(prev => prev - 1)
                    }
                  >
                    Back
                  </button>
                )}


                {currentPage < 3 && (
                  <button
                    type="button"
                    className="next-button"
                    onClick={() =>
                      setCurrentPage(prev => prev + 1)
                    }
                  >
                    Next
                  </button>
                )}


                {currentPage === 3 && (
                  <button
                    className="save-button"
                    type="submit"
                  >
                    Save
                  </button>
                )}

              </div>

            </form>
          </>

        ) : (

          <ViewNewMatches
            newItemName={justSavedItem.name}
            newItemType={justSavedItem.type}
          />

        )}


        {message && (
          <p>{message}</p>
        )}

      </div>
    </div>
  );
};

export default AddUpdateClothes;


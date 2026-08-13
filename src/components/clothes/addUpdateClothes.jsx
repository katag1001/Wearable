import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { URL } from "../../config";

import ModalOne from "./uploadComponents/modalOne";
import ModalTwo from "./uploadComponents/modalTwo";
import ModalThree from "./uploadComponents/modalThree";

import { useClothingForm } from "./uploadComponents/useClothingForm";
import { useClothingDetection } from "./uploadComponents/useClothingDetection";

import '../../styles/modal.css';


const AddUpdateClothes = ({ item, onClose, refresh }) => {

  const navigate = useNavigate();

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
  const [showValidation, setShowValidation] = useState(false);

  useClothingDetection(
    formData.name,
    formData.subtype,
    setFormData,
    manualTempOverride
  );

  useEffect(() => {
    const nextStyle =
      formData.colors.length > 1
        ? "Patterned"
        : "Plain";

    if (formData.styles !== nextStyle) {
      updateField("styles", nextStyle);
    }

  }, [
    formData.colors,
    formData.styles,
    updateField
  ]);


  const pageValidation = {

    1: {
      valid:
        formData.name.trim() !== "" &&
        formData.subtype.trim() !== "" &&
        !!formData.imageUrl,

      missing: [
        !formData.name.trim() && "a name",
        !formData.subtype.trim() && "a type",
        !formData.imageUrl && "an image",
      ].filter(Boolean),
    },


    2: {
      valid:
        (
          formData.spring ||
          formData.summer ||
          formData.autumn ||
          formData.winter
        ) &&
        formData.min_temp !== "" &&
        formData.max_temp !== "",

      missing: [
        !(
          formData.spring ||
          formData.summer ||
          formData.autumn ||
          formData.winter
        ) && "at least one season",

        (
          formData.min_temp === "" ||
          formData.max_temp === ""
        ) && "a temperature range",

      ].filter(Boolean),
    },

    3: {
      valid:
        formData.colors.length > 0,

      missing: [
        formData.colors.length === 0 && "at least one colour",
      ].filter(Boolean),
    }

  };

  const currentValidation =
    pageValidation[currentPage];

  const formatMissingFields = (fields) => {

    if (fields.length === 1) {
      return `${fields[0]}`;
    }

    if (fields.length === 2) {
      return `${fields[0]} and ${fields[1]}`;
    }

    return (
      fields
        .slice(0, -1)
        .map(field => `${field}`)
        .join(", ")
      +
      ` and ${fields[fields.length - 1]}`
    );

  };

  const handleNext = () => {

    if (!currentValidation.valid) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    setCurrentPage(prev => prev + 1);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentValidation.valid) {

      setShowValidation(true);
      return;

    }

    setShowValidation(false);

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
              Authorization:
                `Bearer ${localStorage.getItem("token")}`
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
        id: saved._id,
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

      console.error(
        "Save clothing error:",
        err
      );

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

      <div className="modal-wrapper open">

        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>

        {!justSavedItem ? (

          <>
            <div className="modal-title">
              {
                isUpdate
                  ? "Update Clothing Item"
                  : "Add Clothing Item"
              }
            </div>

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

              {showValidation &&
                !currentValidation.valid && (

                <p className="validation-message">

                  Please enter{" "}
                  {formatMissingFields(
                    currentValidation.missing
                  )}
                  .
                </p>

              )}

              <div className="modal-navigation">

                {currentPage > 1 && (

                  <button
                    type="button"
                    className="modal-button"
                    onClick={() => {

                      setShowValidation(false);

                      setCurrentPage(
                        prev => prev - 1
                      );

                    }}
                  >
                    Back
                  </button>

                )}

                {currentPage < 3 && (

                  <button
                    type="button"
                    className="modal-button"
                    onClick={handleNext}
                  >
                    Next
                  </button>

                )}

                {currentPage === 3 && (

                  <button
                    className="modal-button"
                    type="submit"
                  >
                    Save
                  </button>

                )}

              </div>

            </form>

          </>

        ) : (

          <>
          
          {message && (
            <div className="modal-title">
              {message}
            </div>
          )}

          <div className="view-new-matches-wrapper">
            <button
              className="modal-button"
              onClick={() =>
                navigate(
                  `/matches?item=${justSavedItem.id}`
                )
              }
            >
              View New Matches
            </button>
          </div>
          
        </>

          )}


        

      </div>
    </div>
  );

};


export default AddUpdateClothes;

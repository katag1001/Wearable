import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";

import { URL } from "../../config";

import FootwearModalOne from "./footwearModalOne";
import ModalTwo from "../clothes/uploadComponents/modalTwo";

import { useClothingForm } from "../clothes/uploadComponents/useClothingForm";
import { useClothingDetection } from "../clothes/uploadComponents/useClothingDetection";
import { formatMissingFields } from "../clothes/uploadComponents/uploadHelpers";
import { getFootwearOptions } from "../../constants/footwearOptions";
import { useUserGender } from "../../hooks/useUserGender";
import { uploadImageToCloudinary } from "../../utils/cloudinaryImage";

import "../../styles/modal.css";

/*
 * The two-page Add / Update Footwear modal. Page one is name, image and
 * type; page two (seasons, colours, tags) is the same as clothing's and is
 * pre-filled from the name and type in the same way.
 *
 * Footwear is saved to its own /footwear endpoints and is never matched
 * into outfits, so there is no "View New Matches" step after saving.
 */

// Fields from the shared clothing form state that footwear doesn't store.
const CLOTHING_ONLY_FIELDS = ["type", "min_temp", "max_temp"];

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});


const AddUpdateFootwear = ({ item, onClose, onBack, refresh }) => {

  const isUpdate = !!item;

  const gender = useUserGender();

  const footwearOptions = useMemo(
    () => getFootwearOptions(gender),
    [gender]
  );

  const {
    formData,
    setFormData,
    resetForm,
    updateField,
    toggleColor,
    toggleTag,
    toggleSeason
  } = useClothingForm(item, footwearOptions);

  const {
    applyDetection,
    resetDetection
  } = useClothingDetection(item, setFormData, footwearOptions);


  const [currentPage, setCurrentPage] = useState(1);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);

  // The File chosen by the user - only uploaded when Save is clicked.
  const [selectedImage, setSelectedImage] = useState(null);

  const modalRef = useRef(null);


  // Start each page at the top of the modal.
  useEffect(() => {

    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }

  }, [currentPage, saved]);


  // Style isn't shown - it's Patterned whenever there's more than one colour.
  useEffect(() => {

    const nextStyle =
      formData.colors.length > 1
        ? "Patterned"
        : "Plain";

    if (formData.styles !== nextStyle) {
      updateField("styles", nextStyle);
    }

  }, [formData.colors, formData.styles, updateField]);


  const hasSeason =
    formData.spring ||
    formData.summer ||
    formData.autumn ||
    formData.winter;

  const pageValidation = {

    1: {
      valid:
        formData.name.trim() !== "" &&
        formData.subtype.trim() !== "" &&
        (!!formData.imageUrl || !!selectedImage),

      missing: [
        !formData.name.trim() && "a name",
        !formData.subtype.trim() && "a type",
        !formData.imageUrl && !selectedImage && "an image",
      ].filter(Boolean),
    },

    2: {
      valid: hasSeason && formData.colors.length > 0,

      missing: [
        !hasSeason && "at least one season",
        formData.colors.length === 0 && "at least one colour",
      ].filter(Boolean),
    }

  };

  const currentValidation = pageValidation[currentPage];


  const handleNext = () => {

    if (!currentValidation.valid) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    applyDetection(formData.name, formData.subtype);

    setCurrentPage(2);

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    // Ignore repeat submits (e.g. pressing Enter) while a save is running.
    if (saving) return;

    if (!currentValidation.valid) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    setSaving(true);

    try {

      const cloudinaryData = selectedImage
        ? await uploadImageToCloudinary(selectedImage)
        : null;

      const payload = { ...formData };

      CLOTHING_ONLY_FIELDS.forEach(field => delete payload[field]);

      if (cloudinaryData) {
        payload.imageUrl = cloudinaryData.secure_url;
        payload.cloudinaryId = cloudinaryData.public_id;
      }

      // On update the server deletes the old image if it was replaced.
      if (isUpdate) {
        await axios.put(`${URL}/footwear/${item._id}`, payload, {
          headers: authHeaders()
        });
      } else {
        await axios.post(`${URL}/footwear`, payload, {
          headers: authHeaders()
        });
      }

      setSaved(true);
      setSelectedImage(null);
      setMessage(isUpdate ? "Footwear updated" : "Footwear added");

      if (refresh) {
        refresh();
      }

    } catch (err) {

      console.error("Save footwear error:", err, err.response?.data);

      setMessage(
        err.response?.data?.error ||
        err.message ||
        "Error saving footwear"
      );

    } finally {

      setSaving(false);

    }

  };


  const handleAddAnotherItem = () => {

    resetForm();
    resetDetection();

    setSelectedImage(null);
    setSaved(false);
    setCurrentPage(1);
    setShowValidation(false);
    setMessage("");

  };


  return (

    <div className="modal-backdrop">

      <div className="modal-wrapper open" ref={modalRef}>

        <button className="close-modal" onClick={onClose}>
          ×
        </button>


        {!saved ? (

          <>

            <div className="modal-title">
              {isUpdate ? "Update Footwear" : "Add Footwear"}
            </div>


            <form className="update-form" onSubmit={handleSubmit}>

              {currentPage === 1 && (
                <FootwearModalOne
                  formData={formData}
                  updateField={updateField}
                  setSelectedImage={setSelectedImage}
                  footwearOptions={footwearOptions}
                />
              )}

              {currentPage === 2 && (
                <ModalTwo
                  formData={formData}
                  toggleSeason={toggleSeason}
                  toggleColor={toggleColor}
                  toggleTag={toggleTag}
                />
              )}


              {showValidation && !currentValidation.valid && (
                <p className="validation-message">
                  Please enter{" "}
                  {formatMissingFields(currentValidation.missing)}.
                </p>
              )}

              {/* A failed save keeps the form open with the error. */}
              {message && (
                <p className="validation-message">
                  {message}
                </p>
              )}


              <div className="modal-navigation">

                {/* Page one goes back to the Clothing / Footwear choice. */}
                {(currentPage === 2 || onBack) && (
                  <button
                    type="button"
                    className="modal-button"
                    disabled={saving}
                    onClick={() => {
                      setShowValidation(false);
                      setMessage("");

                      if (currentPage === 2) {
                        setCurrentPage(1);
                      } else {
                        onBack();
                      }
                    }}
                  >
                    Back
                  </button>
                )}

                {currentPage === 1 && (
                  <button
                    type="button"
                    className="modal-button"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                )}

                {currentPage === 2 && (
                  <button
                    className="modal-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}

              </div>

            </form>

          </>

        ) : (

          <>

            <div className="modal-title">
              {message}
            </div>

            <div className="view-new-matches-wrapper">

              <div className="modal-button-row">

                {!isUpdate && (
                  <button
                    className="modal-button"
                    onClick={handleAddAnotherItem}
                  >
                    Add Another Item
                  </button>
                )}

                <button
                  className="modal-button"
                  onClick={onClose}
                >
                  Done
                </button>

              </div>

            </div>

          </>

        )}

      </div>

    </div>

  );

};


export default AddUpdateFootwear;

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { URL } from "../../config";

import ModalOne from "./uploadComponents/modalOne";
import ModalTwo from "./uploadComponents/modalTwo";

import { useClothingForm } from "./uploadComponents/useClothingForm";
import { useClothingDetection } from "./uploadComponents/useClothingDetection";
import { formatMissingFields } from "./uploadComponents/uploadHelpers";
import { getTypeOptions } from "../../constants/typeOptions";
import { useUserGender } from "../../hooks/useUserGender";
import { deleteUnusedImage } from "../../utils/cloudinaryImage";

import "../../styles/modal.css";


// onBack (new items only) returns to the Clothing / Footwear choice.
const AddUpdateClothes = ({ item, onClose, onBack, refresh }) => {

  const navigate = useNavigate();

  const isUpdate = !!item;

  // Defaults to "unisex" until the user's gender preference loads.
  const gender = useUserGender();

  const typeOptions = useMemo(
    () => getTypeOptions(gender),
    [gender]
  );


  const {
    formData,
    setFormData,
    resetForm,
    updateField,
    toggleColor,
    toggleTag,
    toggleSeason,
    handleSubtypeChange
  } = useClothingForm(item, typeOptions);


  const [currentPage, setCurrentPage] = useState(1);
  const [justSavedItem, setJustSavedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);

  // This stores the actual File selected by the user.
  // It is NOT uploaded to Cloudinary yet.
  const [selectedImage, setSelectedImage] = useState(null);

  const modalRef = useRef(null);


  // Start each page at the top of the modal rather than
  // keeping the scroll position from the previous page.
  useEffect(() => {

    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }

  }, [currentPage, justSavedItem]);


  const {
    applyDetection,
    resetDetection
  } = useClothingDetection(
    item,
    setFormData,
    typeOptions
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
        (!!formData.imageUrl || !!selectedImage),

      missing: [
        !formData.name.trim() && "a name",
        !formData.subtype.trim() && "a type",
        !formData.imageUrl &&
          !selectedImage &&
          "an image",
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
        formData.colors.length > 0,

      missing: [
        !(
          formData.spring ||
          formData.summer ||
          formData.autumn ||
          formData.winter
        ) && "at least one season",

        formData.colors.length === 0 &&
          "at least one colour",

      ].filter(Boolean),
    }

  };


  const currentValidation =
    pageValidation[currentPage];


  const handleNext = () => {

    if (!currentValidation.valid) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);

    if (currentPage === 1) {
      applyDetection(formData.name, formData.subtype);
    }

    setCurrentPage(prev => prev + 1);

  };


 const handleSubmit = async (e) => {

  e.preventDefault();

  console.log("[add clothing] 1. submit clicked", {
    isUpdate,
    saving,
    validation: currentValidation,
    formData,
    hasImage: Boolean(selectedImage),
    imageSizeKB: selectedImage ? Math.round(selectedImage.size / 1024) : null,
  });

  // Ignore repeat submits (e.g. pressing Enter) while a save is running.
  if (saving) {
    console.log("[add clothing] stopped: a save is already running");
    return;
  }

  if (!currentValidation.valid) {

    console.log("[add clothing] stopped: form invalid, missing:", currentValidation.missing);
    setShowValidation(true);
    return;

  }

  setShowValidation(false);


  // Keep this outside the try block so the catch
  // can clean up a Cloudinary upload if needed.
  let cloudinaryData = null;

  setSaving(true);


  try {

    // ------------------------------------------
    // 1. Upload selected image to Cloudinary
    // ------------------------------------------

    if (selectedImage) {

      console.log("[add clothing] 2. uploading image to Cloudinary", {
        cloudName: import.meta.env.VITE_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_UPLOAD_PRESET,
      });

      const cloudinaryFormData = new FormData();

      cloudinaryFormData.append(
        "file",
        selectedImage
      );

      cloudinaryFormData.append(
        "upload_preset",
        import.meta.env.VITE_UPLOAD_PRESET
      );


      // Use fetch here so Axios interceptors/default
      // Authorization headers are NOT sent to Cloudinary.
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData
        }
      );


      if (!cloudinaryResponse.ok) {

        const errorText =
          await cloudinaryResponse.text();

        throw new Error(
          `Cloudinary upload failed: ${errorText}`
        );

      }


      cloudinaryData =
        await cloudinaryResponse.json();

      console.log("[add clothing] 2. Cloudinary upload OK", cloudinaryData.public_id);

    } else {

      console.log("[add clothing] 2. no image selected, skipping Cloudinary");

    }


    // ------------------------------------------
    // 2. Build clothing payload
    // ------------------------------------------

    // Items saved before temperature moved to matches may still carry
    // min_temp/max_temp - never send them back.
    const {
      min_temp: _oldMinTemp,
      max_temp: _oldMaxTemp,
      ...itemFields
    } = formData;

    const payload = {

      ...itemFields,


      // Only replace image data if a new image
      // was selected and successfully uploaded.
      ...(cloudinaryData && {

        imageUrl:
          cloudinaryData.secure_url,

        cloudinaryId:
          cloudinaryData.public_id

      })

    };


    // ------------------------------------------
    // 3. Save clothing item
    // ------------------------------------------

    let response;

    console.log(
      `[add clothing] 3. sending ${isUpdate ? "PUT" : "POST"} to ${URL}/clothing`,
      { payload, hasAuthHeader: Boolean(axios.defaults.headers.common["Authorization"]) }
    );


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
          username:
            localStorage.getItem("user")
        }
      );

    }


    const saved = response.data;

    console.log("[add clothing] 4. server responded", response.status, saved);


    // ------------------------------------------
    // 4. Successful save
    //    (if the image was replaced, the server
    //    has already deleted the old one)
    // ------------------------------------------

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


    setSelectedImage(null);


  } catch (err) {

    console.error(
      "[add clothing] FAILED - status:",
      err.response?.status,
      "message:",
      err.message
    );

    console.error(
      "Save clothing error:",
      err
    );

    console.error(
      "Response:",
      err.response?.data
    );


    // ------------------------------------------
    // 5. IMPORTANT:
    //    If Cloudinary uploaded successfully
    //    but the clothing save failed, delete
    //    the newly uploaded image.
    // ------------------------------------------

    if (cloudinaryData?.public_id) {
      await deleteUnusedImage(cloudinaryData.public_id);
    }


    setMessage(
      err.response?.data?.error ||
      err.message ||
      "Error saving clothing item"
    );

  } finally {

    setSaving(false);

  }

};



  const handleAddAnotherItem = () => {

    resetForm();
    resetDetection();

    setSelectedImage(null);

    setJustSavedItem(null);
    setCurrentPage(1);
    setShowValidation(false);
    setMessage("");

  };


  return (

    <div className="modal-backdrop">

      <div className="modal-wrapper open" ref={modalRef}>


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
                  handleSubtypeChange={
                    handleSubtypeChange
                  }
                  setSelectedImage={
                    setSelectedImage
                  }
                  typeOptions={typeOptions}
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


                {(currentPage > 1 || onBack) && (

                  <button
                    type="button"
                    className="modal-button"
                    disabled={saving}
                    onClick={() => {

                      setShowValidation(false);

                      if (currentPage === 1) {
                        onBack();
                        return;
                      }

                      setCurrentPage(
                        prev => prev - 1
                      );

                    }}
                  >
                    Back
                  </button>

                )}


                {currentPage < 2 && (

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

            {message && (

              <div className="modal-title">
                {message}
              </div>

            )}


            <div className="view-new-matches-wrapper">

              <div className="modal-button-row">


                <button
                  className="modal-button"
                  onClick={() =>
                    navigate(
                      `/matches?item=${justSavedItem.id}`,
                      { state: { processing: true } }
                    )
                  }
                >
                  View New Matches
                </button>


                {!isUpdate && (

                  <button
                    className="modal-button"
                    onClick={
                      handleAddAnotherItem
                    }
                  >
                    Add Another Item
                  </button>

                )}


              </div>

            </div>

          </>

        )}

      </div>

    </div>

  );

};


export default AddUpdateClothes;
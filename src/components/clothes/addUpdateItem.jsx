import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import ModalOne from "./uploadComponents/modalOne";
import ModalTwo from "./uploadComponents/modalTwo";
import FootwearModalOne from "../footwear/footwearModalOne";

import { useWardrobeItemForm } from "@core/hooks/useWardrobeItemForm.js";

import "../../styles/modal.css";

/*
 * The two-page Add / Update modal for a clothing item or footwear
 * (`kind`). The form logic is useWardrobeItemForm (shared with the mobile
 * app); this renders it.
 *
 * onBack (new items only) returns to the Clothing / Footwear choice.
 */
const AddUpdateItem = ({ kind, item, onClose, onBack, refresh }) => {

  const navigate = useNavigate();

  const form = useWardrobeItemForm({ kind, item, onSaved: refresh });

  const { formData, page, savedItem, saving, isUpdate } = form;

  const modalRef = useRef(null);

  // Start each page at the top of the modal rather than keeping the
  // scroll position from the previous page.
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [page, savedItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    form.save();
  };

  const handleBack = () => {
    if (!form.goBack()) {
      onBack();
    }
  };

  return (

    <div className="modal-backdrop">

      <div className="modal-wrapper open" ref={modalRef}>

        <button className="close-modal" onClick={onClose}>
          ×
        </button>


        {!savedItem ? (

          <>

            <div className="modal-title">
              {form.title}
            </div>


            <form className="update-form" onSubmit={handleSubmit}>

              {page === 1 && (
                form.hasCategories ? (
                  <ModalOne
                    formData={formData}
                    updateField={form.updateField}
                    chooseSubtype={form.chooseSubtype}
                    setSelectedImage={form.setSelectedImage}
                    typeOptions={form.typeOptions}
                    subtypeSuggestions={form.subtypeSuggestions}
                  />
                ) : (
                  <FootwearModalOne
                    formData={formData}
                    updateField={form.updateField}
                    chooseSubtype={form.chooseSubtype}
                    setSelectedImage={form.setSelectedImage}
                    footwearOptions={form.typeOptions}
                    subtypeSuggestions={form.subtypeSuggestions}
                  />
                )
              )}

              {page === 2 && (
                <ModalTwo
                  formData={formData}
                  toggleSeason={form.toggleSeason}
                  toggleColor={form.toggleColor}
                  toggleTag={form.toggleTag}
                  tights={form}
                />
              )}


              {form.validationMessage && (
                <p className="validation-message">
                  {form.validationMessage}
                </p>
              )}

              {/* A failed save keeps the form open with the error. */}
              {form.error && (
                <p className="validation-message">
                  {form.error}
                </p>
              )}


              <div className="modal-navigation">

                {(page > 1 || onBack) && (
                  <button
                    type="button"
                    className="modal-button"
                    disabled={saving}
                    onClick={handleBack}
                  >
                    Back
                  </button>
                )}

                {!form.isLastPage && (
                  <button
                    type="button"
                    className="modal-button"
                    onClick={form.goNext}
                  >
                    Next
                  </button>
                )}

                {form.isLastPage && (
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
              {savedItem.message}
            </div>

            <div className="view-new-matches-wrapper">

              <div className="modal-button-row">

                {form.hasMatches && (
                  <button
                    className="modal-button"
                    onClick={() =>
                      navigate(
                        `/matches?item=${savedItem.id}`,
                        { state: { processing: true } }
                      )
                    }
                  >
                    View New Matches
                  </button>
                )}

                {!isUpdate && (
                  <button
                    className="modal-button"
                    onClick={form.addAnother}
                  >
                    Add Another Item
                  </button>
                )}

                {!form.hasMatches && (
                  <button
                    className="modal-button"
                    onClick={onClose}
                  >
                    Done
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


export default AddUpdateItem;

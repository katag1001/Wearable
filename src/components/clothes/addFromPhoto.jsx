import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeLoader from "react-spinners/FadeLoader";

import AddUpdateItem from "./addUpdateItem";
import AnalysedItemReview from "./analysedItemReview";
import { usePhotoAnalysis } from "@core/hooks/usePhotoAnalysis.js";
import { WARDROBE_KIND_LIST as KINDS } from "@core/wardrobe/itemKinds.js";

import "../../styles/modal.css";

/*
 * Adding an item from its photo: choose a photo, a loading screen while
 * it's analysed (the logic is usePhotoAnalysis, shared with the mobile
 * app), then the photo with what was found - each field with a "Change" -
 * and Save (AnalysedItemReview), then "View new matches" / "Add another
 * item". If the analysis fails, the item form opens with the photo
 * attached. `onManual` goes to adding an item by hand instead.
 */

// The chosen File as a URL an <img> can show.
const usePreviewUrl = (file) => {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
};

const AddFromPhoto = ({ onClose, onManual, refresh }) => {

  const navigate = useNavigate();

  const flow = usePhotoAnalysis();

  const previewUrl = usePreviewUrl(flow.photo);

  // The full item form over the flow (failed analysis): { kind, prefill } or null.
  const [form, setForm] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    // Choosing the same file again should still fire.
    e.target.value = "";

    if (file) {
      flow.analysePhoto(file);
    }
  };

  const addAnother = () => {
    setForm(null);
    flow.restart();
  };

  if (form && flow.step !== "saved") {
    return (
      <AddUpdateItem
        kind={form.kind}
        prefill={form.prefill}
        onClose={onClose}
        onBack={() => setForm(null)}
        refresh={(saved) => {
          flow.markSaved(saved, form.kind);
          refresh?.();
        }}
      />
    );
  }

  const photo = previewUrl && (
    <img src={previewUrl} alt="Your item" className="photo-analysis-image" />
  );

  return (

    <div className="modal-backdrop">

      <div className="modal-wrapper open">

        <button className="close-modal" onClick={onClose}>
          ×
        </button>


        {flow.step === "pick" && (
          <>
            <div className="modal-title">
              Add Item
            </div>

            <div className="photo-analysis">

              <p className="photo-analysis-text">
                Choose a photo of one item - we'll fill in the rest.
              </p>

              <p className="photo-analysis-text">
                Best results: daylight and a plain background.
              </p>

              <input
                id="photo-analysis-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <label htmlFor="photo-analysis-upload" className="upload-button">
                Choose Photo
              </label>

              {flow.error && (
                <p className="validation-message">{flow.error}</p>
              )}

              <button type="button" className="text-button" onClick={onManual}>
                Add details by hand instead
              </button>

            </div>
          </>
        )}


        {flow.step === "analysing" && (
          <div className="photo-analysis-loading">
            <FadeLoader color="black" loading={true} />

            <p className="photo-analysis-text">
              Analysing your item...
            </p>
          </div>
        )}


        {flow.step === "ready" && (
          <>
            <div className="modal-title">
              Add Item
            </div>

            <AnalysedItemReview
              // A new form when the kind is switched.
              key={flow.kind}
              kind={flow.kind}
              prefill={flow.reviewPrefill}
              photoUrl={previewUrl}
              onSaved={(saved) => {
                flow.markSaved(saved, flow.kind);
                refresh?.();
              }}
              onSwitchKind={flow.switchKind}
              onChooseAnotherPhoto={flow.restart}
            />
          </>
        )}


        {flow.step === "failed" && (
          <>
            <div className="modal-title">
              Add Item
            </div>

            <div className="photo-analysis">

              {photo}

              <p className="validation-message">{flow.error}</p>

              <p className="photo-analysis-text">What is it?</p>

              <div className="modal-button-row">
                {KINDS.map(({ kind, label }) => (
                  <button
                    key={kind}
                    type="button"
                    className="modal-button"
                    onClick={() => setForm({ kind, prefill: flow.manualPrefill })}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button type="button" className="text-button" onClick={flow.restart}>
                Choose another photo
              </button>

            </div>
          </>
        )}


        {flow.step === "saved" && (
          <>
            <div className="modal-title">
              {flow.savedItem.message}
            </div>

            <div className="view-new-matches-wrapper">

              <div className="modal-button-row">

                {flow.savedItem.hasMatches && (
                  <button
                    className="modal-button"
                    onClick={() =>
                      navigate(
                        `/matches?item=${flow.savedItem.id}`,
                        { state: { processing: true } }
                      )
                    }
                  >
                    View New Matches
                  </button>
                )}

                <button className="modal-button" onClick={addAnother}>
                  Add Another Item
                </button>

                {!flow.savedItem.hasMatches && (
                  <button className="modal-button" onClick={onClose}>
                    Done
                  </button>
                )}

              </div>

            </div>
          </>
        )}


        {flow.notice && (
          <div className="photo-notice-backdrop">
            <div className="photo-notice" role="alertdialog" aria-modal="true">
              <p>{flow.noticeText}</p>
              <button type="button" className="modal-button" onClick={flow.dismissNotice}>
                OK
              </button>
            </div>
          </div>
        )}

      </div>

    </div>

  );

};


export default AddFromPhoto;

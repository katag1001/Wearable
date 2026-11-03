import React from "react";

import TypePicker from "./uploadComponents/typePicker";
import {
  ColoursField,
  FabricField,
  PatternField,
  TagsField,
  TightsField,
} from "./uploadComponents/modalTwo";

import { useAnalysedItemReview } from "@core/hooks/useAnalysedItemReview.js";
import { useWardrobeItemForm } from "@core/hooks/useWardrobeItemForm.js";
import { WARDROBE_KINDS } from "@core/wardrobe/itemKinds.js";

import "../../styles/modal.css";

/*
 * After a photo is analysed: the photo, then what was found - name, type
 * and colours, the rest behind "Show more fields" - each with a "Change"
 * that opens its picker underneath, and Save at the bottom. Which fields
 * show is useAnalysedItemReview's (shared with the mobile app); the
 * editing and saving are the item form's (useWardrobeItemForm, filled in
 * from the analysis).
 *
 * `onSwitchKind(fields)` starts the review again as the other kind
 * (clothing <-> footwear) - AddFromPhoto remounts this with the new kind.
 */
const AnalysedItemReview = ({
  kind,
  prefill,
  photoUrl,
  onSaved,
  onSwitchKind,
  onChooseAnotherPhoto,
}) => {

  const form = useWardrobeItemForm({ kind, prefill, onSaved, singlePage: true });

  const review = useAnalysedItemReview(form);

  const otherKind = kind === "clothing" ? "footwear" : "clothing";

  const pickers = {
    name: (
      <input
        className="form-input"
        value={form.formData.name}
        onChange={(e) => form.updateField("name", e.target.value)}
        aria-label="Name"
        autoFocus
      />
    ),
    type: (
      <>
        <TypePicker
          formData={form.formData}
          chooseSubtype={form.chooseSubtype}
          typeOptions={form.typeOptions}
          hasCategories={form.hasCategories}
        />

        <button
          type="button"
          className="text-button"
          onClick={() => onSwitchKind(form.formData)}
        >
          It's {WARDROBE_KINDS[otherKind].label.toLowerCase()}, not {WARDROBE_KINDS[kind].label.toLowerCase()}
        </button>
      </>
    ),
    colours: <ColoursField form={form} titled={false} />,
    pattern: <PatternField form={form} titled={false} />,
    fabric: <FabricField form={form} titled={false} />,
    tights: <TightsField form={form} titled={false} />,
    tags: <TagsField form={form} titled={false} />,
  };

  const rows = (fields) => fields.map(({ key, label, value }) => {

    const open = review.openField === key;

    return (
      <div className="review-field" key={key}>

        <div className="review-field-row">

          <div className="review-field-text">
            <span className="review-field-label">{label}</span>
            <span className="review-field-value">{value}</span>
          </div>

          <button
            type="button"
            className="review-field-change"
            aria-expanded={open}
            onClick={() => review.toggleField(key)}
          >
            {open ? "Done" : "Change"}
          </button>

        </div>

        {open && (
          <div className="review-field-picker">
            {pickers[key]}
          </div>
        )}

      </div>
    );
  });

  return (

    <div className="photo-analysis">

      {photoUrl && (
        <img src={photoUrl} alt="Your item" className="photo-analysis-image" />
      )}

      <div className="review-fields">
        {rows(review.mainFields)}
      </div>

      <button type="button" className="text-button" onClick={review.toggleMore}>
        {review.showMore ? "Show fewer fields" : "Show more fields"}
      </button>

      {review.showMore && (
        <div className="review-fields">
          {rows(review.moreFields)}
        </div>
      )}

      {form.validationMessage && (
        <p className="validation-message">{form.validationMessage}</p>
      )}

      {form.error && (
        <p className="validation-message">{form.error}</p>
      )}

      <button
        type="button"
        className="modal-button"
        disabled={form.saving}
        onClick={form.save}
      >
        {form.saving ? "Saving..." : "Save"}
      </button>

      <button
        type="button"
        className="text-button"
        disabled={form.saving}
        onClick={onChooseAnotherPhoto}
      >
        Choose another photo
      </button>

    </div>

  );
};


export default AnalysedItemReview;

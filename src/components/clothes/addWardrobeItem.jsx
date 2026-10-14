import React, { useState } from "react";

import AddUpdateClothes from "./addUpdateClothes";
import AddUpdateFootwear from "../footwear/addUpdateFootwear";

import "../../styles/modal.css";

/*
 * The Add Item modal on My Wardrobe. A new item starts on a choice of
 * Clothing or Footwear, then opens that form (whose page one has a Back
 * button to return here). Editing skips the choice - `kind` says which
 * form the item belongs to.
 */

const KINDS = [
  { kind: "clothing", label: "Clothing" },
  { kind: "footwear", label: "Footwear" },
];

const AddWardrobeItem = ({ item, kind, onClose, refresh }) => {

  const isUpdate = !!item;

  const [chosenKind, setChosenKind] = useState(isUpdate ? kind : null);

  // Only a new item can go back to the choice.
  const onBack = isUpdate ? undefined : () => setChosenKind(null);

  if (chosenKind === "clothing") {
    return (
      <AddUpdateClothes
        item={item}
        onClose={onClose}
        onBack={onBack}
        refresh={refresh}
      />
    );
  }

  if (chosenKind === "footwear") {
    return (
      <AddUpdateFootwear
        item={item}
        onClose={onClose}
        onBack={onBack}
        refresh={refresh}
      />
    );
  }

  return (

    <div className="modal-backdrop">

      <div className="modal-wrapper open">

        <button className="close-modal" onClick={onClose}>
          ×
        </button>

        <div className="modal-title">
          Add Item
        </div>

        <div className="update-form">

          <div className="form-label">

            What would you like to add?

            <div className="selection-container">

              <div className="selection-grid">

                {KINDS.map(({ kind: option, label }) => (

                  <button
                    key={option}
                    type="button"
                    className="selection-button"
                    onClick={() => setChosenKind(option)}
                  >
                    <span className="selection-title">
                      {label}
                    </span>
                  </button>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};


export default AddWardrobeItem;

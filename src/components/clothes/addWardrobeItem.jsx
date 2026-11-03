import React, { useState } from "react";

import AddFromPhoto from "./addFromPhoto";
import AddUpdateItem from "./addUpdateItem";
import { WARDROBE_KIND_LIST as KINDS } from "@core/wardrobe/itemKinds.js";

import "../../styles/modal.css";

/*
 * The Add Item modal on My Wardrobe. A new item starts from a photo
 * (AddFromPhoto), which fills everything in. "Add details by hand" opens a
 * choice of Clothing or Footwear, then that form (whose page one has a
 * Back button to return here). Editing skips both - `kind` says which
 * form the item belongs to.
 */

const AddWardrobeItem = ({ item, kind, onClose, refresh }) => {

  const isUpdate = !!item;

  const [byHand, setByHand] = useState(false);
  const [chosenKind, setChosenKind] = useState(isUpdate ? kind : null);

  // Only a new item can go back to the choice.
  const onBack = isUpdate ? undefined : () => setChosenKind(null);

  if (!isUpdate && !byHand) {
    return (
      <AddFromPhoto
        onClose={onClose}
        onManual={() => setByHand(true)}
        refresh={refresh}
      />
    );
  }

  if (chosenKind) {
    return (
      <AddUpdateItem
        kind={chosenKind}
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

          <button type="button" className="text-button" onClick={() => setByHand(false)}>
            Add from a photo instead
          </button>

        </div>

      </div>

    </div>

  );

};


export default AddWardrobeItem;

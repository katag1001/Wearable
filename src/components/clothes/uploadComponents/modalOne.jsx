import React from "react";
import UploadImages from "../uploadPics";
import typeOptions from "./typeOptions.js";


const ModalOne = ({
  formData,
  setFormData,
  updateField,
  handleSubtypeChange
}) => {


  const groupedTypes = typeOptions.reduce((groups, item) => {

    if (!groups[item.type]) {
      groups[item.type] = [];
    }

    groups[item.type].push(item);

    return groups;

  }, {});


  return (
    <div className="modal-page">


      <label className="form-label">

        Name:

        <input
          className="form-input"
          value={formData.name}
          onChange={e =>
            updateField(
              "name",
              e.target.value
            )
          }
          required
        />

      </label>



      <div>

        Image:

        <UploadImages
          setFormData={setFormData}
          formData={formData}
        />

      </div>



      {/* Subtype */}

      <div className="form-label">

        Subtype:

        <div className="subtype-container">

          {Object.entries(groupedTypes).map(
            ([category, subtypes]) => (

              <div
                key={category}
                className="subtype-category"
              >

                <h4>
                  {category}
                </h4>


                <div className="subtype-grid">

                  {subtypes.map(subtype => (

                    <button
                      type="button"
                      key={subtype.name}
                      className={
                        formData.subtype === subtype.name
                          ? "subtype-button selected"
                          : "subtype-button"
                      }
                      onClick={() =>
  handleSubtypeChange({
    target: {
      value: subtype.name
    }
  })
}
                    >

                      <span className="material-symbols-outlined subtype-icon">
                        {subtype.icon}
                      </span>


                      <span>
                        {subtype.name}
                      </span>

                    </button>

                  ))}

                </div>

              </div>

            )
          )}

        </div>

      </div>


    </div>
  );
};


export default ModalOne;
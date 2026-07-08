import React from "react";
import UploadImages from "../uploadPics";
import typeOptions from "./typeOptions.js";


const ModalOne = ({
  formData,
  setFormData,
  updateField,
  handleSubtypeChange
}) => {

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



      <label className="form-label">

        Subtype:

        <select
          className="form-select"
          value={formData.subtype}
          onChange={handleSubtypeChange}
          required
        >

          <option value="">
            Select subtype
          </option>


          {typeOptions.map(option => (

            <option
              key={option.name}
              value={option.name}
            >
              {option.name}
            </option>

          ))}

        </select>

      </label>


    </div>
  );
};


export default ModalOne;

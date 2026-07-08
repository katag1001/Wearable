import React from "react";
import {
  seasonOptions
} from "./uploadHelpers";
import TemperatureSlider from "./temperatureSlider";


const ModalTwo = ({
  formData,
  toggleSeason,
  handleTempChange
}) => {

  return (
    <div className="modal-page">

      <fieldset className="season-group">

        <legend>
          Seasons
        </legend>


        {seasonOptions.map(season => (

          <label
            key={season}
            className="season-label"
          >

            <input
              type="checkbox"
              checked={formData[season]}
              onChange={() =>
                toggleSeason(season)
              }
            />

            {" "}
            {season}

          </label>

        ))}

      </fieldset>



<label className="form-label">
  Temperature Range

  <TemperatureSlider
    min={-20}
    max={50}
    valueMin={formData.min_temp}
    valueMax={formData.max_temp}
    onChange={(minTemp, maxTemp) => {
      handleTempChange("min_temp", minTemp);
      handleTempChange("max_temp", maxTemp);
    }}
  />
</label>


    </div>
  );
};


export default ModalTwo;


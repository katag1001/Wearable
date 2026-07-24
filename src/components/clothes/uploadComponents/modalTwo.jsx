import React from "react";
import {seasonOptions} from "../../../constants/optionsBank";
import TemperatureSlider from "../../general/temperatureSlider";

const ModalTwo = ({
  formData,
  toggleSeason,
  handleTempChange
}) => {

  return (

    <div className="modal-page">

    {/* Season */}

        <div>

          <fieldset className="season-group">

            <label className="form-label">Seasons</label>


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

          </div>

<div className="modal-divider-container">
<div className="modal-divider" />
</div>

    {/* Temperature */}

    <div>
        <label className="form-label">
          Temperature Range
        </label>
        
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
        </div>
        </div>
      );
    };


export default ModalTwo;


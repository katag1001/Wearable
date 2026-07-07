import React, { useEffect, useState } from "react";
import axios from "axios";
import UploadImages from "./uploadPics";
import ViewNewMatches from "./viewNewMatches";
import colorOptions from "../../constants/colorOptions.js";
import typeOptions from "../../constants/typeOptions.js";
import { URL } from "../../config";
import "./addUpdateClothes.css";

const styleOptions = ["plain", "patterned"];

const seasonTempRanges = {
  spring: { min: 10, max: 20 },
  summer: { min: 15, max: 35 },
  autumn: { min: 8, max: 15 },
  winter: { min: 0, max: 13 }
};

const tagOptions = [
  "Work",
  "Gym",
  "Loungewear",
  "Party",
  "Date night",
  "Wedding",
  "Beach",
  "Outdoor",
  "Dinner",
  "Everyday"
];

const getInitialState = () => ({
  name: "",
  imageUrl: "",
  min_temp: 10,
  max_temp: 20,
  colors: [],
  styles: "plain",
  type: "",
  subtype: "",
  spring: false,
  summer: false,
  autumn: false,
  winter: false,
  tags: [],
  lastWornDate: new Date(
    Date.now() - 100 * 365 * 24 * 60 * 60 * 1000
  )
});

const AddUpdateClothes = ({
  item,
  onClose,
  refresh
}) => {

  const isUpdate = !!item;

  const [formData, setFormData] = useState(
    item
      ? {
          ...getInitialState(),
          ...item
        }
      : getInitialState()
  );

  const [manualTempOverride, setManualTempOverride] = useState(false);
  const [justSavedItem, setJustSavedItem] = useState(null);
  const [message, setMessage] = useState("");

  const detectFromName = (name) => {
    const lower = name.toLowerCase();

    const detectedColors = colorOptions
      .filter(color =>
        lower.includes(color.name.toLowerCase())
      )
      .map(color => color.name);

    const detectedSeasons = {
      spring: lower.includes("spring"),
      summer: lower.includes("summer"),
      autumn:
        lower.includes("autumn") ||
        lower.includes("fall"),
      winter: lower.includes("winter")
    };

    const detectedTags = tagOptions.filter(tag =>
      lower.includes(tag.toLowerCase())
    );

    const style =
      detectedColors.length > 1
        ? "patterned"
        : "plain";

    return {
      detectedColors,
      detectedSeasons,
      detectedTags,
      style
    };
  };


  useEffect(() => {
    if (!formData.name) return;

    const {
      detectedColors,
      detectedSeasons,
      detectedTags,
      style
    } = detectFromName(formData.name);


    setFormData(prev => {

      const updated = {
        ...prev
      };


      if (detectedColors.length) {
        updated.colors = detectedColors;
      }


      Object.keys(detectedSeasons).forEach(season => {
        updated[season] = detectedSeasons[season];
      });


      if (!manualTempOverride) {

        const active = Object.keys(detectedSeasons)
          .filter(season => detectedSeasons[season]);


        if (active.length) {

          const ranges = active.map(
            season => seasonTempRanges[season]
          );

          updated.min_temp = Math.min(
            ...ranges.map(r => r.min)
          );

          updated.max_temp = Math.max(
            ...ranges.map(r => r.max)
          );
        }
      }


      if (detectedTags.length) {
        updated.tags = detectedTags;
      }


      updated.styles =
        detectedColors.length > 1
          ? "patterned"
          : style;


      return updated;
    });

  }, [formData.name]);


  const toggleColor = (color) => {

    setFormData(prev => {

      const colors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];


      return {
        ...prev,
        colors,
        styles:
          colors.length > 1
            ? "patterned"
            : prev.styles
      };
    });
  };


  const toggleTag = (tag) => {

    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));

  };


  const toggleSeason = (season) => {

    setManualTempOverride(false);

    setFormData(prev => {

      const updated = {
        ...prev,
        [season]: !prev[season]
      };


      const active = [
        "spring",
        "summer",
        "autumn",
        "winter"
      ].filter(s => updated[s]);


      if (active.length) {

        const ranges = active.map(
          s => seasonTempRanges[s]
        );


        updated.min_temp = Math.min(
          ...ranges.map(r => r.min)
        );

        updated.max_temp = Math.max(
          ...ranges.map(r => r.max)
        );
      }


      return updated;
    });
  };


  const handleTempChange = (field, value) => {

    setManualTempOverride(true);


    setFormData(prev => ({
      ...prev,
      [field]:
        field === "min_temp"
          ? Math.min(Number(value), prev.max_temp)
          : Math.max(Number(value), prev.min_temp)
    }));

  };


  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubtypeChange = (e) => {

    const subtype = e.target.value;

    const option = typeOptions.find(
      item => item.name === subtype
    );


    setFormData(prev => ({
      ...prev,
      subtype,
      type: option?.type || ""
    }));
  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    try {

      const payload = {
        ...formData,
        min_temp: Number(formData.min_temp),
        max_temp: Number(formData.max_temp),
        styles: formData.styles
      };


      let response;


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


      setJustSavedItem({
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


    } catch (err) {

  console.error("Save clothing error:", err);

  console.error(
    "Response:",
    err.response?.data
  );

  setMessage(
    err.response?.data?.error ||
    "Error saving clothing item"
  );
}
  };


  return (

    <div className="modal-backdrop">

      <div className="add-update-modal">

        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>


        {!justSavedItem ? (

          <>

            <h2 className="modal-title">
              {isUpdate
                ? "Update Clothing Item"
                : "Add Clothing Item"}
            </h2>


            <form
              className="update-form"
              onSubmit={handleSubmit}
            >

              <label className="form-label">
                Name:
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))
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


              <fieldset className="season-group">

                <legend>
                  Seasons
                </legend>


                {[
                  "spring",
                  "summer",
                  "autumn",
                  "winter"
                ].map(season => (

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

                    {season}

                  </label>

                ))}

              </fieldset>


              <label className="form-label">
                Min Temp:
                <input
                  className="form-input"
                  type="number"
                  value={formData.min_temp}
                  onChange={e =>
                    handleTempChange(
                      "min_temp",
                      e.target.value
                    )
                  }
                />
              </label>


              <label className="form-label">
                Max Temp:
                <input
                  className="form-input"
                  type="number"
                  value={formData.max_temp}
                  onChange={e =>
                    handleTempChange(
                      "max_temp",
                      e.target.value
                    )
                  }
                />
              </label>


              <div>
                <h4>
                  Colours
                </h4>

                <div className="color-grid">

                  {colorOptions.map(color => (

                    <div
                      key={color.name}
                    >

                      <span>
                        {color.name}
                      </span>

                      <div
                        className={
                          formData.colors.includes(color.name)
                          ? "color-square selected"
                          : "color-square"
                        }
                        style={{
                          backgroundColor:
                            color.value
                        }}
                        onClick={() =>
                          toggleColor(color.name)
                        }
                      />

                    </div>

                  ))}

                </div>

              </div>


              <label className="form-label">
                Style:
                <select
                  className="form-select"
                  value={formData.styles}
                  onChange={handleChange}
                  name="styles"
                >

                  {styleOptions.map(style => (

                    <option
                      key={style}
                      value={style}
                    >
                      {style}
                    </option>

                  ))}

                </select>
              </label>


              <div>
                <h4>
                  Tags
                </h4>

                {tagOptions.map(tag => (

                  <label key={tag}>

                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag)}
                      onChange={() =>
                        toggleTag(tag)
                      }
                    />

                    {tag}

                  </label>

                ))}

              </div>


              <button
                className="save-button"
                type="submit"
              >
                Save
              </button>

            </form>

          </>

        ) : (

          <ViewNewMatches
            newItemName={justSavedItem.name}
            newItemType={justSavedItem.type}
          />

        )}

        {message &&
          <p>{message}</p>
        }

      </div>

    </div>

  );

};

export default AddUpdateClothes;
import React, { useEffect, useState } from "react";

const UploadImages = ({
  setSelectedImage
}) => {

  const [previewUrl, setPreviewUrl] = useState(null);


  const handleFileChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);

    const preview = URL.createObjectURL(file);

    setPreviewUrl(preview);
  };


  useEffect(() => {

    return () => {

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

    };

  }, [previewUrl]);


  return (
    <div className="flex_upload">

      <div className="upload">

        <input
          id="clothing-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <label
          htmlFor="clothing-upload"
          className="upload-button"
        >
          {previewUrl ? "Change Image" : "Choose Image"}
        </label>

        {previewUrl && (

            <img
              src={previewUrl}
              alt="Selected clothing"
              className="selected-clothing"
              style={{
                margin: "30px",
                height: "400px",
                objectFit: "contain",
                display: "block"
              }}
            />

        )}

      </div>

    </div>
  );
};


export default UploadImages;

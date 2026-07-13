const UploadImages = ({ setFormData, formData }) => {

  const addImageData = (url, publicId) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: url,
      cloudinaryId: publicId
    }));
  };


  const uploadWidget = () => {

    window.cloudinary.openUploadWidget(
      {
        cloud_name: import.meta.env.VITE_CLOUD_NAME,
        upload_preset: import.meta.env.VITE_UPLOAD_PRESET,
        api_key: import.meta.env.VITE_CLOUD_API_KEY,
        tags: ["user"],
        sources: ["local", "url", "camera", "image_search"],
      },

      (error, result) => {

        if (error) {
          console.log("Cloudinary Widget Error: ", error);
        } 
        
        else if (result.event === "success") {

          console.log(result.info);

          addImageData(
            result.info.url,
            result.info.public_id
          );

        }

      }
    );
  };


  return (
    <div className="flex_upload">

      <div className="upload">

        <button 
          type="button" 
          className="button" 
          onClick={uploadWidget}
        >
          Upload Image
        </button>

      </div>

    </div>
  );
};


export default UploadImages;
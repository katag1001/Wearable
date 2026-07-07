
const UploadImages = ({setFormData,formData}) => {

    const addURL = (url) => {   
        setFormData(prev => ({
            ...prev,
            imageUrl: url
          }))};

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
          console.log('Cloudinary Widget Error: ', error);
        } else {
            addURL(result.info.files[0].uploadInfo.url)
        }
      }
    );
  };



  return (
    <div className="flex_upload">
      {/* form to add title, description, author, date -- onchange goes to state */}
      <div className="upload">
        <button type="button" className="button" onClick={uploadWidget}>
          Upload Image
        </button>
      </div>
      {/* button PUBLISH POST on click take data from state and send to server on the body -- function*/}
    </div>
  );
};

export default UploadImages;
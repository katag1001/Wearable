// Cloudinary serves the original upload by default, which is often
// several MB. Inserting a transformation into the URL asks Cloudinary
// for a resized, compressed copy instead (generated once, then cached).
//
// c_limit  - shrink to fit within size x size, keep aspect ratio, never crop
// f_auto   - serve WebP/AVIF when the browser supports it
// q_auto   - compress as far as possible without visible quality loss
//
// Pass roughly 2x the displayed size so images stay sharp on retina screens.

const UPLOAD_SEGMENT = "/image/upload/";

export const getImageUrl = (url, size = 400) => {
  if (!url || !url.includes(UPLOAD_SEGMENT)) {
    return url;
  }

  const transformation =
    `w_${size},h_${size},c_limit,f_auto,q_auto`;

  return url.replace(
    UPLOAD_SEGMENT,
    `${UPLOAD_SEGMENT}${transformation}/`
  );
};

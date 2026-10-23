import React from "react";

// A sneaker: "change shoes" on Today. Drawn with currentColor; size and
// stroke come from the button's CSS.
const ShoeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M2 18h20v-1.2c0-1.9-1.4-3.5-3.3-3.8L14 12.3 10.6 7H8.8c-.6 1.3-2 2.1-3.6 2.1H2V18z" />
    <path d="M2 15.5h20" />
    <path d="M10.8 9.8l1.6-.9M12.2 11.6l1.6-.9" />
  </svg>
);

export default ShoeIcon;

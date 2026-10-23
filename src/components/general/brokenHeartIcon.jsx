import React from "react";

// The broken heart: "not this outfit" on Today, "mismatch" on an outfit
// card. Drawn with currentColor; size and stroke come from the button's CSS.
const BrokenHeartIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-6.716-4.35-9.428-8.03C.86 10.42 1.02 7.28 3.34 5.34c2.02-1.7 4.86-1.4 6.66.66L12 8.06l2-2.06c1.8-2.06 4.64-2.36 6.66-.66 2.32 1.94 2.48 5.08.77 7.63C18.716 16.65 12 21 12 21z" />
    <path d="M12 8.06 10.5 11.5 13.5 13.5 11.5 17" />
  </svg>
);

export default BrokenHeartIcon;

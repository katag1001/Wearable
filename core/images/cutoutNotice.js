// core/images/cutoutNotice.js
//
// TESTING ONLY (context/before-launch.md, "Must take out"): lets the phone
// app tell the user when a photo's background was removed by Cloudflare
// instead of on the phone. core/ reports it here; the phone app decides
// whether to show anything (mobile/src/platform/garmentCutout.js,
// SHOW_CLOUDFLARE_CUTOUT_NOTICE).

let listener = null;

// The phone app's notice (or null to stop showing it).
export const setCutoutNoticeListener = (fn) => {
  listener = typeof fn === "function" ? fn : null;
};

// Called with an item photo's `removedBy` after it's made.
export const reportCutout = (removedBy) => {
  if (removedBy === "cloudflare" && listener) {
    try {
      listener();
    } catch (error) {
      console.error("Cut-out notice failed:", error);
    }
  }
};

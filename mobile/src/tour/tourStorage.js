// Whether to offer the app tour, kept on the phone only (no server field).
// Registering marks the new email (markTourPending); the first time that
// account reaches Today the offer shows, and taking or skipping it clears
// the mark. Profile's "Take the tour" replays it any time without this.

import { storage } from "../platform/storage";

const PENDING_KEY = "tour_pending_email";

// TEMPORARY, for testing: offers the tour once to whoever is logged in on
// this phone, as if they'd just signed up. Set to false (and remove
// TESTED_KEY) before releasing.
const TREAT_CURRENT_USER_AS_NEW = true;
// A new name offers it again (the old one is already set on the phone).
const TESTED_KEY = "tour_tested_as_new_3";

const normalise = (email) => (email || "").trim().toLowerCase();

export const markTourPending = (email) => {
  storage.setItem(PENDING_KEY, normalise(email));
};

export const shouldOfferTour = (email) => {
  if (!email) return false;

  if (TREAT_CURRENT_USER_AS_NEW && !storage.getItem(TESTED_KEY)) return true;

  return storage.getItem(PENDING_KEY) === normalise(email);
};

export const clearTourOffer = () => {
  storage.removeItem(PENDING_KEY);
  storage.setItem(TESTED_KEY, "1");
};

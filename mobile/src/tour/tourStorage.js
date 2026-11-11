// Whether to offer the app tour, kept on the phone only (no server field).
// Registering marks the new email (markTourPending); the first time that
// account reaches Today the offer shows, and taking or skipping it clears
// the mark. Profile's "Take the tour" replays it any time without this.

import { storage } from "../platform/storage";

const PENDING_KEY = "tour_pending_email";

const normalise = (email) => (email || "").trim().toLowerCase();

export const markTourPending = (email) => {
  storage.setItem(PENDING_KEY, normalise(email));
};

export const shouldOfferTour = (email) => {
  if (!email) return false;
  return storage.getItem(PENDING_KEY) === normalise(email);
};

export const clearTourOffer = () => {
  storage.removeItem(PENDING_KEY);
};

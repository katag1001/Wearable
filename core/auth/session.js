// core/auth/session.js
//
// The saved login: the token (sent with every API request by
// core/api/client.js), the user's email (keys the per-user caches, e.g.
// core/today/todayCache.js) and their first name (the greeting).

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";

export const readSession = () => {
  const storage = getStorage();

  return {
    token: storage.getItem(STORAGE_KEYS.token),
    email: storage.getItem(STORAGE_KEYS.user),
    firstName: storage.getItem(STORAGE_KEYS.firstName) || "",
  };
};

export const saveSession = (token, email, firstName = "") => {
  const storage = getStorage();

  storage.setItem(STORAGE_KEYS.token, token);
  storage.setItem(STORAGE_KEYS.user, email);
  storage.setItem(STORAGE_KEYS.firstName, firstName);
};

export const saveSessionFirstName = (firstName) => {
  getStorage().setItem(STORAGE_KEYS.firstName, firstName);
};

export const saveSessionEmail = (email) => {
  getStorage().setItem(STORAGE_KEYS.user, email);
};

export const clearSession = () => {
  const storage = getStorage();

  storage.removeItem(STORAGE_KEYS.token);
  storage.removeItem(STORAGE_KEYS.user);
  storage.removeItem(STORAGE_KEYS.firstName);
};

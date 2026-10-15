// core/auth/session.js
//
// The saved login: the token (sent with every API request by
// core/api/client.js) and the user's email (keys the per-user caches, e.g.
// core/today/todayCache.js).

import { getStorage } from "../config.js";
import { STORAGE_KEYS } from "../storageKeys.js";

export const readSession = () => {
  const storage = getStorage();

  return {
    token: storage.getItem(STORAGE_KEYS.token),
    email: storage.getItem(STORAGE_KEYS.user),
  };
};

export const saveSession = (token, email) => {
  const storage = getStorage();

  storage.setItem(STORAGE_KEYS.token, token);
  storage.setItem(STORAGE_KEYS.user, email);
};

export const saveSessionEmail = (email) => {
  getStorage().setItem(STORAGE_KEYS.user, email);
};

export const clearSession = () => {
  const storage = getStorage();

  storage.removeItem(STORAGE_KEYS.token);
  storage.removeItem(STORAGE_KEYS.user);
};

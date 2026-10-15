// mobile/src/platform/storage.js
//
// The storage core/ uses (core/config.js): synchronous, like the web's
// localStorage. Phones only have async storage, so every value is loaded
// into memory once at boot (hydrateStorage, behind the splash screen) and
// read from there. Writes update memory straight away and are saved to
// the device in the background, in order.
//
// The login token goes to expo-secure-store (the device keychain /
// keystore); everything else (caches, the user's email) to AsyncStorage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import { STORAGE_KEYS } from "@core/storageKeys.js";

const SECURE_KEYS = new Set([STORAGE_KEYS.token]);

// Android's AsyncStorage accepts bigger values but can't read back one
// over about 2 MB ("Row too big to fit into CursorWindow"). Values above
// this (e.g. a long list of today's outfits) stay in memory for the
// session only and are fetched again next time.
const MAX_SAVED_LENGTH = 1_000_000;

const values = new Map();

// Each save waits for the one before, so a quick set-then-remove can't
// land on the device the wrong way round.
let saveQueue = Promise.resolve();

const saveToDevice = (key, value) => {
  const tooBig = value !== null && value.length > MAX_SAVED_LENGTH;

  if (tooBig) {
    console.warn(`"${key}" is too big to save on the device - kept in memory only.`);
  }

  const save = () => {
    if (SECURE_KEYS.has(key)) {
      return value === null
        ? SecureStore.deleteItemAsync(key)
        : SecureStore.setItemAsync(key, value);
    }

    // A too-big value replaces any older copy, so that isn't read later.
    return value === null || tooBig
      ? AsyncStorage.removeItem(key)
      : AsyncStorage.setItem(key, value);
  };

  saveQueue = saveQueue
    .then(save)
    .catch((error) => console.error(`Failed to save "${key}":`, error));
};

// One key at a time, so a value that can't be read (too big, saved before
// the limit above) loses only itself - and is deleted so it can't fail
// again - instead of every saved value.
const loadSavedKey = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value !== null) {
      values.set(key, value);
    }
  } catch (error) {
    console.warn(`Couldn't read saved "${key}" - removing it:`, error.message);

    await AsyncStorage.removeItem(key).catch(() => {});
  }
};

const loadAsyncStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();

  await Promise.all(keys.map(loadSavedKey));
};

const loadSecureStore = async () => {
  await Promise.all(
    [...SECURE_KEYS].map(async (key) => {
      const value = await SecureStore.getItemAsync(key);

      if (value !== null) {
        values.set(key, value);
      }
    })
  );
};

// Call once at boot, before anything reads storage. If the device storage
// can't be read the app still starts - just logged out, with empty caches.
export const hydrateStorage = async () => {
  try {
    await Promise.all([loadAsyncStorage(), loadSecureStore()]);
  } catch (error) {
    console.error("Failed to load saved data:", error);
  }
};

export const storage = {
  getItem: (key) => (values.has(key) ? values.get(key) : null),

  setItem: (key, value) => {
    const text = String(value);

    values.set(key, text);
    saveToDevice(key, text);
  },

  removeItem: (key) => {
    values.delete(key);
    saveToDevice(key, null);
  },
};

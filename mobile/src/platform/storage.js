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

const values = new Map();

// Each save waits for the one before, so a quick set-then-remove can't
// land on the device the wrong way round.
let saveQueue = Promise.resolve();

const saveToDevice = (key, value) => {
  const save = () => {
    if (SECURE_KEYS.has(key)) {
      return value === null
        ? SecureStore.deleteItemAsync(key)
        : SecureStore.setItemAsync(key, value);
    }

    return value === null
      ? AsyncStorage.removeItem(key)
      : AsyncStorage.setItem(key, value);
  };

  saveQueue = saveQueue
    .then(save)
    .catch((error) => console.error(`Failed to save "${key}":`, error));
};

const loadAsyncStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const entries = await AsyncStorage.multiGet(keys);

  entries.forEach(([key, value]) => {
    if (value !== null) {
      values.set(key, value);
    }
  });
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

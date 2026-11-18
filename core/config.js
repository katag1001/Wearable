// core/config.js
//
// The platform-specific values core/ needs, handed over once at startup by
// each app (web: src/main.jsx, mobile: mobile/src/app/_layout.jsx). core/
// never reads window, localStorage or env vars itself - see
// context/mobile-app-plan.md.
//
// storage: { getItem(key), setItem(key, value), removeItem(key) }, all
// synchronous, like localStorage.

let config = null;

export const configureCore = ({ apiUrl, storage }) => {
  if (!apiUrl) {
    throw new Error("configureCore: apiUrl is required");
  }

  if (!storage) {
    throw new Error("configureCore: storage is required");
  }

  config = { apiUrl, storage };
};

export const getCoreConfig = () => {
  if (!config) {
    throw new Error("configureCore() must be called before using core/");
  }

  return config;
};

// Shorthand for the storage most core/ files need.
export const getStorage = () => getCoreConfig().storage;

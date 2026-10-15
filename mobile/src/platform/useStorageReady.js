// mobile/src/platform/useStorageReady.js
//
// false until saved data has been loaded into memory (./storage.js).
// Nothing that reads storage may render before then.

import { useEffect, useState } from "react";

import { hydrateStorage } from "./storage";

export const useStorageReady = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateStorage().then(() => setReady(true));
  }, []);

  return ready;
};

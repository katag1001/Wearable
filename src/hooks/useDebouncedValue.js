import { useEffect, useState } from "react";

// Returns `value` once it has stopped changing for `delay` ms - used so
// typing a search sends one request when you pause, not one per key.
export const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
};

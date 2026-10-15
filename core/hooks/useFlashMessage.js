import { useCallback, useEffect, useRef, useState } from "react";

// A message that clears itself after `duration` ms ("Preferences saved").
export const useFlashMessage = (duration = 3000) => {
  const [message, setMessage] = useState("");
  const timeoutRef = useRef(null);

  const clear = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setMessage("");
  }, []);

  const show = useCallback(
    (text) => {
      clearTimeout(timeoutRef.current);
      setMessage(text);
      timeoutRef.current = setTimeout(() => setMessage(""), duration);
    },
    [duration]
  );

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return { message, show, clear };
};

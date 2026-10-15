import { useCallback, useEffect, useState } from "react";

import { login as loginRequest, verifyToken } from "../api/auth.js";
import {
  clearSession,
  readSession,
  saveSession,
  saveSessionEmail,
} from "../auth/session.js";
import { checkNeedsStyleQuiz } from "../auth/styleQuizStatus.js";

/*
 * Who's logged in, for the whole app (web: App.jsx, mobile: the root
 * layout).
 *
 * On start it restores the saved login: the token is checked with the
 * server, and the style quiz status loaded, while `isCheckingToken` is
 * true (show a loading / splash screen until then). A token the server
 * rejects is cleared. If the server can't be reached at all, the saved
 * login is kept - the screens will show their own load errors - so
 * opening the app offline doesn't log you out.
 */
export const useAuthSession = () => {
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [needsStyleQuiz, setNeedsStyleQuiz] = useState(false);

  const refreshStyleQuizStatus = useCallback(async () => {
    const needed = await checkNeedsStyleQuiz();

    if (needed !== null) {
      setNeedsStyleQuiz(needed);
    }
  }, []);

  /* -------------------- RESTORE SESSION -------------------- */
  useEffect(() => {
    const restoreSession = async () => {
      const { token, email } = readSession();

      if (!token) {
        setIsCheckingToken(false);
        return;
      }

      try {
        const data = await verifyToken();
        const verifiedEmail = data.decoded?.email || email || "";

        saveSessionEmail(verifiedEmail);
        setUserEmail(verifiedEmail);

        await refreshStyleQuizStatus();

        setLoggedIn(true);
      } catch (err) {
        if (err.response) {
          // The server answered: the token is invalid or expired.
          clearSession();
        } else {
          // No answer (offline): carry on with the saved login.
          setUserEmail(email || "");
          setLoggedIn(true);
        }
      } finally {
        setIsCheckingToken(false);
      }
    };

    restoreSession();
  }, [refreshStyleQuizStatus]);

  /* -------------------- LOGIN -------------------- */
  // Throws on failure - the form shows the message (core/api/errors.js).
  const login = useCallback(
    async (email, password) => {
      const data = await loginRequest(email, password);

      if (!data.token) {
        throw new Error("Login failed");
      }

      const signedInEmail = data.email || email;

      saveSession(data.token, signedInEmail);

      await refreshStyleQuizStatus();

      setUserEmail(signedInEmail);
      setLoggedIn(true);
    },
    [refreshStyleQuizStatus]
  );

  /* -------------------- LOGOUT -------------------- */
  const logout = useCallback(() => {
    clearSession();

    setLoggedIn(false);
    setUserEmail("");
    setNeedsStyleQuiz(false);
  }, []);

  const completeStyleQuiz = useCallback(() => {
    setNeedsStyleQuiz(false);
  }, []);

  return {
    isCheckingToken,
    loggedIn,
    userEmail,
    needsStyleQuiz,
    login,
    logout,
    completeStyleQuiz,
  };
};

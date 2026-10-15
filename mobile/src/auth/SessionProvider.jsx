// mobile/src/auth/SessionProvider.jsx
//
// Shares the one useAuthSession (core/hooks/useAuthSession.js) with every
// screen - the web passes it down as props from App.jsx instead.

import { createContext, use } from "react";

import { useAuthSession } from "@core/hooks/useAuthSession.js";

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const session = useAuthSession();

  return <SessionContext value={session}>{children}</SessionContext>;
};

// { isCheckingToken, loggedIn, userEmail, needsStyleQuiz, login, logout,
//   completeStyleQuiz }
export const useSession = () => {
  const session = use(SessionContext);

  if (!session) {
    throw new Error("useSession must be used inside a SessionProvider");
  }

  return session;
};

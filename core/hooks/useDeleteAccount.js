import { useState } from "react";

import { deleteAccount as deleteAccountRequest } from "../api/auth.js";
import { getErrorMessage } from "../api/errors.js";

// Deleting the account, then `onDeleted` (log out). If it fails, `error`
// is set so the confirm dialog can stay open and say so. deleteAccount
// also resolves to { ok, error } for callers that show the result
// themselves (a native alert).
export const useDeleteAccount = ({ onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const deleteAccount = async () => {
    setDeleting(true);
    setError("");

    try {
      await deleteAccountRequest();

      onDeleted();

      return { ok: true, error: "" };
    } catch (err) {
      console.error("Delete account error:", err);

      const message = getErrorMessage(err, "Failed to delete account.");

      setError(message);
      setDeleting(false);

      return { ok: false, error: message };
    }
  };

  return { deleting, error, deleteAccount };
};

import React, { useState } from 'react';
import { URL } from "../../config";

import "./viewMatchesCard.css"; 

const DeleteMatches = ({ matchId, onDeleteSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("user");

      const url = `${URL}/match/${matchId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });


      const data = await response.json();
      if (!response.ok) {
        onError(data?.error || data?.message || "Delete failed");
        return;
      }

      if (data.error) {
        onError(data.error);
      } else {

        onDeleteSuccess(matchId);
      }
    } catch (err) {

      onError("Failed to delete match");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="match-text-button"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
};

export default DeleteMatches;
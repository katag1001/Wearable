import { URL } from "../../config";

const updateClothes = async (type, id, updatedData) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return { error: "No user logged in" };
    }

    const response = await fetch(`${URL}/clothing/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    // 🔥 IMPORTANT: handle HTTP errors
    if (!response.ok) {
      return {
        error: data?.error || "Update failed",
        status: response.status,
      };
    }

    return data;
  } catch (error) {
    console.error("Update request failed:", error);
    return { error: "Failed to update item" };
  }
};

export default updateClothes;
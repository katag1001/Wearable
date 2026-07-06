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
    return data;
  } catch (error) {
    return { error: "Failed to update item" };
  }
};

export default updateClothes;
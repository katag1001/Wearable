import { URL } from "../../config";

const deleteClothes = async (type, id) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return { error: "No user logged in" };
    }

    const response = await fetch(`${URL}/clothing/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Failed to delete item' };
  }
};

export default deleteClothes;
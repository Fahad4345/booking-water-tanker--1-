import { Auth } from "../Auth";
export const deleteTankerUser = async (tankerId) => {
    const { authFetch } = Auth();
    try {
      const res = await authFetch(`http://192.168.100.187:5000/supplier/deleteTanker/${tankerId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.log("Error deleting tanker user:", error);
      return { success: false, message: "Failed to delete tanker user" };
    }
  };
  
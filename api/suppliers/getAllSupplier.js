import { Auth } from "../Auth";

export const getSuppliers = async () => {
  const { authFetch } = Auth();
  try {
    const res = await authFetch("http://192.168.100.187:5000/supplier/getSupplier", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.success) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.log("Error fetching suppliers:", error);
    return [];
  }
};

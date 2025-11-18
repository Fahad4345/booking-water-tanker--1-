import { Auth } from "../Auth";

export const getSuppliers = async (capacity) => {
  const { authFetch } = Auth();
  try {
 console.log("Get Supplier Running", capacity);

    const url = capacity 
      ? `http://192.168.100.187:5000/supplier/getSupplier?capacity=${capacity}`
      : "http://192.168.100.187:5000/supplier/getSupplier";
    
    const res = await authFetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    const data = await res.json();
    console.log(data)
    if (data.success) {
       console.log(data.data)
      return data.data;
    }
    return [];
  } catch (error) {
    console.log("Error fetching suppliers:", error);
    return [];
  }
};
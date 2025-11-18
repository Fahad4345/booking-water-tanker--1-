import { Auth } from "../Auth";

export const getSupplierTankers = async (supplierId) => {
  const { authFetch } = Auth();
  try {
    const res = await authFetch(`http://192.168.100.187:5000/supplier/getTankerBySupplier/${supplierId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Error fetching supplier tankers:", error);
    return { 
      success: false, 
      data: [], 
      message: "Failed to fetch supplier tankers",
      error: error.message 
    };
  }
};
export const getSuppliers = async () => {
  try {
    const res = await fetch(
      "http://192.168.100.187:5000/supplier/getSupplier",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
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

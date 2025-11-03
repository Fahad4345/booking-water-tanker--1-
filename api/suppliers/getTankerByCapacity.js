// api/suppliers/getSupplierTankers.js
export const getTankerByCapacity = async (supplierId, capacity) => {
  try {
    const res = await fetch(
      "http://192.168.100.187:5000/supplier/getTankerByCapacity",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId, capacity }),
      }
    );

    const data = await res.json();
    if (data.success) return data.tankers;
    return [];
  } catch (error) {
    console.error("Error fetching supplier tankers:", error);
    return [];
  }
};

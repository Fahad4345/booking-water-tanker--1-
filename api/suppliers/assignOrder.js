export const assignOrderToTanker = async (orderId, tankerId, supplierId) => {
  try {
    const res = await fetch(
      "http://192.168.100.187:5000/supplier/assignOrderToTanker",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, tankerId, supplierId }),
      }
    );

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error assigning order to tanker:", error);
    return { success: false, message: "Network error" };
  }
};

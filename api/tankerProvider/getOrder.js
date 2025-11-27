export const getOrders = async (tankerId) => {
  try {
     console.log("Get order Running");
    const response = await fetch(
      `http://192.168.100.187:5000/tanker/getOrders/${tankerId}`,
      {}
    );

    if (!response.ok) throw new Error("Failed to fetch orders for this tanker");

    const data = await response.json();
    console.log("Tanker Order", data.orders);
    return data.orders || [];
     console.log("Tanker Order", data.orders);
  } catch (error) {
    console.error("Error in getOrdersByTanker:", error);
    return [];
  }
};

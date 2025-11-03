export const getOrders = async (supplierId) => {
  try {
    console.log("Get Order Running");
    const response = await fetch(
      `http://192.168.100.187:5000/supplier/getOrderBySupplier/${supplierId}`,
      {}
    );

    if (!response.ok)
      throw new Error("Failed to fetch orders for this supplier");

    const data = await response.json();

    return data.bookings || [];
  } catch (error) {
    console.error("Error in getOrdersBySupplier:", error);
    return [];
  }
};

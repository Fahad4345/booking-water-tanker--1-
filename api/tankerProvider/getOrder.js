export const getOrders = async (tankerId) => {
    try {
      const response = await fetch(`http://192.168.100.187:5000/tanker/getOrders/${tankerId}`,{
        
      });
  
      if (!response.ok) throw new Error("Failed to fetch orders for this tanker");
   
      const data = await response.json();
      console.log("Res of get order", data);
      return data.orders || [];
    } catch (error) {
      console.error("Error in getOrdersByTanker:", error);
      return [];
    }
  };
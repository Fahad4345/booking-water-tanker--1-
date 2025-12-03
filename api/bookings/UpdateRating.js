
export const updateOrderRating = async (ratingData) => {
    try {
        console.log("Sending rating data:", JSON.stringify(ratingData));
      const response = await fetch(`http://192.168.100.187:5000/booking/updateRating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingData)
      });
      
      return await response.json();
       
    } catch (error) {
      console.error("Error updating order rating:", error);
      throw error;
    }
  };
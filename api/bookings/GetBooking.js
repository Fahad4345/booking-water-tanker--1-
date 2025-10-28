export const GetBookings= async(userId)=>{

    try{
    const res = await fetch(`http://192.168.100.187:5000/booking/userBooking/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
       
      });

      const data = await res.json();
       console.log("Res of Get Booking", data);
    return data;
    }
      catch(err){
        console.error("Error fetching bookings:", err);
      }
}
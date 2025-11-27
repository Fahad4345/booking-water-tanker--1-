import { Auth } from "../Auth";
export const BookTank = async (BookingDetail,PaymentIntentId) => {
  const { authFetch } = Auth();
  try {
    console.log("BookingDetail before fetch:", BookingDetail, PaymentIntentId);
    const res = await authFetch(
      "http://192.168.100.187:5000/booking/createBooking",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...BookingDetail,            
          paymentIntentId: PaymentIntentId,}),
      }
    );
    const data = await res.json();
    console.log("Data of booking", data);
    return data;
  } catch (err) {
    console.error("Booking error:", err);
  }
};

import { Auth } from "../Auth";

export const GetBookings = async (userId) => {
  const { authFetch } = Auth();
  try {
    const res = await authFetch(
      `http://192.168.100.187:5000/booking/userBooking/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    return data;
  } catch (err) {
    console.error("Error fetching bookings:", err);
  }
};

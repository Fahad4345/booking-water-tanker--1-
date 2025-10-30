 export const acceptOrder = async (orderId, status, tankerId) => {
    try {
      const res = await fetch("http://192.168.100.187:5000/tanker/updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({orderId, status, tankerId}),
      });
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
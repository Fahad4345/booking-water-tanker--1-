export const registerTankerProvider = async (formData) => {
  try {
    console.log("📤 Sending registration data...", formData);

    const response = await fetch("http://192.168.100.187:5000/tanker/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log("✅ Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;
  } catch (error) {
    return error;
  }
};

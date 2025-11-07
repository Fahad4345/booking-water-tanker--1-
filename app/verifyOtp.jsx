import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const VerifyOtp = () => {
  const { email } = useLocalSearchParams();
  const [pin, setPin] = useState("");
  const router = useRouter();

  const handleVerifyPin = async () => {
    try {
      const res = await fetch("http://192.168.100.187:5000/auth/verifyPin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      Alert.alert("Verified", "OTP verified successfully");
      router.push({ pathname: "/ResetPassword", params: { email } });
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 300 }}>
      <TextInput
        placeholder="Enter OTP"
        value={pin}
        onChangeText={setPin}
        style={{ borderWidth: 1, padding: 20, marginBottom: 10 }}
      />
      <Button title="Verify OTP" onPress={handleVerifyPin} />
    </View>
  );
};

export default VerifyOtp;
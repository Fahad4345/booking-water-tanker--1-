import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
const ResetPassword = ({ route, navigation }) => {
  const { email } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const handleResetPassword = async () => {
    try {
      const res = await fetch("http://192.168.100.187:5000/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      Alert.alert("Success", "Password reset successfully");
      router.push("/login")
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 400 }}>
      <TextInput
        placeholder="Enter new password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={{ borderWidth: 1, padding: 20, marginBottom: 10 }}
      />
      <Button title="Reset Password" onPress={handleResetPassword} />
    </View>
  );
};

export default ResetPassword;

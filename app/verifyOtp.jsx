import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

const VerifyOtp = () => {
  const { email } = useLocalSearchParams();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pinInputRef = useRef(null);
  const router = useRouter();

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://192.168.100.187:5000/auth/verifyPin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid OTP");

      Alert.alert("Success", "OTP verified successfully!");
      router.push({ pathname: "/ResetPassword", params: { email } });
    } catch (err) {
      Alert.alert("Verification Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch("http://192.168.100.187:5000/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");

      Alert.alert("OTP Sent", "A new OTP has been sent to your email");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Icon name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Verify OTP</Text>
              <View style={styles.backButtonPlaceholder} />
            </View>

            {/* Illustration/Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Icon name="verified-user" size={48} color="#007AFF" />
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Enter the 6-digit verification code that was sent to
            </Text>
            <Text style={styles.emailText}>{email}</Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <TextInput
                ref={pinInputRef}
                placeholder="Enter 6-digit code"
                value={pin}
                onChangeText={setPin}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
                selectionColor="#007AFF"
              />
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            </View>

            {/* OTP Length Indicator */}
            <Text style={styles.otpLengthText}>
              {pin.length}/6 digits
            </Text>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (pin.length !== 6 || isLoading) && styles.verifyButtonDisabled
              ]}
              onPress={handleVerifyPin}
              disabled={pin.length !== 6 || isLoading}
            >
              {isLoading ? (
                <Text style={styles.verifyButtonText}>Verifying...</Text>
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                  <Icon name="check-circle" size={20} color="#FFF" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <Text style={styles.helpText}>
              The OTP is valid for 15 minutes
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E6F3FF",
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 40,
  },
  otpContainer: {
    position: "relative",
    marginBottom: 8,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: "#E6F3FF",
    backgroundColor: "#F8FBFF",
    borderRadius: 12,
    paddingHorizontal: 50,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    top: 16,
  },
  otpLengthText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 32,
  },
  verifyButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: "#99C8FF",
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  helpText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});

export default VerifyOtp;
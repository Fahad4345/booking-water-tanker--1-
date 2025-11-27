import React, { useState } from "react";
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

const ResetPassword = () => {
  const { email } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
  
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please enter both password fields");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://192.168.100.187:5000/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      Alert.alert(
        "Success", 
        "Password reset successfully!",
        [
          {
            text: "Login Now",
            onPress: () => router.replace("/login")
          }
        ]
      );
    } catch (err) {
      Alert.alert("Reset Failed", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: "None", color: "#999" };
    if (password.length < 6) return { strength: "Weak", color: "#FF3B30" };
    if (password.length < 8) return { strength: "Fair", color: "#FF9500" };
    if (password.length < 10) return { strength: "Good", color: "#007AFF" };
    return { strength: "Strong", color: "#34C759" };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
          
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Icon name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Reset Password</Text>
              <View style={styles.backButtonPlaceholder} />
            </View>

         
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Icon name="lock-reset" size={48} color="#007AFF" />
              </View>
            </View>

            
            <Text style={styles.description}>
              Create a new password for your account
            </Text>

          
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  placeholder="Enter new password"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.passwordInput}
                  selectionColor="#007AFF"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              
            
              {/* {newPassword.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill,
                        { 
                          width: `${Math.min((newPassword.length / 12) * 100, 100)}%`,
                          backgroundColor: passwordStrength.color
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                    Strength: {passwordStrength.strength}
                  </Text>
                </View>
              )} */}
            </View>

        
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.passwordInput}
                  selectionColor="#007AFF"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon 
                    name={showConfirmPassword ? "visibility-off" : "visibility"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              
           
              {/* {confirmPassword.length > 0 && (
                <View style={styles.matchContainer}>
                  <Icon 
                    name={passwordsMatch ? "check-circle" : "error"} 
                    size={16} 
                    color={passwordsMatch ? "#34C759" : "#FF3B30"} 
                  />
                  <Text style={[
                    styles.matchText, 
                    { color: passwordsMatch ? "#34C759" : "#FF3B30" }
                  ]}>
                    {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                  </Text>
                </View>
              )} */}
            </View>

        
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <View style={styles.requirementItem}>
                <Icon 
                  name={newPassword.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
                  size={14} 
                  color={newPassword.length >= 6 ? "#34C759" : "#999"} 
                />
                <Text style={styles.requirementText}>At least 6 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon 
                  name={passwordsMatch ? "check-circle" : "radio-button-unchecked"} 
                  size={14} 
                  color={passwordsMatch ? "#34C759" : "#999"} 
                />
                <Text style={styles.requirementText}>Passwords must match</Text>
              </View>
            </View>

           
            <TouchableOpacity
              style={[
                styles.resetButton,
                (!newPassword || !confirmPassword || !passwordsMatch || isLoading) && styles.resetButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={!newPassword || !confirmPassword || !passwordsMatch || isLoading}
            >
              {isLoading ? (
                <Text style={styles.resetButtonText}>Resetting...</Text>
              ) : (
                <>
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                  <Icon name="lock-open" size={20} color="#FFF" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
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
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  passwordInputWrapper: {
    position: "relative",
  },
  passwordInput: {
    borderWidth: 2,
    borderColor: "#E6F3FF",
    backgroundColor: "#F8FBFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1A1A1A",
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 4,
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },
  matchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  requirementsContainer: {
    backgroundColor: "#F8FBFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: "#666",
  },
  resetButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: {
    backgroundColor: "#99C8FF",
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default ResetPassword;
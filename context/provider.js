import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "./context";
import { router } from "expo-router";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem("user");
        console.log(data, "data--------");
        if (data) {
          setUser(JSON.parse(data));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateUser = async (data) => {
    try {
      setUser(data);
      await AsyncStorage.setItem("user", JSON.stringify(data));
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const clearUser = async () => {
    try {
      console.log("🧹 Clearing user context...");
      setUser(null);

      // Wait for React to process the state update
      await new Promise((resolve) => setTimeout(resolve, 100));

      await AsyncStorage.clear();
      console.log("✅ User and storage fully cleared");
    } catch (err) {
      console.error("Error clearing user:", err);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    updateUser,
    clearUser,
    setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};



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
          const parsedUser = JSON.parse(data);
          setUser(parsedUser);
  
          const tankerStatus = await AsyncStorage.getItem('tankerStatus');
          const currentOrder = await AsyncStorage.getItem('currentOrder');
          
          console.log("🔄 Syncing from storage - tankerStatus:", tankerStatus);
          console.log("🔄 Syncing from storage - currentOrder:", !!currentOrder);
          
   
          if (parsedUser?.role === 'Tanker' && tankerStatus && parsedUser.Tanker?.availabilityStatus !== tankerStatus) {
            console.log("🔄 Updating user context from storage...");
            const updatedUser = {
              ...parsedUser,
              Tanker: {
                ...parsedUser.Tanker,
                availabilityStatus: tankerStatus
              },
              ...(currentOrder && { currentOrder: JSON.parse(currentOrder) })
            };
            setUser(updatedUser);
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
          }
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
      console.log("💾 User saved to storage");
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const clearUser = async () => {
    try {
      console.log("🧹 Clearing user context...");
      setUser(null);
      await AsyncStorage.clear();
      console.log("User and storage fully cleared");
    } catch (err) {
      console.error("Error clearing user:", err);
    }
  };

  const updateTankerStatus = async (availabilityStatus, currentOrder = null) => {
    console.log("🔄 updateTankerStatus called with:", availabilityStatus);
    
    setUser(prevUser => {
      if (!prevUser || prevUser.role !== 'Tanker') return prevUser;
      
      const updatedUser = {
        ...prevUser,
        Tanker: {
          ...prevUser.Tanker,
          availabilityStatus: availabilityStatus
        },
        ...(currentOrder && { currentOrder: currentOrder })
      };
      
      console.log("✅ User context updated to:", availabilityStatus);
      

      AsyncStorage.setItem("user", JSON.stringify(updatedUser)).catch(err => {
        console.error("❌ Error saving user to storage:", err);
      });
      
      return updatedUser;
    });

 
    try {
      await AsyncStorage.setItem('tankerStatus', availabilityStatus);
      if (currentOrder) {
        await AsyncStorage.setItem('currentOrder', JSON.stringify(currentOrder));
      } else {
        await AsyncStorage.removeItem('currentOrder');
      }
      console.log("💾 Separate storage updated");
    } catch (error) {
      console.error("❌ Error updating separate storage:", error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    updateUser,
    clearUser,
    setUser,
    updateTankerStatus
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
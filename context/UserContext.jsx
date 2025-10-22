import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      // Update AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      
      // Update context state
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  };

  const clearUser = async () => {
    try {
      // Clear AsyncStorage
      await AsyncStorage.multiRemove(["user", "accessToken", "refreshToken"]);
      
      // Clear context state
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error clearing user:', error);
      return { success: false, error: error.message };
    }
  };

  const refreshUser = async () => {
    await loadUserData();
  };

  const value = {
    user,
    isLoading,
    updateUser,
    clearUser,
    refreshUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

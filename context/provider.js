import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './context';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    (async () => {
      try {
       
        const data = await AsyncStorage.getItem('user');
        console.log(data, 'data--------')
        if (data) { setUser(JSON.parse(data) );

        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  

  const updateUser = async (data) => {
    try {
      setUser(data);
      await AsyncStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };


  const clearUser = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
      setUser(null);
    } catch (err) {
      console.error('Error clearing user:', err);
    }
  };


  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    updateUser,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

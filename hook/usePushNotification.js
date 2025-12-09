


import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import registerForPushNotificationsAsync from '../service/NotificationService';




export default function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
  
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          console.log('Expo Push Token:', token);
          AsyncStorage.setItem('@expo_push_token', token);
        }
      })
      .catch(err => console.error('Push registration failed:', err));

  
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        setNotification(notification);
        console.log("Foreground notification received:", notification);
      
      
        const { title, body } = notification.request.content;
        if (title || body) {
          Alert.alert(title || 'Notification', body || '');
        }
      
    
      });
      

  
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

 
  const handleForegroundNotification = async (notification) => {
    const { title, body, data } = notification.request.content;


    Alert.alert(title || 'Notification', body || '');

 
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, 
    });

    console.log('Foreground Notification:', { title, body, data });
  };

 
  const handleNotificationResponse = (response) => {
    const { notification } = response;
    const { data } = notification.request.content;
    console.log('Notification tapped with data:', data);

    // Example: navigate based on data.screen
    // if (data?.screen) router.push(data.screen);
  };

  return {
    expoPushToken,
    notification,
  };
}

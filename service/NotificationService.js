

// import * as Notifications from 'expo-notifications';
// import { Platform, Alert } from 'react-native';
// import * as Device from 'expo-device';

// async function registerForPushNotificationsAsync() {
//   if (!Device.isDevice) {
//     Alert.alert('Push Notifications', 'Must use a physical device for Push Notifications');
//     return;
//   }

 
//   if (Platform.OS === 'android') {
//     await Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

 
//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;

//   if (existingStatus !== 'granted') {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   if (finalStatus !== 'granted') {
//     Alert.alert('Push Notifications', 'Failed to get push token for push notifications!');
//     return;
//   }


//   let token;
//   try {
//     token = (await Notifications.getExpoPushTokenAsync({
//       projectId: '21a0feb0-f743-4950-a6df-0c5c5d2da9fd'
//     })).data;
//     console.log('Expo Push Token:', token);
//   } catch (err) {
//     console.error('Error getting push token:', err);
//   }

//   return token ?? undefined;
// }

// export default registerForPushNotificationsAsync;






// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { Platform } from 'react-native';

// export default async function registerForPushNotificationsAsync() {
//   console.log("🔔 Starting push notification registration...");
  
//   if (!Device.isDevice) {
//     console.log('⚠️ Must use physical device for Push Notifications');
//     return null;
//   }

//   try {
  
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     console.log("📋 Current permission status:", existingStatus);
    
//     let finalStatus = existingStatus;
    
 
//     if (existingStatus !== 'granted') {
//       console.log("📝 Requesting notification permission...");
//       const { status } = await Notifications.requestPermissionsAsync({
//         ios: {
//           allowAlert: true,
//           allowBadge: true,
//           allowSound: true,
//           allowAnnouncements: true,
//         },
//       });
//       finalStatus = status;
//       console.log("📝 Permission request result:", status);
//     }
    
//     if (finalStatus !== 'granted') {
//       console.log('❌ Failed to get push notification permission!');
//       return null;
//     }

   
//     console.log("🔑 Getting Expo push token...");
//     const token = (await Notifications.getExpoPushTokenAsync({
//       projectId: '21a0feb0-f743-4950-a6df-0c5c5d2da9fd', 
//     })).data;
    
//     console.log('✅ Expo Push Token obtained:', token);
    
//     return token;
    
//   } catch (error) {
//     console.log('❌ Error in registerForPushNotificationsAsync:', error);
//     return null;
//   }
// }




// service/NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Set handler HERE TOO
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default async function registerForPushNotificationsAsync() {
  console.log("🔔 Registering for push notifications...");

  if (!Device.isDevice) {
    console.log('⚠️ Physical device required');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Permission denied');
      return null;
    }

    // IMPORTANT: Use your actual Expo project ID
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: "21a0feb0-f743-4950-a6df-0c5c5d2da9fd" // REPLACE THIS
    })).data;

    console.log('✅ Push token obtained:', token);

    // Android specific setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('❌ Push notification error:', error);
    return null;
  }
}
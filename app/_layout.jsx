
// import { Stack } from "expo-router";
// import { UserProvider } from "../context/provider";
// import { useUser } from "../context/context";
// import { StripeProvider } from '@stripe/stripe-react-native';
// import React, { useEffect, useRef, useState } from "react";
// import { View, ActivityIndicator, StatusBar, Alert, Platform } from "react-native";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import registerForPushNotificationsAsync from "./../service/NotificationService";
// import * as Notifications from 'expo-notifications';


// Notifications.setNotificationHandler({
//   handleNotification: async (notification) => {
 
//     console.log("🔔 NotificationHandler triggered");
//     console.log("Notification content:", notification?.request?.content);
    
//     return {
//       shouldShowAlert: true,
//       shouldPlaySound: true,
//       shouldSetBadge: true,
//     };
//   },
// });

// function LayoutContent() {
//   const { isAuthenticated, isLoading } = useUser();

//   const [expoPushToken, setExpoPushToken] = useState('');
//   const [notification, setNotification] = useState(null);

//   const notificationListener = useRef();
//   const responseListener = useRef();


//   useEffect(() => {
//     if (Platform.OS === 'android') {
//       Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//       });
//     }
//   }, []);


//   useEffect(() => {
//     registerForPushNotificationsAsync().then(token => {
//       if (token) {
//         setExpoPushToken(token);
//         AsyncStorage.setItem("@expo_push_token", token);
//       }
//     });

    
//     notificationListener.current = Notifications.addNotificationReceivedListener(async n => {
//       setNotification(n);

//       const { title, body, data } = n.request.content;

    
//       Alert.alert(title ?? "Notification", body ?? "");

      
//       if (Platform.OS === 'android') {
//         await Notifications.scheduleNotificationAsync({
//           content: { title, body, data, sound: "default" },
//           trigger: null,
//         });
//       }

//       console.log("🔥 Foreground notification received:", n);
//     });

 
//     responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
//       const { notification } = response;
//       const { data } = notification.request.content;
//       console.log("Notification tapped with data:", data);

    
//     });

//     return () => {
//       if (notificationListener.current) notificationListener.current.remove();
//       if (responseListener.current) responseListener.current.remove();
//     };
//   }, []);

//   if (isLoading) {
//     return (
//       <SafeAreaView style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#000000"
//       }}>
//         <ActivityIndicator size="large" color="#4FC3F7" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       edges={['right', 'left', 'top', 'bottom']}
//       style={{ flex: 1, backgroundColor: "#000000" }}
//     >
//       <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
//       <Stack screenOptions={{ headerShown: false }}>
//         {!isAuthenticated ? (
//           <>
//             <Stack.Screen name="index" />
//             <Stack.Screen name="login" />
//             <Stack.Screen name="register" />
//           </>
//         ) : (
//           <>
//             <Stack.Screen name="tabCustomer" />
//             <Stack.Screen name="tabSupplier" />
//             <Stack.Screen name="tabTanker" />
//           </>
//         )}
//       </Stack>
//     </SafeAreaView>
//   );
// }

// export default function RootLayout() {
//   return (
//     <StripeProvider
//       publishableKey="pk_test_51S90zX3hLambblRsM0nx1NdKtRw9smh8ePN12VMHMQQvsyjBNYaDwVUJPRj3qRBjTlpcNJILBcjoH1c8ZNA8JS7G00dd99U1yI"
//       merchantIdentifier="merchant.com.yourapp"
//       urlScheme="yourapp"
//     >
//       <UserProvider>
//         <SafeAreaProvider>
//           <LayoutContent />
//         </SafeAreaProvider>
//       </UserProvider>
//     </StripeProvider>
//   );
// }



import { Stack } from "expo-router";
import { UserProvider } from "../context/provider";
import { useUser } from "../context/context";
import { StripeProvider } from '@stripe/stripe-react-native';
import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, StatusBar, Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import registerForPushNotificationsAsync from "./../service/NotificationService";
import * as Notifications from 'expo-notifications';

// This is the KEY - it handles how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log("🔔 NotificationHandler triggered");
    console.log("Notification content:", notification?.request?.content);
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

function LayoutContent() {
  const { isAuthenticated, isLoading } = useUser();

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);

  const notificationListener = useRef();
  const responseListener = useRef();

  // Setup Android notification channel
  useEffect(() => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        lightColor: '#FF231F7C',
      });
    }
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        AsyncStorage.setItem("@expo_push_token", token);
        console.log("✅ Token saved:", token);
      }
    });

    // Listener for when notification is received while app is in FOREGROUND
    notificationListener.current = Notifications.addNotificationReceivedListener(n => {
      console.log("🔥 Foreground notification received:", n);
      setNotification(n);
      
      // REMOVED Alert.alert - this was preventing the notification from showing
      // The notification will show automatically due to setNotificationHandler above
    });

    // Listener for when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { notification } = response;
      const { data } = notification.request.content;
      console.log("👆 Notification tapped with data:", data);
      
      // Handle navigation or actions based on notification data here
      // Example: if (data?.screen) { router.push(data.screen); }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000"
      }}>
        <ActivityIndicator size="large" color="#4FC3F7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['right', 'left', 'top', 'bottom']}
      style={{ flex: 1, backgroundColor: "#000000" }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
          </>
        ) : (
          <>
            <Stack.Screen name="tabCustomer" />
            <Stack.Screen name="tabSupplier" />
            <Stack.Screen name="tabTanker" />
          </>
        )}
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey="pk_test_51S90zX3hLambblRsM0nx1NdKtRw9smh8ePN12VMHMQQvsyjBNYaDwVUJPRj3qRBjTlpcNJILBcjoH1c8ZNA8JS7G00dd99U1yI"
      merchantIdentifier="merchant.com.yourapp"
      urlScheme="yourapp"
    >
      <UserProvider>
        <SafeAreaProvider>
          <LayoutContent />
        </SafeAreaProvider>
      </UserProvider>
    </StripeProvider>
  );
}
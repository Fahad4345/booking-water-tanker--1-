import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupplierTabs() {
  return (
   
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: 50,
            paddingBottom: 8,
            backgroundColor: "#fff",
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      >
        <Tabs.Screen
          name="homeScreen"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        /><Tabs.Screen
        name="viewTanker"
        options={{
          title: "Tankers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
        }}
      />
       
        <Tabs.Screen
        name="tankerRegistration"
        options={{
          title: "Register",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        /> 
         
        <Tabs.Screen
          name="orderDetail"
          options={{
            href: null, 
          }}
        />
   
      <Tabs.Screen
          name="editProfile"
          options={{
            href: null, 
          }}
        />
      </Tabs>
      

    
  );
}

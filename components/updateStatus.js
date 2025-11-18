import { useUser } from "../context/context";
import { acceptOrder } from '../api/tankerProvider/acceptOrder';
import { router } from "expo-router";
 import AsyncStorage from "@react-native-async-storage/async-storage";
export const useUpdateStatus = () => {
    const{user, updateTankerStatus}=useUser();
     
const handleUpdateStatus = async (order) => {
   
     console.log("Updating status", order);
  
  
    try {
      const data = await acceptOrder(order._id, "Accepted", user.Tanker._id);
  
      if (data) {
        updateTankerStatus("OnRide", order);
        await AsyncStorage.setItem('tankerStatus', 'OnRide');
        await AsyncStorage.setItem('currentOrder', JSON.stringify(order));
        
        router.push({
          pathname: '/acceptedOrderScreen',
          params: { order: JSON.stringify(order) },
        });
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      Alert.alert("Error", "Failed to accept order. Please try again.");
    }
  }
  return { handleUpdateStatus };
};
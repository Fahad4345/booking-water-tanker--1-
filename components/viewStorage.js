import AsyncStorage from "@react-native-async-storage/async-storage";

const viewStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    if (!keys || keys.length === 0) {
      console.log("AsyncStorage is empty");
      return;
    }

    const items = await AsyncStorage.multiGet(keys);
    console.log("📦 AsyncStorage contents:");
    items.forEach(([key, value]) => {
      console.log(`👉 ${key}:`, value);
    });
  } catch (error) {
    console.error("Error reading AsyncStorage:", error);
  }
};
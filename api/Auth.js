 "use client";
 import AsyncStorage from "@react-native-async-storage/async-storage";


 export function Auth(){
  const getAccessToken = async () => {
    return await AsyncStorage.getItem("accessToken");
  };
  
    const signup = async (name, email, password, role) => {
        try {
          console.log("Signup running", name, email, password, role);
      
          const res = await fetch("http://192.168.100.187:5000/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role }),
          });
      
          const data = await res.json();
      
          if (!res.ok) {
         
            return { success: false, message: data.error || "Signup failed" };
          }
      
     
          return { success: true, data };
        } catch (err) {
          console.log("Signup error:", err);
          return { success: false, message: "Network error. Please try again." };
        }
      };
      const login = async ( email, password) => {
        try {
          console.log("Login running",email, password);
      
          const res = await fetch("http://192.168.100.187:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({email, password }),
          });
      
          const data = await res.json();
      
          if (!res.ok) {
         
            return { success: false, error: data.error || "Login failed" };
          }
      
     
          return { success: true, data ,message:"Login sucessfull" };
        } catch (err) {
          console.log("Login error:", err);
          return { success: false, error: "Network error. Please try again." };
        }
      };
      const refreshToken = async () => {
        try {
          const refreshTokenValue = await AsyncStorage.getItem("refreshToken");
          
          if (!refreshTokenValue) {
            console.log("No refresh token found");
            return { success: false, error: "No refresh token found" };
          }

          console.log("Refresh token running", refreshTokenValue);
          
          const res = await fetch("http://192.168.100.187:5000/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: refreshTokenValue }),
          });
      
          const data = await res.json();
      
          if (!res.ok) {
            console.log("Refresh token failed:", data.error);
            return { success: false, error: data.error || "Token refresh failed" };
          }
      
      
          await AsyncStorage.setItem("accessToken", data.accessToken);
          if (data.refreshToken) {
            await AsyncStorage.setItem("refreshToken", data.refreshToken);
          }
          
          return { 
            success: true, 
            data: { 
              accessToken: data.accessToken, 
              refreshToken: data.refreshToken || refreshTokenValue 
            },
            message: "Token refreshed successfully" 
          };
        } catch (err) {
          console.log("Refresh token error:", err);
          return { success: false, error: "Network error. Please try again." };
        }
      };
       const authFetch = async (url, options = {}) => {
        let accessToken = await getAccessToken();
        
        if (!accessToken) {
          throw new Error("No access token available");
        }
      
      
        let response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
          },
        });
      
      
        if (response.status === 401) {
          try {
            const newToken = await refreshToken();
            
       
            response = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            throw new Error("Authentication failed");
          }
        }
      
        return response;
      };

      const logout = async () => {
        try {
            
       
          const token = await AsyncStorage.getItem("refreshToken");
          
    if (!token) {
        console.log("No refresh token found");
        return { success: false, error: "No refresh token found" };
      }
          console.log("Logout running",token);
          

          const res = await fetch("http://192.168.100.187:5000/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"refreshToken":token}),
          });
      
          const data = await res.json();
      
          if (!res.ok) {
         
            return { success: false, error: data.error || "Logout failed" };
          }
      
          await AsyncStorage.multiRemove(["accessToken", "refreshToken","user"]);
          return { success: true, data ,message:"Logout sucessfull" };
        } catch (err) {
          console.log("Logout error:", err);
          return { success: false, error: "Network error. Please try again." };
        }
      };
      const updateProfile = async (profileData) => {
        try {
             const res= await authFetch("http://192.168.100.187:5000/auth/updateProfile",{
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(profileData),
            });
            const data = await res.json();
            console.log("data", data);
    if (!res.ok) throw new Error(data.error || "Update failed");

 
    
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    return { success: true, data: data.user, message: data.message };
       } catch (err) {
          console.log("Update Profile error:", err);
          return { success: false, error: "Network error. Please try again." };
        }
      };
      return {
        signup,
        login,
        logout,
        refreshToken,
        authFetch,
        updateProfile
      };

 }
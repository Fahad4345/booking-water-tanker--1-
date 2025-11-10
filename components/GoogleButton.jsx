// import React, { useEffect, useState } from 'react';
// import { Button, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';
// import { Touchable } from 'react-native';

// WebBrowser.maybeCompleteAuthSession();

// export default function GoogleLoginButton({ onLoginSuccess }) {
//   const [userInfo, setUserInfo] = useState(null);
//   const [loading, setLoading] = useState(false);


//   const [request, response, promptAsync] = Google.useAuthRequest({
//     expoClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com',
//     androidClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com',
//     useProxy: true,
//     scopes: ['profile', 'email'],
//   });

//   useEffect(() => {
//     if (response?.type === 'success') {
//       setLoading(true);
//       const { authentication } = response;
//       fetchUserInfo(authentication.accessToken);
//     }
//   }, [response]);

//   const fetchUserInfo = async (token) => {
//     try {
//       const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setUserInfo(data);
//       onLoginSuccess && onLoginSuccess(data); // send user info to parent
//     } catch (err) {
//       console.log('Google login error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ marginVertical: 10 }}>
//       {loading ? (
//         <ActivityIndicator size="small" color="#4285F4" />
//       ) : (
//         <TouchableOpacity    onPress={() => promptAsync()}>
//         <View
//           disabled={!request}
//            style={{ backgroundColor:"#4285F4",  borderRadius:8, padding:18, alignItems:"center"}}
        
//           color=""
//         ><Text style={{  color:"white" }}>Login with Google</Text></View></TouchableOpacity>
//       )}

//       {userInfo && (
//         <Text style={{ marginTop: 10, textAlign: 'center' }}>
//           Logged in as {userInfo.name} ({userInfo.email})
//         </Text>
//       )}
//     </View>
//   );
// }



import React, { useEffect, useState } from 'react';
import { Button, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton({ onLoginSuccess }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com',
    androidClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com',
    iosClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com', // Add iOS if needed
    webClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com', // Add web client ID
    useProxy: true,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    if (!token) return;
    
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setUserInfo(data);
      onLoginSuccess && onLoginSuccess(data);
    } catch (err) {
      console.log('Google login error:', err);
      alert('Failed to fetch user info: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.log('Login prompt error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <View style={{ marginVertical: 10 }}>
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <TouchableOpacity 
          onPress={handleLogin}
          disabled={!request || loading}
          style={{ 
            backgroundColor: loading ? '#cccccc' : '#4285F4', 
            borderRadius: 8, 
            padding: 18, 
            alignItems: "center",
            opacity: (!request || loading) ? 0.6 : 1
          }}
        >
          <Text style={{ color: "white" }}>
            {loading ? 'Loading...' : 'Login with Google'}
          </Text>
        </TouchableOpacity>
      )}

      {userInfo && (
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          Logged in as {userInfo.name} ({userInfo.email})
        </Text>
      )}
    </View>
  );
}

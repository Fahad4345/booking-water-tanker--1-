import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, TouchableOpacity, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton({ onLoginSuccess }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
  
    expoClientId: '60522827713-d0g3l4v0gnaa7dsoe3ijd2ojq1sjb1gr.apps.googleusercontent.com',
    
    androidClientId: '60522827713-melia71sh9tjtb5th3596aurtik22v1v.apps.googleusercontent.com',
    useProxy: true, 
    scopes: ['openid', 'profile', 'email'],
  });
  useEffect(() => {
    if (request) {
      console.log('Using Web Client ID for Expo proxy');
      console.log('Redirect URI:', request.redirectUri);
    }
  }, [request]);

  useEffect(() => {
    console.log('Response:', response);
    
    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      if (authentication?.accessToken) {
        fetchUserInfo(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      console.log('Error:', response.error);
      Alert.alert('Login Failed', response.error);
      setLoading(false);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      setUserInfo(data);
      onLoginSuccess && onLoginSuccess(data);
    } catch (err) {
      console.log('Fetch user error:', err);
      Alert.alert('Error', 'Failed to get user information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <TouchableOpacity 
        onPress={() => promptAsync()}
        disabled={!request || loading}
        style={{ 
          backgroundColor: (!request || loading) ? '#cccccc' : '#4285F4', 
          borderRadius: 8, 
          padding: 18, 
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={{ color: "white", fontWeight: 'bold' }}>
            Login with Google
          </Text>
        )}
      </TouchableOpacity>

      {userInfo && (
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          Logged in as {userInfo.name} ({userInfo.email})
        </Text>
      )}
    </View>
  );
}
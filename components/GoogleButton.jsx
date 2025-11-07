import React, { useEffect, useState } from 'react';
import { Button, ActivityIndicator, View, Text } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleLoginButton({ onLoginSuccess }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);


  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com',
 
    androidClientId: '60522827713-c4sucf170hee7t3bbkkb4t812d7quh3c.apps.googleusercontent.com',
 
    useProxy: true,
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserInfo(data);
      onLoginSuccess && onLoginSuccess(data); // send user info to parent
    } catch (err) {
      console.log('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginVertical: 10 }}>
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <Button
          disabled={!request}
          title="Login with Google"
          onPress={() => promptAsync()}
          color="#4285F4"
        />
      )}

      {userInfo && (
        <Text style={{ marginTop: 10, textAlign: 'center' }}>
          Logged in as {userInfo.name} ({userInfo.email})
        </Text>
      )}
    </View>
  );
}

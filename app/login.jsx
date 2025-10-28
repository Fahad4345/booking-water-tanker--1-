import React, { useState } from 'react';

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../components/Input';
import Button from '../components/Button';
import { Auth } from '../api/Auth';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from '../context/context';

export default function LoginScreen() {
  const router = useRouter();
  const { updateUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const{login}=Auth();

  const handleLogin =  async () => {
    if ( !email || !password ) {
      Alert.alert("Error", "All fields are required");
      return;
    }
  
  
    const result = await login( email, password);

     if (result.success) {
  
       const { user, accessToken, refreshToken } = result.data;
      
  
      await AsyncStorage.setItem("accessToken", accessToken);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      
   
      await updateUser(user);
      
      console.log(await AsyncStorage.getItem("refreshToken"));
      console.log(await AsyncStorage.getItem("accessToken"));
      console.log(await AsyncStorage.getItem("user"));
      if(user.role==="customer"){
         router.replace("/");
      }
      else{
        router.replace("/supplier/homeScreen")
      }

    } else {
      Alert.alert("Login Failed", result.error || "Something went wrong");
    }
  };
  const handleSendOtp = async (email) => {
    try {
      console.log("forget Password running");
      const res = await fetch("http://192.168.100.187:5000/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
    console.log("res of forget",data)
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      Alert.alert("Success", "OTP sent to your email");
      router.push({ pathname: "/verifyOtp", params: { email } });
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Please fill in your email password to login to your account</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Productdesignernew@gmail.com"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            secureTextEntry
          />
          
          <TouchableOpacity onPress={()=>{handleSendOtp(email)}}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button 
            title="LOGIN" 
            onPress={handleLogin}
            variant="primary"
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
    marginTop: 20,
  },
  backButton: {
    fontSize: 28,
    color: '#4FC3F7',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4FC3F7',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    textAlign: 'right',
    color: '#4FC3F7',
    fontSize: 14,
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#4FC3F7',
    fontSize: 14,
    fontWeight: '600',
  },
});

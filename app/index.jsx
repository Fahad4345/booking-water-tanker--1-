import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import AuthWrapper from '../components/AuthWrapper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';


export default function WelcomeScreen() {
  const router = useRouter();

  
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("transparent");
    NavigationBar.setButtonStyleAsync("dark");
  }, []);


  return (
    <AuthWrapper>
      <View style={styles.container} >
        
        <ImageBackground
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/68f0f60b9252847ebae1d642_1760622237534_fb64fefd.png' }}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <View style={styles.content}>
              <Text style={styles.title}>Welcome to Drips water</Text>
              <Text style={styles.subtitle}>Water Delivery app</Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="CREATE AN ACCOUNT"
                onPress={() => router.replace('/register')}
                variant="primary"
                style={styles.button}
              />
              <Button
                title="LOGIN"
                onPress={() => router.replace('/login')}
                variant="secondary"
                style={styles.button}
              />
             
            </View>
          </View>
        </ImageBackground>
      </View>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
  backgroundColor: "#000"
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 12,
  },
});

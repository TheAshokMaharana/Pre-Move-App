import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  // useEffect(() => {
  //   const checkLogin = async () => {
  //     try {
  //       const tokenData = await AsyncStorage.getItem('APP_JWT_TOKEN');
  //       const userType = await AsyncStorage.getItem('USER_TYPE');
  //       const phone = await AsyncStorage.getItem('USER_PHONE');

  //       if (!tokenData || !userType || !phone) {
  //         return navigation.replace('Login');
  //       }

  //       const { token, expiry } = JSON.parse(tokenData);

  //       if (Date.now() < expiry) {
  //         if (userType === 'manager') {
  //           navigation.replace('ManagerHomePage');
  //         } else {
  //           navigation.replace('HomePage');
  //         }
  //       } else {
  //         navigation.replace('Login');
  //       }
  //     } catch (err) {
  //       console.error('SplashScreen Error:', err);
  //       navigation.replace('Login');
  //     }
  //   };

  //   checkLogin();
  // }, [navigation]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const tokenData = await AsyncStorage.getItem('APP_JWT_TOKEN');
        const userType = await AsyncStorage.getItem('USER_TYPE');
        const phone = await AsyncStorage.getItem('USER_PHONE');
        const userId = await AsyncStorage.getItem('USER_ID');

        console.log('SplashScreen - tokenData:', tokenData);
        console.log('SplashScreen - userType:', userType);
        console.log('SplashScreen - phone:', phone);
        console.log('SplashScreen - userId:', userId);

        if (!tokenData || !userType || !phone || !userId) {
          console.log('SplashScreen - Missing data, navigating to Login');
          return navigation.replace('Login');
        }

        const { token, expiry } = JSON.parse(tokenData);

        if (Date.now() < expiry) {
          if (userType === 'manager') {
            console.log(
              'SplashScreen - Manager logged in, navigating to ManagerHomePage',
            );
            navigation.replace('ManagerHomePage');
          } else {
            console.log(
              'SplashScreen - Customer logged in, navigating to HomePage',
            );
            navigation.replace('HomePage');
          }
        } else {
          console.log('SplashScreen - Token expired, navigating to Login');
          navigation.replace('Login');
        }
      } catch (err) {
        console.error('SplashScreen Error:', err);
        navigation.replace('Login');
      }
    };

    checkLogin();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/componylogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#03B5A7" />
      <Text style={styles.text}>Welcome to Eleplace</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: { width: 180, height: 180, marginBottom: 20 },
  text: {
    marginTop: 15,
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

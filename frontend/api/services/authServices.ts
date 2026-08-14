import apiClient from "../client";
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  username: string;
  email: string;
  token?: string; // Optional if only returned on login
}

interface AuthResponse {
  user: User;
  token: string;
}



export const handleUserRegistration = async (userData: any) => {
  // 1. Get the action from the Store
//   const setLogin = useUserStore.getState().setLogin;

  try {
    const response = await apiClient.post('/api/auth/signup', {
      username: userData.userName,
      email: userData.email,
      password: userData.password,
    });

    // 2. Logic: Handle the success globally
    if (response.data && response.data.user) {
    const userprofile= {username: response.data.user.username, email: response.data.user.email};
      // AsyncStorage only stores strings, so we stringify the object
      await AsyncStorage.setItem('userprofile', JSON.stringify(userprofile));
      return { success: true, data: response.data };
    }
  } catch (error: any) {
    // 3. Logic: Handle the error globally
    const message = error.response?.data?.message || "Échec de la connexion au serveur";
    Alert.alert("Registration Error", message);
    
    return { success: false, error: message };
  }
};


export const handleUserSignIn= async(userLoginData:any)=>{
    try {
    const response = await apiClient.post('/api/auth/login', {
      email: userLoginData.email,
      password: userLoginData.password,
    });

    // 2. Logic: Handle the success globally
    const {
      accessToken,
      refreshToken,
      id,
      username,
      email,
    } = response.data;
  
    if (accessToken && refreshToken && email) {
      // Store the token securely
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      const userprofile= {username: username, email: email, userId: id};
      await AsyncStorage.setItem('userprofile', JSON.stringify(userprofile));
     
      return { success: true, data: response.data };
    }
  } catch (error: any) {
    // 3. Logic: Handle the error globally
    const message = error.response?.data?.message || "Échec de la connexion au serveur";
    Alert.alert("Registration Error", message);
    
    return { success: false, error: message };
  }
};


export const sendGoogleTokenToBackend = async (idToken:string) => {
    try {
      
      const response = await apiClient.post('/api/auth/google-login', {
        idToken: idToken
      });

       const {
          accessToken,
          refreshToken,
          id,
          username,
          email,
        } = response.data;

       if (accessToken && refreshToken && email) {
      // Store the token securely
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      const userprofile= {username: username, email: email, userId: id};
      await AsyncStorage.setItem('userprofile', JSON.stringify(userprofile));
     
      return { success: true, data: response.data };
    }
    } catch (error: any) {
      // 3. Logic: Handle the error globally
      const message = error.response?.data?.message || "Échec de la connexion au serveur";
      Alert.alert("Google Login Error", message);
      
      return { success: false, error: message };
    }
  };


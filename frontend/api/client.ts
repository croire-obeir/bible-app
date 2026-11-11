import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const getApiUrl = () => {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    } else if (Platform.OS === 'android') {
      // http://192.168.178.100:3000
      //192.168.0.176
      return 'http://192.168.0.176:3000';
    } else {
      // iOS Simulator or Physical Device
      return 'http://192.168.1.XX:3000'; // Replace with your IP
    }  
    // //deployed backend url
    // return 'https://backend-production-9988.up.railway.app'
  };

// const getApiUrl = () => {
//   return 'https://api.croireobeir.org';
// };

const apiClient = axios.create({
  baseURL: `${getApiUrl()}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});



apiClient.interceptors.request.use(async (config) => {
  const publicEndpoints = [
    '/api/auth/signup',
    '/api/auth/login',
    '/api/auth/google-login',
    '/api/user/forgot-password',
    '/api/media-classes/videos',
    '/api/media-classes/audios',
    '/api/media/videos',
    '/api/media/audios',
  ];

  // Remove query parameters before checking the endpoint.
  // This ensures URLs such as /api/media/videos?classification=... match.
  const requestUrl = (config.url || '').split('?')[0];

  if (publicEndpoints.includes(requestUrl)) {
    return config;
  }

  const token = await SecureStore.getItemAsync('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// You can add interceptors here later to inject the token from AsyncStorage
export default apiClient;
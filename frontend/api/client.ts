import axios from 'axios';
import { Platform } from 'react-native';

const getApiUrl = () => {
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    } else if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    } else {
      // iOS Simulator or Physical Device
      return 'http://192.168.1.XX:3000'; // Replace with your IP
    }
  };


const apiClient = axios.create({
  baseURL: `${getApiUrl()}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// You can add interceptors here later to inject the token from AsyncStorage
export default apiClient;
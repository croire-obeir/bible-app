import apiClient from "../client";
import { Alert } from 'react-native';

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

// export const authService = {
//   // We specify that this returns a Promise of AuthResponse
//   register: async (userData: Partial<User>): Promise<AuthResponse> => {
//     const response = await apiClient.post<AuthResponse>('/api/auth/signup', userData);
//     return response.data;
//   },

//   login: async (credentials: object): Promise<AuthResponse> => {
//     const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
//     return response.data;
//   },
// };

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
    if (response.data) {
    //   setLogin({ username: response.data.user.username });
      return { success: true, data: response.data };
    }
  } catch (error: any) {
    // 3. Logic: Handle the error globally
    const message = error.response?.data?.message || "Server connection failed";
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
    if (response.data) {
    //   setLogin({ username: response.data.user.username });
    console.log(response.data)
      return { success: true, data: response.data };
    }
  } catch (error: any) {
    // 3. Logic: Handle the error globally
    const message = error.response?.data?.message || "Server connection failed";
    Alert.alert("Registration Error", message);
    
    return { success: false, error: message };
  }
};
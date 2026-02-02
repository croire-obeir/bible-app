import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Define the shape of your state and actions
interface UserState {
  username: string | null;
  isLoggedIn: boolean;
  setLogin: (userData: { username: string }) => void;
  logout: () => void;
}

// 2. Create the store with the interface
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      isLoggedIn: false,

      setLogin: (userData) => 
        set({ 
          username: userData.username, 
          isLoggedIn: true 
        }),

      logout: () => 
        set({ 
          username: null, 
          isLoggedIn: false 
        }),
    }),
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
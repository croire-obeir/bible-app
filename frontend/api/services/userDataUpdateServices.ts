import apiClient from "../client";
import { Alert } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";


export const handleNameEmailChange=async(username:string, email:string, userId:string)=>{
    try{
        const response = await apiClient.put(`/api/user/update/${userId}`, {
            username: username,
            email: email
        });
        if (response.status === 200) {
             const userprofile= {username: response.data.username, email: response.data.email};
             await AsyncStorage.setItem('userprofile', JSON.stringify(userprofile));
             return { success: true, data: response.data };
        }
    }catch(error:any){
        const message = error.response?.data?.message || "Échec de la connexion au serveur";
        Alert.alert("Update Error", message);
        return { success: false, error: message };
    }
}
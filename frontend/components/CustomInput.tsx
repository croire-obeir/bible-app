import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  icon: any;
  placeholder: string;
  isPassword?: boolean;
  value:string;
  onChangeText:(text: string) => void;
};

export default function CustomInput({ icon,value,onChangeText, placeholder, isPassword = false }: Props) {
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color="#AA8418" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secure}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
      {isPassword && (
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons
            name={secure ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#333', fontSize: 16 },
});

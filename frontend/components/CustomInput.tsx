import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. Définition des types attendus (Props)
type Props = {
  icon: any; // Idéalement: keyof typeof Ionicons.glyphMap
  placeholder: string;
  isPassword?: boolean; // Optionnel (le ? signifie non obligatoire)
  value: string;        // Obligatoire pour le "controlled input"
  onChangeText: (text: string) => void; // Obligatoire
  accessibilityLabel?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  autoCorrect?: boolean;
};

export default function CustomInput({ 
  icon, 
  placeholder, 
  isPassword = false, 
  value, 
  onChangeText,
  accessibilityLabel,
  autoCapitalize = 'none',
  keyboardType = 'default',
  autoCorrect = true,
}: Props) {
  
  // 2. Initialisation de l'état pour la visibilité du mot de passe
  // On utilise 'isPassword' pour savoir si on doit cacher le texte au départ
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={20} color="#AA8418" style={styles.icon} />
      
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        // Si ce n'est pas un champ mot de passe, secureTextEntry doit toujours être false
        secureTextEntry={isPassword ? secure : false} 
        style={styles.input}
        
        // 3. Liaison des données (Props)
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoCorrect={isPassword ? false : autoCorrect}
        autoComplete={
          isPassword
            ? 'password'
            : keyboardType === 'email-address'
              ? 'email'
              : undefined
        }
      />

      {/* Afficher l'œil uniquement si c'est un champ mot de passe */}
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
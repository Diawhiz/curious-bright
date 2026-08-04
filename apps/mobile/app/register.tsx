import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../src/lib/api';
import * as SecureStore from 'expo-secure-store';
import { RegisterSchema } from '@curious-bright/validation';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      RegisterSchema.parse({ name, schoolName, email, password });
    } catch (error: any) {
      Alert.alert('Validation Error', error.errors?.[0]?.message || 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, schoolName, email, password }),
      });

      if (data.token) {
        await SecureStore.setItemAsync('token', data.token);
        router.replace('/');
      } else {
        Alert.alert('Error', 'No token received');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="School Name"
          placeholderTextColor="#777"
          value={schoolName}
          onChangeText={setSchoolName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#777"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')} style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>

        {/* Legal consent + navigation */}
        <Text style={styles.legalNotice}>
          By registering, you agree to our{' '}
          <Text style={styles.legalLink} onPress={() => router.push('/terms')}>Terms of Use</Text>
          {' '}and{' '}
          <Text style={styles.legalLink} onPress={() => router.push('/privacy')}>Privacy Policy</Text>.
        </Text>

        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => router.push('/privacy')} style={styles.legalBtn}>
            <Text style={styles.legalBtnText}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/terms')} style={styles.legalBtn}>
            <Text style={styles.legalBtnText}>Terms of Use</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 48,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  linkText: {
    color: '#aaaaaa',
    fontSize: 14,
  },
  legalNotice: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 11,
    color: '#888888',
    lineHeight: 17,
    fontFamily: 'monospace',
  },
  legalLink: {
    color: '#00A896',
    textDecorationLine: 'underline',
  },
  legalRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  legalBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
  },
  legalBtnText: {
    fontSize: 12,
    color: '#aaaaaa',
    fontWeight: '600',
  },
});

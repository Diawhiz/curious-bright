import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiFetch } from '../src/lib/api';
import * as SecureStore from 'expo-secure-store';

export default function BrowseScreen() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      checkAuth();
      fetchDocuments();
    }, [])
  );

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync('token');
    setIsAuthenticated(!!token);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/documents');
      setDocuments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isAuthenticated ? (
          <>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/submit')}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <Link href="/notifications" style={[styles.button, { backgroundColor: '#FF9500' }]} asChild>
              <TouchableOpacity>
                <Text style={styles.buttonText}>Notifications</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/read/${item.id}`)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.meta}>Author: {item.author.username}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 12,
  },
  meta: {
    fontSize: 12,
    color: '#777777',
  },
});

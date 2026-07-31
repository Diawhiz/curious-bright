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
    backgroundColor: '#f7f6f2',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f6f2',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    backgroundColor: '#14141a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#14141a',
    shadowColor: '#ff5a36',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#ff5a36',
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
    backgroundColor: '#ffffff',
    padding: 16,
    borderWidth: 2,
    borderColor: '#14141a',
    shadowColor: '#14141a',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#14141a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#52525b',
    marginBottom: 12,
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '../src/lib/api';

interface Room {
  id: string;
  name: string;
  topic: string;
  _count: { members: number };
}

export default function CommunityScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');

  const loadRooms = async () => {
    try {
      const res = await apiFetch('/rooms');
      setRooms(await res.json());
    } catch (e) {
      console.error('Failed to load rooms', e);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName || !newRoomTopic) return;
    try {
      await apiFetch('/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TOPIC',
          name: newRoomName,
          topic: newRoomTopic,
          isPublic: true,
        }),
      });
      setNewRoomName('');
      setNewRoomTopic('');
      loadRooms();
    } catch (e) {
      console.error('Failed to create room', e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Community</Text>
      
      <View style={styles.createCard}>
        <Text style={styles.subtitle}>Create a New Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Room Name"
          value={newRoomName}
          onChangeText={setNewRoomName}
        />
        <TextInput
          style={styles.input}
          placeholder="Topic"
          value={newRoomTopic}
          onChangeText={setNewRoomTopic}
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
          <Text style={styles.buttonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {rooms.map(room => (
          <View key={room.id} style={styles.roomCard}>
            <Text style={styles.roomName}>{room.name}</Text>
            <Text style={styles.roomTopic}>Topic: {room.topic}</Text>
            <Text style={styles.roomMembers}>{room._count.members} Members</Text>
            
            <TouchableOpacity 
              style={styles.joinButton} 
              onPress={() => router.push(`/room/${room.id}`)}
            >
              <Text style={styles.joinButtonText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  createCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 24, elevation: 2 },
  subtitle: { fontSize: 18, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 6, marginBottom: 12 },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  list: { paddingBottom: 40 },
  roomCard: { backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 1 },
  roomName: { fontSize: 18, fontWeight: 'bold' },
  roomTopic: { color: '#666', marginTop: 4 },
  roomMembers: { color: '#888', fontSize: 12, marginTop: 8 },
  joinButton: { backgroundColor: '#eff6ff', padding: 10, borderRadius: 6, marginTop: 12, alignItems: 'center' },
  joinButtonText: { color: '#2563eb', fontWeight: 'bold' },
});

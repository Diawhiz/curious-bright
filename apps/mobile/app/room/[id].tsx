import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { RealtimeEvents } from '@curious-bright/realtime-contracts';
import { apiFetch } from '../../src/lib/api';
import { Whiteboard } from '../../src/components/Whiteboard';
import { VideoCall } from '../../src/components/VideoCall';

interface Message {
  id: string;
  senderName: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function RoomScreen() {
  const { id } = useLocalSearchParams();
  const roomId = Array.isArray(id) ? id[0] : id;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState<'CHAT' | 'WHITEBOARD' | 'VIDEO'>('CHAT');
  const [callToken, setCallToken] = useState<string | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!roomId) return;
    
    // Fetch blocked users
    apiFetch('/users/blocked')
      .then(res => res.json())
      .then((data: any[]) => {
        const blockedIds = new Set(data.map(b => b.blockedId));
        setBlockedUsers(blockedIds as Set<string>);
      }).catch(err => console.error(err));

    // Join room
    apiFetch(`/rooms/${roomId}/join`, { method: 'POST' }).catch(() => {});

    // Fetch messages
    apiFetch(`/rooms/${roomId}/messages`)
      .then(res => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          setMessages(data.map(m => ({
            id: m.id,
            senderName: m.sender?.name || 'Unknown',
            senderId: m.senderId,
            content: m.content,
            createdAt: m.createdAt,
          })).reverse());
        }
      });

    // Real-time socket
    SecureStore.getItemAsync('token').then(token => {
      const newSocket = io(process.env.EXPO_PUBLIC_REALTIME_URL || 'http://localhost:4001', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        newSocket.emit('room:join', roomId);
      });

      newSocket.on(RealtimeEvents.MESSAGE_RECEIVE, (msg: Message) => {
        setMessages(prev => [...prev, msg]);
      });

      setSocket(newSocket);
    });

    return () => {
      socket?.disconnect();
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit(RealtimeEvents.MESSAGE_SEND, {
      roomId,
      content: newMessage,
    });
    setNewMessage('');
  };

  const startVideoCall = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const res = await fetch((process.env.EXPO_PUBLIC_SIGNALING_URL || 'http://localhost:4002') + '/api/call/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId }),
      });
      const data = await res.json();
      if (data.token) {
        setCallToken(data.token);
        setActiveTab('VIDEO');
      }
    } catch (err) {
      console.error('Failed to get call token', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'CHAT' && styles.activeTab]}
          onPress={() => setActiveTab('CHAT')}
        >
          <Text style={[styles.tabText, activeTab === 'CHAT' && styles.activeTabText]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'WHITEBOARD' && styles.activeTab]}
          onPress={() => setActiveTab('WHITEBOARD')}
        >
          <Text style={[styles.tabText, activeTab === 'WHITEBOARD' && styles.activeTabText]}>Whiteboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'VIDEO' && styles.activeTab]}
          onPress={callToken ? () => setActiveTab('VIDEO') : startVideoCall}
        >
          <Text style={[styles.tabText, activeTab === 'VIDEO' && styles.activeTabText]}>
            {callToken ? 'Video' : 'Start Call'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'CHAT' && (
          <>
            <ScrollView 
              style={styles.messagesList}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.filter(msg => !blockedUsers.has(msg.senderId)).map(msg => (
                <View key={msg.id} style={styles.messageBubble}>
                  <Text style={styles.messageSender}>{msg.senderName}</Text>
                  <Text style={styles.messageText}>{msg.content}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {activeTab === 'WHITEBOARD' && roomId && (
          <Whiteboard roomId={roomId} socket={socket} />
        )}

        {activeTab === 'VIDEO' && callToken && roomId && (
          <VideoCall 
            roomId={roomId}
            token={callToken}
            onLeave={() => {
              setCallToken(null);
              setActiveTab('CHAT');
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  tabBar: { flexDirection: 'row', backgroundColor: 'white', padding: 8, elevation: 2 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
  activeTab: { backgroundColor: '#2563eb' },
  tabText: { fontWeight: 'bold', color: '#666' },
  activeTabText: { color: 'white' },
  content: { flex: 1 },
  messagesList: { flex: 1, padding: 16 },
  messageBubble: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 8, alignSelf: 'flex-start', maxWidth: '80%' },
  messageSender: { fontSize: 10, color: '#888', marginBottom: 4 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 20, marginRight: 8 },
  sendButton: { backgroundColor: '#2563eb', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 20 },
  sendButtonText: { color: 'white', fontWeight: 'bold' },
});

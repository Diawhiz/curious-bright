import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { apiFetch } from '../src/lib/api';
import { SubmissionSchema } from '@curious-bright/validation';
import * as SecureStore from 'expo-secure-store';

export default function SubmitScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      setFile(result.assets[0]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !file) {
      Alert.alert('Error', 'Please fill in all fields and select a file');
      return;
    }

    try {
      SubmissionSchema.omit({ fileUrl: true }).parse({ 
        title, 
        description,
        academicLevel: 'HIGH_SCHOOL',
        license: 'CC-BY-4.0'
      });
    } catch (error: any) {
      Alert.alert('Validation Error', error.errors?.[0]?.message || 'Invalid input');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) throw new Error('Not authenticated');

      // 1. Get presigned URL
      const { uploadUrl, fileKey } = await apiFetch('/submissions/presigned-url', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          contentType: file.mimeType || 'application/pdf',
        }),
      });

      // 2. Upload file to S3
      const fileResponse = await fetch(file.uri);
      const blob = await fileResponse.blob();
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': file.mimeType || 'application/pdf',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // 3. Create submission
      await apiFetch('/submissions', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          fileKey,
        }),
      });

      Alert.alert('Success', 'Document submitted successfully for review');
      router.back();
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Submit Document</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Document Title"
          placeholderTextColor="#777"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor="#777"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
          <Text style={styles.fileButtonText}>
            {file ? file.name : 'Select PDF Document'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  fileButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#444',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  fileButtonText: {
    color: '#aaa',
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
});

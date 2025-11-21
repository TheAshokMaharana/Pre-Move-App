import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import {api} from '../utils/baseurl';

export default function VideoUploadScreen({ route }) {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);

  // cus_number & lead_id yaha route se aa sakte hain
  const { cus_number, lead_id } = route.params;
  console.log('customer number', cus_number);
  console.log('customer id', lead_id);
  // Select video from gallery
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0]);
    }
  };

  // Upload video
  const uploadVideo = async () => {
    if (!video) {
      Alert.alert('Error', 'Please select a video first!');
      return;
    }

    setUploading(true);

    // iOS needs "file://", Android doesn't
    const uri =
      Platform.OS === 'ios' ? video.uri.replace('file://', '') : video.uri;

    const formData = new FormData();
    formData.append('video', {
      uri,
      type: 'video/mp4',
      name: `video_${Date.now()}.mp4`,
    });
    formData.append('cus_number', cus_number);
    formData.append('lead_id', lead_id);

    try {
      const res = await api.post(
        'videos/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      Alert.alert('✅ Success', 'Video uploaded successfully!');
      console.log(res.data);
      setVideo(null);
    } catch (err) {
      console.error('❌ Upload error:', err.response?.data || err.message);
      Alert.alert('❌ Error', 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Video for Inspection</Text>

      <TouchableOpacity style={styles.button} onPress={pickVideo}>
        <Text style={styles.buttonText}>🎥 Pick Video</Text>
      </TouchableOpacity>

      {video && (
        <Text style={{ marginVertical: 10, color: '#333' }}>
          Selected: {video.fileName || 'video.mp4'}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: video ? '#007BFF' : '#999' }]}
        onPress={uploadVideo}
        disabled={!video || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>⬆ Upload Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

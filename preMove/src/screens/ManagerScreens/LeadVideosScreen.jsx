import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import Video from 'react-native-video';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import { Colors } from '../../src/Styles/Theme';
import { Linking } from 'react-native';

export default function LeadVideos({ leadId, managerId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userType, setUserType] = useState('normal');
  const [videoToDelete, setVideoToDelete] = useState(null);

  const baseServerUrl = useMemo(
    () => api.defaults.baseURL.replace('/api/', '/'),
    [],
  );

  // Get user type
  useEffect(() => {
    (async () => {
      const type = await AsyncStorage.getItem('USER_TYPE');
      setUserType(type || 'normal');
      console.log('user role', type);
    })();
  }, []);
  // Fetch videos
  const fetchLeadVideos = useCallback(async () => {
    try {
      const res = await api.get(`videos/lead-videos/${leadId}/${managerId}`);
      if (res.data.success) setVideos(res.data.videos || []);
    } catch (err) {
      console.error('❌ Error fetching videos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leadId, managerId]);

  useEffect(() => {
    fetchLeadVideos();
  }, [fetchLeadVideos]);

  // Mark as viewed
  const markViewed = async videoId => {
    try {
      await api.post('videos/mark-viewed', { videoId });
      setVideos(prev =>
        prev.map(v => (v.id === videoId ? { ...v, viewed_by_manager: 1 } : v)),
      );
    } catch (err) {
      console.error('❌ Error marking viewed:', err);
    }
  };

  // Delete video
  const handleDeleteVideo = async () => {
    if (!videoToDelete) return;
    try {
      await api.delete(`videos/${videoToDelete}`);
      setVideos(prev => prev.filter(v => v.id !== videoToDelete));
    } catch (err) {
      console.error('❌ Delete error:', err.response?.data || err.message);
    } finally {
      setVideoToDelete(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeadVideos();
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={styles.loader}
        size="large"
        color={colors.primary}
      />
    );
  }

  if (videos.length === 0) {
    return <Text style={styles.emptyText}>No videos available</Text>;
  }

  const renderVideoItem = ({ item }) => (
    <View style={styles.card}>
      {/* Customer Info */}
      <Text style={styles.customerText}>
        {item.cust_name} ({item.cust_mobile})
      </Text>
      <Text>
        <Text style={styles.label}>Uploaded at: </Text>
        {new Date(item.uploaded_at).toLocaleString()}
      </Text>

      {/* Viewed Status */}
      <Text
        style={[
          styles.status,
          { color: item.viewed_by_manager ? 'green' : 'red' },
        ]}
      >
        {item.viewed_by_manager ? 'Viewed' : 'NEW'}
      </Text>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: `${baseServerUrl}${item.video_path}` }}
          style={styles.video}
          controls
          resizeMode="contain"
          paused={true}
          onProgress={data => {
            if (
              data.currentTime > 1 &&
              !item.viewed_by_manager &&
              userType === 'manager'
            ) {
              markViewed(item.id);
            }
          }}
        />
      </View>

      {/* Delete Button */}
      {userType !== 'manager' && !item.viewed_by_manager && (
        <View style={styles.deleteWrapper}>
          <TouchableOpacity
            onPress={() => setVideoToDelete(item.id)}
            style={styles.deleteBtn}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* {userType !== 'customer' && (
        <View style={styles.CallWrapper}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${item.cust_mobile}`)}
            style={styles.callBtn}
          >
            <Text style={styles.callBtnText}>📞 Call customer</Text>
          </TouchableOpacity>
        </View>
      )} */}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={videos}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={renderVideoItem}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!videoToDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Are you sure you want to delete this video?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setVideoToDelete(null)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteVideo}
                style={styles.deleteBtn}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, marginTop: 20 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#666' },
  card: {
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  CallWrapper: {
    marginVertical: 10,
    textAlign: 'center',
  },
  callBtnText: {
    textAlign: 'center',
    color: 'white',
  },
  callBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  customerText: { fontWeight: 'bold', fontSize: 16 },
  label: { fontWeight: 'bold', color: 'black' },
  status: { fontWeight: 'bold', marginVertical: 5 },
  videoContainer: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: { width: '100%', height: '100%' },
  deleteWrapper: { marginTop: 10, alignItems: 'center' },
  deleteBtn: {
    backgroundColor: '#FF5252',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  deleteBtnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginRight: 10,
  },
  cancelText: { color: '#000', fontWeight: 'bold' },
});

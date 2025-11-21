import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import { api } from '../../utils/baseurl';
import Header from '../../components/Header';
import BackButton from '../../components/BackButton';
import colors from '../../theme/colors';  
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_MAPS_APIKEY = 'AIzaSyD7NldCv3iPs3JbtuGOyuH3Y9m8cWfFQkI';

export default function CurrentLocationMap({ route, navigation }) {
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [managerId, setManagerId] = useState(null);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);
  const { customerId } = route.params;
    console.log("custommer fadfdafid",customerId)
  // Fetch customer location
  useEffect(() => {
    api
      .get(`customer/${customerId}`)  
      .then(res => {
        const data = res.data;
        if (data.movingFromLat && data.movingFromLog) {
          setCustomerLocation({
            latitude: parseFloat(data.movingFromLat),
            longitude: parseFloat(data.movingFromLog),
          });
          setCustomerName(data.name || 'Customer');
          setCustomerAddress(data.movingFrom || 'Address not available');
        }
      })
      .catch(err => console.warn(err));
  }, [customerId]);

  // Get manager location
  useEffect(() => {
    let mounted = true;

    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setLoading(false);
          return false;
        }
      }
      return true;
    };

    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        pos => {
          if (!mounted) return;
          const { latitude, longitude, heading } = pos.coords;
          setLocation({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
          setHeading(heading || 0);
          setLoading(false);
        },
        err => {
          console.warn(err);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    // const watchLocation = () => {
    //   watchIdRef.current = Geolocation.watchPosition(
    //     pos => {
    //       if (!mounted) return;
    //       const { latitude, longitude, heading } = pos.coords;
    //       setLocation(prev => ({
    //         ...(prev || { latitudeDelta: 0.05, longitudeDelta: 0.05 }),
    //         latitude,
    //         longitude,
    //       }));
    //       if (heading !== undefined) setHeading(heading);
    //     },
    //     err => console.warn(err),
    //     {
    //       enableHighAccuracy: true,
    //       distanceFilter: 3,
    //       interval: 3000,
    //       fastestInterval: 2000,
    //     },
    //   );
    // };

    const watchLocation = () => {
      watchIdRef.current = Geolocation.watchPosition(
        async pos => {
          if (!mounted) return;
          const { latitude, longitude, heading } = pos.coords;

          // 🔹 Pehle managerId le lo
          useEffect(() => {
            AsyncStorage.getItem('USER_ID').then(id => setManagerId(id));
          }, []);
          if (!managerId) {
            console.warn('Manager ID not found in session');
            return;
          }
           console.log(
        'Manager location update:',
        managerId,
        latitude,
        longitude,
      );

      setLocation(prev => ({
        ...(prev || { latitudeDelta: 0.05, longitudeDelta: 0.05 }),
        latitude,
        longitude,
      }));
      if (heading !== undefined) setHeading(heading);

      // 🔹 Send location to server
      try {
        await api.post('/manager/update-location', {
          managerId,
          latitude,
          longitude,
        });
      } catch (err) {
        console.warn('Failed to update manager location:', err.message);
      }
        },
        err => console.warn(err),
        {
          enableHighAccuracy: true,
          distanceFilter: 3,
          interval: 5000,
          fastestInterval: 3000,
        },
      );
    };

    requestPermission().then(granted => {
      if (granted) {
        getCurrentLocation();
        watchLocation();
      }
    });

    return () => {
      mounted = false;
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Fetching location...</Text>
      </View>
    );
  }

  // ---- Arrived button handler ----
  const handleArrived = async () => {
    try {
      const res = await api.post('/visit-request/send-otp', {
        customerId: customerId,
      });
      if (res.data.success) {
        setOtpModalVisible(true); // modal khol do
      } else {
        Alert.alert('Error', res.data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  // ---- Verify OTP ----
  const verifyOtp = async () => {
    try {
      const res = await api.post('/visit-request/verify-otp', {
        customerId: customerId,
        otp: otpInput,
      });
      if (res.data.success) {
        setOtpModalVisible(false);
        Alert.alert('Success', 'Visit completed!');
         navigation.goBack();
      } else {
        Alert.alert('Error', res.data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'OTP verification failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <Header />
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerText}>elePlace</Text>
        </View>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
      >
        {/* Manager Marker */}
        <Marker coordinate={location} anchor={{ x: 0.5, y: 0.5 }}>
          <View
            style={[
              styles.managerMarker,
              { transform: [{ rotate: `${heading}deg` }] },
            ]}
          />
          <Text style={styles.markerLabel}>You</Text>
        </Marker>

        {/* Customer Marker */}
        {customerLocation && (
          <Marker coordinate={customerLocation}>
            <View style={styles.customerMarker} />
            <Text style={[styles.markerLabel, { color: 'green' }]}>
              {customerName}
            </Text>
          </Marker>
        )}

        {/* Route */}
        {customerLocation && (
          <MapViewDirections
            origin={location}
            destination={customerLocation}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="#4285F4"
            optimizeWaypoints={true}
            onReady={result => {
              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 120, right: 50, bottom: 180, left: 50 },
                animated: true,
              });
            }}
          />
        )}
      </MapView>

      {/* Bottom Customer Card */}
      {customerLocation && (
        <View style={styles.bottomCard}>
          <Text style={styles.cardTitle}>{customerName}</Text>
          <Text style={styles.cardAddress}>{customerAddress}</Text>
          <TouchableOpacity
            style={styles.arrivedButton}
            onPress={handleArrived}
          >
            <Text style={styles.arrivedText}>Arrived</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* OTP Modal */}
      <Modal
        visible={otpModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter OTP</Text>
            <TextInput
              style={styles.otpInput}
              value={otpInput}
              onChangeText={setOtpInput}
              keyboardType="numeric"
              maxLength={4}
              placeholder="4-digit OTP"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                onPress={() => setOtpModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={verifyOtp}
              >
                <Text style={{ color: '#fff' }}>Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    position: 'absolute',
    top: 30,
    width: '80%',
    padding: 10,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 5,
    borderRadius: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { fontSize: 25, fontWeight: 'bold', color: colors.primary },

  // Marker
  managerMarker: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#4285F4',
    borderWidth: 2,
    borderColor: '#fff',
  },
  customerMarker: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'green',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },

  // Bottom card
  bottomCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  arrivedButton: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 50,
  },
  arrivedText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '60%',
    textAlign: 'center',
    fontSize: 18,
    padding: 8,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
});

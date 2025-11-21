import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { api } from '../utils/baseurl';
import Header from '../components/Header';
import BackButton from '../components/BackButton';
import colors from '../theme/colors';

// const GOOGLE_MAPS_APIKEY = 'AIzaSyD7NldCv3iPs3JbtuGOyuH3Y9m8cWfFQkI';

export default function CustomerTrackingScreen({ route, navigation }) {
  const { visitRequestId } = route.params;
  const [managerLocation, setManagerLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const res = await api.get(`/tracking/${visitRequestId}`);
        if (res.data.success) {
          setManagerLocation({
            latitude: parseFloat(res.data.manager.latitude),
            longitude: parseFloat(res.data.manager.longitude),
          });
          setCustomerLocation({
            latitude: parseFloat(res.data.customer.latitude),
            longitude: parseFloat(res.data.customer.longitude),
          });
        }
      } catch (err) {
        console.error('Error fetching tracking data:', err);
      }
    };

    fetchTrackingData();
    const interval = setInterval(fetchTrackingData, 5000);
    return () => clearInterval(interval);
  }, [visitRequestId]);

  if (!managerLocation || !customerLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Fetching live location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerText}>elePlace</Text>
        </View>
      </View>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: customerLocation.latitude,
          longitude: customerLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Customer Marker */}
        <Marker coordinate={customerLocation}>
          <View style={[styles.marker, styles.customerMarker]} />
          <Text style={styles.markerLabel}>You</Text>
        </Marker>

        {/* Manager Marker */}
        <Marker coordinate={managerLocation}>
          <View style={[styles.marker, styles.managerMarker]} />
          <Text style={styles.markerLabel}>Manager</Text>
        </Marker>

        {/* Route */}
        {managerLocation && customerLocation && (
          <MapViewDirections
            origin={managerLocation}
            destination={customerLocation}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="blue"
            onReady={result => {
              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 120, right: 50, bottom: 120, left: 50 },
                animated: true,
              });
            }}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  // Common marker style
  marker: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Specific marker colors
  managerMarker: {
    backgroundColor: '#4285F4', // blue
  },
  customerMarker: {
    backgroundColor: 'green', // green
  },

  markerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
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
});

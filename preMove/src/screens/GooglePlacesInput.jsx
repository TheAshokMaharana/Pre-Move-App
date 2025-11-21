// GooglePlacesAutocompleteInput.jsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const GooglePlacesInput = ({ apiKey }) => {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const debounceRef = useRef(null);

  // --- Fetch autocomplete predictions ---
  const fetchPredictions = async (text) => {
    if (text.length < 3) {
      setPredictions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&key=${apiKey}&components=country:in`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        setPredictions(data.predictions);
      } else {
        setPredictions([]);
        console.warn('Places Autocomplete Error:', data.status);
      }
    } catch (err) {
      console.error('Places Autocomplete Error:', err);
      setPredictions([]);
    }
  };

  // --- Fetch place details for lat/lng ---
  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const loc = data.result.geometry.location;
        setSelectedLocation({
          lat: loc.lat,
          lng: loc.lng,
          address: data.result.formatted_address,
        });
        setQuery(data.result.formatted_address);
        setPredictions([]);
      } else {
        console.warn('Place Details Error:', data.status);
      }
    } catch (err) {
      console.error('Place Details Error:', err);
    }
  };

  const handleChangeText = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPredictions(text);
    }, 500); // debounce for 500ms
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginVertical: 10, zIndex: 999 }}>
        <TextInput
          value={query}
          onChangeText={handleChangeText}
          placeholder="Search address"
          style={styles.input}
        />

        {predictions.length > 0 && (
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => fetchPlaceDetails(item.place_id)}
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
            style={styles.list}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        {selectedLocation && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: selectedLocation.lat,
              longitude: selectedLocation.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
              }}
              title="Selected Location"
              description={selectedLocation.address}
            />
          </MapView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  list: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 2,
    maxHeight: 200,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  map: {
    width: Dimensions.get('window').width,
    flex: 1,
  },
});

export default GooglePlacesInput;

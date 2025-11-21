import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  Switch,
  StatusBar,
  Dimensions,
  Text as RNText,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '../theme/colors';
import { RelocRequestScreenCss } from '../assets/css/ScreensCss';
import GradientText from '../components/GradientText';
import { useNavigation } from '@react-navigation/native';
import GradientBackground from '../components/GradientBackground';
import { api } from '../utils/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const RelocRequest = ({ apiKey }) => {
  console.log('api key', apiKey);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    moveType: '',
    fromAddress: '',
    toAddress: '',
    moveDate: new Date(),
    movingFromFloorNo: '',
    movingToFloorNo: '',
    movingFromServiceLift: 0,
    movingToServiceLift: 0,
    movingFromLat: null,
    movingFromLng: null,
    movingToLat: null,
    movingToLng: null,
    distance: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();
  const [homeTypes, setHomeTypes] = useState([]);
  const [selectedHomeType, setSelectedHomeType] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [fromQuery, setFromQuery] = useState('');
  const [fromPredictions, setFromPredictions] = useState([]);
  const [fromLocation, setFromLocation] = useState(null);
  const [toQuery, setToQuery] = useState('');
  const [toPredictions, setToPredictions] = useState([]);
  const [toLocation, setToLocation] = useState(null);
  const [moveTypeVisible, setMoveTypeVisible] = useState(false);
  const moveTypeOptions = ['Intercity', 'Within City'];
  const cities = ['Pune', 'Hyderabad', 'Gurgaon', 'Noida', 'Delhi', 'Bangalore'];
  const [cityDropdownVisible, setCityDropdownVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const debounceRef = useRef(null);
  const [autoCity, setAutoCity] = useState('');
  const [distanceText, setDistanceText] = useState('');
  const [durationText, setDurationText] = useState('');

  const cityCoordinates = {
    Pune: { lat: 18.5204, lng: 73.8567 },
    Hyderabad: { lat: 17.385, lng: 78.4867 },
    Gurgaon: { lat: 28.4595, lng: 77.0266 },
    Noida: { lat: 28.5355, lng: 77.391 },
    Delhi: { lat: 28.6139, lng: 77.209 },
    Bangalore: { lat: 12.9716, lng: 77.5946 },
  };

  const fetchPredictions = async (text, type) => {
    if (text.length < 3) {
      if (type === 'from') setFromPredictions([]);
      if (type === 'to') setToPredictions([]);
      return;
    }

    try {
      let locationParam = '';
      const selectedCityCoords = cityCoordinates[selectedCity];
      if (selectedCityCoords) {
        const { lat, lng } = selectedCityCoords;
        locationParam = `&location=${lat},${lng}&radius=30000`;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text,
        )}&key=${apiKey}&components=country:in${locationParam}`,
      );

      const data = await response.json();
      if (data.status === 'OK') {
        if (type === 'from') setFromPredictions(data.predictions);
        if (type === 'to') setToPredictions(data.predictions);
      } else {
        console.warn('Places Autocomplete Error:', data.status);
      }
    } catch (err) {
      console.error('Places Autocomplete Error:', err);
    }
  };

  const fetchPlaceDetails = async (placeId, type) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`,
      );
      const data = await response.json();

      if (data.status === 'OK') {
        const loc = data.result.geometry.location;
        const address = data.result.formatted_address;
        let cityName = '';
        const components = data.result.address_components;
        for (let i = 0; i < components.length; i++) {
          if (
            components[i].types.includes('locality') ||
            components[i].types.includes('administrative_area_level_2')
          ) {
            cityName = components[i].long_name;
            break;
          }
        }

        if (type === 'from') {
          handleChange('fromAddress', address);
          handleChange('movingFromLat', loc.lat);
          handleChange('movingFromLng', loc.lng);
          setFromPredictions([]);
          setAutoCity(cityName);
        }

        if (type === 'to') {
          handleChange('toAddress', address);
          handleChange('movingToLat', loc.lat);
          handleChange('movingToLng', loc.lng);
          setToPredictions([]);
        }

        if (
          (type === 'from' && form.movingToLat && form.movingToLng) ||
          (type === 'to' && form.movingFromLat && form.movingFromLng)
        ) {
          const fromLat = type === 'from' ? loc.lat : form.movingFromLat;
          const fromLng = type === 'from' ? loc.lng : form.movingFromLng;
          const toLat = type === 'to' ? loc.lat : form.movingToLat;
          const toLng = type === 'to' ? loc.lng : form.movingToLng;

          calculateDistance(fromLat, fromLng, toLat, toLng);
        }
      } else {
        console.warn('Place Details Error:', data.status);
      }
    } catch (err) {
      console.error('Place Details Error:', err);
    }
  };

  const calculateDistance = async (fromLat, fromLng, toLat, toLng) => {
    console.log('from lat details', fromLat, fromLng, toLat, toLng);
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${fromLat},${fromLng}&destinations=${toLat},${toLng}&key=${apiKey}`;
      const res = await axios.get(url);
      const data = res.data;

      if (data.rows?.length > 0 && data.rows[0].elements[0].status === 'OK') {
        const distance = data.rows[0].elements[0].distance.text;
        const duration = data.rows[0].elements[0].duration.text;

        setDistanceText(distance);
        setDurationText(duration);
        handleChange('distance', distance);

        console.log('✅ Distance:', distance, '| Duration:', duration);
      } else {
        console.warn('Distance API returned no result.');
      }
    } catch (err) {
      console.error('Distance API Error:', err);
    }
  };

  const handleDebouncedChange = (text, type) => {
    handleChange(type === 'from' ? 'fromAddress' : 'toAddress', text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPredictions(text, type);
    }, 400);
  };

  const handleChangeText = text => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPredictions(text);
    }, 500);
  };

  useEffect(() => {
    const fetchHomeTypes = async () => {
      try {
        const res = await api.get('home-types');
        if (res.data.success) setHomeTypes(res.data.data);
      } catch (err) {
        console.error('Error fetching home types:', err);
      }
    };
    fetchHomeTypes();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const phone = await AsyncStorage.getItem('USER_PHONE');
        if (phone) {
          const { data } = await api.get(`profile/${phone}`);
          setForm(prev => ({
            ...prev,
            fullName: data.full_name || '',
            email: data.customer_email || '',
            phone: data.customer_mobile_no || phone,
          }));
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        showFeedback('Failed to fetch profile', 'error');
      }
    };
    loadUser();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || form.moveDate;
    setShowDatePicker(Platform.OS === 'ios');
    handleChange('moveDate', currentDate);
  };

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
    setFeedbackModalVisible(true);
  };

  const validateForm = () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.moveType ||
      !form.fromAddress ||
      !form.toAddress ||
      !form.moveDate ||
      !selectedHomeType
    ) {
      showFeedback('Please fill all the fields', 'error');
      return false;
    }
    if (!autoCity) {
      showFeedback('City could not be detected from address', 'error');
      return false;
    }
    return true;
  };

  const submitRequest = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        cust_name: form.fullName,
        cust_email: form.email,
        cust_mobile: form.phone,
        moving_type: form.moveType,
        moving_from: `${form.fromAddress}, ${autoCity}`,
        moving_to: form.toAddress,
        moving_date: form.moveDate.toISOString().split('T')[0],
        home_type_id: selectedHomeType,
        city_name: autoCity,
        movingFromLat: form.movingFromLat,
        movingFromLng: form.movingFromLng,
        movingToLat: form.movingToLat,
        movingToLng: form.movingToLng,
        m_movetotal_distance: form.distance,
      };

      console.log('Payload being sent:', payload);

      const res = await api.post('create-lead', payload);

      if (res.data.success) {
        setForm(prev => ({
          ...prev,
          moveType: '',
          fromAddress: '',
          toAddress: '',
          moveDate: new Date(),
          movingFromFloorNo: '',
          movingToFloorNo: '',
          movingFromServiceLift: 0,
          movingToServiceLift: 0,
          distance: '',
        }));
        setSelectedCity(null);
        setSelectedHomeType(null);
        setAutoCity('');
        showFeedback('Relocation request submitted!', 'success');
        navigation.navigate('AddItem', { lead_id: res.data.lead_id });
      } else {
        showFeedback(res.data.message || 'Something went wrong', 'error');
      }
    } catch (err) {
      console.error('Submit Request Error:', err);
      showFeedback('Failed to submit request', 'error');
    }
  };

  return (
    <KeyboardAwareScrollView
      style={RelocRequestScreenCss.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <GradientText
        text="Relocation Request"
        style={RelocRequestScreenCss.title}
      />
      <View style={RelocRequestScreenCss.form}>
        {/* User Info */}
        {['fullName', 'email', 'phone'].map(field => (
          <View key={field}>
            <Text style={RelocRequestScreenCss.label}>
              {field === 'fullName'
                ? 'Full Name'
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </Text>
            <TextInput
              style={[
                RelocRequestScreenCss.input,
                { backgroundColor: '#f0f0f0', fontSize: 16 },
              ]}
              value={form[field]}
              editable={false}
            />
          </View>
        ))}

        {/* Move Type */}
        <Text style={RelocRequestScreenCss.label}>Select Move Type</Text>
        <TouchableOpacity
          style={RelocRequestScreenCss.input}
          onPress={() => setMoveTypeVisible(true)}
        >
          <Text
            style={{ color: form.moveType ? '#000' : '#aaa', fontSize: 16 }}
          >
            {form.moveType || 'Select Move Type'}
          </Text>
        </TouchableOpacity>
        <Modal visible={moveTypeVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: '#00000099',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                margin: 20,
                borderRadius: 10,
                padding: 20,
                maxHeight: 300,
              }}
            >
              <ScrollView
                style={{ maxHeight: 200 }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {moveTypeOptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      handleChange('moveType', item);
                      setMoveTypeVisible(false);
                    }}
                  >
                    <Text style={{ padding: 15 }}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: 'flex-end' }}
                onPress={() => setMoveTypeVisible(false)}
              >
                <Text style={{ color: 'red' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Auto-detected City */}
        <Text style={RelocRequestScreenCss.label}>City</Text>
        <TextInput
          style={[
            RelocRequestScreenCss.input,
            { color: autoCity ? '#000' : '#aaa' },
          ]}
          value={autoCity || ''}
          editable={false}
          placeholder="City will auto-fill from address"
        />

        {/* From + To address fields */}
        <View>
          {[
            {
              label: 'Moving From Address',
              field: 'fromAddress',
              floorNo: 'movingFromFloorNo',
              serviceLift: 'movingFromServiceLift',
              floorLabel: 'Loading Floor No',
              predictions: fromPredictions,
              type: 'from',
            },
            {
              label: 'Moving To Address',
              field: 'toAddress',
              floorNo: 'movingToFloorNo',
              serviceLift: 'movingToServiceLift',
              floorLabel: 'Unloading Floor No',
              predictions: toPredictions,
              type: 'to',
            },
          ].map((item, idx) => (
            <View key={idx} style={{ marginBottom: 20 }}>
              <RNText style={RelocRequestScreenCss.label}>{item.label}</RNText>
              <TextInput
                style={[
                  RelocRequestScreenCss.input,
                  { fontSize: 16, height: 80, textAlignVertical: 'top' },
                ]}
                multiline
                placeholderTextColor={colors.muted}
                placeholder="Enter full address"
                value={form[item.field] || ''}
                onChangeText={text => handleDebouncedChange(text, item.type)}
              />

              {/* Predictions list */}
              {item.predictions.length > 0 && (
                <ScrollView
                  style={[styles.list, { maxHeight: 200 }]}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {item.predictions.map(prediction => (
                    <TouchableOpacity
                      key={prediction.place_id}
                      style={styles.item}
                      onPress={() =>
                        fetchPlaceDetails(prediction.place_id, item.type)
                      }
                    >
                      <RNText>{prediction.description}</RNText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <RNText style={RelocRequestScreenCss.label}>
                {item.floorLabel}
              </RNText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[
                    RelocRequestScreenCss.input,
                    { flex: 1, fontSize: 16 },
                  ]}
                  placeholder="Enter floor no"
                  keyboardType="numeric"
                  value={form[item.floorNo] || ''}
                  onChangeText={text => handleChange(item.floorNo, text)}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 10,
                  }}
                >
                  <RNText style={{ marginRight: 6 }}>Service Lift</RNText>
                  <Switch
                    value={form[item.serviceLift] === 1}
                    onValueChange={val =>
                      handleChange(item.serviceLift, val ? 1 : 0)
                    }
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {distanceText ? (
          <View style={styles.distanceBox}>
            <Text style={styles.distanceText}>
              Distance: {distanceText} | Duration: {durationText}
            </Text>
          </View>
        ) : (
          <Text style={{ marginVertical: 10 }}>null</Text>
        )}

        {/* Moving Date */}
        <Text style={RelocRequestScreenCss.label}>Moving Date</Text>
        <TouchableOpacity
          style={RelocRequestScreenCss.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={{ color: form.moveDate ? '#000' : '#aaa', fontSize: 16 }}
          >
            {form.moveDate
              ? form.moveDate.toDateString()
              : 'Select moving date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.moveDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {/* Home Size */}
        <Text style={RelocRequestScreenCss.label}>Home Size</Text>
        <TouchableOpacity
          style={RelocRequestScreenCss.input}
          onPress={() => setDropdownVisible(true)}
        >
          <Text
            style={{ color: selectedHomeType ? '#000' : '#aaa', fontSize: 16 }}
          >
            {selectedHomeType
              ? homeTypes.find(ht => ht.id === selectedHomeType)?.Home_size
              : 'Select Home Size'}
          </Text>
        </TouchableOpacity>
        <Modal visible={dropdownVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: '#00000025',
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                margin: 20,
                borderRadius: 10,
                padding: 20,
                maxHeight: 300,
              }}
            >
              <ScrollView
                style={{ maxHeight: 200 }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {homeTypes.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setSelectedHomeType(item.id);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={{ padding: 15 }}>{item.Home_size}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={{ marginTop: 10, alignSelf: 'flex-end' }}
                onPress={() => setDropdownVisible(false)}
              >
                <Text style={{ color: 'red' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Submit */}
        <TouchableOpacity onPress={() => setConfirmModalVisible(true)}>
          <GradientBackground style={RelocRequestScreenCss.button}>
            <Text style={RelocRequestScreenCss.buttonText}>Submit Request</Text>
          </GradientBackground>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000050',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              width: '85%',
            }}
          >
            <Text
              style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}
            >
              Are you sure you want to submit this request?
            </Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-around' }}
            >
              <TouchableOpacity
                onPress={() => {
                  setConfirmModalVisible(false);
                  submitRequest();
                }}
                style={{ paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Text
                  style={{ color: 'green', fontSize: 16, fontWeight: 'bold' }}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ paddingHorizontal: 20, paddingVertical: 10 }}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text
                  style={{ color: 'red', fontSize: 16, fontWeight: 'bold' }}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={feedbackModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000050',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              minWidth: '70%',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 20,
                color: feedbackType === 'success' ? 'green' : 'red',
              }}
            >
              {feedbackMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setFeedbackModalVisible(false)}
              style={{ alignSelf: 'center', marginTop: 10 }}
            >
              <Text style={{ color: '#2196F3', fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
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
    marginBottom: 10,
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
  distanceBox: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginVertical: 10,
  },
  distanceText: {
    fontSize: 16,
    color: '#333',
  },
  map: {
    width: Dimensions.get('window').width,
    height: 200,
  },
});

export default RelocRequest;
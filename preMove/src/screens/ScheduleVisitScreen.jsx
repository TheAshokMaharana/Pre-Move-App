import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../utils/baseurl';
import colors from '../theme/colors';
import Header from '../components/Header';
import { LockClosedIcon } from 'react-native-heroicons/outline';
import { XCircleIcon } from 'react-native-heroicons/solid';

export default function ScheduleVisitScreen({ route, navigation }) {
  const { customer } = route.params;

  if (!customer) {
    Alert.alert('Error', 'Customer data not found');
    navigation.goBack();
    return null;
  }

  const [loading, setLoading] = useState(true);
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [timeFrom, setTimeFrom] = useState(new Date());
  const [timeTo, setTimeTo] = useState(new Date());
  const [existingRequest, setExistingRequest] = useState(null);
  const [managerId, setManagerId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeFromPicker, setShowTimeFromPicker] = useState(false);
  const [showTimeToPicker, setShowTimeToPicker] = useState(false);

  const isCompleted = existingRequest?.status === 'complete';

  // ✅ Check existing visit on mount
  useEffect(() => {
    const fetchExistingVisit = async () => {
      console.log(customer.id, 'front end lead id ');
      try {
        const res = await api.post('/check-visit', { lead_id: customer.id });
        if (res.data.success && res.data.existingRequest) {
          const req = res.data.existingRequest;
          setExistingRequest(req);
          setScheduleDate(new Date(req.schedule_date));
          setTimeFrom(new Date(`1970-01-01T${req.time_from}`));
          setTimeTo(new Date(`1970-01-01T${req.time_to}`));
          setManagerId(res.data.manager_id);
        }
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to fetch existing visit');
      } finally {
        setLoading(false);
      }
    };
    fetchExistingVisit();
  }, [customer.id]);

  const formatDate = date =>
    date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  const formatTime = date =>
    date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  const saveVisit = async () => {
    const payload = {
      lead_id: customer.id,
      schedule_date: scheduleDate.toISOString().split('T')[0],
      time_from: timeFrom.toTimeString().split(' ')[0],
      time_to: timeTo.toTimeString().split(' ')[0],
    };

    const missing = Object.entries(payload).filter(([_, val]) => !val);
    if (missing.length) {
      return Alert.alert(
        'Error',
        `Missing fields: ${missing.map(([k]) => k).join(', ')}`,
      );
    }

    try {
      const res = await api.post('/schedule-visite', payload);
      if (res.data.success) {
        Alert.alert('✅ Success', res.data.message);
        setExistingRequest(res.data.newRequest);
        setManagerId(res.data.manager_id);
      } else {
        Alert.alert('❌ Error', res.data.message || 'Failed to schedule visit');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌ Error', 'Failed to schedule visit');
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );

  return (
    <>
      <Header />
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Schedule Visit</Text>

        {existingRequest ? (
          <>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>
                  Time From
                </Text>
                <Text style={[styles.tableCell, styles.headerCell]}>
                  Time To
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {formatDate(new Date(existingRequest.schedule_date))}
                </Text>
                <Text style={styles.tableCell}>
                  {formatTime(
                    new Date(`1970-01-01T${existingRequest.time_from}`),
                  )}
                </Text>
                <Text style={styles.tableCell}>
                  {formatTime(
                    new Date(`1970-01-01T${existingRequest.time_to}`),
                  )}
                </Text>
              </View>
            </View>

            {managerId && !isCompleted && (
              <TouchableOpacity
                style={[styles.saveBtn, { marginTop: 20 }]}
                onPress={() => {
                  if (existingRequest.status === 'started') {
                    // Navigate only if manager has started inspection
                    navigation.navigate('CustomerTrackingScreen', {
                      visitRequestId: existingRequest.id,
                    });
                  } else {
                    // Otherwise show alert
                    Alert.alert(
                      '⚠️ Manager not started',
                      'Manager has not started the inspection yet.',
                    );
                  }
                }}
              >
                <Text style={styles.btnText}>📍 Track Manager Location</Text>
              </TouchableOpacity>
            )}

            {isCompleted && (
              <View style={{ marginTop: 20, alignItems: 'center' }}>
                <LockClosedIcon color="green" size={50} />
                <Text style={{ fontSize: 16, marginTop: 10, color: 'green' }}>
                  ✅ Inspection Completed
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label}>Select Date:</Text>
            <TouchableOpacity
              style={styles.inputBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>{formatDate(scheduleDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={scheduleDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, selected) => {
                  if (selected) setScheduleDate(selected);
                  if (Platform.OS === 'android') setShowDatePicker(false);
                }}
              />
            )}

            <Text style={styles.label}>Time From:</Text>
            <TouchableOpacity
              style={styles.inputBtn}
              onPress={() => setShowTimeFromPicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(timeFrom)}</Text>
            </TouchableOpacity>
            {showTimeFromPicker && (
              <DateTimePicker
                value={timeFrom}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, selected) => {
                  if (selected) setTimeFrom(selected);
                  if (Platform.OS === 'android') setShowTimeFromPicker(false);
                }}
              />
            )}

            <Text style={styles.label}>Time To:</Text>
            <TouchableOpacity
              style={styles.inputBtn}
              onPress={() => setShowTimeToPicker(true)}
            >
              <Text style={styles.inputText}>{formatTime(timeTo)}</Text>
            </TouchableOpacity>
            {showTimeToPicker && (
              <DateTimePicker
                value={timeTo}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e, selected) => {
                  if (selected) setTimeTo(selected);
                  if (Platform.OS === 'android') setShowTimeToPicker(false);
                }}
              />
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={saveVisit}>
              <Text style={styles.btnText}>Save Visit</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    color: colors.primary,
    textAlign: 'center',
  },
  label: { marginBottom: 5, fontWeight: '600', fontSize: 14 },
  inputBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputText: { fontSize: 16 },
  saveBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.primary,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  table: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  tableRow: { flexDirection: 'row' },
  tableCell: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  headerCell: { fontWeight: 'bold', backgroundColor: '#eee' },
});

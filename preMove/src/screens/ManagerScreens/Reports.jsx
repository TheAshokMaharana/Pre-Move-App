import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import GradientText from '../../components/GradientText';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';

import AsyncStorage from '@react-native-async-storage/async-storage';
export default function ManagerVisitRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // const navigation = useNavigation();
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      if (initialLoading) setLoading(true);

      // 🔑 Manager ID from session (AsyncStorage)
      // const managerId = await AsyncStorage.getItem('managerId');
      const managerId = await AsyncStorage.getItem('USER_ID');
      console.log(managerId, 'managsader id');
      if (!managerId) {
        console.warn('No managerId found in session');
        return;
      }

      const res = await api.get(
        `/manager/visit-requests?managerId=${managerId}`,
      );

      if (res.data?.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const truncateWords = (text, limit) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + ' ...';
  };

  const ListHeader = ({ item }) => {
    if (!item) return null; // safety if data is empty

    const firstName = item.cust_name ? item.cust_name.split(' ')[0] : '';

    return (
      <View>
        <GradientText
          text={`Visiting REQ`}
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#222',
            textAlign: 'center',
            marginBottom: 20,
          }}
        />
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <>
      <View style={styles.card}>
        {/* From -> To Row */}
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'pending'
                    ? '#ff2626ff' // orange for pending
                    : item.status === 'started'
                    ? '#42A5F5' // blue for started
                    : '#66BB6A', // green for completed or others
              },
            ]}
          >
            {item.status ? item.status.toUpperCase() : 'UNKNOWN'}
          </Text>
        </View>
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>FROM</Text>
            <Text
              style={[
                styles.value,
                {
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  width: 100,
                  flexWrap: 'nowrap',
                  width: 100,
                },
              ]}
            >
              {truncateWords(item.moving_from, 2)}
            </Text>
          </View>
          <Text style={styles.arrow}>⇄</Text>
          <View>
            <Text style={styles.label}>TO</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.value,
                {
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  width: 100,
                },
              ]}
            >
              {truncateWords(item.moving_to, 2)}
            </Text>
          </View>
        </View>

        {/* Travel Date + Service Type */}
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>TRAVEL DATE</Text>
            <Text style={styles.value}>
              {new Date(item.schedule_date).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.label}>MOVING TYPE</Text>
            <Text style={[styles.value, { fontWeight: '600' }]}>
              {item.moving_type}
            </Text>
          </View>
        </View>

        {/* Inventory + Action */}
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>INVENTORY</Text>
            <Text style={styles.value}>{item.inventory_count} Items</Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 5,
              marginTop: 10,
            }}
            onPress={() =>
              navigation.navigate('CustomerInventoryScreen', {
                customerId: item.lead_id,
              })
            }
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ marginTop: 50 }}
      />
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={item => item.visit_id.toString()}
      ListHeaderComponent={() => (
        <ListHeader item={requests[0]} /> // 👈 yaha manually pass karna padega
      )}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
      refreshing={loading} // Pull to refresh loading state
      onRefresh={fetchRequests} // Trigger fetch again on pull
      ListEmptyComponent={() => (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
          }}
        >
          <Text style={{ fontSize: 16, color: '#555' }}>
            No customer request to visit
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FBFD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E3E7ED',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8A8A8A',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#666',
    marginHorizontal: 10,
  },
  quotationBtn: {
    backgroundColor: '#28C76F',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  gradientTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
});

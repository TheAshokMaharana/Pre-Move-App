import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/solid';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 20;

export default function Dashboard({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Date filter states
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCustomers(customers);
    } else {
      const query = search.toLowerCase();
      const filtered = customers.filter(
        cust =>
          cust.cust_name?.toLowerCase().includes(query) ||
          cust.city_name?.toLowerCase().includes(query) ||
          cust.cust_mobile?.includes(search),
      );
      setFilteredCustomers(filtered);
    }
  }, [search, customers]);

  // const fetchCustomers = async (isRefresh = false) => {
  //   try {
  //     if (!isRefresh) setLoading(true);
  //     else setRefreshing(true);

  //     const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
  //     if (!rawJwt) return;

  //     const { token } = JSON.parse(rawJwt);

  //     // Params for API
  //     let params = { spanco: 's' };
  //     if (dateFrom && dateTo) {
  //       params.date_from = dateFrom.toISOString().split('T')[0];
  //       params.date_to = dateTo.toISOString().split('T')[0];
  //     }

  //     const res = await api.get('/manager/dashboard/customers', {
  //       headers: { Authorization: `Bearer ${token}` },
  //       params,
  //     });

  //     // pura response dekhna ho:
  //     console.log('Full Response:', res);

  //     // sirf customers list dekhna ho:
  //     const list = res.data?.customers || [];
  //     console.log('Customers List:', list);

  //     // agar length bhi dekhna ho:
  //     console.log('Total Customers:', list.length);

  //     setCustomers(list);
  //     setFilteredCustomers(list);
  //   } catch (err) {
  //     console.error('Fetch error:', err);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const fetchCustomers = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
      const rawRole = await AsyncStorage.getItem('USER_ROLE'); // new: role
      if (!rawJwt) return;

      const { token } = JSON.parse(rawJwt);
      const userRole = rawRole || 'Manager'; // default

      // Params for API
      let params = {};
      if (userRole !== 'Head_Manager') {
        // Only assign spanco for regular managers
        params.spanco = 's'; // replace with actual manager spanco
      }

      if (dateFrom && dateTo) {
        params.date_from = dateFrom.toISOString().split('T')[0];
        params.date_to = dateTo.toISOString().split('T')[0];
      }

      const res = await api.get('/manager/dashboard/customers', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const list = res.data?.customers || [];
      setCustomers(list);
      setFilteredCustomers(list);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderCustomer = ({ item: customer }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 20, alignSelf: 'center' }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('CustomerInventoryScreen', {
            customerId: customer.id,
          })
        }
        style={{
          borderRadius: 12,
          backgroundColor: '#fff',
          padding: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          // elevation: 4,
        }}
      >
        {/* FROM → TO */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
            paddingHorizontal: 5,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: '#888' }}>FROM</Text>
            <Text
              style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}
              numberOfLines={1} // <-- limit to 1 line
              ellipsizeMode="tail" // <-- add "..." at the end
            >
              {customer.moving_from || '—'}
            </Text>
          </View>

          <ArrowRightIcon size={18} color={colors.primary} />

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: '#888' }}>TO</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333',
                textAlign: 'right',
              }}
              numberOfLines={1} // <-- limit to 1 line
              ellipsizeMode="tail" // <-- add "..." at the end
            >
              {customer.moving_to || '—'}
            </Text>
          </View>
        </View>

        {/* DATE + SERVICE TYPE */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: '#888' }}>TRAVEL DATE</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
              {customer.created_date
                ? new Date(customer.created_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '--'}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 12, color: '#888' }}>SERVICE TYPE</Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
              {customer.moving_type || '--'}
            </Text>
          </View>
        </View>

        {/* PRICE */}
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 12, color: '#888' }}>Price (TOTAL)</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333' }}>
            {customer.ele_quotation_for_customer || '--'}
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={() =>
            navigation.navigate('CustomerInventoryScreen', {
              customerId: customer.id,
            })
          }
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            View Details
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: '#f5f7fa' }}>
      {/* Search */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 15,
          backgroundColor: '#fff',
          borderRadius: 25,
          paddingHorizontal: 15,
          paddingVertical: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        }}
      >
        <MagnifyingGlassIcon size={22} color="#555" />
        <TextInput
          placeholder="Search customers..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#333' }}
        />
      </View>

      {/* Date Filter */}
      <View style={{ flexDirection: 'row', marginBottom: 10, gap: 10 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
          }}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={{ color: '#333' }}>
            {dateFrom ? dateFrom.toDateString() : 'From Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
          }}
          onPress={() => setShowToPicker(true)}
        >
          <Text style={{ color: '#333' }}>
            {dateTo ? dateTo.toDateString() : 'To Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 15,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => fetchCustomers()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={dateFrom || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, selected) => {
            setShowFromPicker(false);
            if (selected) setDateFrom(selected);
          }}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={dateTo || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, selected) => {
            setShowToPicker(false);
            if (selected) setDateTo(selected);
          }}
        />
      )}

      {/* Loader */}
      {loading && !refreshing && (
        <ActivityIndicator size="large" color={colors.primary} />
      )}

      {/* Customers List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={refreshing}
        onRefresh={() => fetchCustomers(true)}
        ListEmptyComponent={
          !loading && (
            <Text
              style={{
                textAlign: 'center',
                marginTop: 50,
                color: '#888',
                fontSize: 16,
              }}
            >
              No customers found
            </Text>
          )
        }
      />
    </View>
  );
}

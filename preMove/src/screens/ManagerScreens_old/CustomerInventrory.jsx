import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/baseurl';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  MapPinIcon,
} from 'react-native-heroicons/solid';
import { ArrowRightIcon } from 'react-native-heroicons/outline';
import colors from '../../theme/colors';

const { width } = Dimensions.get('window');

// We don't need CARD_WIDTH anymore since it's a single-column layout.
// const CARD_WIDTH = width / 2 - 20;

export default function CustomerInventory({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchCustomers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
      if (!rawJwt) return console.log('❌ Missing token');
      const { token } = JSON.parse(rawJwt);

      const res = await api.get('/manager/customers', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit: 10, search },
      });

      if (pageNum === 1) setCustomers(res.data.customers);
      else setCustomers(prev => [...prev, ...res.data.customers]);

      setTotal(res.data.total);
      setPage(pageNum);
    } catch (err) {
      console.error('❌ Error fetching manager customers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1);
  }, [search]);

  const loadMore = () => {
    if (customers.length < total && !loading) {
      fetchCustomers(page + 1);
    }
  };

  const filteredCustomers = customers.filter(cust =>
    cust.cust_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f5f7', padding: 10 }}>
      {/* Search Bar - No change needed here, it already looks good. */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
          backgroundColor: '#fff',
          borderRadius: 15,
          paddingHorizontal: 15,
          paddingVertical: 8,
          // Using a slight shadow to lift the search bar
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <MagnifyingGlassIcon size={22} color="#555" />
        <TextInput
          placeholder="Search customers..."
          value={search}
          placeholderTextColor={colors.muted}
          onChangeText={setSearch}
          style={{ flex: 1, marginLeft: 10, fontSize: 16, color: '#333' }}
        />
      </View>

      {loading && <ActivityIndicator size="large" color={colors.primary} />}

      <ScrollView
        contentContainerStyle={styles.container}
        onScroll={({ nativeEvent }) => {
          if (
            nativeEvent.contentOffset.y +
              nativeEvent.layoutMeasurement.height >=
            nativeEvent.contentSize.height - 20
          ) {
            loadMore();
          }
        }}
      >
        {filteredCustomers.map(customer => {
          const scaleAnim = new Animated.Value(1);
          const onPressIn = () =>
            Animated.spring(scaleAnim, {
              toValue: 0.98,
              useNativeDriver: true,
            }).start();
          const onPressOut = () =>
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 4,
              useNativeDriver: true,
            }).start();

          return (
            <Animated.View
              key={customer.id}
              style={[
                styles.cardContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={() =>
                  navigation.navigate('CustomerInventoryScreen', {
                    customerId: customer.id,
                  })
                }
                style={styles.card}
              >
                {/* Top Section - From/To Info */}
                <View style={styles.topSection}>
                  <View style={styles.locationBlock}>
                    <Text style={styles.locationLabel}>FROM</Text>
                    <Text style={styles.locationText}>
                      {customer.moving_from}
                    </Text>
                  </View>
                  <ArrowRightIcon
                    size={24}
                    color={colors.primary}
                    style={{ marginHorizontal: 10 }}
                  />
                  <View style={styles.locationBlock}>
                    <Text style={styles.locationLabel}>TO</Text>
                    <Text style={styles.locationText}>
                      {customer.moving_to}
                    </Text>
                    {/* Using the same city for destination as a placeholder */}
                  </View>
                </View>

                {/* Separator Line */}
                <View style={styles.separator} />

                {/* Middle Section - Details */}
                <View style={styles.detailsSection}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>CUSTOMER NAME</Text>
                    <Text style={styles.detailValue}>{customer.cust_name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>MOBILE</Text>
                    <Text style={styles.detailValue}>
                      {customer.cust_mobile}
                    </Text>
                  </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() =>
                    navigation.navigate('CustomerInventoryScreen', {
                      customerId: customer.id,
                    })
                  }
                >
                  <Text style={styles.viewDetailsButtonText}>
                    View Inventory
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    // Change flexWrap to a single column
    flexDirection: 'column',
  },
  cardContainer: {
    width: '100%',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // elevation: 3,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  locationBlock: {
    alignItems: 'center',
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  detailsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  viewDetailsButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

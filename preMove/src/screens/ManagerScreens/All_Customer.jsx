import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import GradientText from '../../components/GradientText';
import debounce from 'lodash.debounce';
import {
  ArrowDownRightIcon,
  ArrowRightIcon,
  UserCircleIcon,
} from 'react-native-heroicons/outline';

export default function Dashboard({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomers(1, search);
  }, []);

  const fetchCustomers = async (pageNumber, searchQuery = '') => {
    try {
      if (!refreshing) setLoading(true);

      const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
      if (!rawJwt) return;
      const { token } = JSON.parse(rawJwt);

      const res = await api.get(
        `/manager/customers?page=${pageNumber}&limit=5&search=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (pageNumber === 1) {
        setCustomers(res.data.customers);
      } else {
        setCustomers(prev => [...prev, ...res.data.customers]);
      }

      setPage(pageNumber);
      const total = res.data.total;
      setHasMore(pageNumber * 5 < total);
    } catch (err) {
      console.error('Fetch customers error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = useCallback(
    debounce(text => {
      setPage(1);
      setHasMore(true);
      fetchCustomers(1, text);
    }, 500),
    [],
  );

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchCustomers(1, search);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      <GradientText text="Customers" style={styles.heading} />

      <TextInput
        style={styles.searchInput}
        placeholder="Search customers..."
        value={search}
        placeholderTextColor={colors.muted}
        onChangeText={text => {
          setSearch(text);
          handleSearch(text);
        }}
      />

      {customers.length === 0 && !loading ? (
        <Text style={styles.noDataText}>No customers found</Text>
      ) : (
        customers.map(cust => (
          <View key={cust.customer_mobile_no} style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.profileRow}>
                {/* <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png' }}
                  style={styles.avatar}
                /> */}
                <View style={styles.user}>
                  <UserCircleIcon  size={50} color={colors.primary} style={{fontSize:20}} />
                </View>

                <Text style={styles.cardTitle}>{cust.full_name}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Leads: {cust.total_leads}</Text>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>📧 {cust.customer_email}</Text>
              <Text style={styles.infoText}>📞 {cust.customer_mobile_no}</Text>

              {/* Circular View Leads Button */}
              <TouchableOpacity
                style={styles.viewLeadsCircle}
                onPress={() =>
                  navigation.navigate('CustomerLeadsScreen', {
                    mobile: cust.customer_mobile_no,
                    name: cust.full_name,
                  })
                }
              >
                <ArrowRightIcon name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {loading && <ActivityIndicator size="large" color={colors.primary} />}

      {hasMore && !loading && customers.length > 0 && (
        <TouchableOpacity
          style={styles.loadMoreBtn}
          onPress={() => fetchCustomers(page + 1, search)}
        >
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f8f9fb' },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
    textAlign: 'center',
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#333' },

  badge: {
    backgroundColor: '#e1fff2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },

  infoBox: {
    backgroundColor: '#f4fff9ff',
    borderRadius: 12,
    padding: 12,
    paddingBottom: 40, // space for circle button
  },
  infoText: { fontSize: 14, color: '#444', marginBottom: 6 },

  viewLeadsCircle: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  loadMoreBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginVertical: 15,
  },
  user:{
    
  },

  loadMoreText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  noDataText: { textAlign: 'center', marginTop: 50, color: '#999' },
});

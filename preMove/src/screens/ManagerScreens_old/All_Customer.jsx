import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import GradientText from '../../components/GradientText';

export default function Dashboard({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomers(1, search, true);
  }, []);

  const fetchCustomers = async (pageNumber, searchQuery = '', reset = false) => {
    try {
      if (!reset) setLoading(true);

      const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
      if (!rawJwt) return;
      const { token } = JSON.parse(rawJwt);

      const res = await api.get(
        `/manager/customers?page=${pageNumber}&limit=5&search=${searchQuery}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (pageNumber === 1 || reset) {
        setCustomers(res.data.customers);
      } else {
        setCustomers(prev => [...prev, ...res.data.customers]);
      }

      setPage(pageNumber);
      const total = res.data.total;
      if (pageNumber * 5 >= total) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = text => {
    setSearch(text);
    fetchCustomers(1, text, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers(1, search, true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      onPress={() =>
        navigation.navigate('CustomerLeadsScreen', {
          mobile: item.customer_mobile_no,
          name: item.full_name,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.full_name}</Text>
        <Text style={styles.leadsBadge}>{item.total} Leads</Text>
      </View>
      <Text style={styles.cardText}>{item.customer_email}</Text>
      <Text style={styles.cardText}>{item.customer_mobile_no}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GradientText text="Customers" style={styles.heading} />

      {/* 🔍 Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search customers..."
        value={search}
        placeholderTextColor={colors.muted}
        onChangeText={handleSearch}
      />

      <FlatList
        data={customers}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderItem}
        ListFooterComponent={
          loading && hasMore ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 15 }} />
          ) : null
        }
        onEndReached={() => {
          if (!loading && hasMore) {
            fetchCustomers(page + 1, search);
          }
        }}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor:colors.bg },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 18,
    borderColor: '#ddd',
    marginBottom: 15,
    borderWidth:1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  leadsBadge: {
    backgroundColor: colors.primary,
    color: '#fff',
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 2,
    fontSize: 12,
  },
  cardText: { fontSize: 14, color: '#666', marginTop: 3 },
});

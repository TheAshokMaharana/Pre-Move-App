import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../utils/baseurl';
import { CustomerLeadsCss as styles } from '../assets/css/ScreensCss';
import { useNavigation } from '@react-navigation/native';
import GradientText from '../components/GradientText';
import { RelocRequestScreenCss } from '../assets/css/components';
import colors from '../theme/colors';

const CustomerLeads = () => {
  const navigation = useNavigation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false); // ✅ for pull-to-refresh

  const fetchLeads = async () => {
    try {
      const phone = await AsyncStorage.getItem('USER_PHONE');
      if (!phone) {
        setError('Phone number not found in storage');
        setLoading(false);
        return;
      }

      const res = await api.get(`/customer/leads/${phone}`);
      if (res.data.success) {
        setLeads(res.data.leads);
        setError(null);
      } else {
        setError('No leads found');
      }
    } catch (err) {
      console.error('❌ API Error:', err.response?.data || err.message);
      setError('Error fetching leads');
    } finally {
      setLoading(false);
      setRefreshing(false); // ✅ stop pull-to-refresh loader
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#007bff"
        style={{ marginTop: 20 }}
      />
    );

  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <GradientText text="Customer Leads" style={RelocRequestScreenCss.title} />
      <FlatList
        data={leads}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const noItem = item?.spanco === 's';
          const Inspection = item?.spanco === 'p';
          const qutaion = item?.spanco === 'a';
          const Nago = item?.spanco === 'n';
          const movecompleted = item?.spanco === 'o'; // या true/false flag
          const clouser =
            item?.spanco === 'c' ||
            item?.spanco === 'o' ||
            item?.spanco === 'n'; // या true/false flag

          return (
            <View style={styles.card}>
              {/* 🔔 Wait for Quotation */}
              {noItem && (
                <Text
                  style={{
                    color: 'red',
                    fontWeight: 'bold',
                    marginBottom: 5,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  you don't have inventory
                </Text>
              )}
              {qutaion && (
                <Text
                  style={{
                    color: colors.primaryDark,
                    fontWeight: 'bold',
                    marginBottom: 5,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  wait for Inspection
                </Text>
              )}
              {Nago && (
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: 'bold',
                    marginBottom: 5,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  wait for Qutation
                </Text>
              )}
              {Inspection && (
                <Text
                  style={{
                    color: colors.muted,
                    fontWeight: 'bold',
                    marginBottom: 5,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  WAIT FOR Confirmation
                </Text>
              )}
              {movecompleted && (
                <Text
                  style={{
                    color: colors.primary,
                    fontWeight: 'bold',
                    marginBottom: 5,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  Move Completed
                </Text>
              )}

              {/* From ⇄ To */}
              <View style={styles.rowBetween}>
                <View style={styles.colLeft}>
                  <Text style={styles.label}>FROM</Text>
                  <Text style={styles.city} numberOfLines={1}>
                    {item.moving_from}
                  </Text>
                </View>
                <View style={styles.colCenter}>
                  <Text style={styles.arrow}>⇄</Text>
                </View>
                <View style={styles.colRight}>
                  <Text style={[styles.label, { textAlign: 'right' }]}>TO</Text>
                  <Text
                    style={[styles.city, { textAlign: 'right' }]}
                    numberOfLines={1}
                  >
                    {item.moving_to}
                  </Text>
                </View>
              </View>

              {/* Travel Date & Service Type */}
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.label}>MOVE DATE</Text>
                  <Text style={styles.value}>
                    {new Date(item.moving_date).toLocaleDateString('en-GB')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.label}>Move TYPE</Text>
                  <Text style={styles.value}>{item.moving_type}</Text>
                </View>
              </View>

              {/* Inventory & Button */}
              <View style={styles.rowBetween}>
                <View style={{ flexDirection: 'column', gap: 5 }}>
                  <Text style={styles.label}>
                    INVENTORY:{' '}
                    <Text style={styles.value}>
                      {item.inventory || '0'} Items
                    </Text>
                  </Text>
                  {clouser && (
                    <Text style={styles.label}>
                      QUTATION:
                      <Text style={styles.value}>
                        {' '}
                       ₹ {item.ele_quotation_for_customer || '0'} 
                      </Text>
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.btn,
                    noItem && { backgroundColor: '#fd0000ff' }, // 🔴 Button red if s or p
                    Inspection && { backgroundColor: colors.muted }, // 🔴 Button red if s or p
                    qutaion && { backgroundColor: colors.primaryDark }, // 🔴 Button red if s or p
                    movecompleted && { backgroundColor: colors.primary }, // 🔴 Button red if s or p
                  ]}
                  onPress={() =>
                    navigation.navigate('Inventory', { id: item.id })
                  }
                >
                  <Text style={styles.btnText}>View Inventory</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

export default CustomerLeads;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';

export default function CustomerLeadsScreen({ route, navigation }) {
  const { mobile, name } = route.params;
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
      if (!rawJwt) return;
      const { token } = JSON.parse(rawJwt);

      const res = await api.get(`/manager/customers/${mobile}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLeads(res.data.leads || []);
    } catch (err) {
      console.error('❌ fetchLeads error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const renderLead = ({ item: lead }) => (
    <View
      key={lead.id}
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {/* FROM ⇄ TO */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#555' }}>FROM</Text>
          <Text style={{ fontWeight: 'bold' }}>{lead.moving_from}</Text>
          <Text style={{ color: '#555' }}>{lead.from_city || ''}</Text>
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 5,
          }}
        >
          <Text style={{ fontSize: 18 }}>⇄</Text>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: '#555' }}>TO</Text>
          <Text style={{ fontWeight: 'bold' }}>{lead.moving_to}</Text>
          <Text style={{ color: '#555' }}>{lead.to_city || ''}</Text>
        </View>
      </View>

      {/* Travel Date & Service Type */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View>
          <Text style={{ fontSize: 12, color: '#555' }}>TRAVEL DATE</Text>
          <Text style={{ fontWeight: 'bold' }}>
            {new Date(lead.moving_date).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: '#555' }}>SERVICE TYPE</Text>
          <Text style={{ fontWeight: 'bold' }}>{lead.moving_type}</Text>
        </View>
      </View>

      {/* Inventory & Button */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 14, color: '#555' }}>
          INVENTORY: {lead.inventory_count || ''}
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 5,
          }}
          onPress={() =>
            navigation.navigate('CustomerInventoryScreen', {
              customerId: lead.id,
            })
          }
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Header />
      <View style={{ flex: 1, padding: 15 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 15 }}>
          Leads for {name}
        </Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={leads}
            keyExtractor={item => item.id.toString()}
            renderItem={renderLead}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
                No leads found
              </Text>
            }
          />
        )}
      </View>
    </>
  );
}

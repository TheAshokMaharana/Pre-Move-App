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
import GradientText from '../../components/GradientText';
import BackButton from '../../components/BackButton';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';

export default function CustomerLeadsScreen({ route, navigation }) {
  const { mobile, name } = route.params;
  console.log('mobile numbner:', mobile);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [managerId, setManagerId] = useState(null);

  useEffect(() => {
    loadManagerId();
    fetchLeads();
  }, []);

  const loadManagerId = async () => {
    try {
      const storedId = await AsyncStorage.getItem('USER_ID'); // ✅ yahi manager id hai
      if (storedId) {
        setManagerId(storedId);
        console.log('✅ Manager ID Loaded:', storedId);
      }
    } catch (err) {
      console.error('❌ Error loading managerId:', err);
    }
  };

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
          marginBottom: 5,
          gap: 20,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: '#555' }}>FROM</Text>
          <Text
            style={{ fontWeight: 'bold' }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lead.moving_from}
          </Text>
          <Text
            style={{ color: '#555' }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lead.from_city || ''}
          </Text>
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
          <Text
            style={{ fontWeight: 'bold', textAlign: 'right' }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lead.moving_to}
          </Text>
          <Text
            style={{ color: '#555', textAlign: 'right' }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lead.to_city || ''}
          </Text>
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
        <Text style={{ fontSize: 14, color: '#555' }}>
          Qutation: {lead.ele_quotation_for_customer || 'No Qutaion Yat'}
        </Text>
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
            customerId: lead.id,
          })
        }
      >
        <Text
          style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}
        >
          View Details
        </Text>
      </TouchableOpacity>
    </View>
  );
  const firstName = name ? name.split(' ')[0] : '';

  return (
    <>
      <Header />

      <View style={{marginTop:10, marginLeft:10}}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          // padding: 15,
          justifyContent: 'center',
        }}
      >
        <GradientText
          text={`Lead for ${firstName}`}
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#222',
            textAlign: 'center',
          }}
        />
      </View>
      <View style={{ flex: 1, padding: 15 }}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={leads}
            keyExtractor={item => item.id.toString()}
            renderItem={renderLead}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListEmptyComponent={
              <Text
                style={{ textAlign: 'center', marginTop: 20, color: '#666' }}
              >
                No leads found
              </Text>
            }
          />
        )}
      </View>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import Header from '../../components/Header';
import { useNavigation } from '@react-navigation/native';

export default function CustomerInventoryScreen({ route }) {
  const { customerId } = route.params;
  const [inventory, setInventory] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Lift mapping
  const mapLift = value => {
    switch (value) {
      case 0:
        return 'No Service Lift';
      case 1:
        return 'Service Lift';
      case 2:
        return 'Small Lift';
      default:
        return 'N/A';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
        if (!rawJwt) return console.log('❌ Missing token');
        const { token } = JSON.parse(rawJwt);

        // Inventory fetch
        const res = await api.get(
          `/manager/customers/${customerId}/inventory`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setInventory(res.data.inventory || []);

        // Customer fetch
        const custRes = await api.get(`/manager/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCustomer(custRes.data.customer || null);
      } catch (err) {
        console.error('❌ Error fetching data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [customerId]);

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  if (!customer)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#555' }}>Customer not found</Text>
      </View>
    );

  return (
    <>
      <Header />

      {/* ---------- HEADER ---------- */}
      <View style={{ padding: 15, backgroundColor: '#fff' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
          Review | {customer.id || '---'}
        </Text>
        <Text style={{ color: '#666', marginTop: 5 }}>
          Date{' '}
          {customer.created_date
            ? new Date(customer.created_date).toLocaleDateString('en-GB')
            : 'N/A'}
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 10 }}>
        {/* ---------- FROM / TO ---------- */}
        <View
          style={{
            backgroundColor: '#fff',
            margin: 10,
            padding: 15,
            borderRadius: 8,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 12 }}>From</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
                {customer.moving_from || '---'}
              </Text>
            </View>
            <Text style={{ fontSize: 20, alignSelf: 'center' }}>↔</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: '#666', fontSize: 12 }}>To</Text>
              <Text
                style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'right' }}
              >
                {customer.moving_to || '---'}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- SERVICE LIST ---------- */}
        <View
          style={{
            margin: 10,
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 15,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>Service List</Text>
          <View style={{ marginTop: 10 }}>
            {[
              { label: 'Phone No.', value: customer.cust_mobile },
              { label: 'Email id', value: customer.cust_email },
              {
                label: 'Moving Date',
                value: customer.moving_date
                  ? new Date(customer.moving_date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A',
              },
              { label: 'Home Size', value: customer.home_size },
              {
                label: 'Loading Floor No',
                value: customer.moving_from_floor_no,
              },
              {
                label: 'Unloading Floor No',
                value: customer.moving_to_floor_no,
              },
              {
                label: 'Loading Services',
                value: mapLift(customer.moving_from_service_lift),
              },
              {
                label: 'Unloading Services',
                value: mapLift(customer.moving_to_service_lift),
              },
              { label: 'Moving Type', value: customer.moving_type },
              { label: 'Distance', value: customer.approx_dist },
            ].map((row, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 6,
                  borderBottomWidth: idx < 5 ? 1 : 0,
                  borderColor: '#eee',
                }}
              >
                <Text style={{ flex: 1, color: '#444' }}>{row.label}</Text>
                <Text
                  style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}
                >
                  {row.value || '---'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ---------- INVENTORY LIST ---------- */}
        <View
          style={{
            margin: 10,
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 15,
          }}
        >
          <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
            Inventory List
          </Text>
          <View style={{ marginTop: 10 }}>
            {inventory.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#555' }}>
                No inventory found
              </Text>
            ) : (
              inventory.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 6,
                    borderBottomWidth: idx < inventory.length - 1 ? 1 : 0,
                    borderColor: '#eee',
                  }}
                >
                  {/* Item Image */}
                  <Image
                    source={{
                      uri: `https://res.cloudinary.com/dfqledkbu/image/upload/v1757054808/premove_inventory/${item.item_image}`,
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      marginRight: 10,
                    }}
                  />
                  {/* Item Name */}
                  <Text style={{ flex: 2, color: '#444' }}>
                    {item.item_name}
                  </Text>

                  {/* Quantity */}
                  <Text
                    style={{
                      flex: 1,
                      textAlign: 'right',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.quantity}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ---------- BOTTOM BUTTONS ---------- */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            margin: 15,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#0f9d58',
              flex: 1,
              padding: 12,
              marginRight: 8,
              borderRadius: 6,
            }}
          >
            <Text
              style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}
            >
              Go For Qutation
            </Text>
          </TouchableOpacity>

          {/* ✅ Updated Add Inventory button */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddItem', {
                lead_id: customer.id,
                cust_email: customer.cust_email, // extra param
              })
            }
            style={{
              backgroundColor: colors.primary,
              flex: 1,
              padding: 12,
              marginLeft: 8,
              borderRadius: 6,
            }}
          >
            <Text
              style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}
            >
              Add Inventory
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

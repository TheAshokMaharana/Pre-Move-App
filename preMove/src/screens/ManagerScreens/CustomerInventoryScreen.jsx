import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import Header from '../../components/Header';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import GradientText from '../../components/GradientText';
import LeadVideos from './LeadVideosScreen';
import { Linking } from 'react-native';
import BackButton from '../../components/BackButton';

export default function CustomerInventoryScreen() {
  const route = useRoute();
  const { customerId, newItemIds = [] } = route.params || {};
  const [inventory, setInventory] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [showVideos, setShowVideos] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [managerId, setManagerId] = useState(null);
  const [visitErrorModalVisible, setVisitErrorModalVisible] = useState(false);
  const [visitErrorMessage, setVisitErrorMessage] = useState('');
  const [completedCustomers, setCompletedCustomers] = useState([]);
  const [confirmVisitModalVisible, setConfirmVisitModalVisible] =
    useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const navigation = useNavigation();
  console.log(customerId, 'csadfd');
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

        // Manager ID
        const storedId = await AsyncStorage.getItem('USER_ID');
        if (storedId) setManagerId(storedId);

        // Inventory fetch
        const res = await api.get(
          `/manager/customers/${customerId}/inventory`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setInventory(res.data.inventory || []);
        console.log(inventory);
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

  const renderInventoryItem = ({ item }) => {
    const isNew = item.new_item === 1; // 👈 direct DB column check

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          paddingVertical: 5,
          marginHorizontal: 15,
          marginVertical: 5,
          borderBottomWidth: 1,
          borderColor: '#eee',
          backgroundColor: 'white', // highlight if new
          borderRadius: 10,
        }}
      >
        <Image
          source={{
            uri: `https://res.cloudinary.com/dfqledkbu/image/upload/v1757054808/premove_inventory/${item.item_image}`,
          }}
          style={{ width: 40, height: 40, borderRadius: 6, marginRight: 10 }}
        />

        {/* Item name */}
        <Text style={{ flex: 2, color: '#444' }}>{item.item_name}</Text>

        {/* If new → show "NEW" */}
        {isNew && (
          <Text
            style={{
              backgroundColor: '#FF5252',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 12,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
              marginHorizontal: 5,
            }}
          >
            Extra Item
          </Text>
        )}

        {/* Quantity */}
        <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
          {item.quantity}
        </Text>
      </View>
    );
  };

  const InventryText = () => (
    <View>
      <GradientText
        text={`Inventory`}
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#222',
          textAlign: 'center',
        }}
      />
    </View>
  );

  const ListHeader = () => (
    <>
      {/* ---------- HEADER ---------- */}
      <View
        style={{
          padding: 15,
          backgroundColor: '#fff',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <BackButton onPress={() => navigation.goBack()} />
        <View>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
            Customer Id | {customer.id || '---'}
          </Text>
          <Text style={{ color: '#666', marginTop: 5, textAlign: 'right' }}>
            Date
            {customer.created_date
              ? new Date(customer.created_date).toLocaleDateString('en-GB')
              : 'N/A'}
          </Text>
        </View>
      </View>

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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
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
            { label: 'Customer Name', value: customer.cust_name },
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
            { label: 'Home Size', value: customer.home_type_name },
            {
              label: 'Loading Floor No',
              value: customer.moving_from_floor_no,
            },
            { label: 'Unloading Floor No', value: customer.moving_to_floor_no },
            {
              label: 'Loading Services',
              value: mapLift(customer.moving_from_service_lift),
            },
            {
              label: 'Unloading Services',
              value: mapLift(customer.moving_to_service_lift),
            },
            { label: 'Moving Type', value: customer.moving_type },
            { label: 'Distance', value: customer.spanco },
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
              <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
                {row.value || '---'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ---------- VIEW VIDEOS BUTTON ---------- */}
      <View style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
        <TouchableOpacity
          onPress={() => setShowVideos(prev => !prev)}
          style={{
            backgroundColor: '#03B5A7',
            padding: 12,
            borderRadius: 6,
            marginVertical: 10,
          }}
        >
          <Text
            style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}
          >
            {showVideos ? 'Hide Videos' : 'View Videos'}
          </Text>
        </TouchableOpacity>
        {showVideos && managerId && customer && (
          <LeadVideos leadId={customer.id} managerId={managerId} />
        )}
        {showVideos && (
          <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${customer.cust_mobile}`)}
              style={{
                backgroundColor: '#0f9d58',
                padding: 12,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                📞 Call Customer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View>
          <GradientText
            text={`Inventory`}
            style={{
              fontSize: 30,
              fontWeight: 'bold',
              color: '#222',
              textAlign: 'center',
            }}
          />
        </View>
        {/* ---------- CALL CUSTOMER BUTTON ---------- */}
      </View>
    </>
  );
  // const handleVisitPress = async (customer, navigation) => {
  //   try {
  //     const managerId = await AsyncStorage.getItem('USER_ID');
  //     if (!managerId) {
  //       alert('Manager ID not found in session');
  //       return;
  //     }

  //     console.log('customer id s ', customer.id);
  //     console.log('manager id s ', managerId);

  //     const res = await api.post('visit-request/create', {
  //       customerId: customer.id,
  //       managerId: managerId,
  //     });

  //     if (!res.data.success) {
  //       if (res.data.error?.includes('No visit request found')) {
  //         setVisitErrorMessage(
  //           'No visit request has been created for this customer.',
  //         );
  //         setVisitErrorModalVisible(true);
  //         return;
  //       }

  //       if (res.data.error?.includes('Inspection already completed')) {
  //         setVisitErrorMessage('Your inspection has already been completed.');
  //         setVisitErrorModalVisible(true);
  //         setCompletedCustomers(prev => [...prev, customer.id]); // store disabled
  //         return;
  //       }

  //       alert(res.data.error || 'Something went wrong.');
  //       return;
  //     }

  //     navigation.navigate('ManagerLivelocation', {
  //       customerId: customer.id,
  //       managerId: managerId,
  //     });
  //   } catch (err) {
  //     console.error('Error in Visit Button:', err.message);
  //     alert('Something went wrong.');
  //   }
  // };
  const handleAddInventoryPress = async (customer, navigation) => {
    try {
      const managerId = await AsyncStorage.getItem('USER_ID');
      if (!managerId) {
        alert('Manager ID not found in session');
        return;
      }

      console.log('customer id s ', customer.id);
      console.log('manager id s ', managerId);

      const res = await api.post('visit-request/create', {
        customerId: customer.id,
        managerId: managerId,
      });

      if (!res.data.success) {
        if (res.data.error?.includes('No visit request found')) {
          setVisitErrorMessage(
            'No visit request has been created for this customer.',
          );
          setVisitErrorModalVisible(true);
          return;
        }

        if (res.data.error?.includes('Inspection already completed')) {
          setVisitErrorMessage('Your inspection has already been completed.');
          setVisitErrorModalVisible(true);
          setCompletedCustomers(prev => [...prev, customer.id]); // store disabled
          return;
        }

        alert(res.data.error || 'Something went wrong.');
        return;
      }

      navigation.navigate('AddItem', {
        lead_id: customer.id,
        cust_email: customer.cust_email,
      });
    } catch (err) {
      console.error('Error in Visit Button:', err.message);
      alert('Something went wrong.');
    }
  };
  const handleVisitPress = async (customer, navigation) => {
    try {
      const managerId = await AsyncStorage.getItem('USER_ID');
      if (!managerId) {
        alert('Manager ID not found in session');
        return;
      }

      console.log('customer id s ', customer.id);
      console.log('manager id s ', managerId);

      // 1️⃣ Create or assign visit request
      const res = await api.post('visit-request/create', {
        customerId: customer.id,
        managerId: managerId,
      });

      if (!res.data.success) {
        if (res.data.error?.includes('No visit request found')) {
          setVisitErrorMessage(
            'No visit request has been created for this customer.',
          );
          setVisitErrorModalVisible(true);
          return;
        }

        if (res.data.error?.includes('Inspection already completed')) {
          setVisitErrorMessage('Your inspection has already been completed.');
          setVisitErrorModalVisible(true);
          setCompletedCustomers(prev => [...prev, customer.id]);
          return;
        }

        alert(res.data.error || 'Something went wrong.');
        return;
      }

      // 2️⃣ ✅ Update status to "started"
      await api.post('visit-request/start', { customerId: customer.id });

      // 3️⃣ Navigate to live location
      navigation.navigate('ManagerLivelocation', {
        customerId: customer.id,
        managerId: managerId,
      });
    } catch (err) {
      console.error('Error in Visit Button:', err.message);
      alert('Something went wrong.');
    }
  };

  const ListFooter = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 15,
      }}
    >
      <Modal
        visible={confirmVisitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmVisitModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              width: '80%',
              borderRadius: 10,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}
            >
              Confirm Visit
            </Text>
            <Text style={{ fontSize: 14, textAlign: 'center', color: '#555' }}>
              Are you sure you want to start inspection for this customer?
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <TouchableOpacity
                onPress={() => setConfirmVisitModalVisible(false)}
                style={{
                  backgroundColor: '#aaa',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 6,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setConfirmVisitModalVisible(false);
                  handleVisitPress(selectedCustomer, navigation); // ✅ call original function
                }}
                style={{
                  backgroundColor: '#0f9d58',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {customer.spanco === 'a' && (
        // <TouchableOpacity
        //   style={{
        //     backgroundColor: '#0f9d58',
        //     flex: 1,
        //     padding: 12,
        //     marginRight: 8,
        //     borderRadius: 6,
        //   }}
        //   onPress={() => handleVisitPress(customer, navigation)}
        // >
        //   <Text
        //     style={{
        //       color: '#fff',
        //       textAlign: 'center',
        //       fontWeight: 'bold',
        //     }}
        //   >
        //     Visit For Inspection
        //   </Text>
        // </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#0f9d58',
            flex: 1,
            padding: 12,
            marginRight: 8,
            borderRadius: 6,
          }}
          onPress={() => {
            setSelectedCustomer(customer);
            setConfirmVisitModalVisible(true);
          }}
        >
          <Text
            style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}
          >
            Visit For Inspection
          </Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={visitErrorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisitErrorModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              width: '80%',
              borderRadius: 10,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <Text
              style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}
            >
              Visit Request Not Found
            </Text>
            <Text style={{ fontSize: 14, textAlign: 'center', color: '#555' }}>
              {visitErrorMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setVisitErrorModalVisible(false)}
              style={{
                backgroundColor: '#0f9d58',
                marginTop: 15,
                paddingVertical: 10,
                paddingHorizontal: 30,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* {customer.spanco === 'a' && (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddItem', {
              lead_id: customer.id,
              cust_email: customer.cust_email,
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
      )} */}

      {customer.spanco === 'a' && (
        <TouchableOpacity
          disabled={customer.status === 'completed'}
          onPress={() =>
            navigation.navigate('AddItem', {
              lead_id: customer.id,
              cust_email: customer.cust_email,
            })
          }
          // onPress={() => handleAddInventoryPress(customer, navigation)}
          style={{
            backgroundColor: colors.primary,
            flex: 1,
            padding: 12,
            marginLeft: 8,
            borderRadius: 6,
            opacity: customer.status === 'completed' ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              color: '#fff',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            Add Inventory
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <Header />

      <FlatList
        data={inventory}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        InventoryText={InventryText}
        renderItem={renderInventoryItem}
      />
    </>
  );
}

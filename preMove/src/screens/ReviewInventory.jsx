import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { api } from '../utils/baseurl';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ReviewInventory = ({ route, navigation }) => {
  const { leadId, selectedItems } = route.params;
  const [items, setItems] = useState(
    selectedItems.map(it => ({
      ...it,
      assemble_disamble: 0,
      wood_crafting: 0,
      wall_dismounting: 0,
    })),
  );
  console.log('items all', selectedItems);
  // Confirmation modal state (Yes/No)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(() => () => {});
  const [allItems, setAllItems] = useState([]);

  // Message modal state (OK only)
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');

  console.log(leadId, 'lead id frontend');
  const toggleOption = (index, field) => {
    const updated = [...items];
    updated[index][field] = updated[index][field] ? 0 : 1;
    setItems(updated);
  };
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await api.get('/all-items');
        setAllItems(res.data || []);
        console.log('✅ All items fetched for name mapping:', res.data.length);
      } catch (err) {
        console.error('Error fetching all items:', err);
      }
    };
    fetchAllItems();
  }, []);
  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmModalVisible(true);
  };

  const showMessage = (message, callback) => {
    setMessageText(message);
    setMessageModalVisible(true);
    if (callback) setOnConfirmAction(() => callback);
  };

  // const saveInventory = () => {
  //   // Show Yes/No confirmation first
  //   showConfirmation(
  //     'Are you sure you want to save the inventory?',
  //     async () => {
  //       try {
  //         const { data } = await api.post('save-inventory', {
  //           items,
  //           lead_unique_id: leadId,
  //         });

  //         if (data.success) {
  //           // Show OK-only message
  //           showMessage('✅ Inventory added successfully', () =>
  //             navigation.navigate('HomePage', { screen: 'Leads' }),
  //           );
  //         }

  //         if (data.success) {

  //           showMessage('✅ Inventory added successfully', async () => {
  //             try {
  //               // userType nikalo (SplashScreen me jo store kiya tha)
  //               const userData = await AsyncStorage.getItem('USER_DETAILS');
  //               const userType = await AsyncStorage.getItem('USER_TYPE');
  //               const parsed = JSON.parse(userData);
  //               // const userType = parsed?.USER_TYPE;
  //               console.log('userType', userType);

  //               if (userType === 'manager') {
  //                 // Manager ke lead screen par redirect
  //                 navigation.navigate('ManagerHomePage', {
  //                   screen: 'Customers',

  //                 });
  //               } else {
  //                 // Customer ke lead screen par redirect
  //                 navigation.navigate('HomePage', {
  //                   screen: 'CustomerLead',
  //                 });
  //               }
  //             } catch (err) {
  //               console.error('❌ Navigation error:', err);
  //               // navigation.navigate('HomePage', { screen: 'Leads' }); // fallback
  //             }
  //           });
  //         } else {
  //           showMessage(data.message || '❌ Something went wrong');
  //         }
  //       } catch (err) {
  //         console.error(
  //           'Save Inventory error:',
  //           err.response?.data || err.message,
  //         );
  //         showMessage('❌ Failed to save inventory');
  //       }
  //     },
  //   );
  // };

  const saveInventory = () => {
    showConfirmation(
      'Are you sure you want to save the inventory?',
      async () => {
        try {
          const userData = await AsyncStorage.getItem('USER_DETAILS');
          const userType = await AsyncStorage.getItem('USER_TYPE'); // manager or customer

          const { data } = await api.post('save-inventory', {
            items,
            lead_unique_id: leadId,
            user_type: userType, // 👈 send kar diya
          });
          // console.log(data.lead_unique_id, 'itemsdfds');
          if (data.success) {
            showMessage('✅ Inventory added successfully', () => {
              if (userType === 'manager') {
                navigation.navigate('ManagerHomePage', { screen: 'Customers' });
                // navigation.navigate('CustomerInventoryScreen', { id: leadId })
              } else {
                navigation.navigate('HomePage', { screen: 'CustomerLead' });
                // navigation.navigate('Inventory', { id: leadId })
              }
            });
          } else {
            showMessage(data.message || '❌ Something went wrong');
          }
        } catch (err) {
          console.error(
            'Save Inventory error:',
            err.response?.data || err.message,
          );
          showMessage('❌ Failed to save inventory');
        }
      },
    );
  };
  // Helper to get name
  const getItemName = id => {
    const found = allItems.find(it => it.id === id);
    return found ? found.sub_category_item_name : `Item ID: ${id}`;
  };
  // console.log("item name" ,  getItemName(item.sub_category_item_id))
  return (
    <>
      <Header />

      {/* Confirmation Modal (Yes/No) */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000050',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              minWidth: '70%',
            }}
          >
            <Text
              style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}
            >
              {confirmMessage}
            </Text>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-around' }}
            >
              <TouchableOpacity
                onPress={() => {
                  setConfirmModalVisible(false);
                  onConfirmAction();
                }}
                style={{ paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Text style={{ color: 'green', fontSize: 16 }}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                style={{ paddingHorizontal: 20, paddingVertical: 10 }}
              >
                <Text style={{ color: 'red', fontSize: 16 }}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Modal (OK only) */}
      <Modal visible={messageModalVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#00000050',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 10,
              minWidth: '70%',
            }}
          >
            <Text
              style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}
            >
              {messageText}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMessageModalVisible(false);
                onConfirmAction();
              }}
              style={{
                alignSelf: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: '#2196F3', fontSize: 16 }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ flex: 1, padding: 16 }}>
        <FlatList
          data={items}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <View
              style={{
                marginBottom: 16,
                padding: 12,
                borderWidth: 1,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {getItemName(item.sub_category_item_id)} | Qty: {item.quantity}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  alignItems: 'center',
                }}
              >
                <Switch
                  value={!!item.assemble_disamble}
                  onValueChange={() => toggleOption(index, 'assemble_disamble')}
                />
                <Text style={{ marginLeft: 8 }}>Assemble/Disassemble</Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  alignItems: 'center',
                }}
              >
                <Switch
                  value={!!item.wood_crafting}
                  onValueChange={() => toggleOption(index, 'wood_crafting')}
                />
                <Text style={{ marginLeft: 8 }}>Wood Crafting</Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 10,
                  alignItems: 'center',
                }}
              >
                <Switch
                  value={!!item.wall_dismounting}
                  onValueChange={() => toggleOption(index, 'wall_dismounting')}
                />
                <Text style={{ marginLeft: 8 }}>Wall Dismounting</Text>
              </View>
            </View>
          )}
        />

        <TouchableOpacity onPress={saveInventory} style={{ marginTop: 20 }}>
          <LinearGradient
            colors={['#03B5A7', '#0189D5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 15, borderRadius: 8, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Save Inventory
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ReviewInventory;

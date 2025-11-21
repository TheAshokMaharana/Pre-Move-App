import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { api } from '../../utils/baseurl';
import colors from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import GradientText from '../../components/GradientText';

export default function InventoryScreen({ route }) {
  const { leadId } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log('LeadId ', leadId);
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);

      const rawJwt = await AsyncStorage.getItem('APP_JWT_TOKEN');
      if (!rawJwt) {
        console.log('⚠️ No token found in storage');
        return;
      }

      const { token } = JSON.parse(rawJwt);

      const res = await api.get(`/manager/leads/${leadId}/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data.inventory || []);
    } catch (err) {
      console.error(
        '❌ Error fetching inventory:',
        err.response?.data || err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={{ marginTop: 20 }}
      />
    );

  return (
    <>
      <Header />
      <View style={styles.container}>
        <GradientText text="Customer Inventory" style={styles.heading} />

        <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Item Name */}
              <View style={styles.rowBetweenheader}>
                <Text style={styles.itemName}>
                  {item.sub_category_item_name}
                </Text>
                <Image
                  source={{
                    uri: `https://res.cloudinary.com/dfqledkbu/image/upload/v1757054818/premove_inventory/${item.sub_category_item_image}`,
                  }}
                  style={styles.image}
                />
              </View>

              {/* Quantity */}
              <View style={styles.rowBetween}>
                <Text style={styles.label}>QUANTITY</Text>
                <Text style={styles.value}>{item.quantity}</Text>
              </View>

              {/* Flags */}
              <View style={styles.rowBetween}>
                <Text style={styles.label}>ASSEMBLE</Text>
                <Text style={styles.value}>
                  {item.assemble_disamble ? 'Yes' : 'No'}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>CRAFTING</Text>
                <Text style={styles.value}>
                  {item.wood_crafting ? 'Yes' : 'No'}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.label}>DISMOUNT</Text>
                <Text style={styles.value}>
                  {item.wall_dismounting ? 'Yes' : 'No'}
                </Text>
              </View>

              {/* Button */}
              {/* <TouchableOpacity style={styles.btn}>
                <Text style={styles.btnText}>Details</Text>
              </TouchableOpacity> */}
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f4f6f9' },
  heading: {
    fontSize: 25,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    // marginBottom: 10,/
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal:20
  },
  label: { fontSize: 12, color: '#888' },
  value: { fontSize: 14, fontWeight: '600', color: '#2d3436' },
  btn: {
    marginTop: 10,
    backgroundColor: '#00b894',
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  rowBetweenheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});

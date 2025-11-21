import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Header from '../components/Header';
import ItemCategory from '../components/ItemCategory';
import SubCategoryList from '../components/SubCategoryScreen';
import { AddItemCss } from '../assets/css/ScreensCss';
import LinearGradient from 'react-native-linear-gradient';
import { MagnifyingGlassIcon } from 'react-native-heroicons/solid';
import colors from '../theme/colors';
import { api } from '../utils/baseurl';
import { useRoute, useNavigation } from '@react-navigation/native';

// ✅ Item Card
const ItemCard = React.memo(({ item, quantity, onIncrease, onDecrease }) => {
  const id = item.id || item.sub_category_item_id;
  return (
    <View style={AddItemCss.card}>
      <Image
        source={{
          uri: `https://res.cloudinary.com/dfqledkbu/image/upload/premove_inventory/${item.sub_category_item_image}`,
        }}
        style={AddItemCss.itemImage}
      />
      <Text style={AddItemCss.itemName}>{item.sub_category_item_name}</Text>
      <View style={AddItemCss.quantityWrapper}>
        <TouchableOpacity onPress={() => onIncrease(id)}>
          <Text style={AddItemCss.quantityBtn}>+</Text>
        </TouchableOpacity>
        <Text style={AddItemCss.quantityText}>{quantity || 0}</Text>
        <TouchableOpacity onPress={() => onDecrease(id)}>
          <Text style={AddItemCss.quantityBtn}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const AddInventory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const leadId = route.params?.lead_id;

  const [subCategories, setSubCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [search, setSearch] = useState('');

  // Confirmation Modal state
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState(() => () => { });

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      const res = await api.get('/all-items');
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching all items:', err);
      showConfirmation('Failed to fetch items', () => setConfirmModalVisible(false));
    }
  };

  const fetchSubCategories = async categoryId => {
    try {
      const res = await api.get(`/sub-categories/${categoryId}`);
      setSubCategories(res.data || []);
      setSelectedSubCat(null);
    } catch (err) {
      console.error('Error fetching sub-categories:', err);
      showConfirmation('Failed to fetch subcategories', () => setConfirmModalVisible(false));
    }
  };

  const fetchItems = async subCategoryId => {
    try {
      setSelectedSubCat(subCategoryId);
      const res = await api.get(`/sub-category-item/${subCategoryId}`);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      showConfirmation('Failed to fetch items', () => setConfirmModalVisible(false));
    }
  };

  const increaseQuantity = useCallback(id => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const decreaseQuantity = useCallback(id => {
    setQuantities(prev => ({ ...prev, [id]: prev[id] > 0 ? prev[id] - 1 : 0 }));
  }, []);

  const filteredItems = items.filter(item =>
    item.sub_category_item_name.toLowerCase().includes(search.toLowerCase()),
  );

  // ✅ Utility to show confirmation modal
  const showConfirmation = (message, action) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmModalVisible(true);
  };

  const handleAddItems = () => {
    const selectedItems = Object.keys(quantities)
      .filter(id => quantities[id] > 0)
      .map(id => ({
        sub_category_item_id: parseInt(id),
        quantity: quantities[id],
      }));

    if (selectedItems.length === 0) {
      showConfirmation('⚠️ Please select at least one item', () => setConfirmModalVisible(false));
      return;
    }

    // Show confirmation before navigating
    showConfirmation('Are you sure you want to add selected items?', () =>
      navigation.navigate('ReviewInventory', { leadId, selectedItems }),
    );
  };

  return (
    <View style={AddItemCss.container}>
      <Header />

      {/* Confirmation Modal */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000050' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, minWidth: '70%' }}>
            <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>{confirmMessage}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity
                onPress={() => { setConfirmModalVisible(false); onConfirmAction(); }}
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

      {/* Search Bar */}
      <View style={AddItemCss.searchwrap}>
        <View style={AddItemCss.searchContainer}>
          <MagnifyingGlassIcon size={20} color="#555" style={AddItemCss.icon} />
          <TextInput
            placeholder="Search items..."
            value={search}
            onChangeText={setSearch}
            style={AddItemCss.input}
            placeholderTextColor={colors.muted}
          />
        </View>
      </View>

      {/* Categories */}
      <ItemCategory onCategorySelect={fetchSubCategories} />

      {/* SubCategories */}
      {subCategories.length > 0 && (
        <SubCategoryList
          subCategories={subCategories}
          selectedSubCat={selectedSubCat}
          onSelect={fetchItems}
        />
      )}

      {/* Items */}
      <FlatList
        data={filteredItems}
        numColumns={3}
        keyExtractor={item => (item.id || item.sub_category_item_id).toString()}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            quantity={quantities[item.id || item.sub_category_item_id]}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
          />
        )}
        extraData={quantities}
      />

      {/* Add Items Button */}
      <TouchableOpacity style={AddItemCss.addBtn} onPress={handleAddItems}>
        <LinearGradient
          colors={['#03B5A7', '#0189D5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={AddItemCss.addBtn}
        >
          <Text style={AddItemCss.addBtnText}>Add Items</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default AddInventory;

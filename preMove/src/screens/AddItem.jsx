import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  AdditemScreenCssheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import {
  AdditemScreenCss,
  RelocRequestScreenCss,
} from '../assets/css/ScreensCss';
import GradientText from '../components/GradientText';
import colors from '../theme/colors';

export default function Additem() {
  const [items, setItems] = useState([]); // ✅ Start with no items
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState(1);
  const [imageUri, setImageUri] = useState(null);

  // ✅ Ask Camera Permission (Android only)
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS auto handles permissions
  };

  // 📸 Open Camera
  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required!');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.7,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
        } else {
          const uri = response.assets[0].uri;
          setImageUri(uri);
        }
      },
    );
  };

  // ➕ Add new item
  const addItem = () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!imageUri) {
      Alert.alert('Error', 'Please add Image');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: itemName,
      qty,
      image: imageUri,
    };

    setItems([newItem, ...items]); // add to TOP
    setItemName('');
    setQty(1);
    setImageUri(null);
  };

  // ❌ Remove item
  const removeItem = id => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <View style={AdditemScreenCss.container}>
      {/* ✅ Added Item List */}
      <GradientText text="Added Items" style={RelocRequestScreenCss.title} />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={AdditemScreenCss.card}>
              <Text style={AdditemScreenCss.itemText}>{item.name}</Text>
              <Text>QTY:- {item.qty}</Text>
              <View>
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={AdditemScreenCss.itemImage}
                  />
                )}
              </View>
            </View>
            <TouchableOpacity
              style={AdditemScreenCss.removeBtn}
              onPress={() => removeItem(item.id)}
            >
              <Text
                style={{
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              >
                x
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={AdditemScreenCss.addBtn} onPress={addItem}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Request Item</Text>
      </TouchableOpacity>

      <View
        style={{ width: '100%', height: 2, backgroundColor: colors.primary }}
      ></View>
      {/* ✅ Add Item Section */}
      <GradientText text="Add Item" style={RelocRequestScreenCss.title} />

      <View style={AdditemScreenCss.row}>
        <TextInput
          placeholder="Enter Item Name"
          style={AdditemScreenCss.input}
          value={itemName}
          onChangeText={setItemName}
        />
        <View style={AdditemScreenCss.qtyBox}>
          <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))}>
            <Text style={AdditemScreenCss.qtyBtn}>-</Text>
          </TouchableOpacity>
          <Text>{qty}</Text>
          <TouchableOpacity onPress={() => setQty(qty + 1)}>
            <Text style={AdditemScreenCss.qtyBtn}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={AdditemScreenCss.imgBtn} onPress={openCamera}>
        <Text>Add Item Image</Text>
      </TouchableOpacity>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={AdditemScreenCss.previewImage}
        />
      )}

      <TouchableOpacity style={AdditemScreenCss.addBtn} onPress={addItem}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
}

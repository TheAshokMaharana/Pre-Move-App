// import React from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
// import { CameraIcon } from 'react-native-heroicons/outline';

// const ItemCard = ({ name, qty, image, onCameraPress }) => {
//   return (
//     <View style={styles.card}>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.itemName}>{name}</Text>
//         <Text style={styles.qty}>QTY: {qty}</Text>
//       </View>

//       <TouchableOpacity
//         onPress={image ? null : onCameraPress}
//         style={styles.imageContainer}
//       >
//         {image ? (
//           <Image source={{ uri: image }} style={styles.image} />
//         ) : (
//           <View style={styles.cameraWrapper}>
//             <CameraIcon size={28} color="#4b5563" />
//           </View>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default ItemCard;

// const styles = StyleSheet.create({
//   card: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     padding: 12,
//     borderRadius: 10,
//     marginVertical: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111',
//   },
//   qty: {
//     fontSize: 14,
//     color: '#6b7280',
//     marginTop: 2,
//   },
//   imageContainer: {
//     width: 50,
//     height: 50,
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 6,
//     resizeMode: 'cover',
//   },
//   cameraWrapper: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#e5e7eb', // light gray background for camera
//     borderRadius: 6,
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {api} from '../utils/baseurl';

export default function ItemCategory({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);

  // ✅ Fetch all main categories
  useEffect(() => {
    api.get('/categories')
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => console.error('❌ Error fetching categories:', err));
  }, []);

  const handleSelect = id => {
    setSelected(id);
    if (onCategorySelect) onCategorySelect(id); // parent ko bhejna
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleSelect(cat.id)}
            style={{ borderRadius: 20, overflow: 'hidden' }}
          >
            {selected === cat.id ? (
              <LinearGradient
                colors={['#03B5A7', '#0189D5']}
                style={styles.categoryBox}
              >
                <Text style={[styles.categoryText, styles.activeText]}>
                  {cat.categoryname}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.categoryBox}>
                <Text style={styles.categoryText}>{cat.categoryname}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  categoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  categoryText: { color: '#333', fontSize: 14, textAlign: 'center' },
  activeText: { color: '#fff', fontWeight: 'bold' },
});

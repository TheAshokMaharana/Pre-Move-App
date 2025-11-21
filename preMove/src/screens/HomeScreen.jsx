// src/screens/HomeScreen.jsx
import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import ServiceCard from '../components/ServiceCard';
import { BoltIcon, HandThumbUpIcon } from 'react-native-heroicons/solid';
import logo from '../assets/images/Logo.png';
import styles from '../assets/css/home';
import { useNavigation } from '@react-navigation/native';
import GradientText from '../components/GradientText';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Logo */}
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image source={logo} style={styles.brand} />
      </View>

      {/* Hero Image */}
      <Image
        source={require('../assets/images/truck.png')}
        style={styles.hero}
        resizeMode="contain"
      />

      {/* Relocation banner (redirect to Reloc Req) */}
      <TouchableOpacity onPress={() => navigation.navigate('Reloc Req')}>
        <View style={styles.textFlas}>
          <BoltIcon color="#03B5A7" size={20} />
          <Text
            style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}
          >
            <Text style={{ color: colors.primary, fontWeight: '900' }}>
              {'Relocation-help '}
            </Text>
            in 10 minutes, right to your door
          </Text>
        </View>
      </TouchableOpacity>

      {/* Live info */}
      <View style={styles.live}>
        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text>We are currently </Text>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            live in
          </Text>
        </View>
      </View> 

      {/* Cities scroll */}
      <View style={styles.citiescontainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.cities}>
            PUNE · BANGALORE · NOIDA · HYDERABAD · DELHI · MUMBAI · CHENNAI ·
            KOLKATA
          </Text>
        </ScrollView>
      </View>

      {/* Primary Button (redirect to Reloc Req) */}
      <View style={{ paddingHorizontal: 22, marginVertical: 20 }}>
        <PrimaryButton
          title="Requested PreMe in your area"
          onPress={() => navigation.navigate('Reloc Req')}
        />
      </View>

      {/* Meta Info */}
      <View style={styles.meta}>
        <HandThumbUpIcon size={20} color="#03B5A7" />
        <Text>Serving 5000+ relocation service across India</Text>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>See how elePLACE can help you</Text>
      <Text style={styles.sectionSub}>
        Meal prep through deep clean, We help with every chore
      </Text>

      {/* Service Cards */}
      <View style={styles.maincardRow}>
        <View style={styles.cardRow}>
          <ServiceCard
            title="Book Our Services"
            source={require('../assets/images/dashbordlogo.png')}
          />
          <ServiceCard
            style={{ backgroundColor: colors.primary }}
            title={'We Pack\n Your\n Goods'}
            source={require('../assets/images/items.png')}
          />
          <ServiceCard
            title={'We move\n your move'}
            source={require('../assets/images/move.png')}
          />
          <ServiceCard
            title={'We\nunpack\n your goods'}
            source={require('../assets/images/unpack.png')}
          />
        </View>
        <GradientText text={"Packers and movers in India"} style={styles.footer}>
        </GradientText>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

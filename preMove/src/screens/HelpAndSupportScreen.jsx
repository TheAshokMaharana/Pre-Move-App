import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Header from '../components/Header';
import { InventoryScreenCss } from '../assets/css/components';
import GradientText from '../components/GradientText';
import Icon from 'react-native-vector-icons/FontAwesome'; // ✅ FontAwesome v4

export default function ContactUsScreen({ navigation }) {
  const handleGoBack = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    } else {
      console.log('Go back triggered');
    }
  };

  // ✅ Dynamic Contact Info with correct icon names
  const contactInfo = {
    address: "Ele House, Andheri Kurla Road,\nAndheri (East), Mumbai",
    phone: "+91 7021810422",
    email: "ele@eleplace.in",
    socials: [
      { name: "LinkedIn", url: "https://lnkd.in/p/d--8mSGd", icon: "linkedin" },
      { name: "Facebook", url: "https://www.facebook.com/share/p/1C9vBoz9dr/", icon: "facebook" },
      { name: "Instagram", url: " https://www.instagram.com/p/DO5KUy5iEd0/?igsh=MXVweTN6bW5iZXZ5Zw==", icon: "instagram" },
      { name: "Twitter", url: "https://twitter.com/ele", icon: "twitter" },
      { name: "YouTube", url: "https://youtube.com/@ele", icon: "youtube-play" }, // ✅ Correct name
    ],
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleSocial = (url) => {
    Linking.openURL(url);
  };

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        {/* 🔙 Back Arrow */}
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <GradientText text="Account" style={InventoryScreenCss.title} />

        {/* 📞 Contact Info Card */}
        <View style={styles.card}>
          {/* Address */}
          <Text style={styles.heading}>📍 Address</Text>
          <Text style={styles.text}>{contactInfo.address}</Text>

          {/* Phone */}
          <Text style={styles.heading}>📞 Contact Us</Text>
          <TouchableOpacity onPress={() => handleCall(contactInfo.phone)}>
            <Text style={[styles.text, styles.link]}>{contactInfo.phone}</Text>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity onPress={() => handleEmail(contactInfo.email)}>
            <Text style={[styles.text, styles.link]}>{contactInfo.email}</Text>
          </TouchableOpacity>

          {/* Socials */}
          <Text style={styles.heading}>🌐 Follow Us</Text>
          <View style={styles.socialRow}>
            {contactInfo.socials.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialItem}
                onPress={() => handleSocial(social.url)}
              >
                <Icon name={social.icon} size={20} color="#007bff" style={styles.socialIcon} />
                <Text style={[styles.text, styles.link]}>{social.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f6ff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backArrow: {
    fontSize: 28,
    color: '#333',
  },
  card: {
    marginTop: 60,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
  link: {
    color: '#007bff',
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  socialIcon: {
    marginRight: 6,
  },
});

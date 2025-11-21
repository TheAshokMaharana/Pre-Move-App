import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OTPScreenCss } from '../../assets/css/ScreensCss';
import { api } from '../../utils/baseurl';

export default function ManagerOtpScreen({ route, navigation }) {
  const phone = route.params?.phone;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    let interval;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) return;

    try {
      const { data } = await api.post('manager/verify-otp', { phone, otp });

      if (data.success && data.token) {
        await AsyncStorage.multiSet([
          ['APP_JWT_TOKEN', JSON.stringify({ token: data.token, expiry: data.expiry })],
          ['USER_PHONE', phone],
          ['USER_TYPE', 'manager'],
          ['USER_ID', data.user.id.toString()],
          ['USER_DETAILS', JSON.stringify(data.user)],
        ]);

        // ✅ Show success modal
        setSuccessModalVisible(true);

        // Automatically navigate after delay
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.replace('ManagerHomePage');
        }, 1500);

      } else {
        alert(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err.response?.data || err.message);
      alert('Server not reachable');
    }
  };

  const handleResendOtp = async () => {
    setIsResendDisabled(true);
    setTimer(60);

    try {
      const { data } = await api.post('manager/send-otp', { phone });
      if (data.success) {
        alert('OTP sent successfully!');
      } else {
        alert(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP Error:', err.response?.data || err.message);
      alert('Server not reachable');
    }
  };

  return (
    <View style={OTPScreenCss.container}>
      <Image
        source={require('../../assets/images/componylogo.png')}
        style={OTPScreenCss.logo}
      />
      <LinearGradient
        colors={['#00b894', '#0984e3']}
        style={OTPScreenCss.gradientBox}
      >
        <Text style={OTPScreenCss.otpTitle}>Enter OTP</Text>

        <TextInput
          style={OTPScreenCss.input}
          placeholder="----"
          keyboardType="number-pad"
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
        />

        <TouchableOpacity disabled={isResendDisabled} onPress={handleResendOtp}>
          <Text
            style={[
              OTPScreenCss.resend,
              { color: isResendDisabled ? 'white' : 'yellow' },
            ]}
          >
            {isResendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={OTPScreenCss.button} onPress={handleVerifyOtp}>
          <Text style={OTPScreenCss.buttonText}>Login</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* ✅ Success Modal */}
      <Modal transparent={true} animationType="fade" visible={successModalVisible}>
        <View style={{
          flex:1,
          backgroundColor:'rgba(0,0,0,0.5)',
          justifyContent:'center',
          alignItems:'center'
        }}>
          <View style={{
            width:'80%',
            backgroundColor:'white',
            borderRadius:10,
            padding:25,
            alignItems:'center',
          }}>
            <Text style={{ fontSize:16, color:'#555', textAlign:'center' }}>
              ✅ Login successfully
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

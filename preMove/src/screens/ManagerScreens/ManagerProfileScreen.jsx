import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import { InventoryScreenCss } from '../../assets/css/components';
import GradientText from '../../components/GradientText';
import { api } from '../../utils/baseurl'; // axios instance
import Toast from 'react-native-toast-message';

export default function ManagerProfileScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [designation, setDesignation] = useState('');
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('USER_PHONE').then(phone => {
            if (phone) {
                setPhoneNumber(phone);
                fetchProfile(phone);
            }
        });
    }, []);

    const fetchProfile = async (phone) => {
        try {
            const { data } = await api.get(`manager/details/${phone}`);

            if (data.success && Array.isArray(data.manager) && data.manager.length > 0) {
                const manager = data.manager[0]; // ✅ pick the first element

                console.log('data', manager);

                setFullName(manager.name || '');
                setEmail(manager.email || '');
                setPhoneNumber(manager.phone_number || phone);
                setAddress(manager.assign_location || '');
                setDesignation(manager.user_role || '');
            } else {
                showToast('error', 'Manager not found');
            }
        } catch (err) {
            showToast('error', err.response?.data?.error || 'Failed to fetch profile');
        }
    };

     const handleSave = async () => {
            if (!fullName || !email) {
                return showToast("error", "Please enter full name and email");
            }
    
            try {
                const { data } = await api.put(
                    `manager/details/${phoneNumber}`,
                    { name: fullName, email: email },
                    { headers: { "Content-Type": "application/json" } }
                );
    
                if (data.success) {
                    showToast('success', data.message || 'Profile updated successfully!');
                    setEditMode(false);
                } else {
                    showToast('error', data.error || 'Update failed') ;
                }
            } catch (err) {
                showToast('error', err.response?.data?.error || 'Update failed');
            }
        };


    const showToast = (type, message) => {
        Toast.show({
            type: type, // success or error
            text1: message,
            visibilityTime: 1500,
        });
    };

  

    return (
        <>
            <Header />

            {/* Title + Edit button */}
            <View style={styles.headerRow}>
                <GradientText text="Profile" style={InventoryScreenCss.title} />
                <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                    <Text style={styles.editBtn}>{editMode ? "Cancel" : "Edit"}</Text>
                </TouchableOpacity>
            </View>

            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* Full Name */}
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={[styles.input, !editMode && styles.disabledInput]}
                        placeholder="Enter full name"
                        value={fullName}
                        onChangeText={setFullName}
                        editable={editMode}
                    />

                    {/* Email */}
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, !editMode && styles.disabledInput]}
                        placeholder="Enter email"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        editable={editMode}
                    />
                    {/* Designation */}
                    <Text style={styles.label}>Designation</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        placeholder="Enter designation"
                        value={designation}
                        onChangeText={setDesignation}
                        editable={editMode}
                    />

                    {/* Phone (always read-only) */}
                    <Text style={styles.label}>Phone number</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={phoneNumber}
                        editable={false}
                    />
                    {/* Address (always read-only) */}
                    <Text style={styles.label}>Assigned Location</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={address}
                        editable={false}
                    />

                    {/* Save Button (only in edit mode) */}
                    {editMode && (
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveText}>Save Information</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Toast Component */}
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 10,
    },
    editBtn: { color: "#00B5A5", fontSize: 16, fontWeight: "bold" },
    label: { fontSize: 14, color: '#333', marginTop: 10, marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    disabledInput: { backgroundColor: "#eee", color: "#888" },
    saveBtn: {
        backgroundColor: '#00B5A5',
        borderRadius: 8,
        marginTop: 40,
        paddingVertical: 15,
        alignItems: 'center',
    },
    saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

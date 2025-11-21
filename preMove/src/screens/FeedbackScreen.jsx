import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Modal,
    FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";
import Toast from "react-native-toast-message";
import { api } from "../utils/baseurl"; // your axios instance

export default function FeedbackScreen({ navigation }) {
    const [experience, setExperience] = useState(null);
    const [option, setOption] = useState("");
    const [comment, setComment] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const options = [
        { label: "App is useful", value: "useful" },
        { label: "Needs improvement", value: "improve" },
        { label: "Great experience", value: "great" },
    ];

    const showToast = (type, message, redirect = false) => {
        Toast.show({
            type: type, // success, error
            text1: message,
            visibilityTime: 1500,
        });

        if (redirect && type === "success") {
            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        }
    };

    const handleSubmit = async () => {
        try {
            const phone = await AsyncStorage.getItem("USER_PHONE");
            if (!phone) return showToast("error", "Phone number not found. Please login again.");
            if (experience === null) return showToast("error", "Please select your experience.");

            const payload = {
                phone,
                experience: experience.toString(),
                option,
                comments: comment,
            };

            const res = await api.post("feedback", payload);

            if (res.data.success) {
                showToast("success", "Thank you for your feedback!", true);
                setExperience(null);
                setOption("");
                setComment("");
            } else {
                showToast("error", res.data.error || "Something went wrong.");
            }
        } catch (err) {
            console.error("❌ Feedback Error:", err);
            showToast("error", "Failed to send feedback.");
        }
    };

    const renderOption = ({ item }) => (
        <TouchableOpacity
            style={styles.optionBtn}
            onPress={() => {
                setOption(item.value);
                setModalVisible(false);
            }}
        >
            <Text style={styles.optionText}>{item.label}</Text>
        </TouchableOpacity>
    );

    return (
        <>
            <Header />
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.pageTitle}>Feedback</Text>
                    <Text style={styles.note}>Please check the fields marked with *</Text>

                    {/* Experience */}
                    <Text style={styles.label}>How’s your experience with elePlace? *</Text>
                    <View style={styles.emojiRow}>
                        {["😟", "😐", "🙂", "😁", "😍"].map((emoji, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.emojiBtn, experience === index && styles.emojiSelected]}
                                onPress={() => setExperience(index)}
                            >
                                <Text style={styles.emoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Dropdown */}
                    <Text style={styles.label}>Anything you want to tell us?</Text>
                    <TouchableOpacity
                        style={styles.dropdownWrapper}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={[styles.dropdownText, option ? {} : { color: "#888" }]}>
                            {option ? options.find((opt) => opt.value === option).label : "Please choose an option"}
                        </Text>
                    </TouchableOpacity>

                    <Modal
                        visible={modalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            onPress={() => setModalVisible(false)}
                        />
                        <View style={styles.modalContent}>
                            <FlatList
                                data={options}
                                keyExtractor={(item) => item.value}
                                renderItem={renderOption}
                            />
                        </View>
                    </Modal>

                    {/* Comments */}
                    <Text style={styles.label}>Share your comments here</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        placeholder=""
                        value={comment}
                        onChangeText={setComment}
                    />

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Submit Feedback</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

            {/* Toast component */}
            <Toast />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 20 },
    pageTitle: { fontSize: 22, fontWeight: "700", color: "#00B5A5", textAlign: "center", marginTop: 10 },
    note: { fontSize: 14, color: "#555", textAlign: "center", marginVertical: 10 },
    label: { fontSize: 16, fontWeight: "600", color: "#000", marginTop: 20, marginBottom: 8 },
    emojiRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 20 },
    emojiBtn: { padding: 5 },
    emojiSelected: { backgroundColor: "#e0f7f6", borderRadius: 50 },
    emoji: { fontSize: 40 },
    dropdownWrapper: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, backgroundColor: "#fff" },
    dropdownText: { fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
    modalContent: { position: "absolute", top: "30%", left: "10%", right: "10%", backgroundColor: "#fff", borderRadius: 10, paddingVertical: 10, elevation: 5 },
    optionBtn: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
    optionText: { fontSize: 16 },
    textArea: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, minHeight: 60, padding: 10, fontSize: 16, marginTop: 5 },
    submitBtn: { backgroundColor: "#00B5A5", borderRadius: 8, marginTop: 30, paddingVertical: 15, alignItems: "center" },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

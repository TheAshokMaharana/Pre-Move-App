// src/screens/CustomerScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, PermissionsAndroid, Platform, TouchableOpacity, Alert } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import io from "socket.io-client";
import {api} from '../utils/baseurl'

const SERVER_URL = api.get(); // replace with your server (wss/http)
const CUSTOMER_ID = "customer_123"; // set dynamically per logged-in customer

export default function CustomerScreen() {
  const [location, setLocation] = useState(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);

  const requestPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const auth = await Geolocation.requestAuthorization("whenInUse");
      return auth === "granted";
    }
  };

  useEffect(() => {
    socketRef.current = io(SERVER_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("connected to server", socketRef.current.id);
      // register this client as a customer
      socketRef.current.emit("register", { type: "customer", id: CUSTOMER_ID });
    });

    socketRef.current.on("connect_error", (err) => {
      console.log("socket connect error", err);
    });

    return () => {
      if (watchIdRef.current != null) Geolocation.clearWatch(watchIdRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await requestPermission();
      if (!ok) {
        Alert.alert("Permission required", "Enable location permission for tracking.");
        return;
      }

      // Use watchPosition for continuous updates (more efficient than interval + getCurrentPosition)
      watchIdRef.current = Geolocation.watchPosition(
        (pos) => {
          const payload = {
            id: CUSTOMER_ID,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timestamp: Date.now(),
          };
          setLocation(payload);
          console.log("location",location)
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("location:update", payload);
          } else {
            console.log("socket not connected yet");
          }
        },
        (err) => console.log("geo err", err),
        { enableHighAccuracy: true, distanceFilter: 5, interval: 5000, fastestInterval: 2000 }
      );
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>Customer Live Location</Text>

      {location ? (
        <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 8, elevation: 4 }}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
          <Text>Sent to server as: {CUSTOMER_ID}</Text>
        </View>
      ) : (
        <Text>Waiting for location...</Text>
      )}

      <TouchableOpacity
        onPress={() => {
          // manual send (optional)
          if (location && socketRef.current) {
            console.log("Sending locaiton",location)
            socketRef.current.emit("location:update", location);
            Alert.alert("Sent", "Location sent to server");
          }
        }}
        style={{ marginTop: 20, backgroundColor: "#007bff", padding: 10, borderRadius: 6 }}
      >
        <Text style={{ color: "#fff" }}>Send Now</Text>
      </TouchableOpacity>
    </View>
  );
}

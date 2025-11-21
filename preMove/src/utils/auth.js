// src/utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TOKEN_KEY = 'APP_JWT_TOKEN';
const TOKEN_EXPIRES_AT = 'APP_JWT_EXPIRES_AT';

export async function saveToken(token, expiresAtMs) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(TOKEN_EXPIRES_AT, String(expiresAtMs));
    // set default axios header (optional)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } catch (err) {
    console.warn('saveToken error', err);
  }
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_EXPIRES_AT);
    delete axios.defaults.headers.common['Authorization'];
  } catch (err) {
    console.warn('clearToken error', err);
  }
}

export async function getStoredToken() {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const expires = await AsyncStorage.getItem(TOKEN_EXPIRES_AT);
    return { token, expiresAt: expires ? Number(expires) : null };
  } catch (err) {
    console.warn('getStoredToken error', err);
    return { token: null, expiresAt: null };
  }
}

export function tokenIsValid(expiresAt) {
  if (!expiresAt) return false;
  return Date.now() < expiresAt;
}

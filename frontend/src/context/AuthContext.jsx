import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api, { setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app opens, check if a token was saved before
  useEffect(() => {
    async function loadSavedLogin() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setToken(token);
          const res = await api.get('/auth/me');
          setUser(res.data);
        }
      } catch (error) {
        // Token expired or server down -> ask to log in again
        await AsyncStorage.removeItem('token');
        setToken(null);
      }
      setLoading(false);
    }
    loadSavedLogin();
  }, []);

  async function saveLogin(data) {
    await AsyncStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    await saveLogin(res.data);
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    await saveLogin(res.data);
  }

  async function logout() {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

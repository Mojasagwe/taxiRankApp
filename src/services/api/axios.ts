import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
    ios: 'http://localhost:8080/api',
    android: 'http://10.0.2.2:8080/api', // Android emulator localhost
});

export const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'},

        //timeout
        timeout: 10000,

});


api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            console.error('Error getting token:', error);
            return config;
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

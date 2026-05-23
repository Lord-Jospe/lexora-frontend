import api from './axios';
import type { LoginRequest, RegisterRequest } from '../../types/auth.type';


export const login = async (data: LoginRequest) => {
    try {
        const response = await api.post('/auth/login', data);
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (data: RegisterRequest) => {
    try {
        const response = await api.post('/auth/register', data);
        return response.data;
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
};
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

const api = axios.create({
    baseURL: 'http://localhost:5001' 
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Chuyển về trang chủ, không chuyển về /login để tránh kẹt
        window.location.href = '/'; 
    };

    useEffect(() => {
        // 1. Khôi phục user từ token khi tải trang
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                if (decodedUser.exp * 1000 > Date.now()) {
                    setUser({ userId: decodedUser.userId, username: decodedUser.username });
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);

        // 2. REQUEST INTERCEPTOR (MỚI - QUAN TRỌNG)
        // Tự động gắn Token vào mọi request gửi đi
        const reqInterceptor = api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // 3. RESPONSE INTERCEPTOR
        // Tự động logout nếu gặp lỗi 401
        const resInterceptor = api.interceptors.response.use(
            (response) => response, 
            (error) => {
                if (error.response && error.response.status === 401) {
                    console.log("Phiên đăng nhập hết hạn hoặc Token không hợp lệ. Đang đăng xuất...");
                    logout(); 
                }
                return Promise.reject(error);
            }
        );

        // Cleanup
        return () => {
            api.interceptors.request.eject(reqInterceptor);
            api.interceptors.response.eject(resInterceptor);
        };

    }, []); 

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { token } = response.data;
            localStorage.setItem('token', token);
            
            const decodedUser = jwtDecode(token);
            setUser({ userId: decodedUser.userId, username: decodedUser.username });
            return true;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error.response?.data?.message || error.message);
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            await api.post('/api/auth/register', { username, email, password });
            return true;
        } catch (error) {
            console.error("Lỗi đăng ký:", error.response?.data?.message || error.message);
            return false;
        }
    };

    const forgotPassword = async (email) => {
        try {
            await api.post('/api/auth/forgot-password', { email });
            return true;
        } catch (error) {
            throw error; 
        }
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, forgotPassword, api }}>
            {children}
        </AuthContext.Provider>
    );
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await api.auth.me();
                    setUser(userData);
                } catch (err) {
                    console.error('Failed to fetch user:', err);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const { access_token } = await api.auth.login(email, password);
        localStorage.setItem('token', access_token);
        const userData = await api.auth.me();
        setUser(userData);
        setModalOpen(false);
    };

    const signup = async (name, email, password) => {
        await api.auth.signup(name, email, password);
        await login(email, password); // Auto login after signup
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, modalOpen, setModalOpen }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

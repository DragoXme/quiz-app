import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (savedToken && savedUser && isTokenValid(savedToken)) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        } else {
            localStorage.removeItem('token'); localStorage.removeItem('user');
            sessionStorage.removeItem('token'); sessionStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken, rememberMe = false) => {
        setUser(userData);
        setToken(userToken);
        const storage = rememberMe ? localStorage : sessionStorage;
        const other = rememberMe ? sessionStorage : localStorage;
        storage.setItem('token', userToken);
        storage.setItem('user', JSON.stringify(userData));
        other.removeItem('token');
        other.removeItem('user');
    };

    const logout = () => {
        setUser(null); setToken(null);
        localStorage.removeItem('token'); localStorage.removeItem('user');
        sessionStorage.removeItem('token'); sessionStorage.removeItem('user');
    };

    const updateUser = (userData) => {
        setUser(userData);
        if (localStorage.getItem('token')) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

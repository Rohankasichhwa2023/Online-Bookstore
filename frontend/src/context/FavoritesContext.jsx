// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const FavoritesContext = createContext();
export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [count, setCount] = useState(0);

    // Always read user fresh from localStorage on each fetch
    const fetchFavoritesCount = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            setCount(0);
            return;
        }
        try {
            const res = await axios.get('http://localhost:8000/books/list-favorites/', {
                params: { user_id: user.id }
            });
            setCount(Array.isArray(res.data) ? res.data.length : 0);
        } catch (err) {
            console.error('Failed to fetch favorites count:', err);
        }
    };

    useEffect(() => {
        fetchFavoritesCount();
    }, []);

    const updateFavorites = () => fetchFavoritesCount();

    return (
        <FavoritesContext.Provider value={{ count, updateFavorites }}>
            {children}
        </FavoritesContext.Provider>
    );
};

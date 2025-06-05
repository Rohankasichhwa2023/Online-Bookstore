import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [count, setCount] = useState(0);

    // Always read user fresh from localStorage whenever we fetch
    const fetchCartCount = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            setCount(0);
            return;
        }
        try {
            const res = await axios.get('http://localhost:8000/carts/view-cart/', {
                params: { user_id: user.id }
            });
            setCount(Array.isArray(res.data) ? res.data.length : 0);
        } catch (err) {
            console.error('Failed to fetch cart count:', err);
        }
    };

    // On mount, fetch once. But since fetchCartCount always re‐reads localStorage,
    // if a new user has been set in localStorage, a later call to updateCart() will pick it up.
    useEffect(() => {
        fetchCartCount();
    }, []);

    // Expose a named function so other pages can ask “refresh the count now”
    const updateCart = () => fetchCartCount();

    return (
        <CartContext.Provider value={{ count, updateCart }}>
            {children}
        </CartContext.Provider>
    );
};

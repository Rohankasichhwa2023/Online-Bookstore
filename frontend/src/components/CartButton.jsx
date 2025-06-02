// src/components/CartButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartButton = () => {
    const navigate = useNavigate();
    const { count } = useCart();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;

    return (
        <button
            onClick={() => navigate('/cart')}
            style={{
                position: 'fixed',
                top: 16,
                right: 16,
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            Cart ({count})
        </button>
    );
};

export default CartButton;

// src/components/CartButton.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartButton = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const User = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!User) return;
        const fetchCount = async () => {
            try {
                const res = await axios.get('http://localhost:8000/carts/view-cart/', {
                    params: { user_id: User.id }
                });
                setCount(res.data.length);
            } catch (err) {
                console.error('Failed to fetch cart count', err);
            }
        };
        fetchCount();
    }, [User]);

    if (!User) return null;

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

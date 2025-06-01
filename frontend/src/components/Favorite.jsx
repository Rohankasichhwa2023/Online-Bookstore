// src/components/Favorite.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FavoriteButton = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const User = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!User) return;
        const fetchCount = async () => {
            try {
                const res = await axios.get('http://localhost:8000/books/list-favorites/', {
                    params: { user_id: User.id }
                });
                setCount(res.data.length);
            } catch (err) {
                console.error('Failed to fetch favorite count', err);
            }
        };
        fetchCount();
    }, [User]);

    if (!User) return null;

    return (
        <button
            onClick={() => navigate('/favorites')}
            style={{
                position: 'fixed',
                top: 16,
                right: 100,
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                cursor: 'pointer'
            }}
        >
            Favorites ({count})
        </button>
    );
};

export default FavoriteButton;

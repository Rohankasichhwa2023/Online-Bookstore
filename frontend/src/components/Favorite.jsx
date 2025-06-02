// src/components/Favorite.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

const FavoriteButton = () => {
    const navigate = useNavigate();
    const { count } = useFavorites();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;

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

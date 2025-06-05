import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import "../css/Navbar.css";

const FavoriteButton = () => {
    const navigate = useNavigate();
    const { count } = useFavorites();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;

    return (
        <div style={{display: "flex", gap: "4px"}}>
            <img src="/icons/add-to-fav.png" alt="Favorite" className="icon" onClick={() => navigate('/favorites')}/>
            <p style={{margin: "0px", fontWeight: "500", color: "#BD4444"}}><sup>{count>0?count:"\u00A0"}</sup></p>
        </div>
    );
};

export default FavoriteButton;

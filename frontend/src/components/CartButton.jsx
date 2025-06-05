import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import "../css/Navbar.css";

const CartButton = () => {
    const navigate = useNavigate();
    const { count } = useCart();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;

    return (
        <div style={{display: "flex", gap: "4px"}}>
            <img src="/icons/add-to-cart.png" alt="Cart" className="icon" onClick={() => navigate('/cart')}/>
            <p style={{margin: "0px", fontWeight: "500", color: "#BD4444"}}><sup>{count>0?count:"\u00A0"}</sup></p>
        </div>
    );
};

export default CartButton;

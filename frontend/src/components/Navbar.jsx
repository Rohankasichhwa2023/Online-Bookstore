import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Navbar.css';
import CartButton from './CartButton';
import Favorite from './Favorite';

function Navbar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="navbar">
            <div className="navbar-left">
                <div className="logo-box">
                    <img src="/logo/white2.png" alt="best reads" className="logo-image" />
                </div>
                <h2 className="brand-title">best reads</h2>
            </div>
            <div className="navbar-center">
                <div className={`nav-item ${isActive("/home") ? "active" : ""}`}>
                    <Link to="/home">Home</Link>
                </div>
                <div className={`nav-item ${isActive("/shop") ? "active" : ""}`}>
                    <Link to="/shop">Shop</Link>
                </div>
                <div className={`nav-item ${isActive("/request-book") ? "active" : ""}`}>
                    <Link to="/request-book">Request book</Link>
                </div>
            </div>
            <div className="navbar-right">
                <CartButton />
                <Favorite />
                <img src="/icons/notification-white.png" alt="Notification" className="icon" />
                <img src="/icons/user-white.png" alt="User" className="icon" />
            </div>
        </div>
    );
}

export default Navbar;

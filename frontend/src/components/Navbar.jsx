
import React from 'react';
import { Link } from 'react-router-dom';
import 'E:/bookstore/Online-Bookstore/frontend/src/css/Navbar.css';

function Navbar() {

    return (
        <div className="navbar">
            <div className="navbar-left">
                <div className="logo-box">
                    <img src="/logo/blue.png" alt="Best Reads Logo" className="logo-image" />
                </div>
                <h2 className="brand-title">Best Reads</h2>
            </div>
            <div className="navbar-center">
                <div className="nav-item active">
                    <Link to="/home">Home</Link>
                </div>
                <div className="nav-item">
                    <Link to="/about">About</Link>
                </div>
                <div className="nav-item">
                    <Link to="/contact">Contact</Link>
                </div>
                <div className="nav-item">
                    <Link to="/shop">Shop</Link>
                </div>
            </div>
            <div className="navbar-right">
                <img src="/icons/add-to-cart.png" alt="Cart" className="icon" />
                <img src="/icons/add-to-fav.png" alt="Favorites" className="icon" />
                <img src="/icons/notification.png" alt="Notification" className="icon" />
                <img src="/icons/user.png" alt="User" className="icon" />
            </div>
        </div>
    );
}

export default Navbar;

import { Link, useLocation } from 'react-router-dom';
import '../css/Navbar.css';
import CartButton from './CartButton';
import Favorite from './Favorite';
import UserLogoutButton from '../components/UserLogoutButton';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Navbar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const [notifications, setNotifications] = useState([]);
    const [user] = useState(() => JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/users/notifications/?user_id=${user.id}`);
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications(); // Fetch once on mount
    }, [user.id]);

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

                <div className="btn-group">
                    <button
                        className="notification-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-bs-display="static"
                        aria-expanded="false"
                    >
                        <img src="/icons/notification-white.png" alt="Notification" className="icon" />
                    </button>
                    <ol
                        className="dropdown-menu dropdown-menu-end notification-dropdown-menu"
                        style={{ width: "400px" }}
                    >
                        <h5 style={{ textAlign: "center", padding: "8px", color: "#0a3b6b", margin: "0px"}}>Notification</h5>
                        <div className="notification-scroll-container">
                            {notifications.length > 0 ? (
                                notifications.map((note) => (
                                    <li key={note.id} className="dropdown-item notification-item" style={{display: "flex", alignItems: "center", gap: "12px"}}>
                                        <img src="/icons/checkbox.png" className="icon"/><div>{note.message}</div>
                                    </li>
                                ))
                            ) : (
                                <li><span className="dropdown-item">No notifications</span></li>
                            )}
                        </div>
                    </ol>

                </div>

                <div className="btn-group">
                    <button
                        className="user-btn"
                        type="button"
                        data-bs-toggle="dropdown"
                        data-bs-display="static"
                        aria-expanded="false"
                    >
                        <img src="/icons/user-white.png" alt="User" className="icon" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-lg-end">
                        <li><Link to="/orders" className="dropdown-item">Order History</Link></li>
                        <li><Link to="/edit-personal-info" className="dropdown-item">Edit Personal Info</Link></li>
                        <li><Link to="/address" className="dropdown-item">Manage Address</Link></li>
                        <li><Link to="/change-password" className="dropdown-item">Change Password</Link></li>
                        <li><UserLogoutButton /></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Navbar;

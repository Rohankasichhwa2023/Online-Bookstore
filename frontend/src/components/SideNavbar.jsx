import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLogoutButton from '../components/AdminLogoutButton';
import "../css/SideNavbar.css";

export default function SideNavbar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="side-navbar-container">
            <div className='header'>
                <img src="/logo/white2.png" style={{ height: "50px", width: "50px" }} />
                <h1 style={{ color: "white", margin: "0px 10px 0px 0px", padding: "0px", fontSize: "28px" }}>best reads</h1>
            </div>

            <div className="link-items">
                <Link to="/admin-dashboard" className={`link-item ${isActive("/admin-dashboard") ? "active" : ""}`}>
                    <img src="/icons/dashboard.png" className='link-icon' />
                    <span className='link-text'>Dashboard</span>
                </Link>

                <Link to="/view-books" className={`link-item ${
                    ["/view-books", "/add-book", "/edit-book"].some(path => location.pathname === path || location.pathname.startsWith(path + "/"))
                        ? "active"
                        : ""
                }`}>
                    <img src="/icons/books.png" className='link-icon' />
                    <span className='link-text'>Manage Books</span>
                </Link>

                <Link to="/view-orders" className={`link-item ${isActive("/view-orders") ? "active" : ""}`}>
                    <img src="/icons/add-to-cart-white.png" className='link-icon' style={{ height: "22px", width: "22px" }}/>
                    <span className='link-text'>Manage Orders</span>
                </Link>

                <Link to="/all-users" className={`link-item ${isActive("/all-users") ? "active" : ""}`}>
                    <img src="/icons/user-white.png" className='link-icon' style={{ height: "20px", width: "20px" }} />
                    <span style={{ marginLeft: "8px" }} className='link-text'>View Users</span>
                </Link>

                <Link to="/view-ratings" className={`link-item ${isActive("/view-ratings") ? "active" : ""}`}>
                    <img src="/icons/star-white.png" className='link-icon' />
                    <span className='link-text'>View Book Ratings</span>
                </Link>

                <Link to="/view-books-request" className={`link-item ${isActive("/view-books-request") ? "active" : ""}`}>
                    <img src="/icons/request.png" className='link-icon' />
                    <span className='link-text'>Manage Book Requests</span>
                </Link>

                <div className="link-item">
                    <img src="/icons/logout.png" className='link-icon' />
                    <AdminLogoutButton />
                </div>
            </div>
        </div>
    );
}

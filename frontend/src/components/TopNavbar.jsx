import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "../css/TopNavbar.css";

export default function TopNavbar(props) {
    const navigate = useNavigate();
    const location = useLocation();

    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const monthYear = `${month}, ${year}`;

    const isViewBookPage = location.pathname === "/view-books";

    return (
        <div className="top-navbar-container">
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <h2 className="top-navbar-title">{props.title}</h2>
                {isViewBookPage && (
                    <div>
                        <button className="add-book-btn" onClick={() => navigate(`/add-book`)}>
                            Add Book <img src="/icons/explore-white.png" className="icon" alt="Add" />
                        </button>
                    </div>
                )}
            </div>
            <p className="month-year">{monthYear}</p>
        </div>
    )
}

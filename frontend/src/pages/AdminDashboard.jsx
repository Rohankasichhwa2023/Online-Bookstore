// AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLogoutButton from '../components/AdminLogoutButton';
import '../css/AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBooksSold: 0,
    pendingOrders: 0,
    highestRated: [],
    mostSold: [],
    pendingRequests: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin-login');
      return;
    }

    axios
      .get('http://localhost:8000/admin_logs/dashboard-stats/', {
        params: { user_id: adminUser.id },
      })
      .then(({ data }) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // ✅ only runs once on component mount

  if (!adminUser || loading) {
    return <div className="dash-container">Loading...</div>;
  }

  return (
    <div className="dash-container">
      <header className="dash-header">
        <h1 className="dash-title">Welcome, {adminUser.username}</h1>
        <AdminLogoutButton />
      </header>

      <div className="cards-grid">
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="card-value">Rs {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Books Sold</h3>
          <p className="card-value">{stats.totalBooksSold}</p>
        </div>
        <div className="card">
          <h3>Pending Orders</h3>
          <p className="card-value">{stats.pendingOrders}</p>
        </div>
        <div className="card">
          <h3>Pending Book Requests</h3>
          <p className="card-value">{stats.pendingRequests}</p>
        </div>
        <div className="card">
          <h3>Out of Stock</h3>
          <p className="card-value">{stats.outOfStock}</p>
        </div>
      </div>

      <div className="tables-section">
        <div className="table-card">
          <h3>Top 3 Highest Rated Books</h3>
          <ul>
            {stats.highestRated.map((b) => (
              <li key={b.id}>
                {b.title} <span className="badge">{b.avgRating.toFixed(1)}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/view-ratings')} className="btn-view-all">
            View All Ratings
          </button>
        </div>
        <div className="table-card">
          <h3>Top 3 Most Ordered Books</h3>
          <ul>
            {stats.mostSold.map((b) => (
              <li key={b.id}>
                {b.title} <span className="badge">{b.soldCount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="dash-footer">
        <button onClick={() => navigate('/all-users')} className="dash-btn">View Users</button>
        <button onClick={() => navigate('/add-book')} className="dash-btn">Add Book</button>
        <button onClick={() => navigate('/view-books')} className="dash-btn">View Books</button>
        <button onClick={() => navigate('/view-orders')} className="dash-btn">View Orders</button>
        <button onClick={() => navigate('/view-books-request')} className="dash-btn">Book Requests</button>
      </footer>
    </div>
  );
}


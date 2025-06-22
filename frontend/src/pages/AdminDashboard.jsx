import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/AdminDashboard.css';
import SideNavbar from '../components/SideNavbar';
import TopNavbar from '../components/TopNavbar';

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
  }, []);

  if (!adminUser || loading) {
    return <div className="dash-container">Loading...</div>;
  }

  return (
    <>
      <SideNavbar/>
      <div className="dash-container">
        
        <TopNavbar title="Dashboard"/>

        <div className="cards-grid">
          <div className="card">
            <h3>Total Revenue</h3>
            <p className="card-value">Rs {stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Books Sold</h3>
            <p className="card-value">{stats.totalBooksSold}</p>
          </div>
          <div className="card" style={{cursor: "pointer"}} onClick={() => navigate(`/view-books`)}>
            <h3>Out of Stock</h3>
            <p className="card-value">{stats.outOfStock}</p>
          </div>
          <div className="card" style={{cursor: "pointer"}} onClick={() => navigate(`/view-orders`)}>
            <h3>Pending Orders</h3>
            <p className="card-value">{stats.pendingOrders}</p>
          </div>
          <div className="card" style={{cursor: "pointer"}} onClick={() => navigate(`/view-books-request`)}>
            <h3>Pending Book Requests</h3>
            <p className="card-value">{stats.pendingRequests}</p>
          </div>
        </div>

        <div className="tables-section">
          <div className="table-card">
            <h3>Top 5 Most Ordered Books</h3>
            <ul>
              {stats.mostSold.map((b) => (
                <li key={b.id}>
                  <span className="badge" style={{width: "42px"}}>{b.soldCount}</span>&nbsp;&nbsp;<span>{b.title}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="table-card">
            <h3>Top 5 Highest Rated Books</h3>
            <ul>
              {stats.highestRated.map((b) => (
                <li key={b.id}>
                  <span className="badge">
                    {b.avgRating != null ? b.avgRating.toFixed(1) : 'N/A'}
                  </span>
                  &nbsp;&nbsp;{b.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}


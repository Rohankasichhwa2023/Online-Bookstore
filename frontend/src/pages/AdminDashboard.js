// src/pages/AdminDashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogoutButton from '../components/AdminLogoutButton';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));

  if (!adminUser) {
    navigate('/admin-login');
    return null;
  }

  return (
    <div>
      <h2>Welcome, {adminUser.username}!</h2>
      <AdminLogoutButton />
      <br />
      <button onClick={() => navigate('/add-book')}>Add New Book</button>
    </div>
  );
};

export default AdminDashboard;

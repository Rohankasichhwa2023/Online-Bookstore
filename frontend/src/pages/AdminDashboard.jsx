import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogoutButton from '../components/AdminLogoutButton';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));

  useEffect(() => {
    if (!adminUser) {
      navigate('/admin-login');
    }
  }, [adminUser, navigate])

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
      <button onClick={() => navigate('/view-books')}>View Books</button>
      <button onClick={() => navigate('/view-orders')}>View Orders</button>
      <button onClick={() => navigate('/view-books-request')}>View Book Requests</button>
    </div>
  );
};

export default AdminDashboard;

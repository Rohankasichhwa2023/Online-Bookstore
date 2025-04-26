import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css'; 

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/users/admin-login/', {
        username,
        password
      });

      localStorage.setItem('adminUser', JSON.stringify(res.data.user));
      window.location.href = '/admin-dashboard'; // Redirect to admin dashboard
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error);
      } else {
        setError('Server error');
      }
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;

import React, { useState } from 'react';
import axios from 'axios';
import '../css/LoginPage.css';


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
    <div className="container">
      <div className="form-box">
        <form onSubmit={handleLogin}>
          <div className="header">
            <img src="/logo/blue.png" alt="Best Reads Logo" height="52px" />&nbsp;
            <h2 style={{color: '#0E4783', margin: '0px' }}>best reads</h2>
          </div>

          <p className="title2">Hello Admin!</p>
          <p className="error-text" aria-live="polite">{error || '\u00A0'}</p>

          <div className="text-field">
            <div className="form-group">
              <label>Username</label>
              <input type="text" placeholder="Enter your username" onChange={e => setUsername(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginTop: '1em' }}>
            <button type="submit" className="submit-button">Log in</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

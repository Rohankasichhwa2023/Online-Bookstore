import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/LoginPage.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/users/login/', formData);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate("/home")
        } catch (err) {
            setMessage(err.response.data.error + '. Please try again.' || 'Login failed');
        }
    };

    return (
        <div className="container">
            <div className="form-box">
                <form onSubmit={handleSubmit}>
                    <div className="header">
                        <img src="/logo/blue.png" alt="Best Reads Logo" height="52px" />&nbsp;
                        <h2 style={{color: '#0E4783', margin: '0px' }}>best reads</h2>
                    </div>

                    <p className="title2">Welcome Back!</p>
                    <p className="error-text" aria-live="polite">{message || '\u00A0'}</p>

                    <div className="text-field">
                        <div className="form-group">
                            <label>Username</label>
                            <input name="username" onChange={handleChange} placeholder="Enter your username" required />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" type="password" onChange={handleChange} placeholder="Enter your password" required />
                        </div>
                    </div>

                    <div style={{ marginTop: '1em' }}>
                        <button type="submit" className="submit-button">Log in</button>
                        <p style={{fontSize: "14px", marginTop: "8px"}}>Don't have an account? <Link to="/register" style={{ color: '#0E4783' }}>Sign up</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}

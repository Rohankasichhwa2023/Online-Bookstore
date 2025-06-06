import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/LoginPage.css';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '', phone: '' });
    const [message, setMessage] = useState('');

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        if (formData.password !== formData.password2) {
            setMessage('Passwords do not match. Please try again.');
            return;
        }
        try {
            await axios.post('http://localhost:8000/users/register/', formData);
            navigate("/login");
        } catch (err) {
            setMessage(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="container">
            <div className="form-box">
                <form onSubmit={handleSubmit}>
                    <div className="header">
                        <img src="/logo/blue.png" alt="Best Reads Logo" height="52px" />&nbsp;
                        <h2 style={{ fontWeight: "700", color: '#0E4783', margin: '0px' }}>best reads</h2>
                    </div>

                    <p className="title">Create Account</p>
                    <p className="error-text" aria-live="polite">{message || '\u00A0'}</p>

                    <div className="text-field">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input id="username" name="username" onChange={handleChange} placeholder="Enter your username" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" onChange={handleChange} placeholder="Enter your email address" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input id="phone" name="phone" onChange={handleChange} placeholder="Enter your phone number" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" onChange={handleChange} placeholder="Create a password" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password2">Confirm Password</label>
                            <input id="password2" name="password2" type="password" onChange={handleChange} placeholder="Re-enter your password" required />
                        </div>
                    </div>

                    <div style={{ marginTop: '1em' }}>
                        <button type="submit" className="submit-button">Sign up</button>
                        <p style={{fontSize: "14px", marginTop: "8px"}}>Already have an account? <Link to="/login" style={{ color: '#0E4783' }}>Log in</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
}
